'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { ZoomIn, ZoomOut, Focus } from 'lucide-react';
import { MapData, MapNode, MapAnnotations, LayoutMode, ConnectionStyle, VisualType } from '@/lib/types';
import { computeLayout } from '@/lib/mapLayout';
import type { DrawTool, DrawElement, DrawArrow, DrawImage, DrawText } from '@/lib/drawingTypes';
import MapCard from './MapCard';
import { CardPanel } from './CardPanel';
import { colors } from './NodeRenderers';
import { DrawingLayer } from './DrawingLayer';
import { DrawingPanel } from './DrawingPanel';
import { ImagePanel } from './ImagePanel';
import { TextPanel } from './TextPanel';
import { ArrowPanel, type ArrowPreset } from './ArrowPanel';

interface Props {
  mapData: MapData;
  layoutMode?: LayoutMode;
  connectionStyle?: ConnectionStyle;
  /** Chamado quando o usuário clica em “+ Conteúdo” em um card */
  onRequestExpandNode?: (nodeId: string) => void;
  /** Id do nó que está sendo expandido pela IA (para mostrar loading local no botão) */
  expandingNodeId?: string | null;
  /** Reorganiza o mapa: muda o pai de um nó para outro nó */
  onReparentNode?: (childId: string, newParentId: string) => void;
  /** Muda o nó ao qual uma anotação (imagem/texto) está ligada */
  onReparentAnnotation?: (elementId: string, newNodeId: string) => void;
  /** Remove uma anotação (imagem/texto) dos dados do mapa para não voltar ao reconstruir */
  onDeleteAnnotation?: (elementId: string) => void;
  /** Cria um novo card manualmente, dado visualType + prompt + nó alvo. */
  onCreateCard?: (visualType: VisualType, prompt: string, parentId?: string) => void;
  creatingCard?: boolean;
  /** Plano do usuario para desbloquear tipos visuais premium no CardPanel */
  userPlan?: 'essencial' | 'creator' | 'pro';
  /** Após criar card, define o id para entrar em modo conexão (potinhos verdes). */
  connectionSourceAfterCreate?: string | null;
  onConsumeConnectionSourceAfterCreate?: () => void;
  /** Modo somente leitura: oculta anotações, desativa arrastar e reconectar; mantém colapsar */
  readOnly?: boolean;
}

/* ─── Helpers ─── */
/** Coleta ids de nós visíveis: raiz + descendentes cujo ancestral colapsado não foi encontrado. Ao colapsar, só escondemos na renderização; o layout continua com a árvore completa para não deslocar o mapa. */
function collectVisibleNodeIds(root: MapNode, collapsed: Set<string>): Set<string> {
  const out = new Set<string>();
  function add(node: MapNode) {
    out.add(node.id);
    if (collapsed.has(node.id)) return;
    node.children?.forEach(add);
  }
  add(root);
  return out;
}

function collectParentIds(node: MapNode, acc: Set<string>): void {
  if (node.children?.length) { acc.add(node.id); node.children.forEach(c => collectParentIds(c, acc)); }
}

function applyOverride(id: string, base: Record<string, unknown>, ov: Record<string, Record<string, string>>) {
  const patch = ov[id];
  if (!patch) return base;
  const r = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    const parts = k.split('.');
    if (parts.length === 1) {
      r[k] = v;
    } else if (parts.length === 2) {
      const [p, c] = parts;
      r[p] = { ...(r[p] as Record<string, unknown> ?? {}), [c]: v };
    } else if (parts.length === 3) {
      // array item: e.g. "metricItems.0.value"
      const [arr, idx, sub] = parts;
      const index = parseInt(idx, 10);
      const existing = Array.isArray(r[arr]) ? [...(r[arr] as unknown[])] : [];
      existing[index] = { ...(existing[index] as Record<string, unknown> ?? {}), [sub]: v };
      r[arr] = existing;
    }
  }
  return r;
}

function buildPath(x1: number, y1: number, x2: number, y2: number, style: ConnectionStyle, isLR: boolean): string {
  if (style === 'straight') return `M ${x1} ${y1} L ${x2} ${y2}`;
  if (style === 'angular') {
    if (isLR) { const mx = (x1+x2)/2; return `M ${x1} ${y1} L ${mx} ${y1} L ${mx} ${y2} L ${x2} ${y2}`; }
    const my = (y1+y2)/2; return `M ${x1} ${y1} L ${x1} ${my} L ${x2} ${my} L ${x2} ${y2}`;
  }
  if (isLR) { const mx = (x1+x2)/2; return `M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`; }
  const my = (y1+y2)/2;
  return `M ${x1} ${y1} C ${x1} ${my} ${x2} ${my} ${x2} ${y2}`;
}

const SNAP_DIST = 55;
const PADDING = 64;

interface LayoutNodeLike { id: string; x: number; y: number; w: number; h: number; parentId?: string }

