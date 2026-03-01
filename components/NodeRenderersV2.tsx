'use client';

import { motion } from 'framer-motion';
import React from 'react';
import * as Icons from 'lucide-react';
import { FaInstagram, FaFacebook, FaWhatsapp, FaYoutube, FaLinkedin, FaTelegram, FaEnvelope, FaComment } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiTiktok } from 'react-icons/si';
import { colors, DIcon, type NodeProps, CardShell, EditField } from './NodeRenderers';
import { useSocialIcons } from '@/contexts/SocialIconsContext';

/* ─── Design tokens ──────────────────────────────────────────────────────────
   All spacing follows an 8pt grid. Micro-spaces (gap, padding adjustments)
   use 4pt. Typography scale: 9 / 10 / 11 / 12 / 13 / 16 / 20 / 28 / 36.
   ─────────────────────────────────────────────────────────────────────────── */

/* Section label — uppercase overline */
function SectionLabel({ children, c, style }: { children: React.ReactNode; c: ReturnType<typeof colors>; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: c.muted, marginBottom: 8, ...style }}>
      {children}
    </div>
  );
}

/* Divider */
function Divider({ c }: { c: ReturnType<typeof colors> }) {
  return <div style={{ height: 1, background: c.divider, margin: '8px 0' }} />;
}

// ─── 1. feature-card ──────────────────────────────────────────────────────────
export function FeatureCardNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Header: icon + badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: c.icon,
          }}>
            <DIcon name={node.featureIcon ?? node.icon ?? 'Sparkles'} size={16} />
          </div>
          {node.featureBadge && (
            <div style={{
              fontSize: 8, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
              border: `1px solid ${c.border}`, color: c.muted, letterSpacing: '0.07em',
              textTransform: 'uppercase', whiteSpace: 'nowrap',
            }}>
              <EditField value={node.featureBadge} field="featureBadge" isEditing={!!isEditing} onSave={onFieldChange} />
            </div>
          )}
        </div>
        {/* Title */}
        <div style={{ fontSize: 12.5, fontWeight: 700, color: c.text, lineHeight: 1.35, letterSpacing: '-0.01em' }}>
          <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </div>
        {/* Description */}
        <div style={{ fontSize: 10.5, color: c.muted, lineHeight: 1.55 }}>
          <EditField value={node.featureDesc ?? node.description ?? ''} field="featureDesc" isEditing={!!isEditing} onSave={onFieldChange} multiline />
        </div>
      </div>
    </CardShell>
  );
}

// ─── 2. gradient-stat ─────────────────────────────────────────────────────────
export function GradientStatNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const isUp = node.statTrend?.startsWith('+');
  const isDown = node.statTrend?.startsWith('-');
  const trendColor = isUp ? c.trendUp : isDown ? c.trendDown : c.muted;

  const glow = (
    <div style={{
      position: 'absolute', inset: 0,
      background: isDark
        ? 'radial-gradient(ellipse 80% 80% at 100% 0%, rgba(255,255,255,0.13) 0%, transparent 65%)'
        : 'radial-gradient(ellipse 80% 80% at 100% 0%, rgba(60,60,60,0.09) 0%, transparent 65%)',
    }} />
  );

  return (
    <CardShell {...props} radius={14} bgDecoration={glow}>
      <SectionLabel c={c}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', color: c.text, lineHeight: 1, marginBottom: 8 }}
      >
        <EditField value={node.statValue ?? '—'} field="statValue" isEditing={!!isEditing} onSave={onFieldChange} />
      </motion.div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: c.muted }}>
          <EditField value={node.statLabel ?? ''} field="statLabel" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
        {node.statTrend && (
          <span style={{
            fontSize: 9, fontWeight: 700, color: trendColor,
            background: isUp ? c.trendBgUp : isDown ? c.trendBgDown : c.bg,
            padding: '2px 7px', borderRadius: 999,
          }}>
            <EditField value={node.statTrend} field="statTrend" isEditing={!!isEditing} onSave={onFieldChange} />
          </span>
        )}
      </div>
    </CardShell>
  );
}

// ─── 3. icon-grid ─────────────────────────────────────────────────────────────
export function IconGridNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const items = node.iconGrid ?? [];
  const cols = items.length <= 4 ? 2 : 3;
  return (
    <CardShell {...props} radius={14}>
      <SectionLabel c={c}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6 }}>
        {items.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.28 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: '8px 6px', borderRadius: 9,
              border: `1px solid ${c.border}`, background: c.bg,
            }}>
            <div style={{ color: c.icon }}><DIcon name={item.icon} size={14} /></div>
            <span style={{ fontSize: 8.5, color: c.muted, textAlign: 'center', lineHeight: 1.3, fontWeight: 500 }}>
              <EditField value={item.label ?? ''} field={`iconGrid.${i}.label`} isEditing={!!isEditing} onSave={onFieldChange} style={{ textAlign: 'center' }} />
            </span>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

// ─── 4. flow-steps ────────────────────────────────────────────────────────────
export function FlowStepsNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const steps = node.flowSteps ?? [];
  return (
    <CardShell {...props} radius={14}>
      <SectionLabel c={c}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.28 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: c.icon,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              }}>
                {step.icon
                  ? <DIcon name={step.icon} size={13} />
                  : <span style={{ fontSize: 11, fontWeight: 700, color: c.text }}>{i + 1}</span>}
              </div>
              <span style={{
                fontSize: 8.5, color: c.text, fontWeight: 500, textAlign: 'center',
                lineHeight: 1.25, maxWidth: '100%', padding: '0 2px',
              }}>
                <EditField value={step.label ?? ''} field={`flowSteps.${i}.label`} isEditing={!!isEditing} onSave={onFieldChange} style={{ textAlign: 'center' }} />
              </span>
            </motion.div>
            {i < steps.length - 1 && (
              <div style={{ flexShrink: 0, color: c.faint, paddingTop: 9 }}>
                <Icons.ChevronRight size={10} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </CardShell>
  );
}

// ─── 5. testimonial ───────────────────────────────────────────────────────────
export function TestimonialNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const author = node.testimonialAuthor ?? '';
  const initials = author.split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <CardShell {...props} radius={14}>
      <div style={{ fontSize: 28, lineHeight: 1, color: c.faint, fontFamily: 'Georgia, serif', marginBottom: 6, userSelect: 'none' }}>&ldquo;</div>
      <div style={{ fontSize: 11, color: c.text, lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12, flex: 1 }}>
        <EditField value={node.testimonialText ?? node.description ?? ''} field="testimonialText" isEditing={!!isEditing} onSave={onFieldChange} multiline />
      </div>
      <Divider c={c} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 2 }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          border: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, color: c.muted,
        }}>{initials}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: c.text, lineHeight: 1.2 }}>
            <EditField value={node.testimonialAuthor ?? ''} field="testimonialAuthor" isEditing={!!isEditing} onSave={onFieldChange} />
          </div>
          <div style={{ fontSize: 9.5, color: c.muted, marginTop: 1 }}>
            <EditField value={node.testimonialRole ?? ''} field="testimonialRole" isEditing={!!isEditing} onSave={onFieldChange} />
          </div>
        </div>
      </div>
    </CardShell>
  );
}

// ─── 6. price-tag ─────────────────────────────────────────────────────────────
export function PriceTagNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const features = node.priceFeatures ?? [];
  return (
    <CardShell {...props} radius={14}>
      {/* Plan name */}
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: c.muted, marginBottom: 4 }}>
        <EditField value={node.priceName ?? node.label} field="priceName" isEditing={!!isEditing} onSave={onFieldChange} />
      </div>
      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 12 }}>
        <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', color: c.text, lineHeight: 1 }}>
          <EditField value={node.priceAmount ?? '—'} field="priceAmount" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
        <span style={{ fontSize: 10, color: c.muted, fontWeight: 400 }}>
          <EditField value={node.pricePeriod ?? '/mes'} field="pricePeriod" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
      </div>
      {/* Features list */}
      {features.length > 0 && (
        <>
          <Divider c={c} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {features.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10, color: c.text }}>
                <Icons.Check size={10} color={c.trendUp} strokeWidth={2.5} />
                <span><EditField value={f ?? ''} field={`priceFeatures.${i}`} isEditing={!!isEditing} onSave={onFieldChange} /></span>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </CardShell>
  );
}

