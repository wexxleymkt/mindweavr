'use client';

import { useState, useMemo, useEffect } from 'react';
import type { DrawElement, DrawArrow, DrawText, DrawImage, DrawTool, TextAlign } from '@/lib/drawingTypes';

/* ── Smooth Catmull-Rom spline ── */
export function catmullRomPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) {
    const [a, b] = pts;
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const curve = Math.min(len * 0.28, 60);
    const nx = -dy / len * curve, ny = dx / len * curve;
    return `M ${a.x} ${a.y} C ${a.x + dx / 3 + nx} ${a.y + dy / 3 + ny} ${b.x - dx / 3 + nx} ${b.y - dy / 3 + ny} ${b.x} ${b.y}`;
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

function arrowHeadPath(pts: { x: number; y: number }[], size = 14): string {
  if (pts.length < 2) return '';
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
  const s = 0.42;
  return `M ${last.x - size * Math.cos(angle - s)} ${last.y - size * Math.sin(angle - s)} L ${last.x} ${last.y} L ${last.x - size * Math.cos(angle + s)} ${last.y - size * Math.sin(angle + s)}`;
}

/* ── Arrow element ── */
function ArrowEl({
  arrow, isDark, selected, drawingTool,
  onSelect, onStartDragPoint, onAddMidpoint, onDelete, onStartMove,
}: {
  arrow: DrawArrow; isDark: boolean; selected: boolean; drawingTool: DrawTool;
  onSelect: () => void;
  onStartDragPoint: (idx: number, e: React.PointerEvent) => void;
  onAddMidpoint: (idx: number, x: number, y: number) => void;
  onDelete: () => void;
  onStartMove: (e: React.PointerEvent) => void;
}) {
  const pathD = useMemo(() => catmullRomPath(arrow.points), [arrow.points]);
  const headD = useMemo(() => arrowHeadPath(arrow.points), [arrow.points]);
  const isSelect = drawingTool === 'select';
  const center = useMemo(() => {
    const xs = arrow.points.map(p => p.x);
    const ys = arrow.points.map(p => p.y);
    return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
  }, [arrow.points]);

  return (
    <g style={{ pointerEvents: isSelect ? 'all' : 'none' } as React.CSSProperties}>
      {/* Área de clique para selecionar (stroke largo para pegar clique) */}
      {isSelect && (
        <path
          d={pathD}
          fill="none"
          stroke="transparent"
          strokeWidth={28}
          style={{ cursor: 'pointer', pointerEvents: 'all' } as React.CSSProperties}
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onSelect(); }}
        />
      )}

      {/* Visible path (cor segue o tema claro/escuro) */}
      <path d={pathD} fill="none" stroke={isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)'}
        strokeWidth={arrow.strokeWidth} strokeLinecap="round" strokeLinejoin="round"
        style={{ pointerEvents: 'none' }} />
      {headD && (
        <path d={headD} fill="none" stroke={isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)'}
          strokeWidth={arrow.strokeWidth} strokeLinecap="round" strokeLinejoin="round"
          style={{ pointerEvents: 'none' }} />
      )}

      {/* Selection + editing handles */}
      {selected && isSelect && (
        <g>
          {/* Move handle (center) */}
          <circle
            cx={center.x} cy={center.y} r={10}
            fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
            stroke={isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)'} strokeWidth={1.5}
            style={{ cursor: 'move', pointerEvents: 'all' } as React.CSSProperties}
            onPointerDown={e => { e.stopPropagation(); onStartMove(e); }}
          >
            <title>Arrastar para mover</title>
          </circle>
          {/* Delete button */}
          <g
            transform={`translate(${arrow.points[0].x - 14},${arrow.points[0].y - 14})`}
            style={{ cursor: 'pointer', pointerEvents: 'all' } as React.CSSProperties}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDelete(); }}
          >
            <circle r={9} fill={isDark ? 'rgba(30,30,30,0.92)' : 'rgba(245,245,245,0.92)'}
              stroke={isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'} strokeWidth={1} />
            <text textAnchor="middle" dominantBaseline="central" fontSize={12}
              fill={isDark ? '#fff' : '#000'} style={{ pointerEvents: 'none' }}>×</text>
          </g>

          {/* Midpoint "add point" circles */}
          {arrow.points.slice(0, -1).map((pt, i) => {
            const next = arrow.points[i + 1];
            const mx = (pt.x + next.x) / 2;
            const my = (pt.y + next.y) / 2;
            return (
              <circle
                key={`mid-${i}`} cx={mx} cy={my} r={5}
                fill={isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)'} fillOpacity={0.35}
                stroke={isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)'} strokeWidth={1}
                style={{ cursor: 'crosshair', pointerEvents: 'all' } as React.CSSProperties}
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); onAddMidpoint(i + 1, mx, my); }}
              >
                <title>Clique para adicionar ponto</title>
              </circle>
            );
          })}

          {/* Waypoint drag handles */}
          {arrow.points.map((pt, i) => (
            <circle
              key={i} cx={pt.x} cy={pt.y} r={7}
              fill={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}
              stroke={isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)'} strokeWidth={1.5}
              style={{ cursor: 'grab', pointerEvents: 'all' } as React.CSSProperties}
              onPointerDown={e => { e.stopPropagation(); onStartDragPoint(i, e); }}
            />
          ))}
        </g>
      )}
    </g>
  );
}

