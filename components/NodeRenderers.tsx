'use client';

import { motion, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { LayoutNode } from '@/lib/types';

/* ──────────────────── shared utils ──────────────────── */

export function DIcon({ name, size = 15, strokeWidth = 1.5 }: {
  name?: string; size?: number; strokeWidth?: number;
}) {
  const Icon = name
    ? (Icons as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[name]
    : null;
  const Comp = (Icon ?? Icons.Sparkles) as React.ComponentType<{ size?: number; strokeWidth?: number }>;
  return <Comp size={size} strokeWidth={strokeWidth} />;
}

export function colors(isDark: boolean) {
  return {
    text:        isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)',
    muted:       isDark ? 'rgba(255,255,255,0.46)' : 'rgba(0,0,0,0.44)',
    faint:       isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.15)',
    icon:        isDark ? 'rgba(255,255,255,0.66)' : 'rgba(0,0,0,0.56)',
    bar:         isDark ? 'rgba(255,255,255,0.76)' : 'rgba(0,0,0,0.68)',
    barBg:       isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)',
    ring:        isDark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.76)',
    divider:     isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)',
    trendUp:     isDark ? 'rgba(74,222,128,0.92)'  : 'rgba(22,163,74,0.92)',
    trendDown:   isDark ? 'rgba(248,113,113,0.90)' : 'rgba(220,38,38,0.90)',
    trendBgUp:   isDark ? 'rgba(74,222,128,0.10)'  : 'rgba(22,163,74,0.10)',
    trendBgDown: isDark ? 'rgba(248,113,113,0.10)' : 'rgba(220,38,38,0.08)',
    accent:      isDark ? 'rgba(255,255,255,0.48)' : 'rgba(0,0,0,0.42)',
    bg:          isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.028)',
    bgRoot:      isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.048)',
    border:      isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.10)',
    borderHov:   isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.20)',
    editRing:    isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.26)',
  };
}

/* ── Editable field ── */
export function EditField({
  value, field, isEditing, onSave, style, multiline = false,
}: {
  value: string; field: string; isEditing: boolean;
  onSave?: (field: string, v: string) => void;
  style?: React.CSSProperties; multiline?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => { setDraft(value); }, [value]);

  const base: React.CSSProperties = {
    fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
    letterSpacing: 'inherit', color: 'inherit', lineHeight: 'inherit',
    margin: 0, padding: 0, background: 'transparent',
    border: 'none', outline: 'none', resize: 'none', width: '100%', display: 'block',
    ...style,
  };

  if (!isEditing) return <span style={{ ...style, display: 'block' }}>{value}</span>;

  return multiline ? (
    <textarea
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={() => onSave?.(field, draft)}
      onKeyDown={e => { if (e.key === 'Escape') { setDraft(value); (e.target as HTMLElement).blur(); } }}
      rows={3}
      style={{ ...base, background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '2px 4px' }}
    />
  ) : (
    <input
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={() => onSave?.(field, draft)}
      onKeyDown={e => {
        if (e.key === 'Enter') (e.target as HTMLElement).blur();
        if (e.key === 'Escape') { setDraft(value); (e.target as HTMLElement).blur(); }
      }}
      style={{ ...base, background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '2px 4px' }}
    />
  );
}

/* ── Count-up ── */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const match = value.match(/^([+\-]?)(\d+(?:\.\d+)?)(.*)$/);
  useEffect(() => {
    const el = ref.current;
    if (!el || !match) return;
    const [, sign, numStr, suffix] = match;
    const num = parseFloat(numStr);
    const ctrl = animate(0, num, {
      duration: 1.4, ease: 'easeOut',
      onUpdate: v => {
        const d = Number.isInteger(num) ? Math.round(v) : Math.round(v * 10) / 10;
        el.textContent = `${sign}${d}${suffix}`;
      },
    });
    return ctrl.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const [, sign, , suffix] = match ?? ['', '', '0', ''];
  return <span ref={ref}>{sign}0{suffix ?? ''}</span>;
}

/* ── Icon badge ── */
function IconBadge({ icon, isDark, size = 14 }: { icon?: string; isDark: boolean; size?: number }) {
  const c = colors(isDark);
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size + 14, height: size + 14, borderRadius: 9,
      background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
      border: `1px solid ${c.divider}`, color: c.icon, flexShrink: 0,
    }}>
      <DIcon name={icon} size={size} />
    </div>
  );
}