// ─── 7. alert-box ─────────────────────────────────────────────────────────────
export function AlertBoxNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const typeMap: Record<string, { icon: string; color: string; bg: string }> = {
    info:    { icon: 'Info',          color: isDark ? '#60a5fa' : '#2563eb', bg: isDark ? 'rgba(96,165,250,0.07)' : 'rgba(37,99,235,0.05)' },
    warning: { icon: 'AlertTriangle', color: isDark ? '#fbbf24' : '#d97706', bg: isDark ? 'rgba(251,191,36,0.07)' : 'rgba(217,119,6,0.05)' },
    success: { icon: 'CheckCircle2',  color: c.trendUp,   bg: c.trendBgUp },
    error:   { icon: 'XCircle',       color: c.trendDown, bg: c.trendBgDown },
  };
  const t = typeMap[node.alertType ?? 'info'];
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Colored accent bar */}
        <div style={{ width: 3, borderRadius: 99, background: t.color, flexShrink: 0, alignSelf: 'stretch', minHeight: 28, opacity: 0.9 }} />
        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: c.text, lineHeight: 1.3, marginBottom: 4 }}>
            <EditField value={node.alertTitle ?? node.label} field="alertTitle" isEditing={!!isEditing} onSave={onFieldChange} />
          </div>
          <div style={{ fontSize: 10, color: c.muted, lineHeight: 1.5 }}>
            <EditField value={node.alertMessage ?? node.description ?? ''} field="alertMessage" isEditing={!!isEditing} onSave={onFieldChange} multiline />
          </div>
        </div>
        {/* Icon */}
        <div style={{ color: t.color, flexShrink: 0, marginTop: 1 }}>
          <DIcon name={t.icon} size={13} />
        </div>
      </div>
    </CardShell>
  );
}

// ─── 8. metric-trio ───────────────────────────────────────────────────────────
export function MetricTrioNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const items = node.metricItems ?? [];
  return (
    <CardShell {...props} radius={14}>
      <SectionLabel c={c} style={{ marginBottom: 10 }}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>
      <div style={{ display: 'flex' }}>
        {items.map((item, i) => {
          const isUp = item.trend?.startsWith('+');
          const isDown = item.trend?.startsWith('-');
          const tc = isUp ? c.trendUp : isDown ? c.trendDown : c.muted;
          return (
            <div key={i} style={{
              flex: 1, padding: '0 10px',
              borderLeft: i > 0 ? `1px solid ${c.divider}` : 'none',
            }}>
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: c.text, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  <EditField value={item.value ?? ''} field={`metricItems.${i}.value`} isEditing={!!isEditing} onSave={onFieldChange} style={{ fontWeight: 700, fontSize: 22 }} />
                </div>
                <div style={{ fontSize: 8.5, color: c.muted, marginTop: 4, lineHeight: 1.2 }}>
                  <EditField value={item.label ?? ''} field={`metricItems.${i}.label`} isEditing={!!isEditing} onSave={onFieldChange} />
                </div>
                {item.trend && (
                  <div style={{ fontSize: 8.5, fontWeight: 600, color: tc, marginTop: 3 }}>
                    <EditField value={item.trend} field={`metricItems.${i}.trend`} isEditing={!!isEditing} onSave={onFieldChange} style={{ color: tc, fontWeight: 600 }} />
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

// ─── 9. kanban-card ───────────────────────────────────────────────────────────
export function KanbanCardNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const statusMap: Record<string, string> = {
    'em progresso': isDark ? '#fbbf24' : '#d97706',
    'concluido': c.trendUp,
    'pendente': isDark ? '#60a5fa' : '#2563eb',
    'bloqueado': c.trendDown,
  };
  const statusColor = statusMap[(node.kanbanStatus ?? '').toLowerCase()] ?? c.muted;
  const items = node.kanbanItems ?? [];
  return (
    <CardShell {...props} radius={14}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: c.text, flex: 1, minWidth: 0 }}>
          <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
        {node.kanbanStatus && (
          <span style={{
            fontSize: 8, fontWeight: 700, padding: '2px 8px', borderRadius: 999, flexShrink: 0,
            color: statusColor, border: `1px solid ${statusColor}`, textTransform: 'capitalize',
          }}>
            {node.kanbanStatus}
          </span>
        )}
      </div>
      {/* Tasks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 14, height: 14, borderRadius: 4, flexShrink: 0,
              border: `1.5px solid ${item.done ? c.trendUp : c.border}`,
              background: item.done ? c.trendBgUp : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.done && <Icons.Check size={8} color={c.trendUp} strokeWidth={2.5} />}
            </div>
            <span style={{
              fontSize: 10.5, color: item.done ? c.muted : c.text,
              textDecoration: item.done ? 'line-through' : 'none', lineHeight: 1.3,
            }}>
              <EditField value={item.text ?? ''} field={`kanbanItems.${i}.text`} isEditing={!!isEditing} onSave={onFieldChange} />
            </span>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

// ─── 10. tag-cloud ────────────────────────────────────────────────────────────
export function TagCloudNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const tags = node.tags ?? [];
  const sizeMap: Record<string, { fs: number; px: number; py: number; fw: number }> = {
    sm: { fs: 9,    px: 8,  py: 3, fw: 400 },
    md: { fs: 10.5, px: 10, py: 4, fw: 500 },
    lg: { fs: 12,   px: 12, py: 5, fw: 600 },
  };
  return (
    <CardShell {...props} radius={14}>
      <SectionLabel c={c}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', alignContent: 'flex-start' }}>
        {tags.map((tag, i) => {
          const s = sizeMap[tag.size ?? 'md'];
          return (
            <motion.span key={i}
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 220 }}
              style={{
                fontSize: s.fs, fontWeight: s.fw,
                padding: `${s.py}px ${s.px}px`,
                borderRadius: 999,
                border: `1px solid ${c.border}`,
                color: c.text, background: c.bg,
                whiteSpace: 'nowrap', display: 'inline-block',
              }}>
              <EditField value={tag.label ?? ''} field={`tags.${i}.label`} isEditing={!!isEditing} onSave={onFieldChange} />
            </motion.span>
          );
        })}
      </div>
    </CardShell>
  );
}

// ─── 11. versus-card ──────────────────────────────────────────────────────────
export function VersusCardNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const winner = node.versusWinner;
  const lw = winner === 'left';
  const rw = winner === 'right';
  return (
    <CardShell {...props} radius={14}>
      <SectionLabel c={c}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
        {/* Left */}
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
          style={{
            flex: 1, padding: '10px 8px', borderRadius: 10, textAlign: 'center',
            border: `1.5px solid ${lw ? c.trendUp : c.border}`,
            background: lw ? c.trendBgUp : c.bg,
          }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: c.text, marginBottom: 4 }}>
            <EditField value={node.versusLeft?.label ?? 'A'} field="versusLeft.label" isEditing={!!isEditing} onSave={onFieldChange} style={{ textAlign: 'center' }} />
          </div>
          {node.versusLeft?.score != null && (
            <div style={{ fontSize: 20, fontWeight: 700, color: lw ? c.trendUp : c.text, lineHeight: 1 }}>
              <EditField value={String(node.versusLeft.score)} field="versusLeft.score" isEditing={!!isEditing} onSave={onFieldChange} style={{ textAlign: 'center', fontWeight: 700, fontSize: 20 }} />
            </div>
          )}
          {lw && <div style={{ marginTop: 4 }}><Icons.Crown size={11} color={c.trendUp} /></div>}
        </motion.div>
        {/* VS label */}
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 9, fontWeight: 700, color: c.faint }}>VS</div>
        {/* Right */}
        <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
          style={{
            flex: 1, padding: '10px 8px', borderRadius: 10, textAlign: 'center',
            border: `1.5px solid ${rw ? c.trendUp : c.border}`,
            background: rw ? c.trendBgUp : c.bg,
          }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: c.text, marginBottom: 4 }}>
            <EditField value={node.versusRight?.label ?? 'B'} field="versusRight.label" isEditing={!!isEditing} onSave={onFieldChange} style={{ textAlign: 'center' }} />
          </div>
          {node.versusRight?.score != null && (
            <div style={{ fontSize: 20, fontWeight: 700, color: rw ? c.trendUp : c.text, lineHeight: 1 }}>
              <EditField value={String(node.versusRight.score)} field="versusRight.score" isEditing={!!isEditing} onSave={onFieldChange} style={{ textAlign: 'center', fontWeight: 700, fontSize: 20 }} />
            </div>
          )}
          {rw && <div style={{ marginTop: 4 }}><Icons.Crown size={11} color={c.trendUp} /></div>}
        </motion.div>
      </div>
    </CardShell>
  );
}

