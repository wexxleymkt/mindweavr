'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const C = {
  bg: '#0a0a0a',
  bg2: '#0d0d0d',
  card: 'rgba(17,17,17,0.8)',
  card2: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  borderL: 'rgba(255,255,255,0.14)',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.65)',
  faint: 'rgba(255,255,255,0.35)',
  vfaint: 'rgba(255,255,255,0.18)',
  accent: '#ffffff',
};

const fs = 'var(--font-inter)';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu();
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [menuOpen, closeMenu]);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isAnchor = href.startsWith('/#');
    if (!isAnchor) return;
    e.preventDefault();
    const id = href.replace('/#', '');
    if (pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      router.push('/');
      // after navigation, scroll when DOM is ready
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
    setMenuOpen(false);
  };

  const links = [
    { label: 'Início',           href: '/#hero' },
    { label: 'Funcionalidades',  href: '/#features' },
    { label: 'Como funciona',    href: '/#how' },
    { label: 'Preços',           href: '/#pricing' },
    { label: 'Parceiros',        href: '/parceiros' },
  ];

  const linkStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 300, color: C.muted,
    textDecoration: 'none', transition: 'color 0.2s', fontFamily: fs,
  };

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }} className={`landing-navbar${scrolled ? ' scrolled' : ''}`}>
      {/* Container único: barra + dropdown integrados (como Creatyx) */}
      <div
        className="navbar-inner"
        style={{
          position: 'relative',
          zIndex: 101,
          margin: scrolled ? 0 : '20px auto',
          maxWidth: scrolled ? '100%' : 1100,
          padding: scrolled ? undefined : undefined,
          minHeight: 56,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(10,10,10,0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: scrolled ? 0 : (menuOpen ? 16 : 100),
          outline: scrolled ? undefined : `1px solid rgba(255,255,255,0.09)`,
          borderBottom: scrolled ? `1px solid ${C.border}` : undefined,
          transition: 'border-radius 0.25s ease',
          overflow: 'hidden',
        }}
      >
        {/* Barra: logo + links desktop + hamburger */}
        <div
          className="navbar-bar-row"
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            paddingLeft: scrolled ? 32 : 24,
            paddingRight: scrolled ? 32 : 24,
          }}
        >
          <Link href="/" onClick={e => handleAnchorClick(e as any, '/#hero')}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
            <img
              src="/logo-mindweavr-black.png"
              alt="MindWeavr"
              style={{ height: 22, width: 'auto', filter: 'brightness(0) invert(1)', objectFit: 'contain' }}
            />
            <span style={{ fontSize: 15, fontWeight: 500, color: C.text, letterSpacing: '-0.02em', fontFamily: fs }}>
              MindWeavr
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-links">
            {links.map(l => (
              <a key={l.label} href={l.href} style={linkStyle}
                onClick={e => handleAnchorClick(e, l.href)}
                onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
                {l.label}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="nav-links">
            {user ? (
              <Link href="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 100, background: C.text, color: C.bg, fontSize: 13, fontWeight: 500, textDecoration: 'none', fontFamily: fs }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                Abrir app <ArrowRight size={13} />
              </Link>
            ) : (
              <>
                <Link href="/login" style={linkStyle}
                  onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
                  Entrar
                </Link>
                <Link href="/#pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 100, background: C.text, color: C.bg, fontSize: 13, fontWeight: 500, textDecoration: 'none', fontFamily: fs }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  Começar agora
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen(o => !o)}
            className="mobile-btn"
            style={{ display: 'none', background: 'none', border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer', borderRadius: 100, padding: 10 }}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Dropdown integrado à navbar (só no mobile, dentro do mesmo bloco) */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden', borderTop: `1px solid ${C.border}` }}
              className="navbar-dropdown"
            >
              <div style={{ padding: '8px 0 16px', display: 'flex', flexDirection: 'column' }}>
                {links.map(l => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={e => { handleAnchorClick(e, l.href); closeMenu(); }}
                    style={{
                      fontSize: 15,
                      color: C.text,
                      textDecoration: 'none',
                      fontFamily: fs,
                      padding: '12px 24px',
                      borderBottom: `1px solid ${C.border}`,
                      background: 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onTouchStart={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    onTouchEnd={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {l.label}
                  </a>
                ))}
                <a
                  href="/#pricing"
                  onClick={e => { handleAnchorClick(e, '/#pricing'); closeMenu(); }}
                  style={{
                    display: 'block',
                    margin: '16px 24px 0',
                    padding: '14px 16px',
                    background: C.text,
                    color: C.bg,
                    fontSize: 15,
                    fontWeight: 500,
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontFamily: fs,
                    borderRadius: 8,
                  }}
                >
                  Começar agora →
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlay só quando menu aberto no mobile (escurece o fundo) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={closeMenu}
            className="navbar-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 99,
            }}
          />
        )}
      </AnimatePresence>
      <style>{`
        @media (max-width: 760px) {
          .nav-links { display: none !important; }
          .mobile-btn { display: flex !important; align-items: center; justify-content: center; }
          .landing-navbar .navbar-inner {
            margin: 12px 16px !important;
            max-width: none !important;
          }
          .landing-navbar .navbar-inner .navbar-bar-row { padding-left: 16px !important; padding-right: 16px !important; }
          .landing-navbar.scrolled .navbar-inner {
            margin: 0 !important;
          }
        }
        @media (min-width: 761px) {
          .navbar-overlay { display: none !important; }
        }
        .navbar-overlay {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
      `}</style>
    </header>
  );
}
