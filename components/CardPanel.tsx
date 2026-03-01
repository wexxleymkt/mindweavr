'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Layers, Sparkles, ChevronLeft, ChevronRight, Lock, Share2, Clapperboard, Image, Eye, Play, Mic, FileText, Globe } from 'lucide-react';
import { FaInstagram, FaFacebook, FaWhatsapp, FaYoutube, FaLinkedin, FaTelegram, FaEnvelope, FaComment } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiTiktok } from 'react-icons/si';
import { useSocialIcons } from '@/contexts/SocialIconsContext';
import type { VisualType } from '@/lib/types';
import { getPreviewLayoutNode } from '@/lib/cardPreview';
import MapCard from './MapCard';

interface TargetOption { id: string; label: string; }

interface Props {
  isDark: boolean;
  targets: TargetOption[];
  onCreateCard?: (visualType: VisualType, prompt: string, parentId?: string) => void | Promise<void>;
  creatingCard?: boolean;
  userPlan?: 'essencial' | 'creator' | 'pro';
}

const ESSENCIAL_TYPES: { id: VisualType; label: string }[] = [
  { id: 'default',       label: 'Padrao' },
  { id: 'stat',          label: 'Metrica' },
  { id: 'chart-bar',     label: 'Grafico barras' },
  { id: 'chart-ring',    label: 'Grafico anel' },
  { id: 'timeline',      label: 'Timeline' },
  { id: 'comparison',    label: 'Comparacao' },
  { id: 'highlight',     label: 'Insight' },
  { id: 'list',          label: 'Lista' },
  { id: 'line-chart',    label: 'Grafico linhas' },
  { id: 'progress-bars', label: 'Progresso (barras)' },
  { id: 'progress-ring', label: 'Progresso (anel)' },
  { id: 'countdown',     label: 'Countdown' },
  { id: 'balance',       label: 'Saldo' },
  { id: 'summary',       label: 'Resumo' },
  { id: 'checklist',     label: 'Checklist' },
  { id: 'success',       label: 'Sucesso' },
  { id: 'product-row',   label: 'Produto' },
  { id: 'rating',        label: 'Avaliacao' },
  { id: 'date-pills',    label: 'Dias' },
  { id: 'time-slots',    label: 'Horarios' },
];

const PREMIUM_TYPES: { id: VisualType; label: string }[] = [
  { id: 'feature-card',      label: 'Feature Card' },
  { id: 'gradient-stat',     label: 'Stat Gradiente' },
  { id: 'icon-grid',         label: 'Grade de Icones' },
  { id: 'flow-steps',        label: 'Fluxo de Passos' },
  { id: 'testimonial',       label: 'Depoimento' },
  { id: 'price-tag',         label: 'Preco' },
  { id: 'alert-box',         label: 'Alerta' },
  { id: 'metric-trio',       label: 'Trio de Metricas' },
  { id: 'kanban-card',       label: 'Kanban' },
  { id: 'tag-cloud',         label: 'Tags / Nuvem' },
  { id: 'versus-card',       label: 'Versus' },
  { id: 'steps-numbered',    label: 'Passos Numerados' },
  { id: 'social-stat',       label: 'Metrica Social' },
  { id: 'cta-card',          label: 'Call to Action' },
  { id: 'score-card',        label: 'Pontuacao' },
  { id: 'heatmap',           label: 'Mapa de Calor' },
  { id: 'avatar-list',       label: 'Lista de Pessoas' },
  { id: 'notification-card', label: 'Notificacao' },
  { id: 'insight-numbered',  label: 'Insights' },
  { id: 'skill-grid',        label: 'Habilidades' },
  { id: 'quote-hero',        label: 'Citacao Grande' },
  { id: 'compare-table',     label: 'Tabela Comp.' },
  { id: 'cycle-flow',        label: 'Ciclo / Processo' },
  { id: 'funnel-bars',       label: 'Funil' },
  { id: 'priority-board',    label: 'Prioridades' },
  { id: 'event-card',        label: 'Evento' },
  { id: 'growth-indicator',  label: 'Crescimento' },
  { id: 'team-card',         label: 'Time / Perfil' },
  { id: 'pill-metrics',      label: 'Pilulas de Dados' },
  { id: 'code-snippet',      label: 'Codigo' },
];