/* ── Text element (borda acompanha conteúdo e alinhamento) ── */
function TextEl({
  el, isDark, selected, drawingTool,
  onUpdate, onDelete, onSelect, onStartDrag,
  connectingFrom = null, onAnnotationDotClick,
}: {
  el: DrawText; isDark: boolean; selected: boolean; drawingTool: DrawTool;
  onUpdate: (p: Partial<DrawText>) => void;
  onDelete: () => void;
  onSelect: () => void;
  onStartDrag: (e: React.PointerEvent) => void;
  connectingFrom?: string | null;
  onAnnotationDotClick?: (id: string) => void;
}) {
  const lines = el.text.split('\n');
  const lineHeight = el.fontSize * 1.38;
  const pad = 14;
  const ascent = el.fontSize * 0.95;
  const maxLen = Math.max(...lines.map(l => l.length), 1);
  const contentW = Math.min(340, Math.max(80, maxLen * el.fontSize * 0.62));
  const boxW = contentW + pad * 2;
  const boxH = lines.length * lineHeight + pad * 2;
  const anchor = el.textAnchor ?? 'start';
  const boxX = anchor === 'start' ? el.x - pad
    : anchor === 'middle' ? el.x - contentW / 2 - pad
    : el.x - contentW - pad;
  const textX = el.x;
  const textAnchor = anchor === 'start' ? 'start' : anchor === 'middle' ? 'middle' : 'end';
  const boxY = el.y - ascent - pad;

  const isConnectionSource = connectingFrom === el.id;
  const dotBaseFill = isDark ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.22)';
  const dotBaseStroke = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.30)';
  const dotDetachedFill = isDark ? 'rgba(248,113,113,0.85)' : 'rgba(220,38,38,0.85)';
  const dotDetachedStroke = isDark ? 'rgba(248,113,113,0.95)' : 'rgba(185,28,28,0.95)';
  const dotFill = isConnectionSource ? dotDetachedFill : dotBaseFill;
  const dotStroke = isConnectionSource ? dotDetachedStroke : dotBaseStroke;
  const dotCx = boxX + boxW / 2;
  const dotCy = boxY - 6;
  const showConnectionDot = el.attachedToNodeId != null;
  const dotClickable = showConnectionDot && !!onAnnotationDotClick;

  return (
    <g
      style={{ pointerEvents: drawingTool === 'select' ? 'all' : 'none' } as React.CSSProperties}
      onPointerDown={e => { e.stopPropagation(); onStartDrag(e); }}
      onClick={e => { e.stopPropagation(); onSelect(); }}
    >
      {/* Ponto de conexão (topo central) — mesmo sistema dos blocos do funil */}
      {showConnectionDot && (dotClickable ? (
        <g
          style={{ cursor: 'pointer', pointerEvents: 'all' } as React.CSSProperties}
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onAnnotationDotClick(el.id); }}
        >
          <title>{isConnectionSource ? 'Clique para cancelar ou em um bloco para ligar aqui' : 'Clique para mover a conexão deste texto'}</title>
          <circle cx={dotCx} cy={dotCy} r={6} fill={dotFill} stroke={dotStroke} strokeWidth={1} />
        </g>
      ) : (
        <circle cx={dotCx} cy={dotCy} r={6} fill={dotFill} stroke={dotStroke} strokeWidth={1} style={{ pointerEvents: 'none' }} />
      ))}
      {/* Borda de seleção (y considera baseline: caixa acima do texto) */}
      {selected && (
        <>
          <rect
            x={boxX} y={boxY}
            width={boxW} height={boxH}
            fill="none"
            stroke={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}
            strokeWidth={1} strokeDasharray="4 3" rx={8}
          />
          <g
            transform={`translate(${boxX + boxW - 10},${boxY - 10})`}
            style={{ cursor: 'pointer', pointerEvents: 'all' } as React.CSSProperties}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDelete(); }}
          >
            <title>Excluir este texto</title>
            <circle r={10} fill={isDark ? 'rgba(28,28,28,0.94)' : 'rgba(245,245,245,0.94)'}
              stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'} strokeWidth={1} />
            <text textAnchor="middle" dominantBaseline="central" fontSize={12}
              fill={isDark ? '#fff' : '#000'} style={{ pointerEvents: 'none' }}>×</text>
          </g>
        </>
      )}

      {lines.map((line, i) => (
        <text
          key={i}
          x={textX}
          y={el.y + i * lineHeight}
          textAnchor={textAnchor}
          fontFamily="var(--font-caveat)"
          fontSize={el.fontSize}
          fill={isDark ? '#fff' : '#111'}
          style={{ userSelect: 'none' }}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/* ── Image element with resize e mover ── */
function ImageEl({
  el, isDark, selected, drawingTool,
  onUpdate, onDelete, onSelect, onStartResize, onStartMove,
  connectingFrom = null, onAnnotationDotClick,
}: {
  el: DrawImage; isDark: boolean; selected: boolean; drawingTool: DrawTool;
  onUpdate: (p: Partial<DrawImage>) => void;
  onDelete: () => void;
  onSelect: () => void;
  onStartResize: (corner: string, e: React.PointerEvent) => void;
  onStartMove: (e: React.PointerEvent) => void;
  connectingFrom?: string | null;
  onAnnotationDotClick?: (id: string) => void;
}) {
  const [loadError, setLoadError] = useState(false);
  const clipId = `img-clip-${el.id}`;
  const stroke = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.14)';
  const isSelect = drawingTool === 'select';

  useEffect(() => {
    setLoadError(false);
  }, [el.src]);

  const isConnectionSource = connectingFrom === el.id;
  const dotBaseFill = isDark ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.22)';
  const dotBaseStroke = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.30)';
  const dotDetachedFill = isDark ? 'rgba(248,113,113,0.85)' : 'rgba(220,38,38,0.85)';
  const dotDetachedStroke = isDark ? 'rgba(248,113,113,0.95)' : 'rgba(185,28,28,0.95)';
  const dotFill = isConnectionSource ? dotDetachedFill : dotBaseFill;
  const dotStroke = isConnectionSource ? dotDetachedStroke : dotBaseStroke;
  const dotCx = el.x + el.w / 2;
  const dotCy = el.y - 6;
  const showConnectionDot = el.attachedToNodeId != null;
  const dotClickable = showConnectionDot && !!onAnnotationDotClick;

  return (
    <g
      style={{ pointerEvents: isSelect ? 'all' : 'none' } as React.CSSProperties}
      onPointerDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); onSelect(); }}
    >
      {/* Ponto de conexão (topo central) — mesmo sistema dos blocos do funil */}
      {showConnectionDot && (dotClickable ? (
        <g
          style={{ cursor: 'pointer', pointerEvents: 'all' } as React.CSSProperties}
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onAnnotationDotClick(el.id); }}
        >
          <title>{isConnectionSource ? 'Clique para cancelar ou em um bloco para ligar aqui' : 'Clique para mover a conexão desta imagem'}</title>
          <circle cx={dotCx} cy={dotCy} r={6} fill={dotFill} stroke={dotStroke} strokeWidth={1} />
        </g>
      ) : (
        <circle cx={dotCx} cy={dotCy} r={6} fill={dotFill} stroke={dotStroke} strokeWidth={1} style={{ pointerEvents: 'none' }} />
      ))}
      <defs>
        <clipPath id={clipId}>
          <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={12} />
        </clipPath>
      </defs>
      {loadError ? (
        <g clipPath={`url(#${clipId})`}>
          <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={12}
            fill={isDark ? 'rgba(40,40,40,0.9)' : 'rgba(240,240,240,0.95)'}
            stroke={stroke} strokeWidth={1.5} />
          <text
            x={el.x + el.w / 2}
            y={el.y + el.h / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.min(14, el.h / 8)}
            fill={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
            style={{ pointerEvents: 'none' }}
          >
            Imagem não disponível
          </text>
        </g>
      ) : (
        <image
          href={el.src}
          x={el.x}
          y={el.y}
          width={el.w}
          height={el.h}
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
          style={{ pointerEvents: 'none' }}
          onError={() => setLoadError(true)}
        />
      )}
      <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={12}
        fill="none" stroke={stroke} strokeWidth={1.5}
        style={{ pointerEvents: 'none' }} />

      {/* Área clicável para selecionar quando não está selecionada (handles aparecem de novo) */}
      {!selected && (
        <g>
          <title>Clique para selecionar e editar</title>
          <rect
            x={el.x} y={el.y} width={el.w} height={el.h} rx={12}
            fill="transparent"
            style={{ cursor: 'pointer', pointerEvents: 'all' } as React.CSSProperties}
            onClick={e => { e.stopPropagation(); onSelect(); }}
          />
        </g>
      )}

      {selected && (
        <>
          {/* Área para arrastar e mover (debaixo dos handles) */}
          <g>
            <title>Arrastar para mover</title>
            <rect
              x={el.x} y={el.y} width={el.w} height={el.h} rx={12}
              fill="transparent"
              style={{ cursor: 'move', pointerEvents: 'all' } as React.CSSProperties}
              onPointerDown={e => { e.stopPropagation(); onStartMove(e); }}
            />
          </g>
          {/* Dashed selection */}
          <rect x={el.x - 3} y={el.y - 3} width={el.w + 6} height={el.h + 6} rx={15}
            fill="none"
            stroke={isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.22)'}
            strokeWidth={1} strokeDasharray="5 3"
            style={{ pointerEvents: 'none' }} />

          {/* Delete */}
          <g transform={`translate(${el.x + el.w},${el.y - 12})`}
            style={{ cursor: 'pointer', pointerEvents: 'all' } as React.CSSProperties}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDelete(); }}>
            <circle r={10}
              fill={isDark ? 'rgba(28,28,28,0.94)' : 'rgba(245,245,245,0.94)'}
              stroke={isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.10)'} strokeWidth={1} />
            <text textAnchor="middle" dominantBaseline="central" fontSize={13}
              fill={isDark ? '#fff' : '#000'} style={{ pointerEvents: 'none' }}>×</text>
          </g>

          {/* Corner resize handles */}
          {([
            ['se', el.x + el.w, el.y + el.h],
            ['sw', el.x,        el.y + el.h],
            ['ne', el.x + el.w, el.y       ],
            ['nw', el.x,        el.y       ],
          ] as [string, number, number][]).map(([corner, cx, cy]) => (
            <rect key={corner}
              x={cx - 5} y={cy - 5} width={10} height={10} rx={2}
              fill={isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)'}
              stroke={isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)'}
              strokeWidth={1}
              style={{ cursor: corner + '-resize', pointerEvents: 'all' } as React.CSSProperties}
              onPointerDown={e => { e.stopPropagation(); onStartResize(corner, e); }}
            />
          ))}
        </>
      )}
    </g>
  );
}

