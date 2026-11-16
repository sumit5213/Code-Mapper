import type { MapEdge, MapObject } from "@/lib/graph/view";

// Sizes are fixed px, not rem: layout positions in the same units React Flow
// draws in, and the zoom does the scaling. The node components read these
// constants so the box drawn is the box laid out.
export const CHAR_WIDTH = 6.6; // Geist Mono advance at 11px
export const PAD_X = 10;
export const FOLDED_MIN_HEIGHT = 40;
export const FOLDED_MIN_WIDTH = 120;
export const PANEL_HEADER_HEIGHT = 40;
export const ROW_HEIGHT = 20;
const ROW_NUMBERS_WIDTH = 84; // swatch, gaps and the fan counts
const PANEL_MIN_WIDTH = 200;
const PANEL_MAX_WIDTH = 440;
const FAN_IN_SCALE = 5;
const FOLDED_MAX_HEIGHT = 160;

const GAP_X = 110;
const GAP_Y = 24;

export type Box = { x: number; y: number; width: number; height: number };

// Height carries fan-in; sqrt so one hub doesn't flatten everything else into
// the minimum. Width comes from the label alone, so a long name doesn't read
// as an important file.
export function sizeOf(o: MapObject): { width: number; height: number } {
  const labelWidth = o.label.length * CHAR_WIDTH + 2 * PAD_X;
  if (o.kind === "folded") {
    return {
      width: Math.ceil(Math.max(FOLDED_MIN_WIDTH, labelWidth)),
      height: Math.round(Math.min(FOLDED_MAX_HEIGHT, FOLDED_MIN_HEIGHT + FAN_IN_SCALE * Math.sqrt(o.fanIn))),
    };
  }
  const widest = Math.max(labelWidth, o.rowChars * CHAR_WIDTH + 2 * PAD_X + ROW_NUMBERS_WIDTH);
  // A scrolling panel always keeps its above and below rows, so its height is
  // the same at every offset and scrolling never moves the layout.
  const rowCount = o.rows.length + (o.scrolls ? 2 : 0);
  return {
    width: Math.ceil(Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, widest))),
    height: PANEL_HEADER_HEIGHT + rowCount * ROW_HEIGHT,
  };
}

function depthOf(dir: string): number {
  return dir === "." ? 0 : dir.split("/").length;
}

/**
 * Assigns architectural hierarchy rank (column index 0..5):
 * 0: Project Roots & Root Entrypoints (., app, scripts)
 * 1: Primary Application Routes (app/(workspace), app/start)
 * 2: Deep Views & UI Components (app/(workspace)/analyses/[id], components)
 * 3: Subsystems, Subcomponents & Feature Pipelines (components/*, lib/pipeline, lib/analysis)
 * 4: Core Domain Engines (lib/graph, lib/parser, lib/supabase, lib/ai)
 * 5: Foundation Libraries & Adapters (lib/parser/adapters, lib)
 */
function rankOf(dir: string): number {
  if (dir === ".") return 0;
  const parts = dir.split("/").filter(Boolean);
  const top = parts[0].toLowerCase();

  if (top === "scripts" || top === "cli" || top === "bin" || top === "cmd") return 0;

  if (top === "app" || top === "pages" || top === "src") {
    if (top === "src" && parts.length > 1) {
      const sub = parts[1].toLowerCase();
      if (sub === "app" || sub === "pages" || sub === "routes") return Math.min(2, parts.length - 1);
      if (sub === "components" || sub === "views" || sub === "ui") return Math.min(3, parts.length);
      if (sub === "lib" || sub === "utils" || sub === "services") return parts.length === 2 ? 5 : 4;
      return Math.min(4, parts.length);
    }
    if (parts.length === 1) return 0;
    if (parts.length === 2) return 1;
    return 2;
  }

  if (top === "components" || top === "views" || top === "ui" || top === "widgets") {
    return parts.length === 1 ? 2 : 3;
  }

  if (top === "pipeline" || top === "pipelines" || top === "analysis" || top === "features" || top === "workflows") {
    return 3;
  }

  if (top === "lib" || top === "utils" || top === "core" || top === "services" || top === "db" || top === "database") {
    if (parts.length === 1) return 5;
    const sub = parts[1].toLowerCase();
    if (sub === "pipeline" || sub === "analysis" || sub === "workflows") return 3;
    if (parts.length > 2) return 5;
    return 4;
  }

  return Math.min(5, Math.max(1, parts.length));
}

// Symmetric, grid-aligned root-to-child layout (n8n workflow style).
// Objects are organized into hierarchical columns, with each column centered
// vertically around a shared midline for clean, balanced visual symmetry.
export function layout(objects: readonly MapObject[], _edges: readonly MapEdge[]): Map<string, Box> {
  const sizes = new Map<string, { width: number; height: number }>();
  for (const o of objects) sizes.set(o.id, sizeOf(o));

  // Group objects into hierarchical columns
  const cols = new Map<number, MapObject[]>();
  for (const o of objects) {
    const r = rankOf(o.dir);
    if (!cols.has(r)) cols.set(r, []);
    cols.get(r)!.push(o);
  }

  // Sort objects within each column: root first, then by depth, then alphabetically
  for (const [, list] of cols) {
    list.sort((a, b) => {
      if (a.dir === ".") return -1;
      if (b.dir === ".") return 1;
      const dDiff = depthOf(a.dir) - depthOf(b.dir);
      if (dDiff !== 0) return dDiff;
      return a.dir.localeCompare(b.dir);
    });
  }

  // Calculate column widths and heights
  const sortedRanks = [...cols.keys()].sort((a, b) => a - b);
  const colWidths = new Map<number, number>();
  const colHeights = new Map<number, number>();

  for (const r of sortedRanks) {
    const list = cols.get(r)!;
    const maxWidth = Math.max(...list.map((o) => sizes.get(o.id)!.width));
    const totalHeight = list.reduce((sum, o) => sum + sizes.get(o.id)!.height, 0) + (list.length - 1) * GAP_Y;
    colWidths.set(r, maxWidth);
    colHeights.set(r, totalHeight);
  }

  // Horizon midline across the entire canvas
  const maxHeight = Math.max(0, ...colHeights.values());
  const centerY = maxHeight / 2;

  // Position nodes symmetrically around centerY
  const boxes = new Map<string, Box>();
  let currentX = 0;

  for (const r of sortedRanks) {
    const list = cols.get(r)!;
    const width = colWidths.get(r)!;
    const height = colHeights.get(r)!;
    const startY = centerY - height / 2;

    let currentY = startY;
    for (const o of list) {
      const s = sizes.get(o.id)!;
      // Center node horizontally within its column track
      const nodeX = currentX + (width - s.width) / 2;
      boxes.set(o.id, {
        x: Math.round(nodeX),
        y: Math.round(currentY),
        width: s.width,
        height: s.height,
      });
      currentY += s.height + GAP_Y;
    }

    currentX += width + GAP_X;
  }

  return boxes;
}
