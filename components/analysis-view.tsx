"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  explainFileAction,
  explainFolderAction,
  fileAtHeadAction,
  repositoryHeadAction,
  type HeadResult,
} from "@/app/(workspace)/analyses/[id]/actions";
import { foldDirectories } from "@/lib/graph/fold";
import type { Selection } from "@/lib/graph/highlight";
import type { Direction } from "@/lib/graph/reach";
import { clampOffset, groupId, MAX_ROWS, rankGroupFiles } from "@/lib/graph/view";
import type { Coverage, Edge, ParsedFile, Route } from "@/lib/parser/types";
import type { ModelRole } from "@/lib/roles";
import { CategoryRail } from "./category-rail";
import { DetailPane, type RepositoryFacts, type Tab } from "./detail-pane";
import { targetKey, type ExplainTarget, type ExplanationState, type Freshness } from "./explanation-panel";
import { DependencyMap } from "./map/dependency-map";
import { RouteTable } from "./route-table";
import { Shell } from "./shell";

// Owns what the map, the rail and the pane share: which folders are open,
// what's selected, what's hovered, which category is picked, and what the pane
// has open. Everything either side
// shows is derived from the parse output already in the browser, so nothing
// here makes a request except the one Explain asks for.
type MapSnapshot = {
  open: ReadonlyMap<string, number>;
  selection: Selection;
  positions: ReadonlyMap<string, { x: number; y: number }>;
};