// ─── 12. steps-numbered ───────────────────────────────────────────────────────
export function StepsNumberedNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const steps = node.numberedSteps ?? [];
  return (
    <CardShell {...props} radius={14}>
      <SectionLabel c={c}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((step, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              border: `1.5px solid ${c.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9.5, fontWeight: 700, color: c.text,
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              marginTop: 1,
            }}>{i + 1}</div>
            <div style={{ flex: 1, paddingTop: 1 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: c.text, lineHeight: 1.3, marginBottom: step.desc ? 3 : 0 }}>
                <EditField value={step.title ?? ''} field={`numberedSteps.${i}.title`} isEditing={!!isEditing} onSave={onFieldChange} />
              </div>
              {step.desc && (
                <div style={{ fontSize: 9.5, color: c.muted, lineHeight: 1.45 }}>
                  <EditField value={step.desc} field={`numberedSteps.${i}.desc`} isEditing={!!isEditing} onSave={onFieldChange} multiline />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

// ─── 13. social-stat ──────────────────────────────────────────────────────────
export function SocialStatNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const platformIconMap: Record<string, string> = {
    instagram: 'Instagram', youtube: 'Youtube', twitter: 'Twitter',
    linkedin: 'Linkedin', tiktok: 'Music2', facebook: 'Facebook', default: 'Users',
  };
  const iconName = platformIconMap[(node.socialPlatform ?? '').toLowerCase()] ?? platformIconMap.default;
  const isUp = node.socialGrowth?.startsWith('+');
  const isDown = node.socialGrowth?.startsWith('-');
  return (
    <CardShell {...props} radius={14}>
      {/* Platform + growth */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: c.muted }}>
          <DIcon name={iconName} size={13} />
          <span style={{ fontSize: 9.5, fontWeight: 500 }}>{node.socialPlatform ?? ''}</span>
        </div>
        {node.socialGrowth && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
            color: isUp ? c.trendUp : isDown ? c.trendDown : c.muted,
            background: isUp ? c.trendBgUp : isDown ? c.trendBgDown : c.bg,
          }}>
            <EditField value={node.socialGrowth} field="socialGrowth" isEditing={!!isEditing} onSave={onFieldChange} />
          </span>
        )}
      </div>
      {/* Big number */}
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.38 }}
        style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: c.text, lineHeight: 1, marginBottom: 4 }}>
        <EditField value={node.socialValue ?? '—'} field="socialValue" isEditing={!!isEditing} onSave={onFieldChange} />
      </motion.div>
      <div style={{ fontSize: 10, color: c.muted }}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </div>
    </CardShell>
  );
}

// ─── 14. cta-card ─────────────────────────────────────────────────────────────
export function CtaCardNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: c.text, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
          <EditField value={node.ctaTitle ?? node.label} field="ctaTitle" isEditing={!!isEditing} onSave={onFieldChange} />
        </div>
        {(node.ctaDesc ?? node.description) && (
          <div style={{ fontSize: 10.5, color: c.muted, lineHeight: 1.5 }}>
            <EditField value={node.ctaDesc ?? node.description ?? ''} field="ctaDesc" isEditing={!!isEditing} onSave={onFieldChange} multiline />
          </div>
        )}
        {node.ctaAction && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 999, marginTop: 2,
            background: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)',
            border: `1px solid ${c.border}`,
            fontSize: 9.5, fontWeight: 600, color: c.text, alignSelf: 'flex-start',
          }}>
            {node.ctaAction}
            <Icons.ArrowRight size={9} />
          </div>
        )}
      </div>
    </CardShell>
  );
}

// ─── 15. score-card ───────────────────────────────────────────────────────────
export function ScoreCardNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  return (
    <CardShell {...props} radius={14}>
      <SectionLabel c={c}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          style={{
            width: 60, height: 60, borderRadius: '50%',
            border: `2px solid ${c.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: c.text,
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          }}>
          <EditField value={node.scoreValue ?? '—'} field="scoreValue" isEditing={!!isEditing} onSave={onFieldChange} style={{ textAlign: 'center' }} />
        </motion.div>
        {node.scoreLabel !== undefined && (
          <div style={{ fontSize: 10.5, color: c.muted, fontWeight: 500, textAlign: 'center' }}>
            <EditField value={node.scoreLabel ?? ''} field="scoreLabel" isEditing={!!isEditing} onSave={onFieldChange} style={{ textAlign: 'center' }} />
          </div>
        )}
        {node.scoreSub !== undefined && (
          <div style={{ fontSize: 9, color: c.faint, textAlign: 'center', lineHeight: 1.4 }}>
            <EditField value={node.scoreSub ?? ''} field="scoreSub" isEditing={!!isEditing} onSave={onFieldChange} style={{ textAlign: 'center' }} />
          </div>
        )}
      </div>
    </CardShell>
  );
}