/* ══════════════════════════════
   NODE PROPS
══════════════════════════════ */
export interface NodeProps {
  node: LayoutNode;
  index: number;
  isDark: boolean;
  isCollapsed?: boolean;
  hasChildren?: boolean;
  /** Quando true, card fica invisível e sem interação (ex.: subárvore oculta); animação só no ponto, sem deslocar o mapa */
  isHidden?: boolean;
   /** Quando true, conexão automática com o pai fica oculta (card “flutuando”) */
  isDetached?: boolean;
  /** Quando true, a IA está gerando um novo bloco a partir deste nó */
  isExpanding?: boolean;
  /** Quando true, este nó é a origem do modo “conectar” (usuário está escolhendo um novo pai) */
  isConnectionSource?: boolean;
  /** Quando true, existe alguma origem selecionada para conexão (outros pontos viram alvos possíveis) */
  hasConnectionSource?: boolean;
  onToggle?: () => void;
  onToggleConnection?: () => void;
  onAddContent?: (nodeId: string) => void;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onStopEdit?: () => void;
  onFieldChange?: (field: string, value: string) => void;
  onDrag?: (nodeId: string, offset: { x: number; y: number }) => void;
  onDragEnd?: (nodeId: string, offset: { x: number; y: number }) => void;
}

/* ══════════════════════════════
   CARD SHELL
══════════════════════════════ */
export function CardShell({
  node, index, isDark, isCollapsed, hasChildren,
  isHidden, isDetached, isExpanding, isConnectionSource, hasConnectionSource,
  onToggle, onToggleConnection, onAddContent,
  isEditing, onStartEdit, onStopEdit, onDrag, onDragEnd, children, radius = 16,
  bgDecoration,
}: NodeProps & { children: React.ReactNode; radius?: number; bgDecoration?: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const c = colors(isDark);
  const isRoot = node.type === 'root';

  const entranceDelay = index * 0.04;
  const dotBaseBg = isDark ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.22)';
  const dotBaseBorder = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.30)';
  const dotTargetBg = isDark ? 'rgba(74,222,128,0.26)' : 'rgba(22,163,74,0.22)';
  const dotTargetBorder = isDark ? 'rgba(74,222,128,0.9)' : 'rgba(22,163,74,0.85)';
  const dotDetachedBg = isDark ? 'rgba(248,113,113,0.85)' : 'rgba(220,38,38,0.85)';
  const dotDetachedBorder = isDark ? 'rgba(248,113,113,0.95)' : 'rgba(185,28,28,0.95)';
  const dotStyleBase: React.CSSProperties = {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 12,
    height: 12,
    borderRadius: '50%',
    cursor: 'pointer',
    padding: 0,
    zIndex: 25,
  };

  return (
    <motion.div
      /* ── Entrada ── */
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{
        x: node.x,
        y: node.y,
        opacity: isHidden ? 0 : 1,
        scale: 1,
        boxShadow: isRoot
          ? isDark
            ? '0 20px 50px -12px rgba(0,0,0,0.55), 0 0 80px -24px rgba(255,255,255,0.12)'
            : '0 20px 50px -12px rgba(0,0,0,0.18), 0 0 60px -20px rgba(0,0,0,0.08)'
          : undefined,
      }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.22 } }}
      transition={{
        x: { type: 'spring', stiffness: 340, damping: 30 },
        y: { type: 'spring', stiffness: 340, damping: 30 },
        opacity: isHidden ? { duration: 0.25 } : { delay: entranceDelay, duration: 0.32 },
        scale: { delay: entranceDelay, duration: 0.32, ease: [0.22, 1, 0.36, 1] },
        boxShadow: { delay: entranceDelay + 0.2, duration: 0.6 },
      }}
      /* ── Drag ── */
      drag
      dragMomentum={false}
      dragElastic={0}
      onDrag={(_, info) => onDrag?.(node.id, info.offset)}
      onDragEnd={(_, info) => onDragEnd?.(node.id, info.offset)}
      /* ── Hover + pointer capture (evita soltar o card ao sair da área) ── */
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onPointerDown={e => {
        e.stopPropagation();
        if (onDrag && e.button === 0) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerUp={e => {
        try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* já liberado */ }
      }}
      onPointerCancel={e => {
        try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* já liberado */ }
      }}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: node.w,
        borderRadius: radius,
        background: isRoot ? c.bgRoot : c.bg,
        border: `1px solid ${isEditing ? c.editRing : hovered ? c.borderHov : c.border}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        transition: 'border-color 0.18s',
        cursor: 'grab',
        overflow: 'visible',
        userSelect: 'none',
        pointerEvents: isHidden ? 'none' : 'auto',
      }}
      whileDrag={{ cursor: 'grabbing', scale: 1.03, zIndex: 50,
        boxShadow: isDark ? '0 12px 48px rgba(0,0,0,0.5)' : '0 12px 48px rgba(0,0,0,0.15)' }}
    >
      {/* Ponto de conexão (entrada) — topo central; também visível como alvo quando origem é anotação */}
      {onToggleConnection && (node.parentId || hasConnectionSource) && (
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={onToggleConnection}
          title={
            isConnectionSource
              ? 'Clique em outro ponto para ligar este bloco, ou clique aqui para cancelar'
              : hasConnectionSource
              ? 'Este bloco pode receber a nova conexão'
              : 'Clique para mover a conexão deste bloco'
          }
          style={{
            ...dotStyleBase,
            border: `1px solid ${
              isConnectionSource
                ? dotDetachedBorder
                : hasConnectionSource
                ? dotTargetBorder
                : dotBaseBorder
            }`,
            background: isConnectionSource
              ? dotDetachedBg
              : hasConnectionSource
              ? dotTargetBg
              : dotBaseBg,
            opacity: isConnectionSource || hasConnectionSource ? 1 : 0.9,
            animation: hasConnectionSource && !isConnectionSource ? 'dot-pulse 1.4s ease-in-out infinite' : undefined,
          }}
        />
      )}

      {/* Background decoration — full-bleed, rendered before content, not clipped by inner overflow */}
      {bgDecoration && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: radius, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {bgDecoration}
        </div>
      )}

      {/* Inner content */}
      <div style={{
        width: '100%', borderRadius: radius, overflow: 'hidden',
        padding: isRoot ? '18px 20px 32px' : '14px 16px 28px',
        display: 'flex', flexDirection: 'column', gap: 6, boxSizing: 'border-box',
        position: 'relative', zIndex: 1,
      }}>
        {children}
      </div>

      {/* Botão global de + conteúdo (IA) — abaixo do card.
          Visível ao hover, ou sempre visível enquanto está gerando novo conteúdo. */}
      {onAddContent && (hovered || isExpanding) && !isHidden && (
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={() => onAddContent(node.id)}
          disabled={isExpanding}
          title={isExpanding ? 'Gerando novo bloco a partir deste conteúdo…' : 'Pedir à IA para continuar este bloco'}
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '3px 10px',
            borderRadius: 999,
            border: `1px ${isExpanding ? 'solid' : 'dashed'} ${c.border}`,
            background: isDark ? 'rgba(10,10,10,0.96)' : 'rgba(250,250,250,0.96)',
            fontSize: 9.5,
            fontWeight: 400,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: isExpanding ? c.text : c.muted,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            cursor: isExpanding ? 'default' : 'pointer',
          }}
        >
          {isExpanding ? (
            <>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: c.accent, display: 'inline-block',
                animation: 'dot-pulse 1.4s ease-in-out infinite',
              }} />
              Gerando…
            </>
          ) : (
            <>
              <span style={{ fontSize: 11, lineHeight: 1 }}>+</span> Conteúdo
            </>
          )}
        </button>
      )}

      {/* Edit button */}
      {onStartEdit && (hovered || isEditing) && (
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={isEditing ? onStopEdit : onStartEdit}
          title={isEditing ? 'Concluir' : 'Editar'}
          style={{
            position: 'absolute', top: 6, right: 6, zIndex: 30,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: 7,
            background: isEditing
              ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)')
              : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
            border: `1px solid ${c.border}`,
            color: isEditing ? c.text : c.muted,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {isEditing
            ? <Icons.Check size={11} strokeWidth={2} />
            : <Icons.Pencil size={10} strokeWidth={1.8} />}
        </button>
      )}

      {/* Collapse toggle */}
      {hasChildren && (
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={onToggle}
          title={isCollapsed ? 'Expandir' : 'Ocultar'}
          style={{
            position: 'absolute', bottom: -13, left: '50%',
            transform: 'translateX(-50%)', zIndex: 20,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: '50%',
            background: isDark ? 'rgba(16,16,16,0.96)' : 'rgba(248,248,248,0.96)',
            border: `1px solid ${c.border}`,
            color: c.muted, cursor: 'pointer',
            fontSize: 13, fontWeight: 600, lineHeight: 1,
            transition: 'all 0.15s',
            boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.55)' : '0 2px 10px rgba(0,0,0,0.12)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = isDark ? '#fff' : '#000'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = c.muted; }}
        >
          {isCollapsed ? '+' : '−'}
        </button>
      )}
    </motion.div>
  );
}

/* ════════════════════════════════
   1. DEFAULT
════════════════════════════════ */
export function DefaultNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const isRoot = node.type === 'root';

  if (isRoot) {
    return (
      <CardShell {...props} radius={22}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{ alignSelf: 'flex-start' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 9,
            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${c.divider}`, flexShrink: 0, overflow: 'hidden',
          }}>
            <img
              src="/logo-mindweavr-black.png"
              alt="MindWeavr"
              style={{
                height: 18, width: 'auto', objectFit: 'contain',
                filter: isDark ? 'brightness(0) invert(1)' : 'none',
              }}
            />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 17, fontWeight: 500, color: c.text, letterSpacing: '-0.02em', lineHeight: 1.4, wordBreak: 'break-word' }}
        >
          <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </motion.div>
        {(isEditing || node.description) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.3 }}
            style={{ fontSize: 12, color: c.muted, lineHeight: 1.6, paddingTop: 8, borderTop: `1px solid ${c.divider}` }}
          >
            <EditField value={node.description ?? ''} field="description" isEditing={!!isEditing} onSave={onFieldChange} multiline />
          </motion.div>
        )}
      </CardShell>
    );
  }

  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <IconBadge icon={node.icon} isDark={isDark} size={14} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: c.text, letterSpacing: '-0.01em', lineHeight: 1.4 }}>
            <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
          </div>
          {(isEditing || node.description) && (
            <div style={{ fontSize: 10.5, color: c.muted, marginTop: 4, lineHeight: 1.55 }}>
              <EditField value={node.description ?? ''} field="description" isEditing={!!isEditing} onSave={onFieldChange} multiline />
            </div>
          )}
        </div>
      </div>
    </CardShell>
  );
}

