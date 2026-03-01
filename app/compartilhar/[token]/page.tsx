'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Eye, Link2 } from 'lucide-react';
import { getPublicMap } from '@/lib/supabase';
import MapRenderer from '@/components/MapRenderer';
import type { MapData, LayoutMode, ConnectionStyle } from '@/lib/types';
import Link from 'next/link';

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === 'dark' : true;

  useEffect(() => {
    if (!token) return;
    getPublicMap(token).then(data => {
      if (data) {
        setMapData(data.map_data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
  }, [token]);

  if (!mounted || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--color-border)', borderTopColor: 'var(--color-text)' }}
        />
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', gap: 16, padding: 32, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--color-card)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Link2 size={24} color="var(--color-muted)" />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>
            Mapa não encontrado
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-muted)', maxWidth: 320, lineHeight: 1.6 }}>
            Este link pode ter sido desativado pelo criador ou não existe mais.
          </div>
        </div>
        <Link href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 100, background: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'all 0.18s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border-hover)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; }}>
          Conhecer o MindWeavr
        </Link>
      </div>
    );
  }

  const layoutMode = (mapData?.layoutMode ?? 'top-down') as LayoutMode;
  const connectionStyle = (mapData?.connectionStyle ?? 'bezier') as ConnectionStyle;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', overflow: 'hidden' }}>
      {/* Barra superior */}
      <header style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg)', flexShrink: 0, zIndex: 10 }}>
        {/* Logo + título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
            <img
              src="/logo-mindweavr-black.png"
              alt="MindWeavr"
              style={{ height: 20, width: 'auto', objectFit: 'contain', filter: isDark ? 'brightness(0) invert(1)' : 'none' }}
            />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
              MindWeavr
            </span>
          </Link>

          {mapData?.title && (
            <>
              <div style={{ width: 1, height: 20, background: 'var(--color-border)', flexShrink: 0 }} />
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                {mapData.title}
              </div>
            </>
          )}
        </div>

        {/* Badge somente visualização */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 100, border: '1px solid var(--color-border)', background: 'var(--color-card)', fontSize: 11, fontWeight: 400, color: 'var(--color-muted)' }}>
            <Eye size={10} strokeWidth={2} />
            Somente visualização
          </div>
          <Link href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 100, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted)', fontSize: 11, fontWeight: 500, textDecoration: 'none', transition: 'all 0.18s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; }}>
            Criar meu mapa
          </Link>
        </div>
      </header>

      {/* Canvas do mapa — somente leitura */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Grade de fundo */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: isDark
            ? 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)'
            : 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 12%, rgba(0,0,0,0.5) 88%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 12%, rgba(0,0,0,0.5) 88%, transparent 100%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {mapData && (
          <MapRenderer
            mapData={mapData}
            layoutMode={layoutMode}
            connectionStyle={connectionStyle}
            readOnly={true}
          />
        )}

        {/* Rodapé flutuante — wrapper para centralizar sem conflitar com transform do Framer Motion */}
        <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 8px 8px 14px', borderRadius: 100, background: isDark ? 'rgba(26,26,26,0.94)' : 'rgba(255,255,255,0.96)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.28)', whiteSpace: 'nowrap', pointerEvents: 'auto' }}>

            {/* Texto + logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 400 }}>
                Mapa compartilhado via
              </span>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                <img
                  src="/logo-mindweavr-black.png"
                  alt="MindWeavr"
                  style={{ height: 14, width: 'auto', objectFit: 'contain', filter: isDark ? 'brightness(0) invert(1)' : 'none' }}
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                  MindWeavr
                </span>
              </Link>
            </div>

            {/* CTA */}
            <Link
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: 100, background: isDark ? 'rgba(255,255,255,0.92)' : 'rgba(10,10,15,0.88)', color: isDark ? '#0a0a0f' : '#ffffff', fontSize: 11, fontWeight: 600, textDecoration: 'none', letterSpacing: '-0.01em', transition: 'opacity 0.15s', flexShrink: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.82'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}>
              Criar meu mapa visual
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
