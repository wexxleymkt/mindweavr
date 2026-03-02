'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, X, Search, Crown, Map,
  Code2, TrendingUp, Heart, GraduationCap, Briefcase,
  Share2, Palette, DollarSign, Brain, Globe, Music,
  FileText, Utensils, Camera, Megaphone, BookOpen,
  Dumbbell, ShoppingBag, Lightbulb, Target, Rocket,
} from 'lucide-react';
import type { MapGeneration } from '@/lib/types';
import { deleteGeneration } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useTheme } from 'next-themes';

interface Props {
  generations: MapGeneration[];
  onSelect: (gen: MapGeneration) => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  /** Se false, exibir "Sem plano" em vez do plano do perfil */
  hasActivePlan?: boolean | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'agora mesmo';
  if (mins < 60) return `${mins}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

const PLAN_LABELS: Record<string, string> = {
  essencial: 'Plano Essencial',
  creator:   'Plano Creator',
  pro:       'Plano Pro',
};

// Infer a contextual icon from the map title/prompt
function getMapIcon(title: string, prompt: string): React.ElementType {
  const text = `${title} ${prompt}`.toLowerCase();
  if (/código|code|programação|program|software|dev|api|tech|tecnologia|sistema|app/.test(text)) return Code2;
  if (/marketing|ads|tráfego|campanha|venda|conversão|funil|crm/.test(text)) return Megaphone;
  if (/tendência|trend|crescimento|mercado|análise|dados|métricas/.test(text)) return TrendingUp;
  if (/saúde|health|medicina|médic|doença|terapia|bem.?estar/.test(text)) return Heart;
  if (/fitness|treino|exercício|muscula|esporte|academia/.test(text)) return Dumbbell;
  if (/educa|aula|curso|aprender|estud|escola|universidade|faculdade/.test(text)) return GraduationCap;
  if (/livro|leitura|liter|biograf|resumo|book/.test(text)) return BookOpen;
  if (/negócio|empresa|startup|business|empreend|gestão|liderança/.test(text)) return Briefcase;
  if (/produto|ecommerce|loja|shopping|compra|vend/.test(text)) return ShoppingBag;
  if (/instagram|youtube|tiktok|redes sociais|social|conteúdo|creator/.test(text)) return Share2;
  if (/design|visual|ui|ux|interface|criativo|arte|branding/.test(text)) return Palette;
  if (/foto|fotografia|câmera|imagem|vídeo|produção/.test(text)) return Camera;
  if (/finanças|dinheiro|investimento|renda|financeir|orçamento|crypto/.test(text)) return DollarSign;
  if (/psicolog|mental|emoç|comportamento|mindset|ansied|depressão/.test(text)) return Brain;
  if (/viagem|travel|turismo|destino|pais|mundo|internacional/.test(text)) return Globe;
  if (/música|music|som|áudio|podcast|banda|canção/.test(text)) return Music;
  if (/comida|alimento|receita|culinária|nutrição|dieta|gastronomia/.test(text)) return Utensils;
  if (/ideia|inovação|criatividade|projeto|plano|estratégia/.test(text)) return Lightbulb;
  if (/meta|objetivo|goal|resultado|melhoria|produtividade/.test(text)) return Target;
  if (/lançamento|produto|startup|escalar|escala|grow/.test(text)) return Rocket;
  if (/mapa|mind map|mindmap/.test(text)) return Map;
  return FileText;
}

export function Sidebar({ generations, onSelect, onDelete, isOpen, onClose, hasActivePlan }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState(false);
  const [search, setSearch] = useState('');
  const { profile } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';

  const filtered = search
    ? generations.filter(g =>
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.prompt.toLowerCase().includes(search.toLowerCase())
      )
    : generations;

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmId(id);
    setDeleteError(false);
  };

  const handleConfirmDelete = async () => {
    if (!confirmId) return;
    const id = confirmId;
    setDeletingId(id);
    setDeleteError(false);
    try {
      const ok = await deleteGeneration(id);
      if (ok) {
        setConfirmId(null);
        onDelete(id);
      } else {
        setDeleteError(true);
      }
    } catch {
      setDeleteError(true);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmId(null);
    setDeleteError(false);
  };

  const isPro     = profile?.plan === 'pro';
  const mapsLeft  = profile?.credits ?? 0;
  const mapsLimit = profile?.plan_credits_limit ?? 0;
  const mapsPercent = isPro ? 100 : (mapsLimit > 0 ? Math.min(100, (mapsLeft / mapsLimit) * 100) : 0);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 20 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{ position: 'fixed', left: 0, top: 0, height: '100%', width: 292, background: 'var(--color-bg)', borderRight: '1px solid var(--color-border)', zIndex: 30, display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src="/logo-mindweavr-black.png"
                  alt="MindWeavr"
                  style={{ height: 22, width: 'auto', objectFit: 'contain', filter: isDark ? 'brightness(0) invert(1)' : 'none' }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>Meus Mapas</div>
                  <div style={{ fontSize: 10, color: 'var(--color-faint)', fontWeight: 300 }}>
                    {generations.length} mapa{generations.length !== 1 ? 's' : ''} salvos
                  </div>
                </div>
              </div>
              <button onClick={onClose}
                style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', transition: 'border-color 0.2s, color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}>
                <X size={13} />
              </button>
            </div>

            {/* Plan banner */}
            {profile && (
              <div style={{ margin: '12px 12px 0', padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text)' }}>
                    {hasActivePlan === false ? 'Sem plano' : (PLAN_LABELS[profile.plan] ?? 'Plano Essencial')}
                  </div>
                  <div style={{ fontSize: 10, color: isPro ? 'rgba(255,255,255,0.5)' : 'var(--color-muted)', fontWeight: 400 }}>
                    {isPro ? 'Mapas ilimitados' : `${mapsLeft} de ${mapsLimit} mapas`}
                  </div>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: 'var(--color-border)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${mapsPercent}%`,
                    background: isPro
                      ? 'rgba(255,255,255,0.35)'
                      : mapsPercent > 30 ? 'rgba(255,255,255,0.4)' : '#c44',
                    borderRadius: 2, transition: 'width 0.5s',
                  }} />
                </div>
                {!isPro && (
                  <Link href="/#pricing" onClick={onClose}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, padding: '3px 9px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'var(--color-muted)', fontSize: 10, fontWeight: 500, textDecoration: 'none', transition: 'background 0.2s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.09)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)')}>
                    <Crown size={9} />
                    Fazer upgrade
                  </Link>
                )}
              </div>
            )}

            {/* Search */}
            <div style={{ padding: '12px 12px 0' }}>
              {generations.length > 3 && (
                <div style={{ position: 'relative' }}>
                  <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-faint)', pointerEvents: 'none' }} />
                  <input type="text" placeholder="Buscar mapas..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px 8px 30px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-text)', fontSize: 12, fontWeight: 300, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
              )}
            </div>

            {/* Map list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--color-faint)', fontSize: 12, fontWeight: 300 }}>
                  <div style={{ fontSize: 26, marginBottom: 12, opacity: 0.35 }}>◎</div>
                  {search ? 'Nenhum resultado encontrado' : 'Nenhum mapa criado ainda'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {filtered.map((gen, idx) => {
                    const Icon = getMapIcon(gen.title, gen.prompt);
                    return (
                      <motion.div key={gen.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.025 }}
                        onClick={() => { onSelect(gen); onClose(); }}
                        className="sidebar-map-item"
                        style={{ padding: '11px 13px', borderRadius: 12, border: `1px solid ${hoveredId === gen.id ? 'var(--color-border-hover)' : 'var(--color-border)'}`, background: 'var(--color-card)', cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 10 }}
                        onMouseEnter={() => setHoveredId(gen.id)}
                        onMouseLeave={() => setHoveredId(null)}>

                        {/* Contextual icon */}
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <Icon size={13} color="var(--color-muted)" />
                        </div>

                        {/* Content */}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', letterSpacing: '-0.01em', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: hoveredId === gen.id ? 26 : 4 }}>
                            {gen.title}
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-text)', opacity: 0.65, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', marginBottom: 4 }}>
                            {gen.prompt}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 400, color: 'var(--color-muted)' }}>
                            {formatDate(gen.created_at)}
                          </div>
                        </div>

                        {/* Delete button — visible on hover via React state */}
                        {hoveredId === gen.id && (
                          <button
                            onClick={e => handleDeleteClick(e, gen.id)}
                            disabled={deletingId === gen.id}
                            style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', border: '1px solid rgba(220,60,60,0.35)', background: isDark ? 'rgba(220,60,60,0.12)' : 'rgba(220,60,60,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e55', transition: 'background 0.15s', pointerEvents: 'auto', zIndex: 2 }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(220,60,60,0.22)' : 'rgba(220,60,60,0.15)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(220,60,60,0.12)' : 'rgba(220,60,60,0.08)'; }}>
                            {deletingId === gen.id ? '…' : <Trash2 size={11} />}
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Modal de confirmação de exclusão ── */}
            <AnimatePresence>
              {confirmId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', background: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                  onClick={handleCancelDelete}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.93, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.93, y: 8 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    onClick={e => e.stopPropagation()}
                    style={{ background: isDark ? '#1a1a1f' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 16, padding: '22px 20px 18px', width: '100%', maxWidth: 240, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
                  >
                    {/* Ícone */}
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? 'rgba(220,60,60,0.15)' : 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                      <Trash2 size={18} color="#e55" />
                    </div>

                    {/* Texto */}
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6, letterSpacing: '-0.01em' }}>
                      Excluir mapa?
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: 18 }}>
                      Esta ação não pode ser desfeita. O mapa será removido permanentemente.
                    </div>

                    {/* Erro */}
                    {deleteError && (
                      <div style={{ fontSize: 11, color: '#e55', background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.2)', borderRadius: 8, padding: '7px 10px', marginBottom: 12 }}>
                        Não foi possível excluir. Tente novamente.
                      </div>
                    )}

                    {/* Botões */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={handleCancelDelete}
                        style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', transition: 'background 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleConfirmDelete}
                        disabled={!!deletingId}
                        style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', background: deletingId ? 'rgba(220,60,60,0.4)' : '#cc2222', cursor: deletingId ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, color: '#fff', transition: 'background 0.15s' }}
                        onMouseEnter={e => { if (!deletingId) (e.currentTarget as HTMLButtonElement).style.background = '#b01c1c'; }}
                        onMouseLeave={e => { if (!deletingId) (e.currentTarget as HTMLButtonElement).style.background = '#cc2222'; }}
                      >
                        {deletingId ? 'Excluindo…' : 'Excluir'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