/* ════════════════════════════════
   2. STAT
════════════════════════════════ */
export function StatNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const trend = node.statTrend ?? '';
  const isUp   = trend.startsWith('+');
  const isDown = trend.startsWith('-');
  const trendColor = isUp ? c.trendUp : isDown ? c.trendDown : c.muted;
  const trendBg    = isUp ? c.trendBgUp : isDown ? c.trendBgDown : 'transparent';

  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <IconBadge icon={node.icon} isDark={isDark} size={12} />
        {trend && (
          <div style={{ fontSize: 9, fontWeight: 600, color: trendColor, background: trendBg, padding: '2px 8px', borderRadius: 999, border: `1px solid ${trendColor}44` }}>
            {isEditing
              ? <EditField value={trend} field="statTrend" isEditing onSave={onFieldChange} style={{ color: trendColor, fontSize: 9, width: 44 }} />
              : trend}
          </div>
        )}
      </div>
      <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: c.text }}>
        {isEditing
          ? <EditField value={node.statValue ?? '0'} field="statValue" isEditing onSave={onFieldChange} style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.04em' }} />
          : <CountUp value={node.statValue ?? '0'} />}
      </div>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>
          <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </div>
        {node.statLabel && (
          <div style={{ fontSize: 9, color: c.muted, marginTop: 2 }}>
            <EditField value={node.statLabel} field="statLabel" isEditing={!!isEditing} onSave={onFieldChange} />
          </div>
        )}
      </div>
    </CardShell>
  );
}