/* ══════════════════════════════
   MAIN EXPORT
══════════════════════════════ */
interface Props {
  elements: DrawElement[];
  activeArrow: { points: { x: number; y: number }[] } | null;
  previewPos: { x: number; y: number } | null;
  isDark: boolean;
  canvasW: number;
  canvasH: number;
  snapPos: { x: number; y: number } | null;
  drawingTool: DrawTool;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, patch: Partial<DrawElement>) => void;
  onDeleteElement: (id: string) => void;
  onStartDragPoint: (arrowId: string, idx: number, e: React.PointerEvent) => void;
  onAddArrowMidpoint: (arrowId: string, insertIdx: number, x: number, y: number) => void;
  onStartImageResize: (imgId: string, corner: string, e: React.PointerEvent) => void;
  onStartMoveImage: (imgId: string, e: React.PointerEvent) => void;
  onStartDragText: (textId: string, e: React.PointerEvent) => void;
  onStartMoveArrow: (arrowId: string, e: React.PointerEvent) => void;
  /** Quando true, renderiza só imagens e fica por cima dos cards (zIndex 15) */
  imageLayer?: boolean;
  /** Id do elemento ou nó que está como origem na conexão (bolinha vermelha) */
  connectingFrom?: string | null;
  /** Clique no ponto de conexão de uma anotação (imagem/texto com attachedToNodeId) */
  onAnnotationDotClick?: (elementId: string) => void;
}