// ─── 16. heatmap ──────────────────────────────────────────────────────────────
export function HeatmapNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const weeks = 4;
  const seed = node.label.length + (node.heatmapLabel?.length ?? 0) + 7;
  const pseudo = (i: number) => ((i * 13 + seed * 5 + 17) % 20) / 20;
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <SectionLabel c={c} style={{ marginBottom: 0 }}>
          <EditField value={node.heatmapLabel ?? node.label} field="heatmapLabel" isEditing={!!isEditing} onSave={onFieldChange} />
        </SectionLabel>
        {node.heatmapPeak && (
          <span style={{ fontSize: 9, color: c.muted }}>
            Pico: <EditField value={node.heatmapPeak} field="heatmapPeak" isEditing={!!isEditing} onSave={onFieldChange} />
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
        {days.map((d, i) => <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 7, color: c.faint, fontWeight: 600 }}>{d}</div>)}
      </div>
      {Array.from({ length: weeks }).map((_, wi) => (
        <div key={wi} style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
          {days.map((_, di) => {
            const v = pseudo(wi * 7 + di);
            const alpha = 0.08 + v * 0.82;
            return (
              <motion.div key={di}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: (wi * 7 + di) * 0.008 }}
                style={{
                  flex: 1, aspectRatio: '1', borderRadius: 3,
                  background: isDark ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha * 0.7})`,
                }} />
            );
          })}
        </div>
      ))}
    </CardShell>
  );
}

// ─── 17. avatar-list ──────────────────────────────────────────────────────────
export function AvatarListNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const items = node.avatarItems ?? [];
  return (
    <CardShell {...props} radius={14}>
      <SectionLabel c={c}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => {
          const initials = item.name.split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
          return (
            <motion.div key={i}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: isDark
                  ? `rgba(255,255,255,${0.07 + (i % 3) * 0.025})`
                  : `rgba(0,0,0,${0.05 + (i % 3) * 0.02})`,
                border: `1px solid ${c.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9.5, fontWeight: 700, color: c.text,
              }}>{initials}</div>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: c.text, lineHeight: 1.2 }}>
                  <EditField value={item.name ?? ''} field={`avatarItems.${i}.name`} isEditing={!!isEditing} onSave={onFieldChange} />
                </div>
                {item.role && (
                  <div style={{ fontSize: 9, color: c.muted, marginTop: 1 }}>
                    <EditField value={item.role} field={`avatarItems.${i}.role`} isEditing={!!isEditing} onSave={onFieldChange} />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </CardShell>
  );
}

// ─── 18. notification-card ────────────────────────────────────────────────────
export function NotificationCardNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const typeMap: Record<string, { icon: string; color: string }> = {
    info:    { icon: 'Bell',          color: isDark ? '#60a5fa' : '#2563eb' },
    warning: { icon: 'AlertTriangle', color: isDark ? '#fbbf24' : '#d97706' },
    success: { icon: 'CheckCircle2',  color: c.trendUp },
    error:   { icon: 'XCircle',       color: c.trendDown },
  };
  const t = typeMap[node.notifType ?? 'info'];
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Icon badge */}
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: t.color,
        }}>
          <DIcon name={t.icon} size={14} />
        </div>
        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: c.text, lineHeight: 1.2 }}>
              <EditField value={node.notifTitle ?? node.label} field="notifTitle" isEditing={!!isEditing} onSave={onFieldChange} />
            </span>
            {node.notifTime && (
              <span style={{ fontSize: 8.5, color: c.faint, flexShrink: 0 }}>
                <EditField value={node.notifTime} field="notifTime" isEditing={!!isEditing} onSave={onFieldChange} />
              </span>
            )}
          </div>
          <div style={{ fontSize: 10, color: c.muted, lineHeight: 1.45 }}>
            <EditField value={node.notifMessage ?? node.description ?? ''} field="notifMessage" isEditing={!!isEditing} onSave={onFieldChange} multiline />
          </div>
        </div>
      </div>
    </CardShell>
  );
}

// ─── 19. insight-numbered ─────────────────────────────────────────────────────
export function InsightNumberedNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const items = node.insights ?? [];
  return (
    <CardShell {...props} radius={14}>
      <SectionLabel c={c}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              fontSize: 16, fontWeight: 900, color: c.faint, lineHeight: 1,
              flexShrink: 0, width: 24, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
            }}>
              <EditField value={String(item.num ?? i + 1)} field={`insights.${i}.num`} isEditing={!!isEditing} onSave={onFieldChange} style={{ textAlign: 'right', width: 24 }} />
            </div>
            <div style={{ fontSize: 10.5, color: c.text, lineHeight: 1.5, paddingTop: 1, flex: 1 }}>
              <EditField value={item.text ?? ''} field={`insights.${i}.text`} isEditing={!!isEditing} onSave={onFieldChange} multiline />
            </div>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

// ─── 20. skill-grid ───────────────────────────────────────────────────────────
export function SkillGridNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const skills = node.skills ?? [];
  return (
    <CardShell {...props} radius={14}>
      <SectionLabel c={c}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {skills.map((skill, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10.5, color: c.text, fontWeight: 500, flex: 1, minWidth: 0 }}>
              <EditField value={skill.label ?? ''} field={`skills.${i}.label`} isEditing={!!isEditing} onSave={onFieldChange} />
            </span>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              {Array.from({ length: 5 }).map((_, d) => (
                <motion.div key={d}
                  initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 + d * 0.04, type: 'spring', stiffness: 300 }}
                  style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: d < skill.level ? c.bar : c.barBg,
                    border: `1px solid ${d < skill.level ? c.bar : c.border}`,
                  }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ─── 21. quote-hero ───────────────────────────────────────────────────────────
export function QuoteHeroNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  return (
    <CardShell {...props} radius={14}>
      <div style={{ fontSize: 40, lineHeight: 0.8, color: c.faint, fontFamily: 'Georgia, serif', userSelect: 'none', marginBottom: 4 }}>&ldquo;</div>
      <div style={{ fontSize: 12, fontStyle: 'italic', color: c.text, lineHeight: 1.65, fontFamily: 'Georgia, serif', flex: 1 }}>
        <EditField value={node.quote ?? node.description ?? node.label} field="quote" isEditing={!!isEditing} onSave={onFieldChange} multiline />
      </div>
      {node.quoteAuthor !== undefined && (
        <div style={{ fontSize: 9.5, color: c.muted, paddingTop: 10, marginTop: 2, borderTop: `1px solid ${c.divider}` }}>
          — <EditField value={node.quoteAuthor ?? ''} field="quoteAuthor" isEditing={!!isEditing} onSave={onFieldChange} />
        </div>
      )}
    </CardShell>
  );
}

// ─── 22. compare-table ────────────────────────────────────────────────────────
export function CompareTableNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const items = node.compareItems ?? [];
  const [la, lb] = node.compareLabels ?? ['A', 'B'];
  return (
    <CardShell {...props} radius={14}>
      {/* Title */}
      <div style={{ fontSize: 11.5, fontWeight: 700, color: c.text, marginBottom: 10, letterSpacing: '-0.01em' }}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </div>
      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 76px 76px', gap: 6, marginBottom: 8, paddingBottom: 8, borderBottom: `1.5px solid ${c.divider}` }}>
        <span />
        <div style={{ textAlign: 'center', padding: '3px 6px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', borderRadius: 7 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: c.text }}>{la}</span>
        </div>
        <div style={{ textAlign: 'center', padding: '3px 6px', background: c.bg, borderRadius: 7 }}>
          <span style={{ fontSize: 10, fontWeight: 500, color: c.muted }}>{lb}</span>
        </div>
      </div>
      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 76px 76px', gap: 6,
              padding: '7px 0',
              borderBottom: i < items.length - 1 ? `1px solid ${c.divider}` : 'none',
              alignItems: 'center',
            }}>
            <span style={{ fontSize: 10.5, color: c.text, fontWeight: 500 }}>
              <EditField value={item.feature ?? ''} field={`compareItems.${i}.feature`} isEditing={!!isEditing} onSave={onFieldChange} />
            </span>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {typeof item.a === 'boolean'
                ? (item.a ? <Icons.Check size={13} color={c.trendUp} strokeWidth={2.5} /> : <Icons.X size={13} color={c.trendDown} strokeWidth={2} />)
                : <span style={{ fontSize: 10, fontWeight: 600, color: c.text, textAlign: 'center' }}>{item.a}</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {typeof item.b === 'boolean'
                ? (item.b ? <Icons.Check size={13} color={c.trendUp} strokeWidth={2.5} /> : <Icons.X size={13} color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} strokeWidth={2} />)
                : <span style={{ fontSize: 10, color: c.muted, textAlign: 'center' }}>{item.b}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

// ─── 23. cycle-flow ───────────────────────────────────────────────────────────
// Definidos fora do componente para que a referência seja estável entre renders
// e o Framer Motion não reinicie as animações ao fazer pan no canvas.

interface CycleStepBoxProps {
  step: { label: string; icon?: string };
  idx: number;
  c: ReturnType<typeof colors>;
  isDark: boolean;
  isEditing: boolean;
  onFieldChange?: (field: string, value: string) => void;
}

function CycleStepBox({ step, idx, c, isDark, isEditing, onFieldChange }: CycleStepBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.08, type: 'spring', stiffness: 240 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        padding: '8px 4px', borderRadius: 10,
        border: `1px solid ${c.border}`,
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        minWidth: 62, flex: 1,
      }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        border: `1px solid ${c.border}`,
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.icon,
      }}>
        {step.icon ? <DIcon name={step.icon} size={13} /> : <span style={{ fontSize: 11, fontWeight: 800, color: c.text }}>{idx + 1}</span>}
      </div>
      <span style={{ fontSize: 9, color: c.text, fontWeight: 600, textAlign: 'center', lineHeight: 1.25, letterSpacing: '-0.01em' }}>
        <EditField value={step.label ?? ''} field={`cycleSteps.${idx}.label`} isEditing={isEditing} onSave={onFieldChange} style={{ textAlign: 'center' }} />
      </span>
    </motion.div>
  );
}