/* ════════════════════════════════
   3. CHART-BAR
════════════════════════════════ */
export function ChartBarNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const bars = node.bars ?? [];
  const maxVal = bars.length ? Math.max(...bars.map(b => b.value), 1) : 1;

  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBadge icon={node.icon} isDark={isDark} size={12} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>
          <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {bars.map((bar, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 68, flexShrink: 0 }}>
              <span style={{ fontSize: 9, color: c.muted, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {bar.label}
              </span>
            </div>
            <div style={{ flex: 1, height: 5, background: c.barBg, borderRadius: 3, overflow: 'hidden', minWidth: 0 }}>
              <motion.div
                style={{ height: '100%', background: c.bar, borderRadius: 3, transformOrigin: 'left' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: bar.value / maxVal }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 + 0.1 }}
              />
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, color: c.text, width: 22, textAlign: 'right', flexShrink: 0 }}>
              {bar.value}
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

/* ════════════════════════════════
   4. CHART-RING
════════════════════════════════ */
function RingChart({ value, isDark, size = 72 }: { value: number; isDark: boolean; size?: number }) {
  const c = colors(isDark);
  const r = 30, cx = 38, cy = 38, circ = 2 * Math.PI * r;
  const clipped = Math.min(Math.max(value, 0), 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 76 76" style={{ width: size, height: size }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.barBg} strokeWidth={5.5} />
        <motion.circle
          cx={cx} cy={cy} r={r} fill="none" stroke={c.ring} strokeWidth={5.5} strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - clipped / 100) }}
          transition={{ duration: 1.3, ease: 'easeOut', delay: 0.2 }}
          style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: c.text, lineHeight: 1 }}>{clipped}</span>
        <span style={{ fontSize: 7.5, color: c.muted, marginTop: 1 }}>%</span>
      </div>
    </div>
  );
}

