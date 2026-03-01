'use client';

import { ArrowRight, X, Plus } from 'lucide-react';

export type ArrowPreset = 2 | 3 | 4 | null;

interface Props {
  isDark: boolean;
  preset: ArrowPreset;
  onSelectPreset: (p: ArrowPreset) => void;
  onPlace: (points: number) => void;
  onClose: () => void;
}

const PRESETS: { points: 2 | 3 | 4; label: string; desc: string }[] = [
  { points: 2, label: 'Curva simples', desc: '2 cliques: início e fim' },
  { points: 3, label: 'Em L', desc: '3 cliques: início, curva, fim' },
  { points: 4, label: 'Curva S', desc: '4 cliques para trajetória suave' },
];

export function ArrowPanel({ isDark, preset, onSelectPreset, onPlace, onClose }: Props) {
  const bg = isDark ? 'rgba(18,18,18,0.96)' : 'rgba(252,252,252,0.96)';
  const border = isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.10)';
  const textColor = isDark ? '#fff' : '#111';
  const muted = isDark ? 'rgba(255,255,255,0.44)' : 'rgba(0,0,0,0.44)';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

  return (
    <div
      onPointerDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        right: 52,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 30,
        width: 220,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        padding: '14px 12px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: isDark ? '-4px 0 24px rgba(0,0,0,0.5)' : '-4px 0 20px rgba(0,0,0,0.10)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowRight size={13} strokeWidth={1.7} color={muted} />
          <span style={{ fontSize: 12, fontWeight: 500, color: textColor }}>Setas</span>
        </div>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={onClose}
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: `1px solid ${border}`,
            background: 'transparent',
            color: muted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={11} />
        </button>
      </div>

      <span style={{ fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Modelo
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {PRESETS.map(({ points, label, desc }) => (
          <button
            key={points}
            type="button"
            onPointerDown={e => e.stopPropagation()}
            onClick={() => onSelectPreset(preset === points ? null : points)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              border: `1px solid ${preset === points ? (isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.22)') : border}`,
              background: preset === points ? inputBg : 'transparent',
              color: textColor,
              fontSize: 11,
              fontWeight: preset === points ? 500 : 400,
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'var(--font-inter)',
            }}
          >
            <div style={{ marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 9.5, color: muted, fontWeight: 400 }}>{desc}</div>
          </button>
        ))}
      </div>

      <button
        disabled={!preset}
        onPointerDown={e => e.stopPropagation()}
        onClick={() => preset && onPlace(preset)}
        style={{
          width: '100%',
          padding: '9px',
          borderRadius: 100,
          border: 'none',
          background: preset ? textColor : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
          color: preset ? (isDark ? '#000' : '#fff') : muted,
          fontSize: 11.5,
          fontWeight: 500,
          cursor: preset ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-inter)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {preset ? <><Plus size={14} strokeWidth={2.5} /> Colocar no canvas</> : 'Colocar no canvas'}
      </button>
      <p style={{ fontSize: 9.5, color: muted, textAlign: 'center', margin: 0 }}>
        Clique no canvas para marcar os pontos
      </p>
    </div>
  );
}
