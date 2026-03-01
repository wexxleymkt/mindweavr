'use client';

import { useEffect, useState, useRef } from 'react';
import { Type, X, Plus, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { TextAlign } from '@/lib/drawingTypes';

interface Props {
  isDark: boolean;
  mode: 'place' | 'edit';
  initialText?: string;
  initialFontSize?: number;
  initialAlign?: TextAlign;
  onPlace: (text: string, fontSize: number, align: TextAlign) => void;
  onApply: (text: string, fontSize: number, align: TextAlign) => void;
  onLiveUpdate?: (text: string, fontSize: number, align: TextAlign) => void;
  onClose: () => void;
}

export function TextPanel({
  isDark,
  mode,
  initialText = '',
  initialFontSize = 24,
  initialAlign = 'start',
  onPlace,
  onApply,
  onLiveUpdate,
  onClose,
}: Props) {
  const [text, setText] = useState(initialText);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [align, setAlign] = useState<TextAlign>(initialAlign);
  const liveRef = useRef(onLiveUpdate);

  useEffect(() => { liveRef.current = onLiveUpdate; }, [onLiveUpdate]);
  useEffect(() => {
    setText(initialText);
    setFontSize(initialFontSize ?? 24);
    setAlign(initialAlign ?? 'start');
  }, [mode, initialText, initialFontSize, initialAlign]);

  const syncLive = (t: string, fs: number, a: TextAlign) => {
    const safeFs = Math.max(12, Math.min(80, fs));
    if (mode === 'edit' && liveRef.current) liveRef.current(t.trim() || t, safeFs, a);
  };

  const bg = isDark ? 'rgba(18,18,18,0.96)' : 'rgba(252,252,252,0.96)';
  const border = isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.10)';
  const textColor = isDark ? '#fff' : '#111';
  const muted = isDark ? 'rgba(255,255,255,0.44)' : 'rgba(0,0,0,0.44)';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

  const handleConfirm = () => {
    const t = text.trim() || 'Texto';
    const fs = Math.max(12, Math.min(80, fontSize));
    if (mode === 'place') onPlace(t, fs, align);
    else onApply(t, fs, align);
  };

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
        width: 300,
        minWidth: 280,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        padding: '16px 14px',
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
          <Type size={13} strokeWidth={1.7} color={muted} />
          <span style={{ fontSize: 12, fontWeight: 500, color: textColor }}>
            {mode === 'place' ? 'Adicionar texto' : 'Editar texto'}
          </span>
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

      <textarea
        value={text}
        onChange={e => { const v = e.target.value; setText(v); syncLive(v, fontSize, align); }}
        placeholder="Digite o texto..."
        onPointerDown={e => e.stopPropagation()}
        style={{
          width: '100%',
          minHeight: 110,
          padding: '10px 12px',
          borderRadius: 8,
          border: `1px solid ${border}`,
          background: inputBg,
          color: textColor,
          fontSize: 13,
          fontFamily: 'var(--font-caveat)',
          lineHeight: 1.4,
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        rows={4}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Alinhar
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['start', 'middle', 'end'] as TextAlign[]).map(a => (
            <button
              key={a}
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onClick={() => { setAlign(a); syncLive(text, fontSize, a); }}
              title={a === 'start' ? 'Esquerda' : a === 'middle' ? 'Centro' : 'Direita'}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1px solid ${align === a ? border : 'transparent'}`,
                background: align === a ? inputBg : 'transparent',
                color: textColor,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {a === 'start' && <AlignLeft size={14} strokeWidth={2} />}
              {a === 'middle' && <AlignCenter size={14} strokeWidth={2} />}
              {a === 'end' && <AlignRight size={14} strokeWidth={2} />}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Tamanho
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            type="button"
            onPointerDown={e => e.stopPropagation()}
            onClick={() => { const n = Math.max(12, fontSize - 4); setFontSize(n); syncLive(text, n, align); }}
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              border: `1px solid ${border}`,
              background: 'transparent',
              color: textColor,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            −
          </button>
          <span style={{ minWidth: 28, textAlign: 'center', fontSize: 12, color: textColor }}>{fontSize}</span>
          <button
            type="button"
            onPointerDown={e => e.stopPropagation()}
            onClick={() => { const n = Math.min(80, fontSize + 4); setFontSize(n); syncLive(text, n, align); }}
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              border: `1px solid ${border}`,
              background: 'transparent',
              color: textColor,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            +
          </button>
        </div>
      </div>

      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={handleConfirm}
        style={{
          width: '100%',
          padding: '9px',
          borderRadius: 100,
          border: 'none',
          background: textColor,
          color: isDark ? '#000' : '#fff',
          fontSize: 11.5,
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'var(--font-inter)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {mode === 'place' ? <><Plus size={14} strokeWidth={2.5} /> Colocar no canvas</> : 'Aplicar'}
      </button>
      {mode === 'place' && (
        <p style={{ fontSize: 9.5, color: muted, textAlign: 'center', margin: 0 }}>
          Clique no canvas para posicionar
        </p>
      )}
    </div>
  );
}