export function DrawingLayer({
  elements, activeArrow, previewPos, isDark, canvasW, canvasH, snapPos,
  drawingTool, selectedId, onSelect, onUpdateElement, onDeleteElement,
  onStartDragPoint, onAddArrowMidpoint, onStartImageResize, onStartMoveImage,
  onStartDragText, onStartMoveArrow,
  imageLayer = false,
  connectingFrom = null,
  onAnnotationDotClick,
}: Props) {
  const previewColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const lastPt = activeArrow?.points.at(-1) ?? null;

  /* Camada de baixo: só setas. Camada de cima (por cima dos cards): imagens + textos para nunca ficarem atrás. */
  const toRender = imageLayer
    ? elements.filter((el): el is DrawImage | DrawText => el.type === 'image' || el.type === 'text')
    : elements.filter((el): el is DrawArrow => el.type === 'arrow');

  const aboveCardsHasSelection = imageLayer && selectedId != null && elements.some(el => (el.type === 'image' || el.type === 'text') && el.id === selectedId);

  /* Camada de cima: SVG com pointer-events: none para não bloquear os cards; só os elementos (texto/imagem) recebem clique. */
  return (
    <svg
      style={{
        position: 'absolute', top: 0, left: 0,
        width: canvasW, height: canvasH,
        overflow: 'visible',
        zIndex: imageLayer ? (aboveCardsHasSelection ? 17 : 15) : 6,
        pointerEvents: imageLayer ? 'none' : 'auto',
      }}
    >
      {/* Committed elements */}
      {toRender.map(el => {
        if (el.type === 'arrow') return (
          <ArrowEl
            key={el.id}
            arrow={el as DrawArrow}
            isDark={isDark}
            selected={selectedId === el.id}
            drawingTool={drawingTool}
            onSelect={() => onSelect(el.id)}
            onStartDragPoint={(idx, e) => onStartDragPoint(el.id, idx, e)}
            onAddMidpoint={(idx, x, y) => onAddArrowMidpoint(el.id, idx, x, y)}
            onDelete={() => onDeleteElement(el.id)}
            onStartMove={e => onStartMoveArrow(el.id, e)}
          />
        );
        if (el.type === 'text') return (
          <TextEl
            key={el.id}
            el={el as DrawText}
            isDark={isDark}
            selected={selectedId === el.id}
            drawingTool={drawingTool}
            onUpdate={p => onUpdateElement(el.id, p as Partial<DrawElement>)}
            onDelete={() => onDeleteElement(el.id)}
            onSelect={() => onSelect(el.id)}
            onStartDrag={e => onStartDragText(el.id, e)}
            connectingFrom={connectingFrom}
            onAnnotationDotClick={onAnnotationDotClick}
          />
        );
        if (el.type === 'image') return (
          <ImageEl
            key={el.id}
            el={el as DrawImage}
            isDark={isDark}
            selected={selectedId === el.id}
            drawingTool={drawingTool}
            onUpdate={p => onUpdateElement(el.id, p as Partial<DrawElement>)}
            onDelete={() => onDeleteElement(el.id)}
            connectingFrom={connectingFrom}
            onAnnotationDotClick={onAnnotationDotClick}
            onSelect={() => onSelect(el.id)}
            onStartResize={(corner, e) => onStartImageResize(el.id, corner, e)}
            onStartMove={e => onStartMoveImage(el.id, e)}
          />
        );
        return null;
      })}

      {/* Arrow being drawn (não na camada de imagens) */}
      {!imageLayer && activeArrow && activeArrow.points.length >= 2 && (
        <g style={{ pointerEvents: 'none' }}>
          <path d={catmullRomPath(activeArrow.points)} fill="none" stroke={previewColor}
            strokeWidth={2} strokeLinecap="round" />
          <path d={arrowHeadPath(activeArrow.points)} fill="none" stroke={previewColor}
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {/* Ghost line from last pt to cursor */}
      {!imageLayer && lastPt && previewPos && (
        <line x1={lastPt.x} y1={lastPt.y} x2={previewPos.x} y2={previewPos.y}
          stroke={previewColor} strokeWidth={1.5} strokeDasharray="5 4" strokeLinecap="round"
          style={{ pointerEvents: 'none' }} />
      )}

      {/* Waypoint dots during drawing */}
      {!imageLayer && activeArrow?.points.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r={4} fill={previewColor}
          style={{ pointerEvents: 'none' }} />
      ))}

      {/* Snap ring */}
      {!imageLayer && snapPos && (
        <circle cx={snapPos.x} cy={snapPos.y} r={20} fill="none"
          stroke={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'}
          strokeWidth={1.5} strokeDasharray="4 3"
          style={{ pointerEvents: 'none' }} />
      )}
    </svg>
  );
}
