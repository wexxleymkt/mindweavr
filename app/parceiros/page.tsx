'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, animate as fmAnimate } from 'framer-motion';
import {
  Users, TrendingUp, DollarSign, Zap, Check,
  BarChart3, Target, ArrowRight, ChevronDown, Star,
  Eye, ShoppingCart, Layers, Network,
  Award, MessageCircle, Play, Lightbulb, Video, BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

const C = {
  bg:      '#0a0a0a',
  bg2:     '#0d0d0d',
  card:    'rgba(17,17,17,0.9)',
  border:  'rgba(255,255,255,0.08)',
  borderL: 'rgba(255,255,255,0.14)',
  text:    '#ffffff',
  muted:   'rgba(255,255,255,0.65)',
  faint:   'rgba(255,255,255,0.35)',
  vfaint:  'rgba(255,255,255,0.07)',
};
const fs = 'var(--font-inter)';
const fp = 'var(--font-playfair)';

function FadeIn({ children, delay = 0, y = 18 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, marginBottom: 20, fontFamily: fs }}>
      {children}
    </div>
  );
}

/* ── Partner Avatar Carousel ── */
const PARTNERS = [
  { initials: 'MR', name: 'Mateus R.',  earn: 'R$1.480/mês' },
  { initials: 'CA', name: 'Carol A.',   earn: 'R$642/mês' },
  { initials: 'FS', name: 'Felipe S.',  earn: 'R$2.210/mês' },
  { initials: 'JL', name: 'Julia L.',   earn: 'R$890/mês' },
  { initials: 'RB', name: 'Rafael B.',  earn: 'R$3.740/mês' },
  { initials: 'TM', name: 'Tais M.',    earn: 'R$1.095/mês' },
  { initials: 'GC', name: 'Gabriel C.', earn: 'R$560/mês' },
  { initials: 'PS', name: 'Pedro S.',   earn: 'R$4.920/mês' },
  { initials: 'AN', name: 'Ana N.',     earn: 'R$1.315/mês' },
  { initials: 'LF', name: 'Lucas F.',   earn: 'R$780/mês' },
  { initials: 'VC', name: 'Vitor C.',   earn: 'R$2.630/mês' },
  { initials: 'BM', name: 'Bianca M.',  earn: 'R$1.970/mês' },
  { initials: 'DK', name: 'Diego K.',   earn: 'R$7.190/mês' },
  { initials: 'IS', name: 'Isabela S.', earn: 'R$990/mês' },
];

const AVATAR_W = 76;
const AVATAR_GAP = 32;

