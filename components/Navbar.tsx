'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu } from 'lucide-react';
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
      <div style={{
        margin: scrolled ? '0' : '20px auto',
        maxWidth: scrolled ? '100%' : 1100,
        padding: scrolled ? '0 32px' : '0 24px',
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRadius: scrolled ? 0 : 100,
        outline: scrolled ? undefined : `1px solid rgba(255,255,255,0.09)`,
        borderBottom: scrolled ? `1px solid ${C.border}` : undefined,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
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
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 100, background: C.text, color: C.bg, fontSize: 13, fontWeight: 500, textDecoration: 'none', fontFamily: fs }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                Começar agora
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setMenuOpen(o => !o)} className="mobile-btn"
          style={{ display: 'none', background: 'none', border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer', borderRadius: 100, padding: 8 }}>
          <Menu size={16} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ background: 'rgba(17,17,17,0.97)', backdropFilter: 'blur(24px)', borderBottom: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {links.map(l => (
              <a key={l.label} href={l.href} onClick={e => handleAnchorClick(e, l.href)}
                style={{ fontSize: 15, color: C.muted, textDecoration: 'none', fontFamily: fs }}>{l.label}</a>
            ))}
            <Link href="/login" onClick={() => setMenuOpen(false)}
              style={{ padding: '12px 20px', background: C.text, color: C.bg, borderRadius: 12, fontSize: 14, fontWeight: 500, textDecoration: 'none', textAlign: 'center', fontFamily: fs }}>
              Começar agora →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        @media (max-width: 760px) {
          .nav-links { display: none !important; }
          .mobile-btn { display: flex !important; }
          .landing-navbar > div { margin: 12px 16px !important; padding: 0 16px !important; max-width: none !important; border-radius: 100px !important; }
          .landing-navbar.scrolled > div { margin: 0 !important; padding: 0 16px !important; border-radius: 0 !important; }
        }
      `}</style>
    </header>
  );
}