export function AnalysisView({
  files,
  edges,
  routes,
  routeCoverage,
  modelRoles: storedModelRoles,
  analysisId,
  commitSha,
  repository,
}: {
  files: ParsedFile[];
  edges: Edge[];
  routes: Route[];
  routeCoverage: Coverage["routes"];
  /** Roles the model gave files no convention identified, by path. */
  modelRoles: Record<string, ModelRole>;
  analysisId: string;
  commitSha: string;
  repository: Omit<RepositoryFacts, "routes">;
}) {
  const folding = useMemo(() => foldDirectories(files), [files]);
  const byPath = useMemo(() => new Map(files.map((f) => [f.path, f])), [files]);
  const [refit, setRefit] = useState(0);

  // Single centralized history state for the map: open panels, selections, and dragged node positions
  const [history, setHistory] = useState<{
    past: MapSnapshot[];
    present: MapSnapshot;
    future: MapSnapshot[];
  }>(() => ({
    past: [],
    present: { open: new Map(), selection: null, positions: new Map() },
    future: [],
  }));
  const { open, selection, positions } = history.present;

  const [hover, setHover] = useState<Selection>(null);
  // Held here rather than in the pane so it outlives every change of selection.
  const [tab, setTab] = useState<Tab>("structure");
  // Likewise, so the same walk shows for each file while comparing them.
  const [walk, setWalk] = useState<Direction | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  // The centre column shows the map or the route table; the rail and the pane
  // keep working on either.
  const [centre, setCentre] = useState<"map" | "routes">("map");
  // Explanations fetched on this page, by file or folder, so moving the
  // selection away and back finds the answer still there without asking again.
  const [explanations, setExplanations] = useState<ReadonlyMap<string, ExplanationState>>(() => new Map());
  const [freshness, setFreshness] = useState<ReadonlyMap<string, Freshness>>(() => new Map());
  const [modelRoles, setModelRoles] = useState<ReadonlyMap<string, ModelRole>>(() => new Map(Object.entries(storedModelRoles)));
  // The repository's latest commit, asked for once per page load: GitHub's
  // unauthenticated API allows few requests, and one answer serves every file.
  const head = useRef<Promise<HeadResult> | null>(null);

  const explain = useCallback(
    (target: ExplainTarget) => {
      const key = targetKey(target);
      setExplanations((prev) => new Map(prev).set(key, { status: "loading" }));
      setFreshness((prev) => new Map(prev).set(key, { status: "checking" }));

      void (async () => {
        const result = await (target.kind === "file" ? explainFileAction(analysisId, target.path) : explainFolderAction(analysisId, target.dir));
        setExplanations((prev) => new Map(prev).set(key, result.ok ? { status: "done", result } : { status: "error", error: result.error }));
        if (result.ok && target.kind === "file" && result.labelled?.role) {
          const role = result.labelled.role;
          setModelRoles((prev) => new Map(prev).set(target.path, role));
        }
      })();

      // Alongside the explanation, not in front of it: a cached answer shows
      // at once, and whether it's current arrives when GitHub answers.
      void (async () => {
        const latest = await (head.current ??= repositoryHeadAction(analysisId));
        if (!latest.ok) head.current = null;
        let state: Freshness;
        if (!latest.ok) state = { status: "unknown", error: latest.error };
        else if (latest.head === latest.analysed) state = { status: "current" };
        else if (target.kind === "group") state = { status: "moved", head: latest.head, file: null };
        else {
          const file = await fileAtHeadAction(analysisId, target.path, latest.head);
          state = file.ok ? { status: "moved", head: latest.head, file: file.state } : { status: "unknown", error: file.error };
        }
        setFreshness((prev) => new Map(prev).set(key, state));
      })();
    },
    [analysisId],
  );

  const toggleCategory = useCallback((c: string) => setCategory((prev) => (prev === c ? null : c)), []);

  const undo = useCallback(() => {
    let openChanged = false;
    setHistory((curr) => {
      if (curr.past.length === 0) return curr;
      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, -1);
      if (previous.open !== curr.present.open) {
        openChanged = true;
      }
      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      };
    });
    if (openChanged) setRefit((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    let openChanged = false;
    setHistory((curr) => {
      if (curr.future.length === 0) return curr;
      const next = curr.future[0];
      const newFuture = curr.future.slice(1);
      if (next.open !== curr.present.open) {
        openChanged = true;
      }
      return {
        past: [...curr.past, curr.present],
        present: next,
        future: newFuture,
      };
    });
    if (openChanged) setRefit((n) => n + 1);
  }, []);

  const updatePositions = useCallback(
    (newPositions: ReadonlyMap<string, { x: number; y: number }>) => {
      setHistory((curr) => ({
        past: [...curr.past.slice(-30), curr.present],
        present: {
          ...curr.present,
          positions: newPositions,
        },
        future: [],
      }));
    },
    [],
  );

  // Clicking a folded node is the one click it has, so opening it also selects
  // the panel it becomes.
  const openGroup = useCallback((id: string) => {
    setHistory((curr) => ({
      past: [...curr.past.slice(-30), curr.present],
      present: {
        ...curr.present,
        open: new Map(curr.present.open).set(id, 0),
        selection: { kind: "group", id },
      },
      future: [],
    }));
    setRefit((n) => n + 1);
  }, []);

  const closeGroup = useCallback(
    (id: string) => {
      setHistory((curr) => {
        const next = new Map(curr.present.open);
        next.delete(id);
        // A selection inside a folded-away panel has nothing left to point at.
        let nextSelection = curr.present.selection;
        if (nextSelection?.kind === "group" && nextSelection.id === id) nextSelection = null;
        if (nextSelection?.kind === "file") {
          const dir = folding.groupOf.get(nextSelection.path);
          if (dir !== undefined && groupId(dir) === id) nextSelection = null;
        }
        return {
          past: [...curr.past.slice(-30), curr.present],
          present: {
            ...curr.present,
            open: next,
            selection: nextSelection,
          },
          future: [],
        };
      });
      setRefit((n) => n + 1);
    },
    [folding],
  );

  const toggleFile = useCallback((path: string) => {
    setHistory((curr) => {
      const nextSelection: Selection =
        curr.present.selection?.kind === "file" && curr.present.selection.path === path ? null : { kind: "file", path };
      return {
        past: [...curr.past.slice(-30), curr.present],
        present: {
          ...curr.present,
          selection: nextSelection,
        },
        future: [],
      };
    });
  }, []);

  const scroll = useCallback((id: string, offset: number) => {
    setHistory((curr) => {
      if (!curr.present.open.has(id)) return curr;
      return {
        ...curr,
        present: {
          ...curr.present,
          open: new Map(curr.present.open).set(id, Math.max(0, offset)),
        },
      };
    });
  }, []);

  // A path clicked in the pane becomes the selection on the map, and the map
  // shows it: its folder opens if it's folded, and scrolls if the row is
  // outside the window. A folder that's already showing the row stays put.
  const reveal = useCallback(
    (path: string) => {
      const dir = folding.groupOf.get(path);
      const group = folding.groups.find((g) => g.dir === dir);
      if (dir === undefined || !group) return;
      const id = groupId(dir);
      const ranked = rankGroupFiles(group, byPath);
      const index = ranked.indexOf(path);
      const current = open.get(id);
      const first = current === undefined ? null : clampOffset(current, ranked.length);

      let shouldRefit = false;
      setHistory((curr) => {
        let nextOpen = curr.present.open;
        if (first === null || index < first || index >= first + MAX_ROWS) {
          nextOpen = new Map(curr.present.open).set(id, index - Math.floor(MAX_ROWS / 2));
          if (current === undefined) shouldRefit = true;
        }
        return {
          past: [...curr.past.slice(-30), curr.present],
          present: {
            ...curr.present,
            open: nextOpen,
            selection: { kind: "file", path },
          },
          future: [],
        };
      });
      if (shouldRefit) setRefit((n) => n + 1);
      // The row under the pointer is about to be replaced, and a removed
      // element never reports the pointer leaving it.
      setHover(null);
    },
    [folding, byPath, open],
  );

  const deselect = useCallback(() => {
    setHistory((curr) => {
      if (curr.present.selection === null) return curr;
      return {
        past: [...curr.past.slice(-30), curr.present],
        present: {
          ...curr.present,
          selection: null,
        },
        future: [],
      };
    });
  }, []);

  return (
    <Shell
      rail={
        <CategoryRail files={files} modelRoles={modelRoles} frameworks={repository.projects.map((p) => p.adapter)} active={category} onToggle={toggleCategory} />
      }
      map={
        <div className="absolute inset-0 flex flex-col">
          <div role="tablist" className="flex h-7 shrink-0 items-end gap-3 border-b border-line bg-surface px-3 text-[11px]">
            <CentreTab label="Map" on={centre === "map"} onClick={() => setCentre("map")} />
            <CentreTab label="Routes" count={routes.length} on={centre === "routes"} onClick={() => setCentre("routes")} />
          </div>
          <div className="relative min-h-0 flex-1">
            {/* The map stays mounted under the table, so switching back keeps its viewport. */}
            <div className={`absolute inset-0 ${centre === "map" ? "" : "invisible"}`}>
              <DependencyMap
                files={files}
                edges={edges}
                modelRoles={modelRoles}
                folding={folding}
                open={open}
                selection={selection}
                hover={hover}
                refit={refit}
                category={category}
                positions={positions}
                canUndo={history.past.length > 0}
                canRedo={history.future.length > 0}
                onUndo={undo}
                onRedo={redo}
                onPositionsChange={updatePositions}
                onOpen={openGroup}
                onClose={closeGroup}
                onSelectFile={toggleFile}
                onScroll={scroll}
                onHover={setHover}
                onDeselect={deselect}
              />
            </div>
            {centre === "routes" && (
              <RouteTable
                routes={routes}
                coverage={routeCoverage}
                selection={selection}
                hover={hover}
                onReveal={reveal}
                onHover={setHover}
              />
            )}
          </div>
        </div>
      }
      detail={
        <DetailPane
          files={files}
          byPath={byPath}
          edges={edges}
          folding={folding}
          repository={{ ...repository, routes: routes.length }}
          selection={selection}
          hover={hover}
          tab={tab}
          onTab={setTab}
          walk={walk}
          onWalk={setWalk}
          insightsOpen={insightsOpen}
          onInsightsOpen={setInsightsOpen}
          onReveal={reveal}
          onHover={setHover}
          modelRoles={modelRoles}
          analysisId={analysisId}
          commitSha={commitSha}
          explanations={explanations}
          freshness={freshness}
          onExplain={explain}
        />
      }
    />
  );
}

function CentreTab({ label, count, on, onClick }: { label: string; count?: number; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={on}
      onClick={onClick}
      className={`-mb-px border-b pb-1.5 ${on ? "border-accent text-fg" : "border-transparent text-fg-muted hover:text-fg"}`}
    >
      {label}
      {count !== undefined && <span className="ml-1 text-fg-muted tabular-nums">{count}</span>}
    </button>
  );
}