export function ChartRingNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBadge icon={node.icon} isDark={isDark} size={12} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>
          <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <RingChart value={node.ringValue ?? 0} isDark={isDark} size={68} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10.5, color: c.muted, lineHeight: 1.55 }}>
            <EditField value={node.ringLabel ?? node.description ?? ''} field="ringLabel" isEditing={!!isEditing} onSave={onFieldChange} multiline />
          </div>
        </div>
      </div>
    </CardShell>
  );
}

/* ════════════════════════════════
   5. TIMELINE
════════════════════════════════ */
export function TimelineNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const steps = node.steps ?? [];
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBadge icon={node.icon} isDark={isDark} size={12} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>
          <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {steps.map((step, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 + 0.12 }}
            style={{ display: 'flex', gap: 10 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 12 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', border: `1.5px solid ${c.accent}`, marginTop: 3, flexShrink: 0 }} />
              {i < steps.length - 1 && (
                <div style={{ width: 1, flex: 1, minHeight: 8, background: c.divider, marginTop: 3, marginBottom: 3 }} />
              )}
            </div>
            <div style={{ paddingBottom: i < steps.length - 1 ? 8 : 0, paddingTop: 1 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>
                <EditField value={step.label ?? ''} field={`steps.${i}.label`} isEditing={!!isEditing} onSave={onFieldChange} />
              </div>
              {step.desc && (
                <div style={{ fontSize: 9.5, color: c.muted, marginTop: 2, lineHeight: 1.4 }}>
                  <EditField value={step.desc} field={`steps.${i}.desc`} isEditing={!!isEditing} onSave={onFieldChange} multiline />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

/* ════════════════════════════════
   6. COMPARISON
════════════════════════════════ */
export function ComparisonNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const left  = node.compLeft  ?? { label: 'A', value: '' };
  const right = node.compRight ?? { label: 'B', value: '' };
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBadge icon={node.icon} isDark={isDark} size={12} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>
          <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          { data: left,  field: 'compLeft.value',  delay: 0.14 },
          { data: right, field: 'compRight.value', delay: 0.20 },
        ].map(({ data, field, delay }, idx) => (
          <motion.div key={idx}
            initial={{ opacity: 0, x: idx === 0 ? -8 : 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            style={{
              flex: 1,
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              borderRadius: 8, padding: '8px 10px',
            }}
          >
            <div style={{ fontSize: 8.5, color: c.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {data.label}
            </div>
            <div style={{ fontSize: 10.5, color: c.text, lineHeight: 1.5 }}>
              <EditField value={data.value ?? ''} field={field} isEditing={!!isEditing} onSave={onFieldChange} multiline />
            </div>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

/* ════════════════════════════════
   7. HIGHLIGHT
════════════════════════════════ */
export function HighlightNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const quoteText = node.quote ?? node.description ?? node.label;

  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ color: c.icon }}><DIcon name={node.icon} size={12} /></div>
        <span style={{ fontSize: 8.5, color: c.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
          Insight
        </span>
      </div>
      <div style={{ height: 1, background: c.divider }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.16, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: 2.5, borderRadius: 2, background: c.accent, alignSelf: 'stretch', flexShrink: 0, transformOrigin: 'top', minHeight: 20 }}
        />
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          style={{ flex: 1, fontSize: 11, color: c.text, lineHeight: 1.65, fontStyle: 'italic' }}
        >
          {isEditing ? (
            <textarea
              defaultValue={quoteText}
              onBlur={e => onFieldChange?.('quote', e.currentTarget.value)}
              rows={3}
              style={{ background: 'rgba(255,255,255,0.04)', border: 'none', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: 11, color: c.text, fontStyle: 'italic', lineHeight: 1.65, width: '100%', borderRadius: 4, padding: '2px 4px' }}
            />
          ) : quoteText}
        </motion.div>
      </div>
    </CardShell>
  );
}

/* ════════════════════════════════
   8. LIST
════════════════════════════════ */
export function ListNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const items = node.listItems ?? [];
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBadge icon={node.icon} isDark={isDark} size={12} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>
          <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {items.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 + 0.1 }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
          >
            <div style={{ color: c.icon, flexShrink: 0, marginTop: 1 }}>
              <DIcon name={item.icon ?? 'CheckCircle'} size={11} strokeWidth={1.8} />
            </div>
            <span style={{ fontSize: 10.5, color: c.text, lineHeight: 1.45 }}>
              <EditField value={item.text ?? ''} field={`listItems.${i}.text`} isEditing={!!isEditing} onSave={onFieldChange} />
            </span>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

/* ════════════════════════════════
   9. LINE-CHART
════════════════════════════════ */
export function LineChartNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const pts = node.lineChartPoints ?? [];
  const pts2 = node.lineChartPoints2;
  const maxVal = Math.max(1, ...pts.map(p => p.value), ...(pts2 ?? []).map(p => p.value));
  const vbW = 200; const vbH = 50; const pad = 6;

  const pointsStr = (arr: { value: number }[]) =>
    arr.map((p, i) => `${pad + (i / Math.max(1, arr.length - 1)) * (vbW - pad * 2)},${vbH - pad - (p.value / maxVal) * (vbH - pad * 2)}`).join(' ');

  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBadge icon={node.icon} isDark={isDark} size={12} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: c.text, flex: 1 }}>
          <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
        {node.lineChartLabel && <span style={{ fontSize: 8.5, color: c.muted }}>{node.lineChartLabel}</span>}
      </div>
      <div style={{ width: '100%', background: c.barBg, borderRadius: 6, overflow: 'hidden', lineHeight: 0 }}>
        <svg width="100%" viewBox={`0 0 ${vbW} ${vbH}`} preserveAspectRatio="none" style={{ display: 'block', height: 48 }}>
          {pts.length >= 2 && (
            <polyline fill="none" stroke={c.bar} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" points={pointsStr(pts)} />
          )}
          {pts2 && pts2.length >= 2 && (
            <polyline fill="none" stroke={c.muted} strokeWidth={1.5} strokeDasharray="4 3" strokeLinecap="round" points={pointsStr(pts2)} />
          )}
        </svg>
      </div>
      {pts.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7.5, color: c.faint }}>
          {pts.map((p, i) => <span key={i}>{p.label}</span>)}
        </div>
      )}
    </CardShell>
  );
}

/* ════════════════════════════════
   10. PROGRESS-BARS
════════════════════════════════ */
export function ProgressBarsNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const bars = node.progressBars ?? [];
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBadge icon={node.icon} isDark={isDark} size={12} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>
          <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {bars.map((bar, i) => {
          const max = bar.max ?? 100;
          const pct = Math.min(1, bar.value / max);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 60, fontSize: 9, color: c.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{bar.label}</span>
              <div style={{ flex: 1, height: 5, background: c.barBg, borderRadius: 3, overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', background: c.bar, borderRadius: 3, transformOrigin: 'left' }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: pct }}
                  transition={{ duration: 0.55, delay: i * 0.06 + 0.1 }}
                />
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: c.text, width: 24, textAlign: 'right', flexShrink: 0 }}>{bar.value}</span>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

/* ════════════════════════════════
   11. PROGRESS-RING — anel com fração (ex.: 6/7)
════════════════════════════════ */
function ProgressRingFraction({ value, max, isDark, size = 52 }: { value: number; max: number; isDark: boolean; size?: number }) {
  const c = colors(isDark);
  const r = 20; const cx = 26; const cy = 26; const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 52 52" style={{ width: size, height: size }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.barBg} strokeWidth={4} />
        <motion.circle
          cx={cx} cy={cy} r={r} fill="none" stroke={c.ring} strokeWidth={4} strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: c.text, lineHeight: 1 }}>{value}/{max}</span>
      </div>
    </div>
  );
}

export function ProgressRingNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const val = node.progressRingValue ?? 0;
  const max = node.progressRingMax ?? 7;
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ProgressRingFraction value={val} max={max} isDark={isDark} size={52} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>
            <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
          </div>
          {node.progressRingLabel && <div style={{ fontSize: 9.5, color: c.muted, marginTop: 3, lineHeight: 1.4 }}>{node.progressRingLabel}</div>}
        </div>
      </div>
    </CardShell>
  );
}