function PartnerCarousel() {
  const doubled = [...PARTNERS, ...PARTNERS];
  return (
    <div style={{ overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)' }}>
      <motion.div
        style={{ display: 'flex', gap: AVATAR_GAP, width: 'max-content', paddingBottom: 4 }}
        animate={{ x: [0, -(PARTNERS.length * (AVATAR_W + AVATAR_GAP))] }}
        transition={{ duration: 32, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((p, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0, width: AVATAR_W }}>
            <div style={{
              width: AVATAR_W, height: AVATAR_W, borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              border: `1.5px solid rgba(255,255,255,0.14)`,
              boxShadow: '0 0 0 4px rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 600, color: C.text, fontFamily: fs, letterSpacing: '-0.02em',
            }}>
              {p.initials}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: C.muted, fontFamily: fs, whiteSpace: 'nowrap', fontWeight: 400 }}>{p.name}</div>
              <div style={{ fontSize: 10, color: C.faint, fontFamily: fs, whiteSpace: 'nowrap', marginTop: 2 }}>{p.earn}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Animated number ── */
function AnimNum({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const mv = useMotionValue(0);
  const [v, setV] = useState(0);
  useEffect(() => {
    const ctrl = fmAnimate(mv, to, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
    const u = mv.on('change', n => setV(Math.round(n)));
    return () => { ctrl.stop(); u(); };
  }, [mv, to]);
  return <span>{prefix}{v}{suffix}</span>;
}

/* ── Funnel: 1000→100→5+ ── */
function ConversionFunnel() {
  const stages = [
    { label: '1.000', sub: 'views no conteúdo',    width: '100%', alpha: 0.18 },
    { label: '100',   sub: 'views qualificadas',    width: '56%',  alpha: 0.13 },
    { label: '5+',    sub: 'novas assinaturas',     width: '20%',  alpha: 0.22 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {stages.map((s, i) => (
        <FadeIn key={i} delay={i * 0.14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '12px 0' }}>
            <div style={{ flex: 1, position: 'relative', height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: s.width }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.16 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: `rgba(255,255,255,${s.alpha})`, borderRadius: 10 }}
              />
            </div>
            <div style={{ minWidth: 160 }}>
              <span style={{ fontSize: i === 2 ? 24 : i === 1 ? 20 : 17, fontWeight: 700, color: C.text, fontFamily: fs }}>{s.label}</span>
              <span style={{ fontSize: 12, color: C.faint, fontFamily: fs, marginLeft: 8, fontWeight: 300 }}>{s.sub}</span>
            </div>
          </div>
          {i < stages.length - 1 && (
            <div style={{ width: 1, height: 10, background: C.border, marginLeft: 20 }} />
          )}
        </FadeIn>
      ))}
    </div>
  );
}

/* ── Calculator Section ── */
const CALC_PLANS = [
  { name: 'Essencial', price: 27,  comm: 9.45,  commStr: 'R$9,45',  priceStr: 'R$27', featured: false },
  { name: 'Creator',   price: 47,  comm: 16.45, commStr: 'R$16,45', priceStr: 'R$47', featured: true  },
  { name: 'Pro',       price: 97,  comm: 33.95, commStr: 'R$33,95', priceStr: 'R$97', featured: false },
];

function CalcSection() {
  const [views,   setViews]   = useState(2000);
  const [planIdx, setPlanIdx] = useState(1);
  const clients = Math.round(views * 5 / 100);
  const monthly = Math.round(clients * CALC_PLANS[planIdx].comm);

  const col: React.CSSProperties = {
    padding: '32px',
    background: C.card,
    border: `1px solid ${C.borderL}`,
    borderRadius: 20,
    boxSizing: 'border-box',
  };

  return (
    <section style={{ padding: '100px 24px', background: C.bg2 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionBadge>Quanto você pode ganhar</SectionBadge>
            <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 500, color: C.text, letterSpacing: '-0.03em', fontFamily: fs, marginBottom: 14 }}>
              Calcule seus{' '}
              <em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.55 }}>ganhos.</em>
            </h2>
            <p style={{ fontSize: 16, color: C.muted, maxWidth: 460, margin: '0 auto', fontFamily: fs, fontWeight: 300 }}>
              Arraste o slider, escolha o plano e veja quanto você pode acumular.
            </p>
          </div>
        </FadeIn>

        {/* Flat 3-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'start' }} className="calc-3col">

          {/* Col 1 — Plans */}
          <FadeIn delay={0}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CALC_PLANS.map((p, i) => (
                <div key={i} style={{ padding: '22px 24px', background: p.featured ? 'rgba(255,255,255,0.05)' : C.card, border: `1px solid ${p.featured ? C.borderL : C.border}`, borderRadius: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 500, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4, fontFamily: fs }}>{p.name}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: C.text, fontFamily: fs, lineHeight: 1 }}>{p.priceStr}<span style={{ fontSize: 12, fontWeight: 300, color: C.faint }}>/mês</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: C.faint, fontFamily: fs, marginBottom: 4 }}>Você recebe</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.muted, fontFamily: fs, lineHeight: 1 }}>{p.commStr}<span style={{ fontSize: 11, fontWeight: 300, color: C.faint }}>/mês</span></div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Col 2 — Controls */}
          <FadeIn delay={0.08}>
            <div style={{ ...col }}>
              {/* slider */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: C.faint, fontFamily: fs, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  <Eye size={12} color={C.faint} strokeWidth={1.5} />
                  Views qualificadas / mês
                </div>
                <motion.div key={views} initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.18 }}
                  style={{ fontSize: 34, fontWeight: 700, color: C.text, fontFamily: fs, lineHeight: 1, marginBottom: 14 }}>
                  {views.toLocaleString('pt-BR')}
                </motion.div>
                <input type="range" min={100} max={20000} step={100} value={views} onChange={e => setViews(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#fff', cursor: 'pointer', margin: 0 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: C.faint, fontFamily: fs }}>100</span>
                  <span style={{ fontSize: 10, color: C.faint, fontFamily: fs }}>20.000</span>
                </div>
              </div>
              {/* plan selector */}
              <div>
                <div style={{ fontSize: 10, color: C.faint, fontFamily: fs, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Plano médio</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {CALC_PLANS.map((p, i) => (
                    <button key={i} onClick={() => setPlanIdx(i)}
                      style={{ padding: '10px 14px', borderRadius: 11, border: `1px solid ${planIdx === i ? C.borderL : C.border}`, background: planIdx === i ? 'rgba(255,255,255,0.06)' : 'transparent', color: planIdx === i ? C.text : C.faint, fontSize: 13, fontFamily: fs, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', transition: 'all 0.18s', fontWeight: planIdx === i ? 500 : 300 }}>
                      <span>{p.name}</span>
                      <span>R${p.price}/mês</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Col 3 — Results */}
          <FadeIn delay={0.16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Monthly */}
              <div style={{ ...col, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: C.faint, fontFamily: fs, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Ganho mensal</div>
                <motion.div key={monthly} initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.22 }}
                  style={{ fontSize: 'clamp(32px,3vw,48px)', fontWeight: 700, color: C.text, fontFamily: fs, lineHeight: 1, marginBottom: 6 }}>
                  R${monthly.toLocaleString('pt-BR')}
                </motion.div>
                <div style={{ fontSize: 12, color: C.faint, fontFamily: fs }}>recorrente · R${CALC_PLANS[planIdx].comm.toFixed(2)}/cliente</div>
              </div>
              {/* Clients */}
              <div style={{ ...col, textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.faint, fontFamily: fs, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Clientes gerados</div>
                <motion.div key={clients} initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.22 }}
                  style={{ fontSize: 'clamp(28px,2.5vw,40px)', fontWeight: 700, color: C.muted, fontFamily: fs, lineHeight: 1, marginBottom: 6 }}>
                  {clients.toLocaleString('pt-BR')}
                </motion.div>
                <div style={{ fontSize: 12, color: C.faint, fontFamily: fs }}>5% das views qualificadas</div>
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}

/* ── FAQ ── */
function FAQItem({ q, a, delay }: { q: string; a: string; delay: number }) {
  const [open, setOpen] = useState(false);
  return (
    <FadeIn delay={delay}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '22px 24px', background: open ? 'rgba(255,255,255,0.04)' : C.card, border: `1px solid ${open ? C.borderL : C.border}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: C.text, fontFamily: fs }}>{q}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ flexShrink: 0 }}>
            <ChevronDown size={16} color={C.faint} />
          </motion.div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 14, fontWeight: 300, color: C.muted, lineHeight: 1.65, margin: '14px 0 0', fontFamily: fs }}>{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </FadeIn>
  );
}

/* ═══════════════════════════════ PAGE ═══════════════════════════════ */
export default function ParceirosPage() {

  const howSteps = [
    { icon: Award,      step: '01', title: 'Cadastre-se gratuitamente', desc: 'Crie sua conta e acesse o painel de parceiros. Leva menos de 2 minutos.' },
    { icon: Network,    step: '02', title: 'Compartilhe seu link',       desc: 'Divulgue para criadores de conteúdo, infoprodutores e YouTubers.' },
    { icon: DollarSign, step: '03', title: 'Receba toda mês',            desc: 'Ganhe 35% de comissão recorrente em cada renovação do cliente.' },
  ];

  const benefits = [
    { icon: DollarSign, title: '35% recorrente',            desc: 'Comissão em toda venda e renovação. Quanto mais você indica, mais acumula todo mês.' },
    { icon: Zap,        title: 'Baixo custo, alta escala',  desc: 'Planos a partir de R$27/mês. Preço acessível garante alta conversão para o seu conteúdo.' },
    { icon: TrendingUp, title: 'Produto que vende sozinho', desc: 'Ferramenta visual única que criadores realmente precisam. Mostre uma vez e eles querem.' },
    { icon: Users,      title: 'Público bem definido',      desc: 'Criadores, infoprodutores, YouTubers. Se faz conteúdo, precisa do MindWeavr.' },
    { icon: BarChart3,  title: 'Dashboard em tempo real',   desc: 'Cliques, conversões e receita na palma da mão. Total transparência.' },
    { icon: Layers,     title: 'Materiais prontos',         desc: 'Banners, copies e templates prontos para você começar a divulgar hoje.' },
  ];

  const strategyItems = [
    {
      icon: Video,
      title: 'Mostre na prática',
      desc: 'Um tutorial de 3 minutos mostrando como você usa o MindWeavr converte mais do que qualquer banner. Grave, publique, repita.',
    },
    {
      icon: Lightbulb,
      title: 'A ferramenta impressiona sozinha',
      desc: 'O visual dos mapas gerados chama atenção instantaneamente. Um único print ou vídeo de tela já desperta a curiosidade da audiência.',
    },
    {
      icon: Target,
      title: 'Foque no público certo',
      desc: 'Criadores de conteúdo, infoprodutores e YouTubers são quem mais converte. Conteúdo para o público errado não gera venda, não importa o volume.',
    },
    {
      icon: BookOpen,
      title: 'Consistência bate viralização',
      desc: 'Não precisa de um post viral. Três ou quatro conteúdos bem direcionados por semana constroem uma renda recorrente estável ao longo do tempo.',
    },
  ];

  const plans = [
    { name: 'Essencial', price: 'R$27', commission: 'R$9,45', featured: false },
    { name: 'Creator',   price: 'R$47', commission: 'R$16,45', featured: true },
    { name: 'Pro',       price: 'R$97', commission: 'R$33,95', featured: false },
  ];

  const faq = [
    { q: 'Como funciona a comissão?',             a: 'Você recebe 35% do valor de cada venda realizada pelo seu link. A comissão é recorrente — continua entrando todo mês enquanto o cliente permanecer ativo.' },
    { q: 'Quando recebo meu pagamento?',           a: 'Pagamentos mensais via PIX, até o dia 15 do mês seguinte. Saldo mínimo de R$50; valores menores acumulam automaticamente.' },
    { q: 'O que é conteúdo qualificado?',          a: 'É conteúdo criado para o público certo — criadores, infoprodutores e YouTubers. Views de pessoas sem fit com o produto não geram conversão.' },
    { q: 'Preciso ser assinante para ser afiliado?', a: 'Não é obrigatório, mas recomendamos usar o produto. Quem usa e aprova converte muito mais — sua audiência percebe autenticidade.' },
    { q: 'Posso divulgar em qualquer lugar?',      a: 'Sim — redes sociais, blog, YouTube, e-mail, WhatsApp. Apenas evite spam e práticas que prejudiquem sua audiência.' },
    { q: 'O cookie expira?',                       a: 'Validade de 30 dias. Se alguém clicar no seu link e assinar dentro desse período, a venda é sua.' },
    { q: 'Preciso ter CNPJ?',                      a: 'Não. Você pode receber como pessoa física via PIX. Para volumes maiores, um MEI pode ajudar na tributação.' },
  ];

  return (
    <div className="parceiros-page" style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: fs, overflowX: 'hidden' }}>
      <Navbar />
      <style>{`
        @media (max-width: 768px) {
          .parceiros-page section { padding-left: 16px !important; padding-right: 16px !important; }
          .parceiros-page .parceiros-hero { padding: 80px 16px 60px !important; min-height: auto !important; }
          .calc-3col { grid-template-columns: 1fr !important; gap: 20px !important; }
          .funnel-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .community-grid { grid-template-columns: 1fr !important; }
          .community-grid > div:first-child { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; padding: 32px 24px !important; }
          .parceiros-page .scale-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .parceiros-page .scale-table-wrap > div { min-width: 420px; }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <section className="parceiros-hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(255,255,255,0.025) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <SectionBadge>
              <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>
                <Star size={11} color={C.muted} />
              </motion.span>
              Programa de Parceiros — MindWeavr
            </SectionBadge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 'clamp(34px, 5vw, 66px)', fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1.1, color: C.text, marginBottom: 20, fontFamily: fs }}>
            Ganhe 35%{' '}
            <em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.55 }}>recorrente</em>
            <br />
            <span style={{ whiteSpace: 'nowrap' }}>indicando o MindWeavr</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.65, color: C.muted, maxWidth: 520, margin: '0 auto 36px', fontFamily: fs }}>
            Indique a ferramenta que criadores de conteúdo realmente precisam e receba{' '}
            <span style={{ color: C.text, fontWeight: 400 }}>até R$33,95 por cliente, todo mês.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            <Link href="/login"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 100, background: C.text, color: C.bg, fontSize: 14, fontWeight: 500, textDecoration: 'none', boxShadow: '0 0 30px rgba(255,255,255,0.1)', fontFamily: fs }}>
              Tornar-me parceiro <ArrowRight size={15} />
            </Link>
            <a href="#como-funciona"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 100, border: `1px solid ${C.border}`, color: C.muted, fontSize: 14, fontWeight: 300, textDecoration: 'none', fontFamily: fs }}>
              Como funciona <ChevronDown size={14} />
            </a>
          </motion.div>

          {/* Partner avatar carousel */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}>
            <PartnerCarousel />
          </motion.div>
        </div>
      </section>

      {/* ══ COMO FUNCIONA ══ */}
      <section id="como-funciona" style={{ padding: '100px 24px', background: C.bg2 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <SectionBadge>3 passos simples</SectionBadge>
              <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 500, color: C.text, letterSpacing: '-0.03em', fontFamily: fs, margin: 0 }}>
                Comece a ganhar em{' '}
                <em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.55 }}>minutos.</em>
              </h2>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {howSteps.map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeIn key={i} delay={i * 0.12}>
                  <div style={{ padding: '32px 28px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, position: 'relative', overflow: 'hidden', height: '100%', boxSizing: 'border-box' }}>
                    <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 64, fontWeight: 800, color: C.vfaint, fontFamily: fs, lineHeight: 1, userSelect: 'none' }}>{s.step}</div>
                    <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                      <Icon size={22} color={C.muted} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 500, color: C.text, marginBottom: 10, fontFamily: fs }}>{s.title}</h3>
                    <p style={{ fontSize: 14, fontWeight: 300, color: C.muted, lineHeight: 1.65, margin: 0, fontFamily: fs }}>{s.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 100 VIEWS ══ */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <SectionBadge>A lógica do programa</SectionBadge>
              <h2 style={{ fontSize: 'clamp(30px,4.5vw,54px)', fontWeight: 500, color: C.text, letterSpacing: '-0.04em', fontFamily: fs, marginBottom: 18, lineHeight: 1.1 }}>
                A cada{' '}
                <em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400 }}>100 Views,</em>
                <br />
                <em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400 }}>5 Assinaturas</em>
                {' '}novas.
              </h2>
              <p style={{ fontSize: 16, fontWeight: 300, color: C.muted, maxWidth: 520, margin: '0 auto', lineHeight: 1.7, fontFamily: fs }}>
                O que converte é conteúdo criado para{' '}
                <span style={{ color: C.text, fontWeight: 400 }}>o público certo</span>{' '}
                — criadores que querem apresentar suas ideias de forma visual e memorável.
              </p>
            </div>
          </FadeIn>

          {/* Funnel + explanation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', marginBottom: 36 }} className="funnel-grid">
            <FadeIn>
              <ConversionFunnel />
            </FadeIn>
            <FadeIn delay={0.15}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  { n: '1.000', desc: 'views chegam ao seu conteúdo. A maioria é curiosidade passageira.' },
                  { n: '100',   desc: 'são do público certo — criadores que se identificam com o problema.' },
                  { n: '5+',    desc: 'assinam o MindWeavr. Cada uma paga R$9,45 a R$33,95 direto para você, todo mês.' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 50, height: 50, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: i === 2 ? 17 : i === 1 ? 15 : 14, fontWeight: 700, color: C.text, fontFamily: fs }}>{item.n}</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 300, color: C.muted, lineHeight: 1.65, margin: 0, fontFamily: fs, paddingTop: 3 }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Scale table */}
          <FadeIn delay={0.1}>
            <div className="scale-table-wrap" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ padding: '16px 28px', borderBottom: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {['Views qualificadas / mês', 'Clientes recorrentes', 'Ganho mensal (Creator)'].map((h, i) => (
                  <div key={i} style={{ fontSize: 10, color: C.faint, fontFamily: fs, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: i > 0 ? 'center' : 'left' }}>{h}</div>
                ))}
              </div>
              {[
                { views: '1.000',  clients: '50',    earn: 'R$822/mês' },
                { views: '5.000',  clients: '250',   earn: 'R$4.112/mês' },
                { views: '10.000', clients: '500',   earn: 'R$8.225/mês' },
                { views: '20.000', clients: '1.000', earn: 'R$16.450/mês' },
              ].map((row, i) => (
                <div key={i} style={{ padding: '16px 28px', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ fontSize: 14, fontWeight: 400, color: C.muted, fontFamily: fs }}>{row.views}</div>
                  <div style={{ fontSize: 14, fontWeight: 400, color: C.muted, fontFamily: fs, textAlign: 'center' }}>{row.clients}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: i === 3 ? C.text : C.muted, fontFamily: fs, textAlign: 'center' }}>{row.earn}</div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 14, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: `1px solid ${C.border}` }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1px solid rgba(255,255,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 9, color: C.faint, fontWeight: 700, lineHeight: 1 }}>i</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 300, color: C.faint, fontFamily: fs, lineHeight: 1.6, margin: 0 }}>
                <span style={{ color: C.muted, fontWeight: 400 }}>Baseado nos ganhos de nossos parceiros.</span>{' '}
                Seus resultados são únicos e podem variar para mais ou para menos — os dados acima refletem experiências reais, mas não constituem garantia de rendimento.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ ESTRATÉGIA ══ */}
      <section style={{ padding: '100px 24px', background: C.bg2 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <SectionBadge>Como divulgar</SectionBadge>
              <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 500, color: C.text, letterSpacing: '-0.03em', fontFamily: fs, marginBottom: 16 }}>
                A ferramenta{' '}
                <em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.55 }}>se vende sozinha.</em>
              </h2>
              <p style={{ fontSize: 16, fontWeight: 300, color: C.muted, maxWidth: 500, margin: '0 auto', fontFamily: fs, lineHeight: 1.65 }}>
                Você não precisa vender nada. Só precisa mostrar o que ela faz — o resultado visual convence sozinho.
              </p>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {strategyItems.map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeIn key={i} delay={i * 0.08}>
                  <div
                    style={{ padding: '28px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, height: '100%', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = C.borderL)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                      <Icon size={20} color={C.muted} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 8, fontFamily: fs }}>{s.title}</h3>
                    <p style={{ fontSize: 13, fontWeight: 300, color: C.muted, lineHeight: 1.65, margin: 0, fontFamily: fs }}>{s.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ BENEFÍCIOS ══ */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <SectionBadge>Por que vale a pena</SectionBadge>
              <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 500, color: C.text, letterSpacing: '-0.03em', fontFamily: fs, margin: 0 }}>
                Por que se tornar{' '}
                <em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.55 }}>parceiro?</em>
              </h2>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <FadeIn key={i} delay={i * 0.07}>
                  <div
                    style={{ padding: '28px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, transition: 'border-color 0.2s', height: '100%', boxSizing: 'border-box' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = C.borderL)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                      <Icon size={20} color={C.muted} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 8, fontFamily: fs }}>{b.title}</h3>
                    <p style={{ fontSize: 13, fontWeight: 300, color: C.muted, lineHeight: 1.65, margin: 0, fontFamily: fs }}>{b.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CALCULADORA ══ */}
      <CalcSection />

      {/* ══ WHATSAPP COMMUNITY ══ */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ background: C.card, border: `1px solid ${C.borderL}`, borderRadius: 24, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'stretch' }} className="community-grid">
                {/* Left */}
                <div style={{ padding: '56px 52px', borderRight: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MessageCircle size={22} color={C.muted} />
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, fontSize: 11, color: C.faint, fontFamily: fs }}>
                      Comunidade exclusiva
                    </div>
                  </div>
                  <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 500, color: C.text, letterSpacing: '-0.03em', fontFamily: fs, marginBottom: 16, lineHeight: 1.15 }}>
                    Entre na comunidade<br />
                    de{' '}
                    <em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.55 }}>parceiros.</em>
                  </h2>
                  <p style={{ fontSize: 15, fontWeight: 300, color: C.muted, fontFamily: fs, lineHeight: 1.7, marginBottom: 32, maxWidth: 380 }}>
                    Grupo exclusivo no WhatsApp para parceiros ativos. Tire dúvidas, compartilhe estratégias e receba novidades antes de todo mundo.
                  </p>
                  <a href="https://chat.whatsapp.com/LINK_DO_GRUPO" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 100, background: C.text, color: C.bg, fontSize: 14, fontWeight: 500, textDecoration: 'none', fontFamily: fs, boxShadow: '0 0 30px rgba(255,255,255,0.08)' }}>
                    <MessageCircle size={15} />
                    Entrar na comunidade
                  </a>
                </div>

                {/* Right: benefit items */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    {
                      icon: Users,
                      title: 'Suporte direto',
                      desc: 'A equipe MindWeavr responde dúvidas em tempo real, sem ficar esperando.',
                    },
                    {
                      icon: TrendingUp,
                      title: 'Materiais toda semana',
                      desc: 'Banners, copies e conteúdos prontos para você usar e publicar sem esforço.',
                    },
                    {
                      icon: BarChart3,
                      title: 'Estratégias que convertem',
                      desc: 'Aprenda com outros parceiros o que funciona de verdade para o seu nicho.',
                    },
                  ].map((b, i) => {
                    const Icon = b.icon;
                    return (
                      <div key={i} style={{
                        flex: 1,
                        padding: '32px 36px',
                        borderBottom: i < 2 ? `1px solid ${C.border}` : 'none',
                        display: 'flex',
                        gap: 18,
                        alignItems: 'flex-start',
                      }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={18} color={C.muted} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: C.text, fontFamily: fs, marginBottom: 6 }}>{b.title}</div>
                          <div style={{ fontSize: 13, fontWeight: 300, color: C.muted, fontFamily: fs, lineHeight: 1.65 }}>{b.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section style={{ padding: '100px 24px', background: C.bg2 }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <SectionBadge>Dúvidas frequentes</SectionBadge>
              <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 500, color: C.text, letterSpacing: '-0.03em', fontFamily: fs, margin: 0 }}>
                Perguntas{' '}
                <em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.55 }}>frequentes</em>
              </h2>
            </div>
          </FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faq.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} delay={i * 0.04} />)}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section style={{ padding: '120px 24px', background: C.bg, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 300, background: 'radial-gradient(ellipse, rgba(255,255,255,0.025) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <FadeIn>
            <SectionBadge>Comece hoje</SectionBadge>
            <h2 style={{ fontSize: 'clamp(32px,4.5vw,58px)', fontWeight: 500, color: C.text, marginBottom: 20, fontFamily: fs, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Pronto para{' '}
              <em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.55 }}>começar a ganhar?</em>
            </h2>
            <p style={{ fontSize: 17, fontWeight: 300, color: C.muted, marginBottom: 40, fontFamily: fs, lineHeight: 1.65 }}>
              Cadastre-se gratuitamente e comece a divulgar em minutos.
              <br />Sem burocracia. Sem taxa de adesão.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', borderRadius: 100, background: C.text, color: C.bg, fontSize: 15, fontWeight: 500, textDecoration: 'none', boxShadow: '0 0 40px rgba(255,255,255,0.1)', fontFamily: fs }}>
                Tornar-me parceiro <ArrowRight size={16} />
              </Link>
              <a href="https://chat.whatsapp.com/LINK_DO_GRUPO" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 24px', borderRadius: 100, border: `1px solid ${C.border}`, color: C.muted, fontSize: 15, fontWeight: 300, textDecoration: 'none', fontFamily: fs }}>
                <MessageCircle size={15} />
                Comunidade
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding: '36px 24px', borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: C.faint, margin: 0, fontFamily: fs }}>
          © 2026 MindWeavr. Todos os direitos reservados.
        </p>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .calc-3col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .funnel-grid    { grid-template-columns: 1fr !important; }
          .community-grid { grid-template-columns: 1fr !important; }
          .community-grid > div:first-child { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08); }
        }
      `}</style>
    </div>
  );
}