function CycleArrow({ dir, c }: { dir: 'right' | 'left' | 'up' | 'down'; c: ReturnType<typeof colors> }) {
  const Icon = dir === 'right' ? Icons.ArrowRight : dir === 'left' ? Icons.ArrowLeft : dir === 'up' ? Icons.ArrowUp : Icons.ArrowDown;
  return <div style={{ color: c.faint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={11} /></div>;
}

export function CycleFlowNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const raw = node.cycleSteps ?? [];
  const steps = [...raw];
  while (steps.length < 4) steps.push({ label: `Etapa ${steps.length + 1}` });
  const s = steps.slice(0, 4);

  return (
    <CardShell {...props} radius={14}>
      <SectionLabel c={c}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gridTemplateRows: 'auto auto auto',
        gap: '6px 6px',
        alignItems: 'center',
        justifyItems: 'stretch',
      }}>
        {/* Row 0 */}
        <CycleStepBox step={s[0]} idx={0} c={c} isDark={isDark} isEditing={!!isEditing} onFieldChange={onFieldChange} />
        <CycleArrow dir="right" c={c} />
        <CycleStepBox step={s[1]} idx={1} c={c} isDark={isDark} isEditing={!!isEditing} onFieldChange={onFieldChange} />
        {/* Row 1: vertical arrows + spinning refresh */}
        <CycleArrow dir="up" c={c} />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{ color: c.faint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.RefreshCw size={13} />
        </motion.div>
        <CycleArrow dir="down" c={c} />
        {/* Row 2 */}
        <CycleStepBox step={s[3]} idx={3} c={c} isDark={isDark} isEditing={!!isEditing} onFieldChange={onFieldChange} />
        <CycleArrow dir="left" c={c} />
        <CycleStepBox step={s[2]} idx={2} c={c} isDark={isDark} isEditing={!!isEditing} onFieldChange={onFieldChange} />
      </div>
    </CardShell>
  );
}

// ─── 24. funnel-bars ──────────────────────────────────────────────────────────
export function FunnelBarsNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const steps = node.funnelSteps ?? [];
  const maxVal = Math.max(...steps.map(s => s.value), 1);

  // Layout constants
  const LABEL_W = 68;  // fixed left column for step names
  const VAL_W   = 34;  // fixed right column for values
  const H_GAP   = 8;   // horizontal gaps between columns
  const STEP_H  = 26;  // bar height
  const MIN_FRAC = 0.22; // narrowest bar = 22% of bar area

  const fmtVal = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1000    ? `${(v / 1000).toFixed(1)}k`
    : String(v);

  // Shade: step 0 = most opaque, last = lightest
  const shade = (i: number, total: number) => {
    const opacity = 0.90 - (i / Math.max(total - 1, 1)) * 0.55;
    return isDark
      ? `rgba(255,255,255,${opacity.toFixed(2)})`
      : `rgba(18,18,18,${opacity.toFixed(2)})`;
  };

  return (
    <CardShell {...props} radius={14}>
      <SectionLabel c={c}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((step, i) => {
          const frac    = MIN_FRAC + (step.value / maxVal) * (1 - MIN_FRAC);
          const isFirst = i === 0;
          const isLast  = i === steps.length - 1;
          const convPct = i > 0
            ? Math.round((step.value / steps[i - 1].value) * 100)
            : null;

          return (
            <React.Fragment key={i}>
              {/* ── Conversion rate bridge ── */}
              {convPct !== null && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '3px 0',
                }}>
                  {/* left spacer aligns arrow with the bars */}
                  <div style={{ width: LABEL_W + H_GAP, flexShrink: 0 }} />
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 4,
                    fontSize: 7.5, color: c.faint, letterSpacing: '0.04em',
                  }}>
                    <span>↓</span>
                    <span>{convPct}% conv.</span>
                  </div>
                  <div style={{ width: VAL_W + H_GAP, flexShrink: 0 }} />
                </div>
              )}

              {/* ── Step row: label | bar | value ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: H_GAP }}>

                {/* Label */}
                <span style={{
                  width: LABEL_W, flexShrink: 0, textAlign: 'right',
                  fontSize: 9, color: c.muted, lineHeight: 1.2,
                }}>
                  <EditField value={step.label ?? ''} field={`funnelSteps.${i}.label`} isEditing={!!isEditing} onSave={onFieldChange} style={{ textAlign: 'right' }} />
                </span>

                {/* Bar — centered in flex space → creates pyramid/funnel shape */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{
                      delay: i * 0.09,
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      width: `${frac * 100}%`,
                      height: STEP_H,
                      background: shade(i, steps.length),
                      borderRadius:
                        isFirst ? '5px 5px 1px 1px'
                        : isLast ? '1px 1px 5px 5px'
                        : '1px',
                      flexShrink: 0,
                      transformOrigin: 'center',
                    }}
                  />
                </div>

                {/* Value */}
                <span style={{
                  width: VAL_W, flexShrink: 0, textAlign: 'left',
                  fontSize: 9, fontWeight: 700, color: c.text, whiteSpace: 'nowrap',
                }}>
                  {fmtVal(step.value)}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </CardShell>
  );
}

// ─── 25. priority-board ───────────────────────────────────────────────────────
export function PriorityBoardNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const items = node.priorityItems ?? [];
  const pMap = {
    high:   { label: 'Alta',  color: c.trendDown,  bg: c.trendBgDown },
    medium: { label: 'Média', color: isDark ? '#fbbf24' : '#d97706', bg: isDark ? 'rgba(251,191,36,0.09)' : 'rgba(217,119,6,0.07)' },
    low:    { label: 'Baixa', color: c.trendUp,    bg: c.trendBgUp },
  };
  return (
    <CardShell {...props} radius={14}>
      <SectionLabel c={c}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => {
          const p = pMap[item.priority] ?? pMap.medium;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 8px', borderRadius: 8,
                border: `1px solid ${c.border}`, background: c.bg,
              }}>
              <span style={{
                fontSize: 7.5, fontWeight: 700, padding: '2px 6px', borderRadius: 999,
                color: p.color, background: p.bg, textTransform: 'uppercase',
                letterSpacing: '0.07em', flexShrink: 0,
              }}>{p.label}</span>
              <span style={{ fontSize: 10.5, color: c.text, flex: 1, lineHeight: 1.3 }}>{item.text}</span>
            </motion.div>
          );
        })}
      </div>
    </CardShell>
  );
}

