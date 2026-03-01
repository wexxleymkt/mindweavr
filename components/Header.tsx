'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Sun, Moon, Plus, ChevronDown, LogOut, Settings, User, Crown, Save, Map, Share2, Link2, Check, Lock, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  onToggleSidebar: () => void;
  mapTitle?: string | null;
  mapPrompt?: string | null;
  onNewMap?: () => void;
  onSaveMap?: () => void;
  isSaving?: boolean;
  // Compartilhamento
  canShare?: boolean;
  isPublic?: boolean;
  shareToken?: string | null;
  onToggleShare?: (enable: boolean) => Promise<void>;
}

const PLAN_LABELS: Record<string, string> = {
  essencial: 'Essencial',
  creator:   'Creator',
  pro:       'Pro',
};

export function Header({ onToggleSidebar, mapTitle, mapPrompt, onNewMap, onSaveMap, isSaving, canShare, isPublic, shareToken, onToggleShare }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const shareUrl = shareToken
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://mindweavr.app'}/compartilhar/${shareToken}`
    : '';

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleShare = async (enable: boolean) => {
    if (!onToggleShare) return;
    setShareLoading(true);
    await onToggleShare(enable);
    setShareLoading(false);
  };

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  const btnStyle: React.CSSProperties = {
    width: 34, height: 34, borderRadius: '50%',
    border: '1px solid var(--color-border)', background: 'transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-muted)', transition: 'border-color 0.2s, color 0.2s, background 0.2s',
    flexShrink: 0,
  };
  const btnHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget as HTMLButtonElement;
    el.style.borderColor = 'var(--color-border-hover)';
    el.style.color = 'var(--color-text)';
    el.style.background = 'var(--color-card)';
  };
  const btnLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget as HTMLButtonElement;
    el.style.borderColor = 'var(--color-border)';
    el.style.color = 'var(--color-muted)';
    el.style.background = 'transparent';
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const planLabel = profile ? (PLAN_LABELS[profile.plan] ?? 'Essencial') : null;
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '??';

  // Maps display — Pro = unlimited
  const isPro = profile?.plan === 'pro';
  const mapsUsed   = profile ? (profile.plan_credits_limit - profile.credits) : 0;
  const mapsLimit  = profile?.plan_credits_limit ?? 0;
  const mapsPercent = isPro ? 100 : (mapsLimit > 0 ? Math.min(100, (profile!.credits / mapsLimit) * 100) : null);

  return (
    <header style={{
      height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-bg)', flexShrink: 0, position: 'relative', zIndex: 10,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
        <button onClick={onToggleSidebar}
          style={{ ...btnStyle, flexDirection: 'column', gap: 3.5, borderRadius: 10 }}
          onMouseEnter={btnHover} onMouseLeave={btnLeave} title="Abrir histórico">
          <span style={{ width: 14, height: 1.5, background: 'currentColor', borderRadius: 1, display: 'block' }} />
          <span style={{ width: 10, height: 1.5, background: 'currentColor', borderRadius: 1, display: 'block' }} />
          <span style={{ width: 14, height: 1.5, background: 'currentColor', borderRadius: 1, display: 'block' }} />
        </button>

        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
          <img
            src="/logo-mindweavr-black.png"
            alt="MindWeavr"
            style={{ height: 20, width: 'auto', objectFit: 'contain', filter: isDark ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.2s' }}
          />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', letterSpacing: '-0.02em', fontFamily: 'var(--font-inter)' }}>
            MindWeavr
          </span>
        </Link>

        {mapTitle && (
          <>
            <div style={{ width: 1, height: 22, background: 'var(--color-border)', flexShrink: 0, marginLeft: 4 }} />
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                {mapTitle}
              </div>
              {mapPrompt && (
                <div style={{ fontSize: 10, fontWeight: 300, color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                  {mapPrompt}
                </div>
              )}
            </motion.div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {/* Save button */}
              {onSaveMap && (
                <button onClick={onSaveMap} disabled={isSaving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 100, border: '1px solid var(--color-border)', background: 'transparent', color: isSaving ? 'var(--color-faint)' : 'var(--color-muted)', fontSize: 11, fontWeight: 400, cursor: isSaving ? 'default' : 'pointer', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap', transition: 'all 0.18s' }}
                  onMouseEnter={e => { if (!isSaving) { const el = e.currentTarget as HTMLButtonElement; el.style.color = 'var(--color-text)'; el.style.borderColor = 'var(--color-border-hover)'; }}}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = isSaving ? 'var(--color-faint)' : 'var(--color-muted)'; el.style.borderColor = 'var(--color-border)'; }}>
                  <Save size={10} strokeWidth={2} />
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              )}

              {/* Share button — Creator / Pro apenas */}
              {canShare !== undefined && (
                <div ref={shareRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => canShare ? setShareOpen(o => !o) : undefined}
                    title={canShare ? 'Compartilhar mapa' : 'Disponível no plano Creator ou Pro'}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 100, border: `1px solid ${isPublic ? 'rgba(52,211,153,0.45)' : 'var(--color-border)'}`, background: isPublic ? 'rgba(52,211,153,0.08)' : 'transparent', color: !canShare ? 'var(--color-faint)' : isPublic ? 'rgba(52,211,153,0.9)' : 'var(--color-muted)', fontSize: 11, fontWeight: 400, cursor: canShare ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap', transition: 'all 0.18s' }}
                    onMouseEnter={e => { if (canShare && !isPublic) { const el = e.currentTarget as HTMLButtonElement; el.style.color = 'var(--color-text)'; el.style.borderColor = 'var(--color-border-hover)'; }}}
                    onMouseLeave={e => { if (canShare && !isPublic) { const el = e.currentTarget as HTMLButtonElement; el.style.color = 'var(--color-muted)'; el.style.borderColor = 'var(--color-border)'; }}}>
                    {canShare ? <Share2 size={10} strokeWidth={2} /> : <Lock size={10} strokeWidth={2} />}
                    {isPublic ? 'Público' : 'Compartilhar'}
                  </button>

                  {/* Popover de compartilhamento */}
                  <AnimatePresence>
                    {shareOpen && canShare && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 300, background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 16, zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                      >
                        {/* Cabeçalho */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Link2 size={14} color="rgba(52,211,153,0.85)" />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>Compartilhar mapa</div>
                            <div style={{ fontSize: 10, color: 'var(--color-muted)' }}>Qualquer pessoa com o link pode visualizar</div>
                          </div>
                        </div>

                        {/* Toggle ativar/desativar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg)', marginBottom: 12 }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)' }}>
                            {isPublic ? 'Link ativo' : 'Link desativado'}
                          </span>
                          <button
                            onClick={() => handleToggleShare(!isPublic)}
                            disabled={shareLoading}
                            style={{ width: 40, height: 22, borderRadius: 11, border: 'none', background: isPublic ? 'rgba(52,211,153,0.75)' : 'rgba(255,255,255,0.12)', cursor: shareLoading ? 'wait' : 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                          >
                            <motion.div
                              animate={{ x: isPublic ? 20 : 2 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                              style={{ position: 'absolute', top: 3, left: 0, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                            />
                          </button>
                        </div>

                        {/* Link para copiar */}
                        {isPublic && shareUrl && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <div style={{ flex: 1, padding: '7px 10px', borderRadius: 9, border: '1px solid var(--color-border)', background: 'var(--color-bg)', fontSize: 10, color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                                {shareUrl}
                              </div>
                              <button
                                onClick={handleCopyLink}
                                style={{ padding: '7px 10px', borderRadius: 9, border: '1px solid var(--color-border)', background: copied ? 'rgba(52,211,153,0.15)' : 'var(--color-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, color: copied ? 'rgba(52,211,153,0.9)' : 'var(--color-muted)', whiteSpace: 'nowrap', transition: 'all 0.18s', flexShrink: 0 }}>
                                {copied ? <Check size={11} /> : <Copy size={11} />}
                                {copied ? 'Copiado!' : 'Copiar'}
                              </button>
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--color-faint)', marginTop: 8, lineHeight: 1.5 }}>
                              Desative o link a qualquer momento para revogar o acesso.
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* New map button */}
              {onNewMap && (
                <button onClick={onNewMap}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 100, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted)', fontSize: 11, fontWeight: 400, cursor: 'pointer', fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap', transition: 'all 0.18s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = 'var(--color-text)'; el.style.borderColor = 'var(--color-border-hover)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = 'var(--color-muted)'; el.style.borderColor = 'var(--color-border)'; }}>
                  <Plus size={10} strokeWidth={2} />
                  Novo mapa
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button onClick={() => mounted && setTheme(isDark ? 'light' : 'dark')} style={btnStyle} onMouseEnter={btnHover} onMouseLeave={btnLeave}>
          {mounted ? (
            <motion.div key={resolvedTheme} initial={{ rotate: -20, opacity: 0, scale: 0.8 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} transition={{ duration: 0.18 }}>
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </motion.div>
          ) : <Moon size={14} />}
        </button>

        {user ? (
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button onClick={() => setUserMenuOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 8px 4px 4px', borderRadius: 100, border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-hover)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-card)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
              <Avatar initials={initials} size={26} />
              {planLabel && (
                <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-muted)', background: 'var(--color-border)', padding: '2px 7px', borderRadius: 100 }}>
                  {planLabel}
                </span>
              )}
              <ChevronDown size={11} color="var(--color-muted)" />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 240, background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden', zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                  {/* User info */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar initials={initials} size={36} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {profile?.full_name || 'Usuário'}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 300, color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>

                    {profile && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: 'var(--color-muted)', fontWeight: 400, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Map size={10} />
                            Mapas restantes
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text)' }}>
                            {isPro ? 'Ilimitado' : `${profile.credits}/${mapsLimit}`}
                          </span>
                        </div>
                        {!isPro && mapsPercent !== null && (
                          <div style={{ height: 4, borderRadius: 2, background: 'var(--color-border)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${mapsPercent}%`, background: mapsPercent > 20 ? 'rgba(255,255,255,0.5)' : '#c44', borderRadius: 2, transition: 'width 0.5s' }} />
                          </div>
                        )}
                        {isPro && (
                          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: '100%', background: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: 6 }}>
                    <MenuItemBtn icon={<User size={13} />} label="Minha conta" onClick={() => { setUserMenuOpen(false); router.push('/app/conta'); }} />
                    <MenuItemBtn icon={<Crown size={13} />} label="Upgrade de plano" onClick={() => { setUserMenuOpen(false); router.push('/#pricing'); }} accent />
                    <MenuItemBtn icon={<Settings size={13} />} label="Configurações" onClick={() => { setUserMenuOpen(false); router.push('/app/configuracoes'); }} />
                    <div style={{ height: 1, background: 'var(--color-border)', margin: '6px 0' }} />
                    <MenuItemBtn icon={<LogOut size={13} />} label="Sair" onClick={handleSignOut} danger />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link href="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 100, background: 'rgba(255,255,255,0.07)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: 12, fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; }}>
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}

function Avatar({ initials, size }: { initials: string; size: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 600, color: 'var(--color-text)', flexShrink: 0, letterSpacing: '-0.02em' }}>
      {initials}
    </div>
  );
}

function MenuItemBtn({ icon, label, onClick, accent, danger }: {
  icon: React.ReactNode; label: string; onClick: () => void; accent?: boolean; danger?: boolean;
}) {
  return (
    <button onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 10, border: 'none', background: 'transparent', color: danger ? '#f87171' : accent ? 'var(--color-text)' : 'var(--color-muted)', fontSize: 13, fontWeight: 400, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s, color 0.15s', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = danger ? 'rgba(248,113,113,0.08)' : 'var(--color-border)';
        el.style.color = danger ? '#fca5a5' : 'var(--color-text)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = 'transparent';
        el.style.color = danger ? '#f87171' : accent ? 'var(--color-text)' : 'var(--color-muted)';
      }}>
      {icon}
      {label}
    </button>
  );
}