/* ════════════════════════════════
   12. COUNTDOWN
════════════════════════════════ */
export function CountdownNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBadge icon={node.icon ?? 'Timer'} isDark={isDark} size={12} />
        <span style={{ fontSize: 9.5, color: c.muted }}>
          <EditField value={node.countdownLabel ?? 'Tempo restante'} field="countdownLabel" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '0.04em', color: c.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        <EditField value={node.countdownValue ?? '00:00'} field="countdownValue" isEditing={!!isEditing} onSave={onFieldChange} />
      </div>
      {node.countdownSubtext && <div style={{ fontSize: 9.5, color: c.muted }}>{node.countdownSubtext}</div>}
    </CardShell>
  );
}

/* ════════════════════════════════
   13. BALANCE
════════════════════════════════ */
export function BalanceNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  return (
    <CardShell {...props} radius={14}>
      <div style={{ fontSize: 9.5, color: c.muted, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 }}>
        <EditField value={node.balanceLabel ?? node.label} field="balanceLabel" isEditing={!!isEditing} onSave={onFieldChange} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: c.text, lineHeight: 1 }}>
        <EditField value={node.balanceValue ?? '0'} field="balanceValue" isEditing={!!isEditing} onSave={onFieldChange} />
      </div>
      {node.balanceAction && (
        <div style={{ fontSize: 9.5, color: c.accent, textDecoration: 'underline' }}>{node.balanceAction}</div>
      )}
    </CardShell>
  );
}

