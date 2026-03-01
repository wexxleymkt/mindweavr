'use client';

import { useState, useRef } from 'react';
import { Upload, Link, X, ImagePlus, Plus } from 'lucide-react';

interface Props {
  isDark: boolean;
  onImageReady: (src: string, aspectRatio?: number) => void;
  onClose: () => void;
  /** place: inserir nova imagem; edit: editar imagem existente */
  mode?: 'place' | 'edit';
  /** URL inicial quando estamos editando uma imagem existente */
  initialUrl?: string;
}

export function ImagePanel({ isDark, onImageReady, onClose, mode = 'place', initialUrl }: Props) {
  const [tab, setTab] = useState<'upload' | 'url'>(initialUrl ? 'url' : 'upload');
  const [url, setUrl] = useState(initialUrl ?? '');
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const bg     = isDark ? 'rgba(18,18,18,0.96)' : 'rgba(252,252,252,0.96)';
  const border = isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.10)';
  const text   = isDark ? '#fff' : '#111';
  const muted  = isDark ? 'rgba(255,255,255,0.44)' : 'rgba(0,0,0,0.44)';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const canConfirm = tab === 'upload' ? !!preview : !!url.trim();

  const handleConfirm = () => {
    const src = tab === 'upload' ? preview! : url.trim();
    if (!src) return;
    const img = new window.Image();
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      onImageReady(src, ratio);
    };
    img.onerror = () => onImageReady(src);
    img.src = src;
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '6px 0', borderRadius: 7,
    border: `1px solid ${active ? border : 'transparent'}`,
    background: active ? (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)') : 'transparent',
    color: active ? text : muted,
    fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
    fontFamily: 'var(--font-inter)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
  });

  return (
    <div
      onPointerDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', right: 52, top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 30, width: 230,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        padding: '14px 12px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: isDark ? '-4px 0 24px rgba(0,0,0,0.5)' : '-4px 0 20px rgba(0,0,0,0.10)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ImagePlus size={13} strokeWidth={1.7} color={muted} />
          <span style={{ fontSize: 12, fontWeight: 500, color: text, letterSpacing: '-0.01em' }}>
            {mode === 'edit' ? 'Editar imagem' : 'Inserir Imagem'}
          </span>
        </div>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={onClose}
          style={{
            width: 22, height: 22, borderRadius: '50%',
            border: `1px solid ${border}`, background: 'transparent',
            color: muted, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={11} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: 3, background: inputBg, borderRadius: 9 }}>
        <button style={tabStyle(tab === 'upload')} onClick={() => setTab('upload')}>
          <Upload size={10} />Upload
        </button>
        <button style={tabStyle(tab === 'url')} onClick={() => setTab('url')}>
          <Link size={10} />Via Link
        </button>
      </div>

      {/* Content */}
      {tab === 'upload' ? (
        <>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          {preview ? (
            <div style={{ position: 'relative' }}>
              <img src={preview} style={{ width: '100%', borderRadius: 9, border: `1px solid ${border}`, maxHeight: 130, objectFit: 'cover', display: 'block' }} />
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                style={{ position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: '50%', background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)', border: `1px solid ${border}`, color: text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={9} />
              </button>
            </div>
          ) : (
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => fileRef.current?.click()}
              style={{ width: '100%', padding: '20px 10px', borderRadius: 9, border: `1.5px dashed ${border}`, background: inputBg, color: muted, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontFamily: 'var(--font-inter)', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? 'rgba(255,255,255,0.26)' : 'rgba(0,0,0,0.20)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = border; }}
            >
              <Upload size={18} strokeWidth={1.2} />
              <span style={{ fontSize: 10.5, fontWeight: 300 }}>Selecionar arquivo</span>
            </button>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            type="url" placeholder="https://..." value={url}
            onChange={e => setUrl(e.target.value)}
            onPointerDown={e => e.stopPropagation()}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${border}`, background: inputBg, color: text, fontSize: 11, fontFamily: 'var(--font-inter)', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.25)'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = border; }}
          />
          {url && (
            <img src={url} style={{ width: '100%', borderRadius: 8, border: `1px solid ${border}`, maxHeight: 100, objectFit: 'cover' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              onLoad={e => { (e.target as HTMLImageElement).style.display = ''; }} />
          )}
        </div>
      )}

      {/* Confirm */}
      <button
        disabled={!canConfirm}
        onPointerDown={e => e.stopPropagation()}
        onClick={handleConfirm}
        style={{
          width: '100%', padding: '9px', borderRadius: 100,
          border: 'none',
          background: canConfirm ? text : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
          color: canConfirm ? (isDark ? '#000' : '#fff') : muted,
          fontSize: 11.5, fontWeight: 500, cursor: canConfirm ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-inter)', transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        {mode === 'place'
          ? (canConfirm ? <><Plus size={14} strokeWidth={2.5} /> Colocar no canvas</> : 'Colocar no canvas')
          : (canConfirm ? 'Atualizar imagem' : 'Atualizar imagem')}
      </button>

      <p style={{ fontSize: 9.5, color: muted, textAlign: 'center', margin: 0, lineHeight: 1.4 }}>
        Clique no canvas para posicionar
      </p>
    </div>
  );
}