// ─── 26. event-card ───────────────────────────────────────────────────────────
export function EventCardNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const dateParts = (node.eventDate ?? '').split(' ');
  const day = dateParts[0] || '—';
  const month = dateParts[1] || 'MES';
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Date badge */}
        <div style={{ width: 44, flexShrink: 0, border: `1px solid ${c.border}`, borderRadius: 10, overflow: 'hidden', textAlign: 'center' }}>
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
            padding: '3px 0', fontSize: 7.5, fontWeight: 700, color: c.muted,
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            {month}
          </div>
          <div style={{ padding: '4px 0 3px', fontSize: 20, fontWeight: 800, color: c.text, lineHeight: 1 }}>
            {day}
          </div>
        </div>
        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: c.text, lineHeight: 1.3, marginBottom: 6 }}>
            <EditField value={node.eventTitle ?? node.label} field="eventTitle" isEditing={!!isEditing} onSave={onFieldChange} />
          </div>
          {node.eventTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9.5, color: c.muted, marginBottom: 3 }}>
              <Icons.Clock size={9} /><span>{node.eventTime}</span>
            </div>
          )}
          {node.eventLocation && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9.5, color: c.muted }}>
              <Icons.MapPin size={9} /><span>{node.eventLocation}</span>
            </div>
          )}
        </div>
      </div>
    </CardShell>
  );
}

// ─── 27. growth-indicator ─────────────────────────────────────────────────────
export function GrowthIndicatorNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const pts = node.growthPoints ?? node.lineChartPoints?.map(p => p.value) ?? [20, 35, 28, 50, 45, 70];
  const max = Math.max(...pts, 1);
  const W = 200; const H = 42;
  const polyPts = pts.map((v, i) => `${(i / (pts.length - 1)) * W},${H - (v / max) * H}`).join(' ');
  const isUp = (node.growthValue ?? '').startsWith('+') || pts[pts.length - 1] > pts[0];
  const lineColor = isUp ? c.trendUp : c.trendDown;
  return (
    <CardShell {...props} radius={14}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 8.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: c.muted, marginBottom: 2 }}>
            <EditField value={node.growthLabel ?? node.label} field="growthLabel" isEditing={!!isEditing} onSave={onFieldChange} />
          </div>
          <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
            style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: c.text, lineHeight: 1 }}>
            <EditField value={node.growthValue ?? `+${Math.round(((pts[pts.length - 1] - pts[0]) / Math.max(pts[0], 1)) * 100)}%`} field="growthValue" isEditing={!!isEditing} onSave={onFieldChange} />
          </motion.div>
        </div>
        <span style={{
          fontSize: 8.5, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
          color: lineColor, background: isUp ? c.trendBgUp : c.trendBgDown, marginTop: 2,
        }}>
          {isUp ? 'alta' : 'queda'}
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible', display: 'block' }}>
        <motion.polyline
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          points={polyPts} fill="none" stroke={lineColor} strokeWidth={2.2}
          strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </CardShell>
  );
}