// ── Card type panel (shared between both sections) ────────────────────────────
function TypePanel({
  isDark, types, locked,
  cardType, onSelectType,
  cardPrompt, onChangePrompt,
  onCreate, creatingCard, localCreating,
  columns = 2,
}: {
  isDark: boolean;
  types: { id: VisualType; label: string }[];
  locked?: boolean;
  cardType: VisualType;
  onSelectType: (t: VisualType) => void;
  cardPrompt: string;
  onChangePrompt: (v: string) => void;
  onCreate: () => void;
  creatingCard?: boolean;
  localCreating?: boolean;
  columns?: number;
}) {
  const bg = isDark ? 'rgba(18,18,18,0.92)' : 'rgba(252,252,252,0.94)';
  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const text = isDark ? 'rgba(255,255,255,0.96)' : 'rgba(0,0,0,0.9)';
  const muted = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const faint = isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.1)';

  const [promptFocused, setPromptFocused] = useState(false);
  const hasPromptText = cardPrompt.trim().length > 0;
  const busy = creatingCard || localCreating;
  const btnLabel = busy
    ? (hasPromptText ? 'Gerando...' : 'Adicionando...')
    : promptFocused && hasPromptText ? 'Gerar card' : 'Adicionar Card sem IA';

  const previewNode = useMemo(() => getPreviewLayoutNode(cardType), [cardType]);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const w = previewNode.w || 190;
    const h = previewNode.h || 88;
    const update = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (cw > 0 && ch > 0) setScale(Math.max(0.3, Math.min(1.1, Math.min(cw / w, ch / h))));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cardType, previewNode.w, previewNode.h]);

  const panelWidth = columns === 3 ? 420 : 320;

  return (
    <div style={{ width: panelWidth, padding: 13, borderRadius: 16, border: `1px solid ${border}`, background: bg, boxShadow: isDark ? '0 18px 60px rgba(0,0,0,0.85)' : '0 18px 60px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Preview */}
      <div ref={previewRef} style={{ borderRadius: 10, border: `1px solid ${border}`, minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', marginBottom: 2 }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          <div style={{ position: 'relative', width: previewNode.w, height: previewNode.h, pointerEvents: 'none' }}>
            <MapCard node={previewNode} index={0} isDark={isDark} hasChildren={false} isCollapsed={false} />
          </div>
        </div>
      </div>

      {/* Locked overlay for premium */}
      {locked ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '12px 0' }}>
          <Lock size={20} color={muted} strokeWidth={1.5} />
          <div style={{ fontSize: 11, color: muted, textAlign: 'center', lineHeight: 1.5 }}>
            Estilos exclusivos para<br />planos <strong style={{ color: text }}>Creator</strong> e <strong style={{ color: text }}>Pro</strong>
          </div>
          <a href="/#pricing" style={{ fontSize: 10, color: muted, textDecoration: 'none', padding: '5px 14px', borderRadius: 999, border: `1px solid ${border}`, marginTop: 2 }}>
            Ver planos
          </a>
        </div>
      ) : (
        <>
          {/* Type grid */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: 4 }}>
            {types.map(t => {
              const active = t.id === cardType;
              return (
                <button key={t.id} onClick={() => onSelectType(t.id)}
                  style={{
                    padding: columns === 3 ? '8px 8px' : '7px 8px',
                    borderRadius: 8,
                    border: `1px solid ${active ? text : border}`,
                    background: active ? (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)') : 'transparent',
                    color: active ? text : muted,
                    fontSize: columns === 3 ? 9.5 : 9.5,
                    textAlign: 'left',
                    cursor: 'pointer',
                    lineHeight: 1.4,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Prompt */}
          <textarea value={cardPrompt} onChange={e => onChangePrompt(e.target.value)} onFocus={() => setPromptFocused(true)}
            placeholder="Descreva o conteudo do card (opcional — a IA gera para voce)."
            rows={4}
            style={{ width: '100%', fontSize: 11.5, padding: '7px 9px', borderRadius: 8, border: `1px solid ${border}`, background: isDark ? 'rgba(8,8,8,0.96)' : 'rgba(252,252,252,0.96)', color: text, resize: 'vertical', boxSizing: 'border-box' }}
          />

          <button onClick={onCreate} disabled={busy}
            style={{
              padding: '7px 10px', borderRadius: 999, border: 'none', fontSize: 11, fontWeight: 500,
              cursor: busy ? 'default' : 'pointer',
              background: busy ? border : text,
              color: busy ? muted : bg,
              opacity: busy ? 0.7 : 1,
            }}>
            {btnLabel}
          </button>

          <div style={{ fontSize: 9.5, color: muted, lineHeight: 1.4, textAlign: 'center' }}>
            Clique num potinho verde para conectar ao bloco desejado.
          </div>
        </>
      )}
    </div>
  );
}

const SOCIAL_PLATFORMS: { id: string; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook',  label: 'Facebook'  },
  { id: 'whatsapp',  label: 'WhatsApp'  },
  { id: 'tiktok',    label: 'TikTok'    },
  { id: 'youtube',   label: 'YouTube'   },
  { id: 'twitter',   label: 'Twitter/X' },
  { id: 'linkedin',  label: 'LinkedIn'  },
  { id: 'telegram',  label: 'Telegram'  },
  { id: 'email',     label: 'E-mail'    },
  { id: 'mensagem',  label: 'Mensagem'  },
  { id: 'reels',     label: 'Reels'     },
  { id: 'post',      label: 'Post'      },
  { id: 'stories',   label: 'Stories'   },
  { id: 'shorts',    label: 'Shorts'    },
  { id: 'podcast',   label: 'Podcast'   },
  { id: 'blog',      label: 'Blog'      },
  { id: 'site',      label: 'Site'      },
];

const SOCIAL_PANEL_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties; color?: string }>> = {
  instagram: FaInstagram,
  facebook:  FaFacebook,
  whatsapp:  FaWhatsapp,
  tiktok:    SiTiktok,
  youtube:   FaYoutube,
  twitter:   FaXTwitter,
  linkedin:  FaLinkedin,
  telegram:  FaTelegram,
  email:     FaEnvelope,
  mensagem:  FaComment,
  reels:     Clapperboard,
  post:      Image,
  stories:   Eye,
  shorts:    Play,
  podcast:   Mic,
  blog:      FileText,
  site:      Globe,
};

function SocialIconsPanel({
  isDark, bg, border, text, muted, localCreating, handleCreateSocial,
}: {
  isDark: boolean; bg: string; border: string; text: string; muted: string;
  localCreating: boolean; handleCreateSocial: (platform: string) => void;
}) {
  const { useBrandColors, setUseBrandColors } = useSocialIcons();
  return (
    <div style={{
      width: 300,
      background: bg,
      borderTop: `1px solid ${border}`, borderRight: `1px solid ${border}`, borderBottom: `1px solid ${border}`, borderLeft: 'none',
      borderRadius: '0 14px 14px 0',
      boxShadow: isDark ? '4px 0 24px rgba(0,0,0,0.5)' : '4px 0 24px rgba(0,0,0,0.12)',
      padding: '18px 16px',
      display: 'flex', flexDirection: 'column', gap: 16,
      maxHeight: '70vh', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: muted }}>
          Ícones Sociais
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 9, color: muted }}>Adicionar cor?</span>
          <button
            type="button"
            role="switch"
            aria-checked={useBrandColors}
            onClick={() => setUseBrandColors(!useBrandColors)}
            style={{
              width: 32, height: 18, borderRadius: 9, border: 'none', padding: 0,
              background: useBrandColors ? 'var(--color-muted)' : 'var(--color-border)',
              cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
            }}
          >
            <span style={{
              position: 'absolute', top: 2, left: useBrandColors ? 16 : 2,
              width: 14, height: 14, borderRadius: '50%', background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 0.2s',
            }} />
          </button>
        </label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {SOCIAL_PLATFORMS.map(p => {
          const IconComponent = SOCIAL_PANEL_ICONS[p.id];
          return (
            <button
              key={p.id}
              onClick={() => handleCreateSocial(p.id)}
              disabled={localCreating}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '12px 10px 10px',
                borderRadius: 12,
                border: `1px solid ${border}`,
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                cursor: localCreating ? 'wait' : 'pointer',
                color: text,
                fontSize: 11,
                fontWeight: 500,
                lineHeight: 1.3,
                textAlign: 'center',
                transition: 'background 0.15s, border-color 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'; (e.currentTarget as HTMLButtonElement).style.borderColor = text; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; (e.currentTarget as HTMLButtonElement).style.borderColor = border; }}
            >
              {IconComponent && <IconComponent size={18} style={{ color: text, flexShrink: 0 }} />}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{p.label}</span>
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: muted, lineHeight: 1.4, textAlign: 'center' }}>
        Clique num potinho verde para conectar ao bloco desejado.
      </div>
    </div>
  );
}

// ── Main CardPanel component ──────────────────────────────────────────────────
export function CardPanel({ isDark, targets, onCreateCard, creatingCard, userPlan = 'essencial' }: Props) {
  const [collapsed, setCollapsed]       = useState(false);
  const [openPanel, setOpenPanel]       = useState<'essencial' | 'premium' | 'social' | null>(null);
  const [cardType, setCardType]         = useState<VisualType>('default');
  const [premiumType, setPremiumType]   = useState<VisualType>('feature-card');
  const [cardPrompt, setCardPrompt]     = useState('');
  const [localCreating, setLocalCreating] = useState(false);

  const hasPremium = userPlan === 'creator' || userPlan === 'pro';

  const handleCreate = async () => {
    if (!onCreateCard) return;
    const type = openPanel === 'premium' ? premiumType : cardType;
    setLocalCreating(true);
    try {
      await onCreateCard(type, cardPrompt);
      setCardPrompt('');
    } finally {
      setLocalCreating(false);
    }
  };

  const handleCreateSocial = async (platform: string) => {
    if (!onCreateCard) return;
    setLocalCreating(true);
    try {
      await onCreateCard('social-icon', platform);
    } finally {
      setLocalCreating(false);
    }
  };

  const bg     = isDark ? 'rgba(18,18,18,0.92)' : 'rgba(252,252,252,0.94)';
  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const text   = isDark ? 'rgba(255,255,255,0.96)' : 'rgba(0,0,0,0.9)';
  const muted  = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';

  const toggle = (panel: 'essencial' | 'premium' | 'social') =>
    setOpenPanel(prev => (prev === panel ? null : panel));

  if (collapsed) {
    return (
      <div onPointerDown={e => e.stopPropagation()} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 18 }}>
        <button onClick={() => setCollapsed(false)} title="Mostrar cards"
          style={{ width: 28, height: 36, borderRadius: '0 9px 9px 0', border: `1px solid ${border}`, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: text }}>
          <ChevronRight size={13} />
        </button>
      </div>
    );
  }

  return (
    <div onPointerDown={e => e.stopPropagation()} onWheel={e => e.stopPropagation()}
      style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 18, display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'auto' }}
    >
      {/* ── Vertical icon bar ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 5, padding: '12px 6px',
        background: bg,
        borderTop: `1px solid ${border}`, borderRight: `1px solid ${border}`, borderBottom: `1px solid ${border}`, borderLeft: 'none',
        borderRadius: '0 14px 14px 0',
        boxShadow: isDark ? '4px 0 24px rgba(0,0,0,0.5)' : '4px 0 24px rgba(0,0,0,0.12)',
      }}>
        {/* Label */}
        <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: muted, writingMode: 'vertical-rl', transform: 'rotate(180deg)', userSelect: 'none' }}>
          Cards
        </div>
        <div style={{ width: 22, height: 1, background: border }} />

        {/* Essencial — 20 tipos */}
        <button
          onClick={() => toggle('essencial')}
          title="Estilos Essencial (20 tipos)"
          style={{
            width: 32, height: 32, borderRadius: 10,
            border: `1px solid ${openPanel === 'essencial' ? text : border}`,
            background: openPanel === 'essencial' ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)') : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: openPanel === 'essencial' ? text : muted,
          }}
        >
          <Layers size={14} />
        </button>

        {/* Creator / Pro — 30 tipos */}
        <button
          onClick={() => toggle('premium')}
          title={hasPremium ? 'Estilos Creator/Pro (30 tipos)' : 'Estilos Creator/Pro — upgrade necessario'}
          style={{
            width: 32, height: 32, borderRadius: 10,
            border: `1px solid ${openPanel === 'premium' ? text : border}`,
            background: openPanel === 'premium' ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)') : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: openPanel === 'premium' ? text : muted,
            position: 'relative',
          }}
        >
          <Sparkles size={14} />
          {!hasPremium && (
            <div style={{ position: 'absolute', bottom: 3, right: 3 }}>
              <Lock size={7} color={muted} />
            </div>
          )}
        </button>

        {/* Ícones Sociais — apenas Creator/Pro */}
        <button
          onClick={() => hasPremium && toggle('social')}
          title={hasPremium ? 'Ícones de Redes Sociais' : 'Ícones Sociais — plano Creator ou Pro'}
          style={{
            width: 32, height: 32, borderRadius: 10,
            border: `1px solid ${openPanel === 'social' ? text : border}`,
            background: openPanel === 'social' ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)') : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: hasPremium ? 'pointer' : 'not-allowed',
            color: openPanel === 'social' ? text : muted,
            position: 'relative',
          }}
        >
          <Share2 size={14} />
          {!hasPremium && (
            <div style={{ position: 'absolute', bottom: 3, right: 3 }}>
              <Lock size={7} color={muted} />
            </div>
          )}
        </button>

        {/* Collapse */}
        <div style={{ width: 22, height: 1, background: border }} />
        <button onClick={() => setCollapsed(true)} title="Recolher"
          style={{ width: 28, height: 28, borderRadius: 10, border: `1px solid ${border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: muted }}>
          <ChevronLeft size={13} />
        </button>
      </div>

      {/* ── Panel: Essencial 20 tipos ── */}
      {openPanel === 'essencial' && (
        <TypePanel
          isDark={isDark}
          types={ESSENCIAL_TYPES}
          locked={false}
          cardType={cardType}
          onSelectType={setCardType}
          cardPrompt={cardPrompt}
          onChangePrompt={setCardPrompt}
          onCreate={handleCreate}
          creatingCard={creatingCard}
          localCreating={localCreating}
        />
      )}

      {/* ── Panel: Creator/Pro 30 tipos ── */}
      {openPanel === 'premium' && (
        <TypePanel
          isDark={isDark}
          types={PREMIUM_TYPES}
          locked={!hasPremium}
          cardType={premiumType}
          onSelectType={setPremiumType}
          cardPrompt={cardPrompt}
          onChangePrompt={setCardPrompt}
          onCreate={handleCreate}
          creatingCard={creatingCard}
          localCreating={localCreating}
          columns={3}
        />
      )}

      {/* ── Panel: Ícones Sociais ── */}
      {openPanel === 'social' && (
        <SocialIconsPanel
          isDark={isDark}
          bg={bg}
          border={border}
          text={text}
          muted={muted}
          localCreating={localCreating}
          handleCreateSocial={handleCreateSocial}
        />
      )}
    </div>
  );
}