/* ════════════════════════════════
   14. SUMMARY
════════════════════════════════ */
export function SummaryNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const items = node.summaryItems ?? [];
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBadge icon={node.icon} isDark={isDark} size={12} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>
          <EditField value={node.summaryTitle ?? node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 9.5, color: c.muted }}>
              <EditField value={item.label ?? ''} field={`summaryItems.${i}.label`} isEditing={!!isEditing} onSave={onFieldChange} />
            </span>
            <div style={{ width: 1, flex: 1, borderBottom: `1px dashed ${c.divider}`, marginBottom: 2 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: c.text }}>
              <EditField value={item.value ?? ''} field={`summaryItems.${i}.value`} isEditing={!!isEditing} onSave={onFieldChange} style={{ fontWeight: 700 }} />
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

/* ════════════════════════════════
   15. CHECKLIST
════════════════════════════════ */
export function ChecklistNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const items = node.checklistItems ?? [];
  const doneCount = items.filter(it => it.done).length;
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBadge icon={node.icon ?? 'CheckCircle'} isDark={isDark} size={12} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: c.text, flex: 1 }}>
          <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
        <span style={{ fontSize: 9, color: c.muted }}>{doneCount}/{items.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 13, height: 13, borderRadius: 3, border: `1.5px solid ${item.done ? c.trendUp : c.faint}`,
              background: item.done ? c.trendBgUp : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {item.done && <DIcon name="Check" size={8} strokeWidth={2.5} />}
            </div>
            <span style={{ fontSize: 10.5, color: item.done ? c.muted : c.text, textDecoration: item.done ? 'line-through' : 'none', lineHeight: 1.3 }}>
              <EditField value={item.text ?? ''} field={`checklistItems.${i}.text`} isEditing={!!isEditing} onSave={onFieldChange} />
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

/* ════════════════════════════════
   16. SUCCESS
════════════════════════════════ */
export function SuccessNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: 34, height: 34, borderRadius: '50%', background: c.trendBgUp, border: `2px solid ${c.trendUp}`, color: c.trendUp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <DIcon name="Check" size={18} strokeWidth={2.5} />
        </motion.div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: c.text, textAlign: 'center', lineHeight: 1.3 }}>
        <EditField value={node.successTitle ?? node.label} field="successTitle" isEditing={!!isEditing} onSave={onFieldChange} />
      </div>
      {(node.successMessage ?? node.description) && (
        <div style={{ fontSize: 10, color: c.muted, textAlign: 'center', lineHeight: 1.5 }}>{node.successMessage ?? node.description}</div>
      )}
      {node.successButton && (
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 9.5, fontWeight: 600, color: c.accent }}>{node.successButton}</span>
        </div>
      )}
    </CardShell>
  );
}