function annotationsToDrawingElements(
  annotations: MapAnnotations,
  nodes: LayoutNodeLike[],
  visibleNodeIds?: Set<string>,
  layoutMode: LayoutMode = 'top-down',
  detachedNodes?: Set<string>
): DrawElement[] {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const visible = visibleNodeIds ?? new Set(nodes.map(n => n.id));
  const el: DrawElement[] = [];
  let idx = 0;
  const hasArrows = !!annotations.arrows?.length;
  const imageAnchors: Record<number, { x: number; y: number }> = {};
  const imagesPerNode = new Map<string, number>();
  const textsPerNode = new Map<string, number>();
  if (annotations.texts?.length) {
    for (let textIndex = 0; textIndex < annotations.texts.length; textIndex++) {
      const t = annotations.texts[textIndex];
      if (!visible.has(t.nodeId)) continue;
      if (detachedNodes && detachedNodes.has(t.nodeId)) continue;
      const n = byId.get(t.nodeId);
      if (!n) continue;
      const x = n.x + n.w / 2 + PADDING;
      const localIdx = textsPerNode.get(t.nodeId) ?? 0;
      const textGap = 22;
      const baseY = n.y + n.h + PADDING + 28;
      const y = baseY + localIdx * textGap;
      textsPerNode.set(t.nodeId, localIdx + 1);

      el.push({
        id: `ann-text-${textIndex}`,
        type: 'text',
        x,
        y,
        text: t.text || 'Texto',
        fontSize: Math.max(12, Math.min(80, t.fontSize ?? 24)),
        color: '#111',
        textAnchor: (t.textAnchor as 'start' | 'middle' | 'end') ?? 'middle',
        attachedToNodeId: t.nodeId,
      } as DrawText);
    }
  }
  if (annotations.images?.length) {
    for (let imageIndex = 0; imageIndex < annotations.images.length; imageIndex++) {
      const im = annotations.images[imageIndex];
      if (!visible.has(im.nodeId)) continue;
      if (detachedNodes && detachedNodes.has(im.nodeId)) continue;
      const n = byId.get(im.nodeId);
      if (!n || !im.url) continue;
      const w = Math.max(120, Math.min(480, im.width ?? 260));
      const h = Math.max(90, Math.min(320, im.height ?? 146));
      const localIdx = imagesPerNode.get(im.nodeId) ?? 0;
      const stackGap = 16;
      let x = n.x + n.w / 2 - w / 2 + PADDING;
      // Imagens acima do nó, empilhadas para cima
      let y = n.y + PADDING - h - 32 - localIdx * (h + stackGap);
      imagesPerNode.set(im.nodeId, localIdx + 1);

      el.push({
        id: `ann-img-${imageIndex}`,
        type: 'image',
        x,
        y,
        w,
        h,
        src: im.url,
        aspectRatio: w / h,
        attachedToNodeId: im.nodeId,
      } as DrawImage);
      imageAnchors[imageIndex] = { x: x + w / 2, y: y + h / 2 };
    }
  }
  if (annotations.arrows?.length) {
    for (const a of annotations.arrows) {
      if (!visible.has(a.fromNodeId)) continue;
      const from = byId.get(a.fromNodeId);
      if (!from) continue;

      // Âncora de origem: ponto na borda do card, já "por fora" do fluxo
      const fromCx = from.x + from.w / 2 + PADDING;
      const fromCy = from.y + from.h / 2 + PADDING;

      const resolveTarget = (): { x: number; y: number; r: number } | null => {
        if (typeof a.toImageIndex === 'number' && a.toImageIndex in imageAnchors) {
          const anchor = imageAnchors[a.toImageIndex];
          if (!anchor) return null;
          // raio aproximado para imagem (não temos width/height aqui, então usamos um valor fixo confortável)
          return { x: anchor.x, y: anchor.y, r: 48 };
        }
        if (a.toNodeId && visible.has(a.toNodeId)) {
          const to = byId.get(a.toNodeId);
          if (!to) return null;
          const toCx = to.x + to.w / 2 + PADDING;
          const toCy = to.y + to.h / 2 + PADDING;
          const toRadius = Math.min(to.w, to.h) * 0.38;
          return { x: toCx, y: toCy, r: toRadius };
        }
        return null;
      };

      const target = resolveTarget();
      if (!target) continue;

      const points: { x: number; y: number }[] = [];

      if (layoutMode === 'top-down') {
        // Origem: topo do card de origem, centro horizontal
        const x1 = from.x + from.w / 2 + PADDING;
        const y1 = from.y + PADDING;

        // Destino: topo do destino (nó ou imagem), ajustado pelo "raio"
        const x2 = target.x;
        const y2 = target.y - target.r;

        // Pista local logo acima dos dois nós (não sobe demais)
        const laneOffset = 56;
        const laneY = Math.min(y1, y2) - laneOffset;

        points.push({ x: x1, y: y1 });
        points.push({ x: x1, y: laneY });
        points.push({ x: x2, y: laneY });
        points.push({ x: x2, y: y2 });
      } else {
        // Fallback simples para outros layouts: curva leve entre centros
        points.push({ x: fromCx, y: fromCy });
        points.push({ x: target.x, y: target.y });
      }

      el.push({
        id: `ann-arrow-${idx++}`,
        type: 'arrow',
        points,
        color: 'rgba(0,0,0,0.88)',
        strokeWidth: 2,
      } as DrawArrow);
    }
  }
  return el;
}

