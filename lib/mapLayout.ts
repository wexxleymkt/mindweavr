import { MapNode, LayoutNode, VisualType, LayoutMode } from './types';

// Sizes calibrated to content — enough room to breathe, never overflowing
const VISUAL_SIZES: Record<VisualType, { w: number; h: number }> = {
  // ── Essencial (20 types) ──────────────────────────────────────────────────
  'stat':           { w: 210, h: 126 },
  'chart-bar':      { w: 256, h: 186 },
  'chart-ring':     { w: 210, h: 178 },
  'timeline':       { w: 240, h: 206 },
  'comparison':     { w: 278, h: 126 },
  'highlight':      { w: 256, h: 106 },
  'list':           { w: 246, h: 186 },
  'line-chart':     { w: 220, h: 136 },
  'progress-bars':  { w: 220, h: 146 },
  'progress-ring':  { w: 200, h: 96 },
  'countdown':      { w: 180, h: 106 },
  'balance':        { w: 180, h: 96 },
  'summary':        { w: 220, h: 136 },
  'checklist':      { w: 220, h: 156 },
  'success':        { w: 220, h: 116 },
  'product-row':    { w: 258, h: 72 },
  'rating':         { w: 200, h: 106 },
  'date-pills':     { w: 258, h: 106 },
  'time-slots':     { w: 258, h: 96 },
  'default':        { w: 0,   h: 0   },
  // ── Premium (30 types) ───────────────────────────────────────────────────
  'feature-card':      { w: 240, h: 136 },
  'gradient-stat':     { w: 220, h: 126 },
  'icon-grid':         { w: 248, h: 186 },
  'flow-steps':        { w: 316, h: 104 },
  'testimonial':       { w: 280, h: 168 },
  'price-tag':         { w: 220, h: 186 },
  'alert-box':         { w: 260, h: 106 },
  'metric-trio':       { w: 298, h: 104 },
  'kanban-card':       { w: 230, h: 168 },
  'tag-cloud':         { w: 266, h: 126 },
  'versus-card':       { w: 278, h: 136 },
  'steps-numbered':    { w: 248, h: 196 },
  'social-stat':       { w: 200, h: 116 },
  'cta-card':          { w: 258, h: 136 },
  'score-card':        { w: 200, h: 148 },
  'heatmap':           { w: 278, h: 144 },
  'avatar-list':       { w: 240, h: 166 },
  'notification-card': { w: 266, h: 108 },
  'insight-numbered':  { w: 266, h: 182 },
  'skill-grid':        { w: 246, h: 182 },
  'quote-hero':        { w: 278, h: 154 },
  'compare-table':     { w: 308, h: 244 },
  'cycle-flow':        { w: 268, h: 248 },
  'funnel-bars':       { w: 280, h: 280 },
  'priority-board':    { w: 246, h: 182 },
  'event-card':        { w: 246, h: 136 },
  'growth-indicator':  { w: 238, h: 136 },
  'team-card':         { w: 246, h: 164 },
  'pill-metrics':      { w: 298, h: 92 },
  'code-snippet':      { w: 286, h: 192 },
  'social-icon':       { w: 220, h: 180 },
};

const ROOT_SIZE   = { w: 320, h: 124 };
const BRANCH_SIZE = { w: 220, h: 100 };
const LEAF_SIZE   = { w: 190, h: 88  };

const GAP_TD = { levelY: 88, siblingX: 24 };
const GAP_LR = { levelX: 84, siblingY: 20 };

const SOCIAL_UI_PLATFORMS = ['reels', 'post', 'stories', 'shorts', 'podcast', 'blog', 'site'];

export function getCardSize(node: MapNode): { w: number; h: number } {
  if (node.type === 'root') return ROOT_SIZE;
  const vt = node.visualType;
  if (vt === 'social-icon') {
    const platform = node.socialPlatform?.toLowerCase();
    if (platform && SOCIAL_UI_PLATFORMS.includes(platform)) {
      if (platform === 'podcast' || platform === 'blog' || platform === 'site') return { w: 320, h: 180 };
      return { w: 280, h: 400 };
    }
    return VISUAL_SIZES['social-icon'];
  }
  if (vt && vt !== 'default') return VISUAL_SIZES[vt];
  return node.type === 'branch' ? BRANCH_SIZE : LEAF_SIZE;
}

/* ── Top-down (vertical tree, root at top) ── */
function tdSubtreeWidth(node: MapNode): number {
  const { w } = getCardSize(node);
  if (!node.children?.length) return w;
  const total = node.children.reduce(
    (sum, c) => sum + tdSubtreeWidth(c) + GAP_TD.siblingX,
    -GAP_TD.siblingX
  );
  return Math.max(w, total);
}

function placeTopDown(
  node: MapNode, cx: number, y: number,
  depth: number, parentId: string | undefined, out: LayoutNode[]
): void {
  const { w, h } = getCardSize(node);
  out.push({ ...node, x: cx - w / 2, y, w, h, depth, parentId });
  if (!node.children?.length) return;

  const childY = y + h + GAP_TD.levelY;
  const childWidths = node.children.map(tdSubtreeWidth);
  const total = childWidths.reduce((s, cw) => s + cw + GAP_TD.siblingX, -GAP_TD.siblingX);

  let startX = cx - total / 2;
  node.children.forEach((child, i) => {
    placeTopDown(child, startX + childWidths[i] / 2, childY, depth + 1, node.id, out);
    startX += childWidths[i] + GAP_TD.siblingX;
  });
}

/* ── Left-right (horizontal tree, root at left) ── */
function lrSubtreeHeight(node: MapNode): number {
  const { h } = getCardSize(node);
  if (!node.children?.length) return h;
  const total = node.children.reduce(
    (sum, c) => sum + lrSubtreeHeight(c) + GAP_LR.siblingY,
    -GAP_LR.siblingY
  );
  return Math.max(h, total);
}

function placeLeftRight(
  node: MapNode, x: number, cy: number,
  depth: number, parentId: string | undefined, out: LayoutNode[]
): void {
  const { w, h } = getCardSize(node);
  out.push({ ...node, x, y: cy - h / 2, w, h, depth, parentId });
  if (!node.children?.length) return;

  const childX = x + w + GAP_LR.levelX;
  const childHeights = node.children.map(lrSubtreeHeight);
  const total = childHeights.reduce((s, ch) => s + ch + GAP_LR.siblingY, -GAP_LR.siblingY);

  let startY = cy - total / 2;
  node.children.forEach((child, i) => {
    placeLeftRight(child, childX, startY + childHeights[i] / 2, depth + 1, node.id, out);
    startY += childHeights[i] + GAP_LR.siblingY;
  });
}


export function computeLayout(
  rootNode: MapNode,
  mode: LayoutMode = 'top-down'
): { nodes: LayoutNode[]; canvasW: number; canvasH: number } {
  const nodes: LayoutNode[] = [];

  if (mode === 'left-right') {
    const totalH = lrSubtreeHeight(rootNode);
    placeLeftRight(rootNode, 0, totalH / 2, 0, undefined, nodes);
  } else {
    // top-down e tecnico: árvore vertical (tecnico é só a estrutura de conteúdo pedida à IA)
    const totalW = tdSubtreeWidth(rootNode);
    placeTopDown(rootNode, totalW / 2, 0, 0, undefined, nodes);
  }

  const maxX = Math.max(...nodes.map(n => n.x + n.w));
  const maxY = Math.max(...nodes.map(n => n.y + n.h));
  const canvasW = maxX;
  return { nodes, canvasW, canvasH: maxY };
}