/* ════════════════════════════════
   17. PRODUCT-ROW
════════════════════════════════ */
export function ProductRowNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: c.barBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${c.divider}` }}>
          <DIcon name={node.icon ?? 'Package'} size={18} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: c.text, lineHeight: 1.3 }}>
            <EditField value={node.productTitle ?? node.label} field="productTitle" isEditing={!!isEditing} onSave={onFieldChange} />
          </div>
          {node.productSubtitle && <div style={{ fontSize: 9.5, color: c.muted, marginTop: 2 }}>{node.productSubtitle}</div>}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: c.text }}>{node.productPrice ?? '—'}</div>
          {node.productCta && <div style={{ fontSize: 8.5, color: c.accent, marginTop: 2 }}>{node.productCta}</div>}
        </div>
      </div>
    </CardShell>
  );
}

/* ════════════════════════════════
   18. RATING
════════════════════════════════ */
export function RatingNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const max = node.ratingMax ?? 5;
  const value = parseFloat(node.ratingValue ?? '0') || 0;
  const fullStars = Math.floor(value);
  const hasHalf = value % 1 >= 0.25 && value % 1 < 0.75;
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: c.text, display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <EditField value={node.ratingValue ?? '—'} field="ratingValue" isEditing={!!isEditing} onSave={onFieldChange} />
          {max > 0 && <span style={{ fontSize: 12, fontWeight: 400, color: c.muted }}>/ {max}</span>}
        </div>
        <div style={{ color: c.icon, flexShrink: 0 }}><Icons.Star size={22} strokeWidth={1} fill="currentColor" /></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {Array.from({ length: max }, (_, i) => {
          const filled = i < fullStars;
          const half = i === fullStars && hasHalf;
          return (
            <span key={i} style={{ color: filled || half ? c.bar : c.barBg, display: 'inline-flex' }}>
              <Icons.Star size={13} strokeWidth={filled || half ? 0 : 1.5} fill={filled || half ? 'currentColor' : 'none'} />
            </span>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: c.muted }}>
        <EditField value={node.ratingLabel ?? node.label} field="ratingLabel" isEditing={!!isEditing} onSave={onFieldChange} />
      </div>
      {node.ratingSubtext && <div style={{ fontSize: 9, color: c.faint }}>{node.ratingSubtext}</div>}
    </CardShell>
  );
}

/* ════════════════════════════════
   19. DATE-PILLS
════════════════════════════════ */
export function DatePillsNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const pills = node.datePills ?? [];
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBadge icon={node.icon ?? 'Calendar'} isDark={isDark} size={12} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>
          <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {pills.map((pill, i) => (
          <div key={i} style={{
            padding: '4px 10px', borderRadius: 8,
            fontSize: 9.5, fontWeight: 500,
            background: pill.selected ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : c.barBg,
            color: pill.selected ? c.text : c.muted,
            border: `1px solid ${pill.selected ? c.border : c.divider}`,
          }}>
            {pill.label}{pill.date ? ` ${pill.date}` : ''}
          </div>
        ))}
      </div>
    </CardShell>
  );
}

/* ════════════════════════════════
   20. TIME-SLOTS
════════════════════════════════ */
export function TimeSlotsNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const slots = node.timeSlots ?? [];
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBadge icon={node.icon ?? 'Clock'} isDark={isDark} size={12} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>
          <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {slots.map((slot, i) => (
          <div key={i} style={{
            padding: '6px 10px', borderRadius: 8,
            fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
            background: slot.selected ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : c.barBg,
            color: slot.selected ? c.text : c.muted,
            border: `1px solid ${slot.selected ? c.border : c.divider}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <span>{slot.time}</span>
            {slot.label && <span style={{ fontSize: 8.5, fontWeight: 500, color: c.faint }}>{slot.label}</span>}
          </div>
        ))}
      </div>
    </CardShell>
  );
}
