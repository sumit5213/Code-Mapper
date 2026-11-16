"use client";

import {
  MarkerType,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  applyNodeChanges,
  getViewportForBounds,
  useReactFlow,
  useStore,
  type BuiltInEdge,
  type NodeChange,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Folding } from "@/lib/graph/fold";
import {
  categoryFocus,
  endpointKey,
  highlight as highlightFor,
  hoverEndpoint,
  type Selection,
} from "@/lib/graph/highlight";
import { buildView } from "@/lib/graph/view";
import { UNCLASSIFIED, type ModelRole } from "@/lib/roles";
import type { Edge, ParsedFile } from "@/lib/parser/types";
import { layout, type Box } from "./layout";
import {
  FoldedNodeView,
  MapActions,
  MapSelection,
  PanelNodeView,
  type FoldedNode,
  type PanelNode,
} from "./nodes";

const nodeTypes: NodeTypes = { folded: FoldedNodeView, panel: PanelNodeView };
const FIT_PADDING = 0.06;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2;
/** Initial fit may enlarge a small graph a little, never to poster size. */
const INITIAL_MAX_ZOOM = 1.25;

/** What the map draws and what it reports back. State lives with the caller, so the detail pane can drive the same selection. */
export type MapControl = {
  files: ParsedFile[];
  edges: Edge[];
  /** Roles the model gave files convention left unclassified, for the category focus. */
  modelRoles: ReadonlyMap<string, ModelRole>;
  folding: Folding;
  /** Open groups and how far each has been scrolled. */
  open: ReadonlyMap<string, number>;
  selection: Selection;
  /** Whatever the pointer is over, here or in the pane. */
  hover: Selection;
  /** Changes whenever an open should refit the view to the new layout. */
  refit: number;
  /** The rail category (a role, or unclassified) left bright, or null for all of them. */
  category: string | null;
  /** Custom dragged node positions */
  positions?: ReadonlyMap<string, { x: number; y: number }>;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onPositionsChange?: (positions: ReadonlyMap<string, { x: number; y: number }>) => void;
  onOpen: (id: string) => void;
  onClose: (id: string) => void;
  onSelectFile: (path: string) => void;
  onScroll: (id: string, offset: number) => void;
  onHover: (hover: Selection) => void;
  onDeselect: () => void;
};

export function DependencyMap(props: MapControl) {
  return (
    <ReactFlowProvider>
      <MapCanvas {...props} />
    </ReactFlowProvider>
  );
}