export default function MapRenderer({
  mapData,
  layoutMode: lmProp,
  connectionStyle: csProp,
  onRequestExpandNode,
  expandingNodeId,
  onReparentNode,
  onReparentAnnotation,
  onDeleteAnnotation,
  onCreateCard,
  creatingCard,
  userPlan,
  connectionSourceAfterCreate,
  onConsumeConnectionSourceAfterCreate,
  readOnly = false,
}: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale]   = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const scaleRef  = useRef(1);
  const [panning, setPanning] = useState(false);
  const panStart  = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  useEffect(() => { offsetRef.current = offset; }, [offset]);
  useEffect(() => { scaleRef.current  = scale;  }, [scale]);

  const zoomAnimRef = useRef<number | null>(null);
  const ZOOM_DURATION = 280;
  const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

  const animateZoomTo = useCallback((targetScale: number, targetOffset: { x: number; y: number }) => {
    if (zoomAnimRef.current != null) cancelAnimationFrame(zoomAnimRef.current);
    const startScale = scaleRef.current;
    const startOffset = { ...offsetRef.current };
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / ZOOM_DURATION);
      const k = easeOutCubic(t);
      const s = startScale + (targetScale - startScale) * k;
      const ox = startOffset.x + (targetOffset.x - startOffset.x) * k;
      const oy = startOffset.y + (targetOffset.y - startOffset.y) * k;
      setScale(s); scaleRef.current = s;
      setOffset({ x: ox, y: oy }); offsetRef.current = { x: ox, y: oy };
      if (t < 1) zoomAnimRef.current = requestAnimationFrame(tick);
      else zoomAnimRef.current = null;
    };
    zoomAnimRef.current = requestAnimationFrame(tick);
  }, []);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Record<string, string>>>({});
  const [detachedNodes, setDetachedNodes] = useState<Set<string>>(new Set());
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  useEffect(() => {
    if (connectionSourceAfterCreate != null && onConsumeConnectionSourceAfterCreate) {
      setConnectingFrom(connectionSourceAfterCreate);
      onConsumeConnectionSourceAfterCreate();
    }
  }, [connectionSourceAfterCreate, onConsumeConnectionSourceAfterCreate]);

  /* Card drag */
  const [baseOffsets, setBaseOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const activeDeltaRef = useRef<Record<string, { x: number; y: number }>>({});
  const [dragTick, setDragTick] = useState(0);
  const rafRef = useRef<number | null>(null);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => { rafRef.current = null; setDragTick(t => t + 1); });
  }, []);

  const handleCardDrag = useCallback((nodeId: string, delta: { x: number; y: number }) => {
    activeDeltaRef.current[nodeId] = delta; scheduleUpdate();
  }, [scheduleUpdate]);

  const handleCardDragEnd = useCallback((nodeId: string, delta: { x: number; y: number }) => {
    if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    const active = activeDeltaRef.current[nodeId] ?? delta;
    delete activeDeltaRef.current[nodeId];
    setBaseOffsets(prev => ({
      ...prev, [nodeId]: { x: (prev[nodeId]?.x ?? 0) + active.x, y: (prev[nodeId]?.y ?? 0) + active.y },
    }));
  }, []);

  const getTotalOffset = useCallback((nodeId: string) => {
    const base   = baseOffsets[nodeId]            ?? { x: 0, y: 0 };
    const active = activeDeltaRef.current[nodeId] ?? { x: 0, y: 0 };
    return { x: base.x + active.x, y: base.y + active.y };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseOffsets, dragTick]);

  /* Drawing state */
  const [drawingTool, setDrawingTool] = useState<DrawTool>('select');
  const [drawingElements, setDrawingElements] = useState<DrawElement[]>([]);
  const [activeArrow, setActiveArrow] = useState<{ points: { x: number; y: number }[] } | null>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);
  const [snapPos, setSnapPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [pendingText, setPendingText] = useState<{ text: string; fontSize: number; align: import('@/lib/drawingTypes').TextAlign } | null>(null);
  const [arrowPresetPoints, setArrowPresetPoints] = useState<ArrowPreset>(null);
  const [arrowPresetActive, setArrowPresetActive] = useState(false);
  /** Posições (e tamanhos) que o usuário alterou em anotações — preservadas ao reconstruir da IA */
  const [annotationPositionOverrides, setAnnotationPositionOverrides] = useState<Record<string, { x: number; y: number; w?: number; h?: number }>>({});

  const appliedAnnotationsRef = useRef<string | null>(null);
  const prevMapTitleRef = useRef<string | null>(null);
  const prevTextsLengthRef = useRef<number>(0);
  const prevImagesLengthRef = useRef<number>(0);

  useEffect(() => {
    if (prevMapTitleRef.current !== null && prevMapTitleRef.current !== mapData.title) {
      setDrawingElements([]);
      appliedAnnotationsRef.current = null;
    }
    prevMapTitleRef.current = mapData.title;
  }, [mapData.title]);

  const activeArrowRef = useRef(activeArrow);
  useEffect(() => { activeArrowRef.current = activeArrow; }, [activeArrow]);

  /* Arrow point dragging */
  const draggingPoint = useRef<{ arrowId: string; idx: number } | null>(null);
  /* Text dragging */
  const draggingText = useRef<{ id: string; startX: number; startY: number; startElX: number; startElY: number } | null>(null);
  /* Arrow moving */
  const movingArrow = useRef<{ id: string; startX: number; startY: number; origPoints: { x: number; y: number }[] } | null>(null);

  /* Image resize */
  const resizingImage = useRef<{
    id: string; corner: string;
    startX: number; startY: number;
    origX: number; origY: number; origW: number; origH: number;
    aspectRatio?: number;
  } | null>(null);
  /* Image moving */
  const movingImage = useRef<{ id: string; startX: number; startY: number; startElX: number; startElY: number } | null>(null);

  const isDrawingMode = drawingTool !== 'select';
  const isPlacingImage = drawingTool === 'image' && !!pendingImageSrc;
  const isPlacingText = drawingTool === 'text' && !!pendingText;

  const layoutMode      = lmProp ?? mapData.layoutMode      ?? 'top-down';
  const connectionStyle = csProp ?? mapData.connectionStyle  ?? 'bezier';
  const isLR = layoutMode === 'left-right';

  const parentIds = useMemo(() => {
    const s = new Set<string>(); collectParentIds(mapData.rootNode, s); return s;
  }, [mapData]);

  /* Layout sempre com a árvore completa para que, ao colapsar, o resto do mapa não se desloque. A ocultação é só visual (nós/arestas filtrados por visibleNodeIds). */
  const { nodes: allNodes, canvasW, canvasH } = useMemo(
    () => computeLayout(mapData.rootNode, layoutMode),
    [mapData.rootNode, layoutMode]
  );
  const visibleNodeIds = useMemo(
    () => collectVisibleNodeIds(mapData.rootNode, collapsed),
    [mapData.rootNode, collapsed]
  );
  const nodes = allNodes;

  // Auto-fit ao montar o mapa pela primeira vez
  const didAutoFit = useRef(false);
  useEffect(() => {
    if (didAutoFit.current || nodes.length === 0) return;
    const el = containerRef.current;
    if (!el || el.clientWidth === 0 || el.clientHeight === 0) return;
    didAutoFit.current = true;
    // Pequeno delay para garantir que o layout foi pintado
    const t = setTimeout(() => {
      const vw = el.clientWidth, vh = el.clientHeight;
      const cw = canvasW + PADDING * 2, ch = canvasH + PADDING * 2;
      const targetScale = Math.max(0.15, Math.min(1, Math.min(vw / cw, vh / ch) * 0.9));
      const targetOffset = { x: (vw - cw * targetScale) / 2, y: (vh - ch * targetScale) / 2 };
      animateZoomTo(targetScale, targetOffset);
    }, 80);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, canvasW, canvasH]);

  useEffect(() => {
    if (!mapData.annotations || nodes.length === 0) return;
    const textsLen = mapData.annotations.texts?.length ?? 0;
    const imagesLen = mapData.annotations.images?.length ?? 0;
    if (textsLen < prevTextsLengthRef.current || imagesLen < prevImagesLengthRef.current) {
      setAnnotationPositionOverrides({});
    }
    prevTextsLengthRef.current = textsLen;
    prevImagesLengthRef.current = imagesLen;

    const elements = annotationsToDrawingElements(
      mapData.annotations,
      nodes,
      visibleNodeIds,
      layoutMode,
      detachedNodes,
    );
    setDrawingElements(prev => {
      if (prevMapTitleRef.current !== mapData.title) return elements;
      const merged = elements.map(el => {
        const ov = annotationPositionOverrides[el.id];
        if (!ov) return el;
        if (el.type === 'text') return { ...el, x: ov.x, y: ov.y } as DrawText;
        if (el.type === 'image') return { ...el, x: ov.x, y: ov.y, w: ov.w ?? (el as DrawImage).w, h: ov.h ?? (el as DrawImage).h } as DrawImage;
        return el;
      });
      return [...prev.filter(e => !e.id.startsWith('ann-')), ...merged];
    });
    appliedAnnotationsRef.current = mapData.title;
  }, [mapData.title, mapData.annotations, nodes, visibleNodeIds, detachedNodes, annotationPositionOverrides]);

  const positionedNodes = useMemo(() => nodes.map(n => {
    const d = getTotalOffset(n.id);
    return { ...n, x: n.x + PADDING + d.x, y: n.y + PADDING + d.y };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [nodes, dragTick, baseOffsets]);

  const findSnap = useCallback((pos: { x: number; y: number }) => {
    for (const n of positionedNodes) {
      if (!visibleNodeIds.has(n.id)) continue;
      const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
      if (Math.sqrt((cx - pos.x) ** 2 + (cy - pos.y) ** 2) < SNAP_DIST) return { x: cx, y: cy };
    }
    return null;
  }, [positionedNodes, visibleNodeIds]);

  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: (clientX - rect.left - offsetRef.current.x) / scaleRef.current,
      y: (clientY - rect.top  - offsetRef.current.y) / scaleRef.current,
    };
  }, []);

  /* Center on load */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const vw = el.clientWidth, vh = el.clientHeight;
    const cw = canvasW + PADDING * 2, ch = canvasH + PADDING * 2;
    const s  = Math.max(0.28, Math.min(1, Math.min(vw / cw, vh / ch) * 0.9));
    const no = { x: (vw - cw * s) / 2, y: (vh - ch * s) / 2 };
    setScale(s); scaleRef.current = s;
    setOffset(no); offsetRef.current = no;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveArrow(null); setPreviewPos(null); setSnapPos(null);
        setPendingText(null); setPendingImageSrc(null); setArrowPresetActive(false);
        if (drawingTool !== 'select') setDrawingTool('select');
        setSelectedId(null);
        setConnectingFrom(null);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setDrawingElements(prev => prev.filter(el => el.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawingTool, selectedId]);

  const drawColor = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(20,20,20,0.88)';

  const connectingLabel = useMemo(() => {
    if (!connectingFrom) return null;
    const n = nodes.find(n => n.id === connectingFrom);
    return n?.label ?? null;
  }, [connectingFrom, nodes]);

  /* ── Drawing capture overlay handlers ── */
  const handleDrawPointerMove = useCallback((e: React.PointerEvent) => {
    const pos = screenToCanvas(e.clientX, e.clientY);
    if (drawingTool === 'arrow') {
      const snap = findSnap(pos);
      setPreviewPos(snap ?? pos);
      setSnapPos(snap);
    }
  }, [screenToCanvas, findSnap, drawingTool]);

  const handleDrawClick = useCallback((e: React.MouseEvent) => {
    if (e.detail >= 2) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    if (isPlacingText && pendingText) {
      const id = `txt-${Date.now()}`;
      setDrawingElements(prev => [...prev, { id, type: 'text', x: pos.x, y: pos.y, text: pendingText.text, fontSize: pendingText.fontSize, color: drawColor, textAnchor: pendingText.align }]);
      setPendingText(null);
      setDrawingTool('select');
      setSelectedId(id);
      return;
    }
    if (drawingTool === 'arrow' || arrowPresetActive) {
      const snap = findSnap(pos);
      const pt = snap ?? pos;
      const current = activeArrowRef.current;
      const nextPoints = current ? [...current.points, pt] : [pt];
      const preset = arrowPresetPoints ?? 0;
      if (preset > 0 && nextPoints.length >= preset) {
        const id = `arr-${Date.now()}`;
        setDrawingElements(prev => [...prev, { id, type: 'arrow', points: nextPoints, color: drawColor, strokeWidth: 2 } as DrawArrow]);
        setActiveArrow(null);
        setPreviewPos(null);
        setSnapPos(null);
        setArrowPresetActive(false);
        setDrawingTool('select');
        setSelectedId(id);
      } else {
        setActiveArrow({ points: nextPoints });
      }
      return;
    }
    if (isPlacingImage && pendingImageSrc) {
      const id = `img-${Date.now()}`;
      const ar = imageAspectRef.current;
      const w = 220;
      const h = ar ? w / ar : 155;
      setDrawingElements(prev => [...prev, { id, type: 'image', x: pos.x, y: pos.y, w, h, src: pendingImageSrc, aspectRatio: ar }]);
      setPendingImageSrc(null);
      imageAspectRef.current = undefined;
      setDrawingTool('select');
      setSelectedId(id);
    }
  }, [drawingTool, screenToCanvas, findSnap, drawColor, isPlacingImage, pendingImageSrc, isPlacingText, pendingText, arrowPresetActive, arrowPresetPoints]);

  const handleDrawDblClick = useCallback((e: React.MouseEvent) => {
    if (drawingTool !== 'arrow' || arrowPresetActive) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    const snap = findSnap(pos);
    const pt = snap ?? pos;
    const current = activeArrowRef.current;
    if (current && current.points.length >= 1) {
      const finalPoints = [...current.points, pt];
      if (finalPoints.length >= 2) {
        const id = `arr-${Date.now()}`;
        setDrawingElements(prev => [...prev, { id, type: 'arrow', points: finalPoints, color: drawColor, strokeWidth: 2 } as DrawArrow]);
        setDrawingTool('select');
        setSelectedId(id);
      }
    }
    setActiveArrow(null); setPreviewPos(null); setSnapPos(null);
  }, [drawingTool, screenToCanvas, findSnap, drawColor, arrowPresetActive]);

  /* Arrow point drag (handled at container level) */
  const handleStartDragPoint = useCallback((arrowId: string, idx: number, e: React.PointerEvent) => {
    draggingPoint.current = { arrowId, idx };
    containerRef.current?.setPointerCapture(e.pointerId);
  }, []);

  /* Image resize (handled at container level); aspectRatio fixa o quadro */
  const handleStartImageResize = useCallback((imgId: string, corner: string, e: React.PointerEvent) => {
    const img = drawingElements.find(el => el.id === imgId) as DrawImage | undefined;
    if (!img) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    resizingImage.current = {
      id: imgId, corner, startX: pos.x, startY: pos.y,
      origX: img.x, origY: img.y, origW: img.w, origH: img.h,
      aspectRatio: img.aspectRatio,
    };
    containerRef.current?.setPointerCapture(e.pointerId);
  }, [drawingElements, screenToCanvas]);

  const handleStartDragText = useCallback((textId: string, e: React.PointerEvent) => {
    const el = drawingElements.find(x => x.id === textId);
    if (!el || el.type !== 'text') return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    draggingText.current = { id: textId, startX: pos.x, startY: pos.y, startElX: el.x, startElY: el.y };
    setSelectedId(textId);
    containerRef.current?.setPointerCapture(e.pointerId);
  }, [drawingElements, screenToCanvas]);

  const handleStartMoveArrow = useCallback((arrowId: string, e: React.PointerEvent) => {
    const el = drawingElements.find(x => x.id === arrowId);
    if (!el || el.type !== 'arrow') return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    movingArrow.current = { id: arrowId, startX: pos.x, startY: pos.y, origPoints: (el as DrawArrow).points.map(p => ({ ...p })) };
    setSelectedId(arrowId);
    containerRef.current?.setPointerCapture(e.pointerId);
  }, [drawingElements, screenToCanvas]);

  const handleStartMoveImage = useCallback((imgId: string, e: React.PointerEvent) => {
    const el = drawingElements.find(x => x.id === imgId);
    if (!el || el.type !== 'image') return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    const img = el as DrawImage;
    movingImage.current = { id: imgId, startX: pos.x, startY: pos.y, startElX: img.x, startElY: img.y };
    setSelectedId(imgId);
    containerRef.current?.setPointerCapture(e.pointerId);
  }, [drawingElements, screenToCanvas]);

  /* Tool change */
  const handleToolChange = useCallback((tool: DrawTool) => {
    if (tool === 'image') {
      const selected = selectedId
        ? drawingElements.find(el => el.id === selectedId && el.type === 'image') as DrawImage | undefined
        : undefined;
      setEditingImageId(selected ? selected.id : null);
      setDrawingTool('image');
      setActiveArrow(null);
      setPreviewPos(null);
      setSnapPos(null);
      setArrowPresetActive(false);
      setPendingText(null);
      if (!selected) {
        setSelectedId(null);
      }
      return;
    }
    setDrawingTool(tool);
    if (tool !== 'arrow') {
      setActiveArrow(null);
      setPreviewPos(null);
      setSnapPos(null);
      setArrowPresetActive(false);
    }
    setPendingImageSrc(null);
    setEditingImageId(null);
    if (tool !== 'text') setPendingText(null);
    setSelectedId(null);
  }, [drawingElements, selectedId]);

  const imageAspectRef = useRef<number | undefined>(undefined);
  const handleImageReady = useCallback((src: string, aspectRatio?: number) => {
    if (editingImageId) {
      setDrawingElements(prev => prev.map(el => {
        if (el.id !== editingImageId || el.type !== 'image') return el;
        const img = el as DrawImage;
        return {
          ...img,
          src,
          aspectRatio: aspectRatio ?? img.aspectRatio,
        };
      }));
    } else {
      setPendingImageSrc(src);
      imageAspectRef.current = aspectRatio;
    }
    if (editingImageId) {
      setEditingImageId(null);
      setDrawingTool('select');
      setSelectedId(editingImageId);
    }
  }, [editingImageId]);

  /* ── Pan & pointer handling at container level ── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (isDrawingMode || draggingPoint.current || resizingImage.current || draggingText.current || movingArrow.current || movingImage.current) return;
    setEditingId(null);
    setSelectedId(null);
    setPanning(true);
    panStart.current  = { x: e.clientX, y: e.clientY };
    panOrigin.current = { ...offsetRef.current };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [isDrawingMode]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (draggingText.current) {
      const { id, startX, startY, startElX, startElY } = draggingText.current;
      const pos = screenToCanvas(e.clientX, e.clientY);
      const dx = pos.x - startX, dy = pos.y - startY;
      const newX = startElX + dx, newY = startElY + dy;
      setDrawingElements(prev => prev.map(el => {
        if (el.id !== id || el.type !== 'text') return el;
        return { ...el, x: newX, y: newY };
      }));
      if (id.startsWith('ann-')) {
        setAnnotationPositionOverrides(prev => ({ ...prev, [id]: { ...prev[id], x: newX, y: newY } }));
      }
      return;
    }
    if (movingImage.current) {
      const { id, startX, startY, startElX, startElY } = movingImage.current;
      const pos = screenToCanvas(e.clientX, e.clientY);
      const dx = pos.x - startX, dy = pos.y - startY;
      const newX = startElX + dx, newY = startElY + dy;
      setDrawingElements(prev => prev.map(el => {
        if (el.id !== id || el.type !== 'image') return el;
        return { ...el, x: newX, y: newY };
      }));
      if (id.startsWith('ann-')) {
        setAnnotationPositionOverrides(prev => ({ ...prev, [id]: { ...prev[id], x: newX, y: newY } }));
      }
      return;
    }
    if (movingArrow.current) {
      const { id, startX, startY, origPoints } = movingArrow.current;
      const pos = screenToCanvas(e.clientX, e.clientY);
      const dx = pos.x - startX, dy = pos.y - startY;
      setDrawingElements(prev => prev.map(el => {
        if (el.id !== id || el.type !== 'arrow') return el;
        return { ...el, points: origPoints.map(p => ({ x: p.x + dx, y: p.y + dy })) };
      }));
      return;
    }
    if (draggingPoint.current) {
      const { arrowId, idx } = draggingPoint.current;
      const pos = screenToCanvas(e.clientX, e.clientY);
      setDrawingElements(prev => prev.map(el => {
        if (el.id !== arrowId || el.type !== 'arrow') return el;
        const pts = [...(el as DrawArrow).points];
        pts[idx] = pos;
        return { ...el, points: pts };
      }));
      return;
    }
    if (resizingImage.current) {
      const { id, corner, startX, startY, origX, origY, origW, origH, aspectRatio } = resizingImage.current;
      const pos = screenToCanvas(e.clientX, e.clientY);
      const dx = pos.x - startX, dy = pos.y - startY;
      const MIN = 60;
      let newW = origW, newH = origH;
      if (aspectRatio != null) {
        if (corner.includes('e')) newW = Math.max(MIN, origW + dx);
        if (corner.includes('s')) newH = Math.max(MIN, origH + dy);
        if (corner.includes('w')) newW = Math.max(MIN, origW - dx);
        if (corner.includes('n')) newH = Math.max(MIN, origH - dy);
        if (corner.includes('e') || corner.includes('w')) newH = newW / aspectRatio;
        else if (corner.includes('s') || corner.includes('n')) newW = newH * aspectRatio;
      }
      setDrawingElements(prev => prev.map(el => {
        if (el.id !== id || el.type !== 'image') return el;
        let x = (el as DrawImage).x, y = (el as DrawImage).y, w = (el as DrawImage).w, h = (el as DrawImage).h;
        if (aspectRatio != null) {
          w = newW; h = newH;
          if (corner.includes('w')) x = origX + origW - w;
          if (corner.includes('n')) y = origY + origH - h;
        } else {
          if (corner.includes('e')) w = Math.max(MIN, origW + dx);
          if (corner.includes('s')) h = Math.max(MIN, origH + dy);
          if (corner.includes('w')) { x = Math.min(origX + origW - MIN, origX + dx); w = Math.max(MIN, origW - dx); }
          if (corner.includes('n')) { y = Math.min(origY + origH - MIN, origY + dy); h = Math.max(MIN, origH - dy); }
        }
        return { ...el, x, y, w, h };
      }));
      if (id.startsWith('ann-')) {
        let x = origX, y = origY, w = origW, h = origH;
        if (aspectRatio != null) {
          w = newW; h = newH;
          if (corner.includes('w')) x = origX + origW - w;
          if (corner.includes('n')) y = origY + origH - h;
        } else {
          if (corner.includes('e')) w = Math.max(MIN, origW + dx);
          if (corner.includes('s')) h = Math.max(MIN, origH + dy);
          if (corner.includes('w')) { x = Math.min(origX + origW - MIN, origX + dx); w = Math.max(MIN, origW - dx); }
          if (corner.includes('n')) { y = Math.min(origY + origH - MIN, origY + dy); h = Math.max(MIN, origH - dy); }
        }
        setAnnotationPositionOverrides(prev => ({ ...prev, [id]: { ...prev[id], x, y, w, h } }));
      }
      return;
    }
    if (!panning) return;
    const no = { x: panOrigin.current.x + e.clientX - panStart.current.x, y: panOrigin.current.y + e.clientY - panStart.current.y };
    setOffset(no); offsetRef.current = no;
  }, [panning, screenToCanvas]);

  const onPointerUp = useCallback(() => {
    draggingPoint.current = null;
    draggingText.current = null;
    movingArrow.current = null;
    movingImage.current = null;
    resizingImage.current = null;
    setPanning(false);
  }, []);

  const handleUpdateDrawingElement = useCallback((id: string, patch: Partial<DrawElement>) => {
    setDrawingElements(prev => prev.map(el => (el.id === id ? { ...el, ...patch } as DrawElement : el)));
    if (id.startsWith('ann-')) {
      const p = patch as Partial<DrawText> & Partial<DrawImage>;
      if (p.x !== undefined || p.y !== undefined || p.w !== undefined || p.h !== undefined) {
        setAnnotationPositionOverrides(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            ...(p.x !== undefined && { x: p.x }),
            ...(p.y !== undefined && { y: p.y }),
            ...(p.w !== undefined && { w: p.w }),
            ...(p.h !== undefined && { h: p.h }),
          },
        }));
      }
    }
  }, []);

  const handleDeleteDrawingElement = useCallback((id: string) => {
    setDrawingElements(prev => prev.filter(el => el.id !== id));
    setSelectedId(null);
    if (id.startsWith('ann-')) {
      onDeleteAnnotation?.(id);
      setAnnotationPositionOverrides(prev => { const next = { ...prev }; delete next[id]; return next; });
    }
  }, [onDeleteAnnotation]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const s = scaleRef.current;
    const ns = Math.max(0.15, Math.min(3, s * factor));
    const ox = offsetRef.current.x;
    const oy = offsetRef.current.y;
    const no = {
      x: mx - (mx - ox) * (ns / s),
      y: my - (my - oy) * (ns / s),
    };
    scaleRef.current = ns;
    offsetRef.current = no;
    setScale(ns);
    setOffset(no);
  }, []);

  const zoom = useCallback((dir: 1 | -1) => {
    const el = containerRef.current; if (!el) return;
    const vw = el.clientWidth, vh = el.clientHeight;
    const s = scaleRef.current;
    const ns = Math.max(0.15, Math.min(3, s * (dir > 0 ? 1.2 : 0.83)));
    const ox = offsetRef.current.x, oy = offsetRef.current.y;
    const cx = vw / 2, cy = vh / 2;
    const no = {
      x: cx - (cx - ox) * (ns / s),
      y: cy - (cy - oy) * (ns / s),
    };
    animateZoomTo(ns, no);
  }, [animateZoomTo]);

  const fitAll = useCallback(() => {
    const el = containerRef.current; if (!el) return;
    const vw = el.clientWidth, vh = el.clientHeight;
    const cw = canvasW + PADDING * 2, ch = canvasH + PADDING * 2;
    const targetScale = Math.max(0.15, Math.min(1, Math.min(vw / cw, vh / ch) * 0.9));
    const targetOffset = { x: (vw - cw * targetScale) / 2, y: (vh - ch * targetScale) / 2 };
    animateZoomTo(targetScale, targetOffset);
  }, [canvasW, canvasH, animateZoomTo]);

  const handleFieldChange = useCallback((nodeId: string, field: string, value: string) => {
    setOverrides(prev => ({ ...prev, [nodeId]: { ...(prev[nodeId] ?? {}), [field]: value } }));
  }, []);

  /* Edges: desenhar todas; opacidade 0 quando filho oculto ou desconectado (transição suave, sem deslocar o mapa) */
  const c = colors(isDark);
  const edges = nodes.filter(n => n.parentId).map(child => {
    const parent = nodes.find(n => n.id === child.parentId);
    if (!parent) return null;
    const pD = getTotalOffset(parent.id), cD = getTotalOffset(child.id);
    const px = parent.x + PADDING + pD.x, py = parent.y + PADDING + pD.y;
    const cx = child.x + PADDING + cD.x, cy = child.y + PADDING + cD.y;
    const x1 = isLR ? px + parent.w + 12 : px + parent.w / 2;
    const y1 = isLR ? py + parent.h / 2 : py + parent.h + 12;
    const x2 = isLR ? cx : cx + child.w / 2;
    const y2 = isLR ? cy + child.h / 2 : cy;
    return {
      id: child.id,
      d: buildPath(x1, y1, x2, y2, connectionStyle, isLR),
      visible: visibleNodeIds.has(child.id) && !detachedNodes.has(child.id),
    };
  }).filter(Boolean) as Array<{ id: string; d: string; visible: boolean }>;

  /* Conexões nó → imagem/texto: mesmo sistema dos blocos (base do pai → topo do filho) */
  const annotationEdges = (() => {
    const out: Array<{ id: string; d: string; visible: boolean }> = [];
    for (const el of drawingElements) {
      const nodeId = el.type === 'image' ? (el as DrawImage).attachedToNodeId : el.type === 'text' ? (el as DrawText).attachedToNodeId : undefined;
      if (!nodeId || !visibleNodeIds.has(nodeId) || detachedNodes.has(nodeId)) continue;
      const parent = nodes.find(n => n.id === nodeId);
      if (!parent) continue;
      const pD = getTotalOffset(parent.id);
      const px = parent.x + PADDING + pD.x, py = parent.y + PADDING + pD.y;
      const x1 = isLR ? px + parent.w + 12 : px + parent.w / 2;
      const y1 = isLR ? py + parent.h / 2 : py + parent.h + 12;
      let x2: number, y2: number;
      if (el.type === 'image') {
        const im = el as DrawImage;
        x2 = isLR ? im.x : im.x + im.w / 2;
        y2 = isLR ? im.y + im.h / 2 : im.y - 6;
      } else {
        const tx = el as DrawText;
        const lines = tx.text.split('\n');
        const pad = 14, ascent = tx.fontSize * 0.95;
        const lineHeight = tx.fontSize * 1.38;
        const maxLen = Math.max(...lines.map(l => l.length), 1);
        const contentW = Math.min(340, Math.max(80, maxLen * tx.fontSize * 0.62));
        const boxW = contentW + pad * 2;
        const boxH = lines.length * lineHeight + pad * 2;
        const boxY = tx.y - ascent - pad;
        const anchor = tx.textAnchor ?? 'start';
        const boxX = anchor === 'start' ? tx.x - pad : anchor === 'middle' ? tx.x - contentW / 2 - pad : tx.x - contentW - pad;
        x2 = isLR ? boxX : boxX + boxW / 2;
        y2 = isLR ? boxY + boxH / 2 : boxY - 6;
      }
      out.push({
        id: `ann-edge-${el.id}`,
        d: buildPath(x1, y1, x2, y2, connectionStyle, isLR),
        visible: true,
      });
    }
    return out;
  })();

  const lineColor = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.28)';

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 30, height: 30, borderRadius: 8,
    border: `1px solid ${c.border}`,
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    color: c.muted, cursor: 'pointer', transition: 'all 0.18s',
  };

  const cursorStyle = panning ? 'grabbing'
    : isPlacingImage || isPlacingText ? 'pointer'
    : drawingTool === 'text'  ? 'text'
    : drawingTool === 'arrow' ? 'crosshair'
    : drawingTool === 'image' && !pendingImageSrc ? 'default'
    : 'default';

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', cursor: cursorStyle }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onWheel={onWheel}
    >
      {/* Scaled canvas */}
      <div style={{
        position: 'absolute', transformOrigin: '0 0',
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        width: canvasW + PADDING * 2, height: canvasH + PADDING * 2,
      }}>
        {/* Connectors */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 1 }}>
          {edges.map(e => (
            <path
              key={e.id}
              d={e.d}
              fill="none"
              stroke={lineColor}
              strokeWidth={1.5}
              strokeDasharray={connectionStyle === 'bezier' ? '5 4' : 'none'}
              style={{ opacity: e.visible ? 1 : 0, transition: 'opacity 0.25s ease' }}
            />
          ))}
          {annotationEdges.map(e => (
            <path
              key={e.id}
              d={e.d}
              fill="none"
              stroke={lineColor}
              strokeWidth={1.5}
              strokeDasharray={connectionStyle === 'bezier' ? '5 4' : 'none'}
              style={{ opacity: e.visible ? 1 : 0, transition: 'opacity 0.25s ease' }}
            />
          ))}
        </svg>

        {/* Drawing layer (abaixo dos cards para que cliques em área vazia façam pan) */}
        <DrawingLayer
          elements={drawingElements}
          activeArrow={activeArrow}
          previewPos={previewPos}
          isDark={isDark}
          canvasW={canvasW + PADDING * 2}
          canvasH={canvasH + PADDING * 2}
          snapPos={snapPos}
          drawingTool={drawingTool}
          selectedId={selectedId}
          onSelect={id => setSelectedId(prev => prev === id ? null : id)}
          onUpdateElement={handleUpdateDrawingElement}
          onDeleteElement={handleDeleteDrawingElement}
          onStartDragPoint={handleStartDragPoint}
          onAddArrowMidpoint={(arrowId, insertIdx, x, y) => {
            setDrawingElements(prev => prev.map(el => {
              if (el.id !== arrowId || el.type !== 'arrow') return el;
              const pts = [...(el as DrawArrow).points];
              pts.splice(insertIdx, 0, { x, y });
              return { ...el, points: pts };
            }));
          }}
          onStartImageResize={handleStartImageResize}
          onStartMoveImage={handleStartMoveImage}
          onStartDragText={handleStartDragText}
          onStartMoveArrow={handleStartMoveArrow}
          connectingFrom={connectingFrom}
          onAnnotationDotClick={id => setConnectingFrom(prev => prev === id ? null : id)}
        />

        {/* Wrapper com pointer-events: none para que cliques em área vazia passem para a camada de desenho/container; cards com pointer-events: auto */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
          <AnimatePresence>
            {nodes.map((node, i) => {
              const drag    = getTotalOffset(node.id);
              const rawNode = applyOverride(
                node.id,
                { ...node, x: node.x + PADDING + drag.x, y: node.y + PADDING + drag.y } as unknown as Record<string, unknown>,
                overrides
              );
              return (
                <MapCard
                  key={node.id}
                  node={rawNode as unknown as typeof node}
                  index={i}
                  isDark={isDark}
                  hasChildren={parentIds.has(node.id)}
                  isCollapsed={collapsed.has(node.id)}
                  isHidden={!visibleNodeIds.has(node.id)}
                  isDetached={detachedNodes.has(node.id)}
                  isExpanding={expandingNodeId === node.id}
                  isConnectionSource={connectingFrom === node.id}
                  hasConnectionSource={!!connectingFrom && connectingFrom !== node.id}
                  onToggle={() => setCollapsed(prev => {
                    const next = new Set(prev);
                    next.has(node.id) ? next.delete(node.id) : next.add(node.id);
                    return next;
                  })}
                  onToggleConnection={readOnly ? undefined : (() => {
                    const isAnnotationSource = connectingFrom?.startsWith('ann-');
                    if (isAnnotationSource && connectingFrom) {
                      return onReparentAnnotation ? () => {
                        onReparentAnnotation(connectingFrom, node.id);
                        setConnectingFrom(null);
                      } : undefined;
                    }
                    if (!node.parentId) return undefined;
                    return () => {
                      if (!connectingFrom) {
                        setDetachedNodes(prev => { const next = new Set(prev); next.add(node.id); return next; });
                        setConnectingFrom(node.id);
                        return;
                      }
                      if (connectingFrom === node.id) {
                        setConnectingFrom(null);
                        return;
                      }
                      if (onReparentNode) {
                        onReparentNode(connectingFrom, node.id);
                        setConnectingFrom(null);
                        setDetachedNodes(prev => { const next = new Set(prev); next.delete(connectingFrom); return next; });
                      }
                    };
                  })()}
                  onAddContent={onRequestExpandNode ? (id) => onRequestExpandNode(id) : undefined}
                  isEditing={readOnly ? false : editingId === node.id}
                  onStartEdit={readOnly ? undefined : () => setEditingId(node.id)}
                  onStopEdit={readOnly ? undefined : () => setEditingId(null)}
                  onFieldChange={readOnly ? undefined : (field, value) => handleFieldChange(node.id, field, value)}
                  onDrag={readOnly ? undefined : handleCardDrag}
                  onDragEnd={readOnly ? undefined : handleCardDragEnd}
                />
              );
            })}
          </AnimatePresence>
        </div>

        {/* Camada de textos e imagens por cima dos cards — nenhum elemento fica atrás do card */}
        <DrawingLayer
          elements={drawingElements}
          activeArrow={null}
          previewPos={null}
          isDark={isDark}
          canvasW={canvasW + PADDING * 2}
          canvasH={canvasH + PADDING * 2}
          snapPos={null}
          drawingTool={drawingTool}
          selectedId={selectedId}
          onSelect={id => setSelectedId(prev => prev === id ? null : id)}
          onUpdateElement={handleUpdateDrawingElement}
          onDeleteElement={handleDeleteDrawingElement}
          onStartDragPoint={handleStartDragPoint}
          onAddArrowMidpoint={() => {}}
          onStartImageResize={handleStartImageResize}
          onStartMoveImage={handleStartMoveImage}
          onStartDragText={handleStartDragText}
          onStartMoveArrow={handleStartMoveArrow}
          imageLayer
          connectingFrom={connectingFrom}
          onAnnotationDotClick={id => setConnectingFrom(prev => prev === id ? null : id)}
        />
        {/* Áreas de clique para imagens (por cima da camada, para selecionar sem bloquear cards) */}
        {drawingTool === 'select' && drawingElements.some(el => el.type === 'image') && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 16, pointerEvents: 'none' }}>
            {drawingElements.filter((el): el is DrawImage => el.type === 'image').map(img => (
              <div
                key={img.id}
                style={{
                  position: 'absolute',
                  left: img.x,
                  top: img.y,
                  width: img.w,
                  height: img.h,
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                }}
                onClick={e => { e.stopPropagation(); setSelectedId(prev => prev === img.id ? null : img.id); }}
                onPointerDown={e => e.stopPropagation()}
              />
            ))}
          </div>
        )}
      </div>

      {/* Overlay só quando estamos esperando clique no canvas (não cobre os painéis) */}
      {(isPlacingText || isPlacingImage || (drawingTool === 'arrow' && (arrowPresetActive || activeArrow !== null))) && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 40, cursor: cursorStyle }}
          onPointerMove={handleDrawPointerMove}
          onClick={handleDrawClick}
          onDoubleClick={handleDrawDblClick}
        />
      )}

      {/* Zoom e centralizar — horizontal, canto inferior direito */}
      <div style={{ position: 'absolute', bottom: 20, right: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, zIndex: 50 }}>
        {[
          { Icon: ZoomIn,  fn: () => zoom(1),  title: 'Aumentar zoom' },
          { Icon: ZoomOut, fn: () => zoom(-1), title: 'Diminuir zoom' },
          { Icon: Focus,   fn: fitAll,         title: 'Centralizar mapa' },
        ].map(({ Icon, fn, title }) => (
          <button key={title} onClick={fn} title={title} style={btnStyle}
            onPointerDown={e => e.stopPropagation()}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = c.text; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = c.muted; }}>
            <Icon size={13} strokeWidth={1.5} />
          </button>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 20, left: 20, fontSize: 10, fontFamily: 'Inter, monospace', color: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)', letterSpacing: '0.05em', userSelect: 'none', pointerEvents: 'none' }}>
        {Math.round(scale * 100)}%
      </div>

      {/* Painel de cards (lado esquerdo, dentro da área do mapa) */}
      {onCreateCard && (
        <CardPanel
          isDark={isDark}
          targets={nodes.map(n => ({ id: n.id, label: n.label }))}
          onCreateCard={onCreateCard}
          creatingCard={creatingCard}
          userPlan={userPlan}
        />
      )}

      {/* Drawing panel — oculto em modo somente leitura */}
      {!readOnly && (
        <DrawingPanel
          activeTool={drawingTool}
          onToolChange={handleToolChange}
          isDark={isDark}
          onClearAll={() => { setDrawingElements([]); setSelectedId(null); }}
          hasElements={drawingElements.length > 0}
        />
      )}

      {/* Image side panel */}
      {!readOnly && drawingTool === 'image' && !pendingImageSrc && (
        <ImagePanel
          isDark={isDark}
          mode={editingImageId ? 'edit' : 'place'}
          initialUrl={editingImageId ? (drawingElements.find(el => el.id === editingImageId && el.type === 'image') as DrawImage | undefined)?.src : undefined}
          onImageReady={handleImageReady}
          onClose={() => { setEditingImageId(null); handleToolChange('select'); }}
        />
      )}

      {/* Text side panel */}
      {!readOnly && drawingTool === 'text' && !pendingText && (
        <TextPanel
          isDark={isDark}
          mode="place"
          onPlace={(text, fontSize, align) => setPendingText({ text, fontSize, align })}
          onApply={() => {}}
          onClose={() => handleToolChange('select')}
        />
      )}
      {!readOnly && drawingTool === 'select' && selectedId && (() => {
        const sel = drawingElements.find(el => el.id === selectedId);
        if (!sel || sel.type !== 'text') return null;
        const t = sel as import('@/lib/drawingTypes').DrawText;
        const updateEl = (text: string, fontSize: number, align: import('@/lib/drawingTypes').TextAlign) => {
          setDrawingElements(prev => prev.map(el => el.id === selectedId ? { ...el, text, fontSize, textAnchor: align } : el));
        };
        return (
          <TextPanel
            key={selectedId}
            isDark={isDark}
            mode="edit"
            initialText={t.text}
            initialFontSize={t.fontSize}
            initialAlign={t.textAnchor ?? 'start'}
            onPlace={() => {}}
            onApply={updateEl}
            onLiveUpdate={updateEl}
            onClose={() => setSelectedId(null)}
          />
        );
      })()}

      {/* Arrow side panel */}
      {!readOnly && drawingTool === 'arrow' && (
        <ArrowPanel
          isDark={isDark}
          preset={arrowPresetPoints}
          onSelectPreset={setArrowPresetPoints}
          onPlace={(points) => { setArrowPresetPoints(points as ArrowPreset); setArrowPresetActive(true); }}
          onClose={() => { handleToolChange('select'); setArrowPresetPoints(null); setArrowPresetActive(false); }}
        />
      )}

      {/* Placement hints */}
      {isPlacingImage && (
        <div style={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)', padding: '6px 16px', borderRadius: 100, background: isDark ? 'rgba(20,20,20,0.9)' : 'rgba(248,248,248,0.9)', border: `1px solid ${c.border}`, fontSize: 11, fontWeight: 300, color: c.muted, backdropFilter: 'blur(8px)', pointerEvents: 'none', zIndex: 50 }}>
          Clique no canvas para posicionar a imagem
        </div>
      )}
      {isPlacingText && (
        <div style={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)', padding: '6px 16px', borderRadius: 100, background: isDark ? 'rgba(20,20,20,0.9)' : 'rgba(248,248,248,0.9)', border: `1px solid ${c.border}`, fontSize: 11, fontWeight: 300, color: c.muted, backdropFilter: 'blur(8px)', pointerEvents: 'none', zIndex: 50 }}>
          Clique no canvas para posicionar o texto
        </div>
      )}
    </div>
  );
}