// ─── 28. team-card ────────────────────────────────────────────────────────────
export function TeamCardNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const name = node.teamName ?? node.label;
  const initials = name.split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const stats = node.teamStats ?? [];
  return (
    <CardShell {...props} radius={14}>
      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: stats.length ? 12 : 0 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          border: `1.5px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: c.text,
        }}>{initials}</div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: c.text, lineHeight: 1.2 }}>
            <EditField value={name} field="teamName" isEditing={!!isEditing} onSave={onFieldChange} />
          </div>
          <div style={{ fontSize: 9.5, color: c.muted, marginTop: 2 }}>
            <EditField value={node.teamRole ?? ''} field="teamRole" isEditing={!!isEditing} onSave={onFieldChange} />
          </div>
        </div>
      </div>
      {/* Stats */}
      {stats.length > 0 && (
        <div style={{ display: 'flex', borderTop: `1px solid ${c.divider}`, paddingTop: 10 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              flex: 1, textAlign: 'center',
              borderLeft: i > 0 ? `1px solid ${c.divider}` : 'none',
              padding: '0 6px',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.text, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 8, color: c.muted, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </CardShell>
  );
}

// ─── 29. pill-metrics ─────────────────────────────────────────────────────────
export function PillMetricsNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const items = node.pillItems ?? [];
  return (
    <CardShell {...props} radius={14}>
      <SectionLabel c={c}>
        <EditField value={node.label} field="label" isEditing={!!isEditing} onSave={onFieldChange} />
      </SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {items.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 240 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 999,
              border: `1px solid ${c.border}`, background: c.bg,
            }}>
            {item.icon && <div style={{ color: c.icon }}><DIcon name={item.icon} size={9} /></div>}
            <span style={{ fontSize: 10.5, fontWeight: 600, color: c.text }}>{item.value}</span>
            <span style={{ fontSize: 8.5, color: c.muted }}>{item.label}</span>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

// ─── 30. code-snippet ─────────────────────────────────────────────────────────
export function CodeSnippetNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const lines = node.codeLines ?? ['// sem conteudo'];
  const kw = new Set(['const', 'let', 'var', 'function', 'return', 'import', 'export', 'from', 'if', 'else', 'class', 'new', 'await', 'async', 'for', 'of', 'in', 'true', 'false', 'null', 'undefined', 'type', 'interface']);

  function tokenize(line: string): { text: string; type: 'keyword' | 'string' | 'comment' | 'number' | 'normal' }[] {
    if (line.trim().startsWith('//') || line.trim().startsWith('#'))
      return [{ text: line, type: 'comment' }];
    const parts: ReturnType<typeof tokenize> = [];
    line.split(/(\s+|[(){}[\];,.]|"[^"]*"|'[^']*'|`[^`]*`|\b\d+\b)/).forEach(t => {
      if (!t) return;
      if (kw.has(t))        parts.push({ text: t, type: 'keyword' });
      else if (/^["'`]/.test(t)) parts.push({ text: t, type: 'string' });
      else if (/^\d/.test(t))    parts.push({ text: t, type: 'number' });
      else                        parts.push({ text: t, type: 'normal' });
    });
    return parts;
  }

  const tc = {
    keyword: isDark ? '#c084fc' : '#7c3aed',
    string:  isDark ? '#86efac' : '#16a34a',
    comment: isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.32)',
    number:  isDark ? '#fbbf24' : '#d97706',
    normal:  c.text,
  };

  return (
    <CardShell {...props} radius={12}>
      {/* Chrome bar */}
      <div style={{ margin: '-14px -16px 0', padding: '7px 12px', borderBottom: `1px solid ${c.divider}`, background: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#f87171', '#fbbf24', '#4ade80'].map((col, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: col, opacity: 0.65 }} />
          ))}
        </div>
        <span style={{ fontSize: 8, color: c.faint, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
          <EditField value={node.codeLang ?? 'code'} field="codeLang" isEditing={!!isEditing} onSave={onFieldChange} />
        </span>
      </div>
      {/* Code lines */}
      <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace", fontSize: 9.5, lineHeight: 1.7 }}>
        {lines.map((line, li) => (
          <motion.div key={li}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: li * 0.04 }}
            style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
            <span style={{ fontSize: 8, color: c.faint, userSelect: 'none', minWidth: 14, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{li + 1}</span>
            <span>
              {tokenize(line).map((tok, ti) => (
                <span key={ti} style={{ color: tc[tok.type] }}>{tok.text}</span>
              ))}
            </span>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

// --- 31. social-icon (ícones reais + cards UI para Stories/Reels/Post/etc) -----
const SOCIAL_UI_PLATFORMS = ['reels', 'post', 'stories', 'shorts', 'podcast', 'blog', 'site'];

const BRAND_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string; className?: string }>> = {
  instagram:  FaInstagram,
  facebook:   FaFacebook,
  whatsapp:   FaWhatsapp,
  tiktok:     SiTiktok,
  youtube:    FaYoutube,
  twitter:    FaXTwitter,
  linkedin:   FaLinkedin,
  telegram:   FaTelegram,
  email:      FaEnvelope,
  mensagem:   FaComment,
};

const SOCIAL_COLORS: Record<string, { bg: string; color: string }> = {
  instagram:  { bg: 'linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)', color: '#fff' },
  facebook:   { bg: '#1877F2', color: '#fff' },
  whatsapp:   { bg: '#25D366', color: '#fff' },
  tiktok:     { bg: '#010101', color: '#fff' },
  youtube:    { bg: '#FF0000', color: '#fff' },
  twitter:    { bg: '#1DA1F2', color: '#fff' },
  linkedin:   { bg: '#0077B5', color: '#fff' },
  telegram:   { bg: '#229ED9', color: '#fff' },
  email:      { bg: '#EA4335', color: '#fff' },
  mensagem:   { bg: '#34B7F1', color: '#fff' },
  reels:      { bg: 'linear-gradient(135deg,#f9ce34,#ee2a7b)', color: '#fff' },
  post:       { bg: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color: '#fff' },
  stories:    { bg: 'linear-gradient(135deg,#ee2a7b,#6228d7)', color: '#fff' },
  shorts:     { bg: '#FF0000', color: '#fff' },
  podcast:    { bg: '#8940FA', color: '#fff' },
  blog:       { bg: '#FF5722', color: '#fff' },
  site:       { bg: '#2196F3', color: '#fff' },
};

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram', facebook: 'Facebook', whatsapp: 'WhatsApp',
  tiktok: 'TikTok', youtube: 'YouTube', email: 'E-mail',
  linkedin: 'LinkedIn', telegram: 'Telegram', mensagem: 'Mensagem',
  twitter: 'Twitter / X', reels: 'Reels', post: 'Post', stories: 'Stories',
  shorts: 'Shorts', podcast: 'Podcast', blog: 'Blog', site: 'Site',
};

const avatarStyle = { width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: 'var(--color-bg2)', border: '2px solid var(--color-border)' } as const;
const avatarStyleSm = { width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: 'var(--color-bg2)', border: '2px solid var(--color-border)' } as const;

/** Stories: header (avatar, username, olho, menu, X) + conteúdo + footer */
function StoriesUICard(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  return (
    <CardShell {...props} radius={16}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 360, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--color-bg2)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={avatarStyle} />
          <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--color-text)' }}>
            <EditField value={node.socialHandle ?? 'username'} field="socialHandle" isEditing={!!isEditing} onSave={onFieldChange} style={{ fontSize: 11 }} />
          </span>
          <Icons.Eye size={14} style={{ color: 'var(--color-muted)' }} />
          <div style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--color-bg2)', border: '1px solid var(--color-border)' }} />
          <Icons.X size={12} style={{ color: 'var(--color-muted)' }} />
        </div>
        <div style={{ flex: 1, minHeight: 220, background: 'linear-gradient(135deg, var(--color-bg2) 0%, var(--color-bg) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Icons.Eye size={36} style={{ color: 'var(--color-text)' }} strokeWidth={1.5} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '0.04em' }}>Stories</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--color-bg2)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ flex: 1, height: 28, borderRadius: 100, background: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
            <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>Enviar mensagem</span>
          </div>
          <Icons.Heart size={14} style={{ color: 'var(--color-muted)' }} />
          <Icons.MessageCircle size={13} style={{ color: 'var(--color-muted)' }} />
          <Icons.Send size={13} style={{ color: 'var(--color-muted)' }} />
        </div>
      </div>
    </CardShell>
  );
}

/** Reels: ícone de vídeo/play ao centro com "Reels" embaixo; avatar visível no overlay */
function ReelsUICard(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  return (
    <CardShell {...props} radius={16}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 360, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-card)', position: 'relative' }}>
        <div style={{ flex: 1, minHeight: 260, background: 'linear-gradient(180deg, var(--color-bg2) 0%, var(--color-bg) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, position: 'relative' }}>
          <motion.div style={{ width: 64, height: 64, borderRadius: 16, border: '2px solid var(--color-border)', background: 'var(--color-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Play size={28} style={{ color: 'var(--color-text)', marginLeft: 4 }} fill="var(--color-text)" />
          </motion.div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.02em' }}>Reels</span>
          <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={avatarStyleSm} />
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text)' }}><EditField value={node.socialHandle ?? 'username'} field="socialHandle" isEditing={!!isEditing} onSave={onFieldChange} style={{ fontSize: 10 }} /></span>
            <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 100, border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>Seguir</span>
          </div>
          <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Icons.Heart size={16} style={{ color: 'var(--color-muted)' }} /><span style={{ fontSize: 8, color: 'var(--color-muted)' }}>103K</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Icons.MessageCircle size={14} style={{ color: 'var(--color-muted)' }} /><span style={{ fontSize: 8, color: 'var(--color-muted)' }}>342</span></div>
            <Icons.Send size={14} style={{ color: 'var(--color-muted)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg2)', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
            <Icons.Home size={18} style={{ color: 'var(--color-text)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
            <Icons.Search size={18} style={{ color: 'var(--color-text)' }} />
          </div>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Clapperboard size={16} style={{ color: 'var(--color-text)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
            <Icons.ShoppingBag size={18} style={{ color: 'var(--color-text)' }} />
          </div>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-bg2)', border: '2px solid var(--color-border)' }} />
        </div>
      </div>
    </CardShell>
  );
}

/** Post: header (avatar visível), quadrado com ícone de imagem acima do texto POST, like/comment/share/save, nav */
function PostUICard(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  return (
    <CardShell {...props} radius={16}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 360, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--color-bg2)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={avatarStyle} />
          <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--color-text)' }}><EditField value={node.socialHandle ?? 'username'} field="socialHandle" isEditing={!!isEditing} onSave={onFieldChange} style={{ fontSize: 11 }} /></span>
          <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--color-text)', padding: '2px 10px', borderRadius: 6, border: '1px solid var(--color-border)' }}>Seguir</span>
          <Icons.MoreHorizontal size={14} style={{ color: 'var(--color-muted)' }} />
        </div>
        <div style={{ aspectRatio: '1', background: 'linear-gradient(135deg, var(--color-bg2), var(--color-bg))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icons.Image size={28} style={{ color: 'var(--color-muted)' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.06em' }}>POST</span>
        </div>
        <div style={{ padding: '6px 10px' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}><Icons.Heart size={14} style={{ color: 'var(--color-text)' }} /><Icons.MessageCircle size={13} style={{ color: 'var(--color-text)' }} /><Icons.Send size={13} style={{ color: 'var(--color-text)' }} /><div style={{ flex: 1 }} /><Icons.Bookmark size={13} style={{ color: 'var(--color-muted)' }} /></div>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text)' }}>2.368 curtidas</span>
          <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}><strong style={{ color: 'var(--color-text)' }}>username</strong> Lorem ipsum #template</div>
          <span style={{ fontSize: 9, color: 'var(--color-faint)' }}>Ver todos os 926 comentários</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg2)', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
            <Icons.Home size={18} style={{ color: 'var(--color-text)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
            <Icons.Search size={18} style={{ color: 'var(--color-text)' }} />
          </div>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Plus size={14} style={{ color: 'var(--color-text)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
            <Icons.LayoutGrid size={18} style={{ color: 'var(--color-text)' }} />
          </div>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-bg2)', border: '2px solid var(--color-border)' }} />
        </div>
      </div>
    </CardShell>
  );
}

/** Shorts: play central com texto "Shorts" embaixo; avatar visível; barra direita; nav inferior */
function ShortsUICard(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  return (
    <CardShell {...props} radius={16}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 360, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <div style={{ flex: 1, minHeight: 240, background: 'var(--color-bg)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <motion.div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-card)' }}>
            <Icons.Play size={24} style={{ color: 'var(--color-text)', marginLeft: 4 }} fill="var(--color-text)" />
          </motion.div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.02em' }}>Shorts</span>
          <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <div><Icons.ThumbsUp size={18} style={{ color: 'var(--color-muted)' }} /></div>
            <div><Icons.ThumbsDown size={18} style={{ color: 'var(--color-muted)' }} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Icons.MessageCircle size={16} style={{ color: 'var(--color-muted)' }} /><span style={{ fontSize: 8, color: 'var(--color-muted)' }}>0</span></div>
            <Icons.Share2 size={16} style={{ color: 'var(--color-muted)' }} />
            <span style={{ fontSize: 8, color: 'var(--color-muted)' }}>Remix</span>
          </div>
          <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={avatarStyleSm} />
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text)' }}><EditField value={node.socialHandle ?? '@creator'} field="socialHandle" isEditing={!!isEditing} onSave={onFieldChange} style={{ fontSize: 10 }} /></span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 8px', background: 'var(--color-bg2)', borderTop: '1px solid var(--color-border)' }}>
          <Icons.Home size={14} style={{ color: 'var(--color-muted)' }} />
          <Icons.Clapperboard size={14} style={{ color: 'var(--color-text)' }} />
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-bg2)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Plus size={14} style={{ color: 'var(--color-text)' }} /></div>
          <Icons.Tv size={13} style={{ color: 'var(--color-muted)' }} />
          <Icons.Library size={13} style={{ color: 'var(--color-muted)' }} />
        </div>
      </div>
    </CardShell>
  );
}

/** Podcast: horizontal 16:9; ícone de pessoa ao centro com "Podcast" embaixo; controles */
function PodcastUICard(props: NodeProps) {
  const { node } = props;
  return (
    <CardShell {...props} radius={16}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 160, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <div style={{ flex: 1, minHeight: 100, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, position: 'relative' }}>
          <motion.div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-bg2)', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.User size={24} style={{ color: 'var(--color-text)' }} />
          </motion.div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.02em' }}>Podcast</span>
          <div style={{ position: 'absolute', bottom: 6, left: 8, right: 8, height: 3, borderRadius: 2, background: 'var(--color-bg2)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '6px 10px', background: 'var(--color-bg2)', borderTop: '1px solid var(--color-border)' }}>
          <Icons.SkipBack size={16} style={{ color: 'var(--color-muted)' }} />
          <Icons.Play size={22} style={{ color: 'var(--color-text)' }} fill="var(--color-text)" />
          <Icons.SkipForward size={16} style={{ color: 'var(--color-muted)' }} />
        </div>
      </div>
    </CardShell>
  );
}

/** Blog: horizontal 16:9; conteúdo visível; nome "Blog" ao centro */
function BlogUICard(props: NodeProps) {
  const { node } = props;
  return (
    <CardShell {...props} radius={16}>
      <div style={{ display: 'flex', height: '100%', minHeight: 160, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <div style={{ width: 56, padding: '8px 6px', background: 'var(--color-bg2)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-bg2)', border: '1px solid var(--color-border)' }} />
          <div style={{ width: '100%', height: 4, borderRadius: 2, background: 'var(--color-muted)', opacity: 0.6 }} />
          <div style={{ width: '85%', height: 3, borderRadius: 2, background: 'var(--color-muted)', opacity: 0.5 }} />
          <div style={{ width: '70%', height: 3, borderRadius: 2, background: 'var(--color-muted)', opacity: 0.4 }} />
        </div>
        <div style={{ flex: 1, padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ background: 'var(--color-bg)', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <div style={{ height: 28, background: 'var(--color-bg2)', borderBottom: '1px solid var(--color-border)' }} />
              <div style={{ padding: 4 }}>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--color-text)', opacity: 0.4, marginBottom: 3, width: '90%' }} />
                <div style={{ height: 3, borderRadius: 2, background: 'var(--color-muted)', opacity: 0.5, width: '60%' }} />
              </div>
            </div>
          ))}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.02em', textShadow: '0 0 20px var(--color-card)' }}>Blog</span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

/** Site: horizontal 16:9; janela browser; conteúdo mais visível; nome "Site" ao centro */
function SiteUICard(props: NodeProps) {
  const { node } = props;
  return (
    <CardShell {...props} radius={16}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 160, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'var(--color-bg2)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', gap: 3 }}>{[1,2,3].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-muted)', opacity: 0.7 }} />)}</div>
          <div style={{ flex: 1, height: 16, borderRadius: 4, background: 'var(--color-bg)', border: '1px solid var(--color-border)', marginLeft: 6 }} />
        </div>
        <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
          <div style={{ flex: 1, padding: 8 }}>
            <div style={{ height: 6, borderRadius: 2, background: 'var(--color-text)', opacity: 0.35, width: '70%', marginBottom: 6 }} />
            <div style={{ height: 4, borderRadius: 2, background: 'var(--color-muted)', opacity: 0.5, width: '100%', marginBottom: 3 }} />
            <div style={{ height: 4, borderRadius: 2, background: 'var(--color-muted)', opacity: 0.45, width: '95%', marginBottom: 8 }} />
            <div style={{ height: 48, borderRadius: 6, background: 'var(--color-bg2)', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ width: 48, padding: 6, background: 'var(--color-bg2)', borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-bg2)', border: '1px solid var(--color-border)' }} />
            <div style={{ width: '100%', height: 3, borderRadius: 2, background: 'var(--color-muted)', opacity: 0.5 }} />
            <div style={{ width: '80%', height: 3, borderRadius: 2, background: 'var(--color-muted)', opacity: 0.4 }} />
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.02em', textShadow: '0 0 20px var(--color-card)' }}>Site</span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

export function SocialIconNode(props: NodeProps) {
  const { node, isDark, isEditing, onFieldChange } = props;
  const c = colors(isDark);
  const platform = (node.socialPlatform ?? 'instagram').toLowerCase();
  const isUICard = SOCIAL_UI_PLATFORMS.includes(platform);
  const { useBrandColors } = useSocialIcons();

  if (isUICard) {
    switch (platform) {
      case 'stories': return <StoriesUICard {...props} />;
      case 'reels':   return <ReelsUICard {...props} />;
      case 'post':    return <PostUICard {...props} />;
      case 'shorts':  return <ShortsUICard {...props} />;
      case 'podcast': return <PodcastUICard {...props} />;
      case 'blog':    return <BlogUICard {...props} />;
      case 'site':    return <SiteUICard {...props} />;
      default:       return <StoriesUICard {...props} />;
    }
  }

  const BrandIcon = BRAND_ICONS[platform];
  const label = SOCIAL_LABELS[platform] ?? platform;
  const useIdentity = !useBrandColors;
  const s = useIdentity
    ? { bg: isDark ? 'var(--color-bg2)' : 'var(--color-bg2)', color: 'var(--color-text)' }
    : (SOCIAL_COLORS[platform] ?? { bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', color: isDark ? '#fff' : '#000' });

  return (
    <CardShell {...props} radius={16}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, paddingTop: 6 }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          style={{
            width: 60, height: 60, borderRadius: 16, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: s.color, flexShrink: 0, boxShadow: useIdentity ? 'none' : '0 4px 14px rgba(0,0,0,0.2)',
            border: useIdentity ? '1px solid var(--color-border)' : undefined,
          }}
        >
          {BrandIcon ? <BrandIcon size={26} color={useIdentity ? 'var(--color-text)' : s.color} /> : <Icons.Globe size={24} style={{ color: s.color }} />}
        </motion.div>
        <div style={{ fontSize: 13, fontWeight: 700, color: c.text, textAlign: 'center' }}>{label}</div>
        <div style={{ fontSize: 11, color: c.muted, textAlign: 'center' }}>
          <EditField value={node.socialHandle ?? '@handle'} field="socialHandle" isEditing={!!isEditing} onSave={onFieldChange} style={{ textAlign: 'center' }} />
        </div>
        {node.socialFollowers && (
          <div style={{ fontSize: 11, fontWeight: 600, color: c.text, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', padding: '3px 10px', borderRadius: 100 }}>
            <EditField value={node.socialFollowers} field="socialFollowers" isEditing={!!isEditing} onSave={onFieldChange} style={{ textAlign: 'center' }} />
          </div>
        )}
      </div>
    </CardShell>
  );
}
