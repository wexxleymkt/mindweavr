'use client';

import { useState } from 'react';
import { MousePointer2, Type, Minus, Image, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { DrawTool } from '@/lib/drawingTypes';

interface Props {
  activeTool: DrawTool;
  onToolChange: (t: DrawTool) => void;
  isDark: boolean;
  onClearAll: () => void;
  hasElements: boolean;
}

const TOOLS: { id: DrawTool; Icon: React.ElementType; label: string }[] = [
  { id: 'select', Icon: MousePointer2, label: 'Selecionar' },
  { id: 'text',   Icon: Type,          label: 'Texto (fonte rabiscada)' },
  { id: 'arrow',  Icon: Minus,         label: 'Seta rabiscada — clique para pontos, duplo-clique para finalizar' },
  { id: 'image',  Icon: Image,         label: 'Imagem (upload ou link)' },
];

export function DrawingPanel({ activeTool, onToolChange, isDark, onClearAll, hasElements }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const bg     = isDark ? 'rgba(18,18,18,0.92)' : 'rgba(252,252,252,0.92)';
  const border = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const text   = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)';
  const muted  = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
  const activeColor  = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const activeBorder = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.3)';

  const btnBase: React.CSSProperties = {
    width: 36, height: 36, borderRadius: 10,
    border: `1px solid ${border}`,
    background: 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.15s',
    color: muted,
    flexShrink: 0,
  };

  if (collapsed) {
    return (
      <div
        onPointerDown={e => e.stopPropagation()}
        style={{
          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
          zIndex: 30, padding: '6px 0 6px 6px',
        }}
      >
        <button
          onClick={() => setCollapsed(false)}
          title="Abrir editor"
          style={{
            ...btnBase,
            background: bg,
            border: `1px solid ${border}`,
            backdropFilter: 'blur(12px)',
            color: text,
            borderRadius: '10px 0 0 10px',
          }}
        >
          <ChevronLeft size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      onPointerDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
        zIndex: 30,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        padding: '12px 8px',
        background: bg,
        borderTop: `1px solid ${border}`,
        borderRight: 'none',
        borderBottom: `1px solid ${border}`,
        borderLeft: `1px solid ${border}`,
        borderRadius: '14px 0 0 14px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: isDark ? '-4px 0 24px rgba(0,0,0,0.4)' : '-4px 0 24px rgba(0,0,0,0.08)',
      }}
    >
      {/* Label */}
      <div style={{
        fontSize: 8.5, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: muted, writingMode: 'vertical-rl', transform: 'rotate(180deg)',
        marginBottom: 2, userSelect: 'none',
      }}>
        Anotações
      </div>

      {/* Divider */}
      <div style={{ width: 24, height: 1, background: border }} />

      {/* Tool buttons */}
      {TOOLS.map(({ id, Icon, label }) => {
        const isActive = activeTool === id;
        return (
          <button
            key={id}
            onClick={() => onToolChange(isActive && id !== 'select' ? 'select' : id)}
            title={label}
            style={{
              ...btnBase,
              background: isActive ? activeColor : 'transparent',
              border: `1px solid ${isActive ? activeBorder : border}`,
              color: isActive ? text : muted,
            }}
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                (e.currentTarget as HTMLButtonElement).style.color = text;
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = muted;
              }
            }}
          >
            {id === 'arrow'
              ? <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M2 11 Q4 5 8 7 Q11 8 13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <path d="M10.5 2.5 L13 4 L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              : <Icon size={15} strokeWidth={1.6} />}
          </button>
        );
      })}

      {/* Divider */}
      <div style={{ width: 24, height: 1, background: border, marginTop: 2 }} />

      {/* Lixeira — só ícone, sem texto */}
      {hasElements && (
        <button
          onClick={onClearAll}
          title="Limpar todas as anotações do canvas"
          style={{ ...btnBase, color: isDark ? 'rgba(220,80,80,0.7)' : 'rgba(180,40,40,0.6)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(220,60,60,0.1)' : 'rgba(200,40,40,0.07)';
            (e.currentTarget as HTMLButtonElement).style.color = isDark ? '#ff6b6b' : '#cc2222';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = isDark ? 'rgba(220,80,80,0.7)' : 'rgba(180,40,40,0.6)';
          }}
        >
          <Trash2 size={15} strokeWidth={1.6} />
        </button>
      )}

      {/* Collapse */}
      <button
        onClick={() => setCollapsed(true)}
        title="Recolher painel"
        style={{ ...btnBase, marginTop: 2 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = text; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = muted; }}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