function MapCanvas({
  files,
  edges,
  modelRoles,
  folding,
  open,
  selection,
  hover,
  refit,
  category,
  positions,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onPositionsChange,
  onOpen,
  onClose,
  onSelectFile,
  onScroll,
  onHover,
  onDeselect,
}: MapControl) {
  const view = useMemo(() => buildView(files, edges, folding, open), [files, edges, folding, open]);
  const boxes = useMemo(() => layout(view.objects, view.edges), [view]);
  const lit = useMemo(() => highlightFor(view, edges, selection), [view, edges, selection]);
  const hovered = useMemo(() => hoverEndpoint(view, hover), [view, hover]);
  const railKeys = useMemo(
    () => new Map(files.map((f) => [f.path, f.role ?? modelRoles.get(f.path) ?? UNCLASSIFIED])),
    [files, modelRoles],
  );
  const focus = useMemo(() => categoryFocus(view, category, railKeys), [view, category, railKeys]);

  const isDraggingRef = useRef(false);
  const [nodes, setNodes] = useState<(FoldedNode | PanelNode)[]>(() =>
    view.objects.map((o): FoldedNode | PanelNode => {
      const box = boxes.get(o.id);
      if (!box) throw new Error(`No layout box for ${o.id}`);
      const position = positions?.get(o.id) ?? { x: box.x, y: box.y };
      const base = { id: o.id, position, width: box.width, height: box.height };
      return o.kind === "folded" ? { ...base, type: "folded", data: o } : { ...base, type: "panel", data: o };
    }),
  );

  const [prevView, setPrevView] = useState(view);
  const [prevBoxes, setPrevBoxes] = useState(boxes);
  const [prevPositions, setPrevPositions] = useState(positions);

  if (view !== prevView || boxes !== prevBoxes || positions !== prevPositions) {
    setPrevView(view);
    setPrevBoxes(boxes);
    setPrevPositions(positions);
    setNodes(
      view.objects.map((o): FoldedNode | PanelNode => {
        const box = boxes.get(o.id);
        if (!box) throw new Error(`No layout box for ${o.id}`);
        const position = positions?.get(o.id) ?? { x: box.x, y: box.y };
        const base = { id: o.id, position, width: box.width, height: box.height };
        return o.kind === "folded" ? { ...base, type: "folded", data: o } : { ...base, type: "panel", data: o };
      }),
    );
  }

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds: (FoldedNode | PanelNode)[]) => applyNodeChanges(changes, nds) as (FoldedNode | PanelNode)[]);
  }, []);

  const onUndoRef = useRef(onUndo);
  const onRedoRef = useRef(onRedo);
  const canUndoRef = useRef(canUndo);
  const canRedoRef = useRef(canRedo);

  useEffect(() => {
    onUndoRef.current = onUndo;
    onRedoRef.current = onRedo;
    canUndoRef.current = canUndo;
    canRedoRef.current = canRedo;
  }, [onUndo, onRedo, canUndo, canRedo]);

  // Global Undo / Redo keyboard shortcuts (Ctrl+Z / Cmd+Z, Ctrl+Y / Cmd+Shift+Z)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const isZ = e.key.toLowerCase() === "z" || e.code === "KeyZ";
      const isY = e.key.toLowerCase() === "y" || e.code === "KeyY";
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && isZ) {
        if (e.shiftKey) {
          if (canRedoRef.current && onRedoRef.current) {
            e.preventDefault();
            e.stopPropagation();
            onRedoRef.current();
          }
        } else {
          if (canUndoRef.current && onUndoRef.current) {
            e.preventDefault();
            e.stopPropagation();
            onUndoRef.current();
          }
        }
      } else if (isMod && isY) {
        if (canRedoRef.current && onRedoRef.current) {
          e.preventDefault();
          e.stopPropagation();
          onRedoRef.current();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, []);

  const flowEdges = useMemo(
    () => {
      const dim: BuiltInEdge[] = [];
      const bright: BuiltInEdge[] = [];
      for (const e of view.edges) {
        // Direction only gets colour once there's a selection for it to be
        // relative to: green flows into it, amber flows out of it.
        const stroke = lit?.incoming.has(e.id) ? "var(--incoming)" : lit?.outgoing.has(e.id) ? "var(--outgoing)" : undefined;
        // Under a category, a line stays bright only when both of its ends do.
        const outOfFocus =
          focus !== null &&
          !(focus.endpoints.has(endpointKey(e.source, e.sourceHandle)) && focus.endpoints.has(endpointKey(e.target, e.targetHandle)));

        const isHighlighted = !!stroke;
        const opacity = isHighlighted ? 1 : (lit && !stroke) || outOfFocus ? 0.12 : 0.45;

        (isHighlighted ? bright : dim).push({
          id: e.id,
          type: "default",
          pathOptions: {
            curvature: 0.25,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: stroke ?? "var(--edge)",
          },
          source: e.source,
          sourceHandle: e.sourceHandle,
          target: e.target,
          targetHandle: e.targetHandle,
          style: {
            strokeWidth: Math.min(2.5, (isHighlighted ? 1.6 : 1.1) + Math.log2(e.count) / 4),
            stroke: stroke ?? "var(--edge)",
            opacity,
          },
        });
      }
      // Bright edges are drawn last so they cross over the dim ones. Order,
      // not zIndex: a raised edge would also draw over the nodes.
      return [...dim, ...bright];
    },
    [view, lit, focus],
  );

  // Refit after an open, against the layout that open produced. The caller
  // changes `refit` in the same update as `open`, so by the time this sees a
  // new value the boxes are already the new ones, never the state before.
  const refitted = useRef(refit);
  const { getZoom, setViewport, zoomIn, zoomOut, fitView, } = useReactFlow();
  const width = useStore((s) => s.width);
  const height = useStore((s) => s.height);
  useEffect(() => {
    if (refitted.current === refit) return;
    refitted.current = refit;
    // Capping at the current zoom means this can only ever zoom out: fitting
    // everything including the new panel, never zooming into the panel.
    setViewport(getViewportForBounds(boundsOf(boxes), width, height, MIN_ZOOM, getZoom(), FIT_PADDING));
  }, [refit, boxes, width, height, getZoom, setViewport]);

  const actions = useMemo(
    () => ({ close: onClose, selectFile: onSelectFile, scroll: onScroll, hover: onHover }),
    [onClose, onSelectFile, onScroll, onHover],
  );
  const selectionValue = useMemo(
    () => ({ selection, highlight: lit, hovered, focus, category }),
    [selection, lit, hovered, focus, category],
  );

  return (
    <MapActions.Provider value={actions}>
      <MapSelection.Provider value={selectionValue}>
        <ReactFlow
          nodes={nodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          fitView
          fitViewOptions={{ padding: FIT_PADDING, maxZoom: INITIAL_MAX_ZOOM }}
          onNodeDragStart={() => {
            isDraggingRef.current = true;
          }}
          onNodeDragStop={(_, node) => {
            setTimeout(() => {
              isDraggingRef.current = false;
            }, 50);
            if (onPositionsChange) {
              const box = boxes.get(node.id);
              const origPos = positions?.get(node.id) ?? (box ? { x: box.x, y: box.y } : undefined);
              const newX = Math.round(node.position.x);
              const newY = Math.round(node.position.y);
              if (origPos && Math.abs(newX - origPos.x) < 1 && Math.abs(newY - origPos.y) < 1) {
                return;
              }
              const nextMap = new Map(positions ?? []);
              nextMap.set(node.id, { x: newX, y: newY });
              onPositionsChange(nextMap);
            }
          }}
          // Folded nodes open here. Panels handle their own header and row
          // clicks, which bubble up to this too and are ignored.
          onNodeClick={(_, node) => {
            if (isDraggingRef.current) return;
            if (node.type === "folded") onOpen(node.id);
          }}
          onPaneClick={onDeselect}
        >
          <Panel position="top-left" className="!m-3 flex items-center rounded border border-line bg-surface/90 shadow-sm backdrop-blur-sm">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (canUndo && onUndo) onUndo();
              }}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
              className={`flex size-7 items-center justify-center transition-colors ${
                canUndo ? "cursor-pointer text-fg-muted hover:bg-raised hover:text-fg active:scale-95" : "cursor-not-allowed opacity-35 text-fg-muted"
              }`}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-3.5">
                <path d="M6 4L2.5 7.5L6 11" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 7.5h7a3.5 3.5 0 0 1 3.5 3.5v1" strokeLinecap="round" />
              </svg>
            </button>
            <div className="h-4 w-px bg-line" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (canRedo && onRedo) onRedo();
              }}
              disabled={!canRedo}
              title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
              aria-label="Redo"
              className={`flex size-7 items-center justify-center transition-colors ${
                canRedo ? "cursor-pointer text-fg-muted hover:bg-raised hover:text-fg active:scale-95" : "cursor-not-allowed opacity-35 text-fg-muted"
              }`}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-3.5">
                <path d="M10 4l3.5 3.5L10 11" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 7.5H6A3.5 3.5 0 0 0 2.5 11v1" strokeLinecap="round" />
              </svg>
            </button>
          </Panel>
          <Panel position="top-right" className="!m-3 flex items-center rounded border border-line bg-surface/90 shadow-sm backdrop-blur-sm">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                zoomIn({ duration: 250 });
              }}
              title="Zoom in"
              aria-label="Zoom in"
              className="flex size-7 cursor-pointer items-center justify-center text-fg-muted transition-colors hover:bg-raised hover:text-fg active:scale-95"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-3.5">
                <path d="M8 3.5v9M3.5 8h9" strokeLinecap="round" />
              </svg>
            </button>
            <div className="h-4 w-px bg-line" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                zoomOut({ duration: 250 });
              }}
              title="Zoom out"
              aria-label="Zoom out"
              className="flex size-7 cursor-pointer items-center justify-center text-fg-muted transition-colors hover:bg-raised hover:text-fg active:scale-95"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-3.5">
                <path d="M3.5 8h9" strokeLinecap="round" />
              </svg>
            </button>
            <div className="h-4 w-px bg-line" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fitView({ padding: FIT_PADDING, duration: 300 });
              }}
              title="Fit to view"
              aria-label="Fit to view"
              className="flex size-7 cursor-pointer items-center justify-center text-fg-muted transition-colors hover:bg-raised hover:text-fg active:scale-95"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-3.5">
                <path d="M2.5 5.5V2.5h3M10.5 2.5h3v3M13.5 10.5v3h-3M5.5 13.5h-3v-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Panel>
        </ReactFlow>
      </MapSelection.Provider>
    </MapActions.Provider>
  );
}

function boundsOf(boxes: ReadonlyMap<string, Box>): Box {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const b of boxes.values()) {
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
