'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { motion, AnimatePresence, useMotionValue, useTransform, animate as fmAnimate } from 'framer-motion';
import {
  ArrowRight, Check, X, Star, TrendingUp, ChevronRight,
  Sparkles, Zap, Crown, Layers, Brain, Cpu, Wand2,
  MousePointer, Move, ZoomIn, Link2, Share2, Quote,
  Menu, FileText, Table, LayoutTemplate, BookOpen,
  Target, Download, BarChart3, Clock, ListChecks,
  CheckSquare, RefreshCw, Maximize2, Network,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';

/* ─── TOKENS ─────────────────────────────────────────── */
const C = {
  bg:    '#0a0a0a', bg2:   '#111111', card:  '#141414', card2: '#1a1a1a',
  border: 'rgba(255,255,255,0.08)', borderL: 'rgba(255,255,255,0.13)',
  borderH: 'rgba(255,255,255,0.2)',
  text:  '#f0f0f0', muted: '#888888', faint: '#555555', vfaint: '#333333',
  accent: '#c8c8c8',
};
const fs = 'var(--font-inter, Inter, -apple-system, sans-serif)';
const fp = 'var(--font-playfair, "Playfair Display", Georgia, serif)';

/* ─── FADEIN ─────────────────────────────────────────── */
function FadeIn({ children, delay = 0, y = 24, className, style }: {
  children: React.ReactNode; delay?: number; y?: number; className?: string; style?: React.CSSProperties;
}) {
  return (
    <motion.div className={className} style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

/* ─── MAP STATES ─────────────────────────────────────── */
const MAP_STATES = [
  {
    title: 'Marketing de Conteúdo', subtitle: 'Estratégias para criadores em 2024',
    tags: ['SEO', 'Reels', 'Tráfego'], headerTitle: 'Marketing de Conteúdo',
    statValue: '95K', statLabel: 'seguidores totais', statTrend: '+34%', statSub: 'vs. mês ant.',
    checkItems: ['Roteiro finalizado', 'Thumbnail aprovada', 'Publicar às 18h'],
    bars: [{ l: 'YouTube', p: 82 }, { l: 'Instagram', p: 65 }, { l: 'TikTok', p: 91 }],
    timelineItems: ['Ideação', 'Roteiro', 'Gravação'],
    insight: '"Conteúdo visual retém 65% mais atenção"',
    genCardTitle: 'Avaliação do canal', genCardSub: '4.9 · 2.1K avaliações',
    nodeCount: '6 nodes · 5 conexões',
  },
  {
    title: 'Funil de Vendas', subtitle: 'Estrutura completa do funil',
    tags: ['Leads', 'Conversão', 'ROI'], headerTitle: 'Funil de Vendas Pro',
    statValue: '12.4%', statLabel: 'taxa de conversão', statTrend: '+8%', statSub: 'últ. campanha',
    checkItems: ['Landing page pronta', 'Sequência de emails', 'Oferta principal'],
    bars: [{ l: 'Email', p: 78 }, { l: 'WhatsApp', p: 92 }, { l: 'Instagram', p: 45 }],
    timelineItems: ['Capturar', 'Nutrir', 'Converter'],
    insight: '"ROI médio de 340% em infoprodutos"',
    genCardTitle: 'Taxa de abandono', genCardSub: 'Stage 2 · 68%',
    nodeCount: '5 nodes · 4 conexões',
  },
  {
    title: 'Estratégias YouTube', subtitle: 'Canal em crescimento acelerado',
    tags: ['Views', 'CTR', 'CPM'], headerTitle: 'YouTube Growth 2024',
    statValue: '2.8M', statLabel: 'views no mês', statTrend: '+52%', statSub: 'vs. mês ant.',
    checkItems: ['Thumbnail A/B testada', 'SEO otimizado', 'CTA no final'],
    bars: [{ l: 'Retenção', p: 68 }, { l: 'CTR', p: 72 }, { l: 'Likes', p: 41 }],
    timelineItems: ['Ideia', 'Roteiro', 'Upload'],
    insight: '"3.2K novos inscritos por mês"',
    genCardTitle: 'Sugestão de thumbnail', genCardSub: 'Alto CTR esperado',
    nodeCount: '7 nodes · 6 conexões',
  },
] as const;

/* ─── ANIMATED DASHBOARD MOCKUP ─────────────────────── */
function AppMockup() {
  const [mapIdx, setMapIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMapIdx(i => (i + 1) % MAP_STATES.length), 7000);
    return () => clearInterval(id);
  }, []);
  const map = MAP_STATES[mapIdx];

  const [checked, setChecked] = useState(0);
  useEffect(() => {
    setChecked(0);
    const id = setInterval(() => setChecked(c => (c >= 3 ? 0 : c + 1)), 1100);
    return () => clearInterval(id);
  }, [mapIdx]);

  const [barKey, setBarKey] = useState(0);
  useEffect(() => {
    setBarKey(k => k + 1);
    const id = setInterval(() => setBarKey(k => k + 1), 3500);
    return () => clearInterval(id);
  }, [mapIdx]);

  const [genPhase, setGenPhase] = useState<'hidden'|'dots'|'content'>('hidden');
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>,
        t3: ReturnType<typeof setTimeout>, t4: ReturnType<typeof setTimeout>;
    const go = () => {
      setGenPhase('dots');
      t1 = setTimeout(() => setGenPhase('content'), 1800);
      t2 = setTimeout(() => { setGenPhase('hidden'); t3 = setTimeout(go, 2500); }, 5500);
    };
    t4 = setTimeout(go, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 960, margin: '0 auto' }}>
      <div style={{
        background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16,
        overflow: 'hidden', boxShadow: '0 50px 140px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        {/* Chrome bar — 3-column grid for perfect URL centering */}
        <div style={{
          height: 40, background: '#161616', borderBottom: `1px solid ${C.border}`,
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', padding: '0 16px',
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['#3a3a3a', '#2e2e2e', '#484848'].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 6, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 18px', width: 220 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3a3a3a' }} />
              <span style={{ fontSize: 10, color: C.faint, fontFamily: fs }}>mindweavr.app/app</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {[0, 1].map(i => (
              <div key={i} style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }} />
            ))}
          </div>
        </div>

        {/* App header */}
        <div style={{ height: 48, background: C.bg, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3.5, padding: 4 }}>
            {[14, 10, 14].map((w, i) => <div key={i} style={{ width: w, height: 1.5, background: C.faint, borderRadius: 1 }} />)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <img src="/logo-mindweavr-black.png" alt="MindWeavr" style={{ height: 14, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: fs }}>MindWeavr</span>
          </div>
          <div style={{ width: 1, height: 18, background: C.border, margin: '0 6px' }} />
          <AnimatePresence mode="wait">
            <motion.span key={mapIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ fontSize: 10, fontWeight: 400, color: C.muted, fontFamily: fs }}>
              {map.headerTitle}
            </motion.span>
          </AnimatePresence>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <div style={{ padding: '4px 12px', borderRadius: 100, border: `1px solid ${C.border}`, fontSize: 9, color: C.faint, fontFamily: fs }}>+ Novo mapa</div>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: C.text, fontFamily: fs }}>JD</div>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ position: 'relative', height: 520, background: C.bg, overflow: 'hidden', backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`, backgroundSize: '48px 48px' }}>
          {/* SVG connections — re-animate on state change */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', zIndex: 1, pointerEvents: 'none' }}>
            {[
              { key: `p1-${mapIdx}`, d: 'M 385,110 C 385,133 135,133 135,158', delay: 0.2 },
              { key: `p2-${mapIdx}`, d: 'M 415,110 C 415,133 410,133 410,158', delay: 0.3 },
              { key: `p3-${mapIdx}`, d: 'M 460,110 C 460,133 695,133 695,158', delay: 0.4 },
              { key: `p4-${mapIdx}`, d: 'M 135,248 C 135,284 230,284 230,330', delay: 0.7 },
              { key: `p5-${mapIdx}`, d: 'M 410,248 C 410,284 515,284 515,330', delay: 0.8 },
              { key: `p6-${mapIdx}`, d: 'M 695,248 C 695,284 740,284 740,370', delay: 0.9 },
            ].map(p => (
              <motion.path key={p.key} d={p.d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="5 4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, delay: p.delay }} />
            ))}
            <AnimatePresence>
              {genPhase === 'content' && (
                <motion.path d="M 695,248 C 695,310 760,310 760,370" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="5 4"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ pathLength: 0, opacity: 0 }} transition={{ duration: 0.6 }} />
              )}
            </AnimatePresence>
          </svg>

          {/* ROOT CARD */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
            style={{ position: 'absolute', left: 280, top: 14, width: 260, zIndex: 2 }}>
            <div style={{ background: C.card, border: `1px solid rgba(255,255,255,0.14)`, borderRadius: 14, padding: '13px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
              <div style={{ fontSize: 8, fontWeight: 500, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5, fontFamily: fs }}>root</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.text, letterSpacing: '-0.02em', lineHeight: 1.3, fontFamily: fs }}>
                <AnimatePresence mode="wait">
                  <motion.span key={`t-${mapIdx}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }} style={{ display: 'inline' }}>
                    {map.title}
                  </motion.span>
                </AnimatePresence>
                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }} style={{ display: 'inline-block', width: 1.5, height: 13, background: C.accent, marginLeft: 2, verticalAlign: 'text-bottom' }} />
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={`s-${mapIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ fontSize: 10, fontWeight: 300, color: C.muted, marginTop: 4, fontFamily: fs }}>
                  {map.subtitle}
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.div key={`tags-${mapIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  {map.tags.map(t => (
                    <span key={t} style={{ fontSize: 8, padding: '2px 7px', borderRadius: 100, border: `1px solid ${C.border}`, color: C.faint, fontFamily: fs }}>{t}</span>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* STAT CARD */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
            style={{ position: 'absolute', left: 20, top: 158, width: 220, zIndex: 2 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ fontSize: 8, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, fontFamily: fs }}>métrica</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <AnimatePresence mode="wait">
                    <motion.div key={`sv-${mapIdx}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                      style={{ fontSize: 28, fontWeight: 600, color: C.text, letterSpacing: '-0.04em', lineHeight: 1, fontFamily: fs }}>
                      {map.statValue}
                    </motion.div>
                  </AnimatePresence>
                  <div style={{ fontSize: 9, color: C.muted, marginTop: 3, fontFamily: fs }}>{map.statLabel}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.accent, display: 'flex', alignItems: 'center', gap: 2, fontFamily: fs }}><TrendingUp size={9} />{map.statTrend}</div>
                  <div style={{ fontSize: 8, color: C.faint, fontFamily: fs }}>{map.statSub}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CHECKLIST CARD */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
            style={{ position: 'absolute', left: 292, top: 158, width: 234, zIndex: 2 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ fontSize: 8, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, fontFamily: fs }}>checklist</div>
              {map.checkItems.map((item, i) => {
                const done = i < checked;
                return (
                  <motion.div key={`${mapIdx}-ci-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                    <motion.div animate={{ background: done ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                      style={{ width: 12, height: 12, borderRadius: 3, flexShrink: 0, border: `1.5px solid ${done ? 'rgba(255,255,255,0.25)' : C.vfaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                      <AnimatePresence>
                        {done && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={7} color={C.accent} strokeWidth={3} /></motion.div>}
                      </AnimatePresence>
                    </motion.div>
                    <span style={{ fontSize: 10, color: done ? C.faint : C.text, textDecoration: done ? 'line-through' : 'none', fontFamily: fs, transition: 'all 0.3s' }}>{item}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* BAR CHART CARD */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}
            style={{ position: 'absolute', left: 582, top: 158, width: 222, zIndex: 2 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ fontSize: 8, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, fontFamily: fs }}>engajamento</div>
              {map.bars.map((b, bi) => (
                <div key={`${mapIdx}-${b.l}`} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: C.faint, marginBottom: 2, fontFamily: fs }}>
                    <span>{b.l}</span><span>{b.p}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div key={`${barKey}-${mapIdx}-${bi}`} initial={{ width: '0%' }} animate={{ width: `${b.p}%` }} transition={{ duration: 0.9, delay: bi * 0.15, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 2, background: 'rgba(255,255,255,0.22)' }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* TIMELINE CARD */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4 }}
            style={{ position: 'absolute', left: 100, top: 330, width: 240, zIndex: 2 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '10px 14px' }}>
              <div style={{ fontSize: 8, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 7, fontFamily: fs }}>timeline</div>
              {map.timelineItems.map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < map.timelineItems.length - 1 ? 6 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: i < 2 ? 'rgba(255,255,255,0.18)' : 'transparent', border: `1.5px solid ${i < 2 ? 'rgba(255,255,255,0.3)' : C.vfaint}` }} />
                    {i < map.timelineItems.length - 1 && <div style={{ width: 1.5, height: 10, background: 'rgba(255,255,255,0.06)', marginTop: 2 }} />}
                  </div>
                  <span style={{ fontSize: 9, color: i < 2 ? C.muted : C.faint, fontFamily: fs }}>{step}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* INSIGHT CARD */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}
            style={{ position: 'absolute', left: 396, top: 330, width: 220, zIndex: 2 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '10px 14px' }}>
              <div style={{ fontSize: 8, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, fontFamily: fs }}>insight</div>
              <Quote size={11} color={C.vfaint} style={{ marginBottom: 4 }} />
              <AnimatePresence mode="wait">
                <motion.p key={`ins-${mapIdx}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
                  style={{ fontSize: 10, fontWeight: 300, color: C.muted, lineHeight: 1.5, margin: 0, fontFamily: fs }}>
                  {map.insight}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* DYNAMIC AI-GENERATED CARD */}
          <AnimatePresence>
            {genPhase !== 'hidden' && (
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}
                style={{ position: 'absolute', left: 668, top: 370, width: 210, zIndex: 3 }}>
                <div style={{ background: C.card, border: `1px solid ${C.borderL}`, borderRadius: 14, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}><Sparkles size={9} color={C.muted} /></motion.div>
                    <span style={{ fontSize: 8, color: C.muted, fontFamily: fs }}>gerado pelo sistema...</span>
                  </div>
                  {genPhase === 'dots' ? (
                    <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 0.9, delay: i * 0.2, repeat: Infinity }}
                          style={{ width: 5, height: 5, borderRadius: '50%', background: C.faint }} />
                      ))}
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: C.text, fontFamily: fs, marginBottom: 3 }}>{map.genCardTitle}</div>
                      <div style={{ display: 'flex', gap: 2 }}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} fill={C.accent} color={C.accent} />)}</div>
                      <div style={{ fontSize: 9, color: C.muted, marginTop: 3, fontFamily: fs }}>{map.genCardSub}</div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Canvas chrome */}
          <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 4, zIndex: 4 }}>
            {['+', '−', '⊡'].map((s, i) => (
              <div key={i} style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: C.faint }}>{s}</div>
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: 100, zIndex: 4 }}>
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} style={{ width: 5, height: 5, borderRadius: '50%', background: '#3a3a3a' }} />
            <AnimatePresence mode="wait">
              <motion.span key={`nc-${mapIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ fontSize: 9, color: C.faint, fontFamily: fs }}>
                {map.nodeCount}
              </motion.span>
            </AnimatePresence>
          </div>
          {/* State indicator */}
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 4 }}>
            {MAP_STATES.map((_, i) => (
              <motion.div key={i} animate={{ background: i === mapIdx ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.1)', width: i === mapIdx ? 16 : 5 }}
                transition={{ duration: 0.4 }} style={{ height: 5, borderRadius: 3 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── HERO ANIMATED VERB ─────────────────────────────── */
const HERO_VERBS = ['criar', 'apresentar', 'publicar', 'compartilhar', 'exibir', 'mostrar'];
function HeroAnimatedVerb() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [erasing, setErasing] = useState(false);
  useEffect(() => {
    const full = HERO_VERBS[idx];
    let t: ReturnType<typeof setTimeout>;
    if (!erasing) {
      if (text.length < full.length) t = setTimeout(() => setText(full.slice(0, text.length + 1)), 72);
      else t = setTimeout(() => setErasing(true), 2000);
    } else {
      if (text.length > 0) t = setTimeout(() => setText(text.slice(0, -1)), 32);
      else { setErasing(false); setIdx(i => (i + 1) % HERO_VERBS.length); }
    }
    return () => clearTimeout(t);
  }, [text, idx, erasing]);
  return (
    <span style={{ color: C.text }}>
      {text || '\u00a0'}
      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.85, repeat: Infinity }}
        style={{ display: 'inline-block', width: '0.06em', height: '0.82em', background: C.text, marginLeft: '0.04em', verticalAlign: '-0.06em' }} />
    </span>
  );
}

/* ─── HERO ───────────────────────────────────────────── */
function HeroSection() {
  const { user } = useAuth();
  return (
    <section id="hero" className="landing-hero" style={{ paddingTop: 130, paddingBottom: 100, paddingLeft: 24, paddingRight: 24, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', width: 700, height: 300, background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 28 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 100, fontSize: 11, fontWeight: 400, color: C.muted, fontFamily: fs }}>
            <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>
              <Network size={11} color={C.muted} />
            </motion.span>
            Mapas visuais interativos para criadores de conteúdo
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontSize: 'clamp(38px, 5.5vw, 72px)', fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1.05, color: C.text, marginBottom: 20, fontFamily: fs }}>
          Pare de <HeroAnimatedVerb />
          <br /><em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.55 }}>conteúdos</em> chatos.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: 18, fontWeight: 300, lineHeight: 1.65, color: C.muted, maxWidth: 520, margin: '0 auto 36px', fontFamily: fs }}>
          Você digita o conteúdo e em segundos já sai pronto um mapa{' '}
          <span style={{ color: C.text, fontWeight: 400 }}>altamente interativo e visualmente impactante</span>
          {' '}— do jeito que você precisa.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <Link href={user ? '/app' : '/login'} className="landing-cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 100, background: C.text, color: C.bg, fontSize: 14, fontWeight: 500, textDecoration: 'none', boxShadow: '0 0 30px rgba(255,255,255,0.1)', transition: 'all 0.2s', fontFamily: fs }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {user ? 'Abrir meu painel' : 'Começar agora'} <ArrowRight size={15} />
          </Link>
          <a href="#how" className="landing-cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', borderRadius: 100, border: `1px solid ${C.border}`, color: C.muted, fontSize: 14, fontWeight: 300, textDecoration: 'none', transition: 'all 0.2s', fontFamily: fs }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderL; e.currentTarget.style.color = C.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
            Como funciona <ChevronRight size={14} />
          </a>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="landing-dashboard-wrap" style={{ maxWidth: 1020, margin: '0 auto', paddingBottom: 0 }}>
        <AppMockup />
      </motion.div>
    </section>
  );
}

/* ─── RETENTION COMPARISON CARD ─────────────────────── */
/* ─── PAIN CARD VISUALS (SIMPLIFIED) ────────────────── */
function SlidesVisual() {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ marginBottom: 8 }}>
        {[100, 88, 70, 48, 24, 12].map((w, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: i < 5 ? 6 : 0 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', width: `${w}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function DocsVisual() {
  return (
    <div style={{ marginTop: 18 }}>
      {[100, 98, 92, 100, 78, 94, 88].map((w, i) => (
        <div key={i} style={{ height: 5, borderRadius: 2, background: 'rgba(255,255,255,0.05)', width: `${w}%`, marginBottom: i < 6 ? 4 : 0 }} />
      ))}
    </div>
  );
}

function PlanilhasVisual() {
  return (
    <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3 }}>
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} style={{ height: 20, background: i < 6 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }} />
      ))}
    </div>
  );
}

function MapasGenericosVisual() {
  return (
    <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 42, background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 7, gap: 3 }}>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 1, width: '75%' }} />
          <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 1, width: '55%' }} />
        </div>
      ))}
    </div>
  );
}

/* ─── MINDMAP BENEFITS GRID ──────────────────────────── */
function BenefitRetentionCard() {
  const barMV = useMotionValue(0);
  const barWidth = useTransform(barMV, [0, 1], ['0%', '87%']);
  useEffect(() => {
    const ctrl = fmAnimate(barMV, 1, { duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 });
    return () => ctrl.stop();
  }, [barMV]);
  return (
    <div style={{ background: C.card, border: `1px solid ${C.borderL}`, borderRadius: 18, padding: '24px 26px', textAlign: 'left', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={16} color={C.muted} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.faint, fontFamily: fs }}>Retenção de Audiência</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: C.muted, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', fontFamily: fs }}>Média geral</div>
      </div>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 700, color: 'rgba(140,210,160,0.9)', fontFamily: fs, letterSpacing: '-0.03em', lineHeight: 1 }}>87%</span>
      </div>
      <div style={{ fontSize: 13, color: C.muted, fontFamily: fs, marginBottom: 20 }}>da audiência assiste até o final</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 9, color: C.faint, fontFamily: fs, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Taxa de retenção</span>
          <span style={{ fontSize: 9, color: C.muted, fontFamily: fs }}>87 / 100</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div style={{ height: '100%', width: barWidth, background: `linear-gradient(90deg, rgba(255,255,255,0.25), ${C.text})`, borderRadius: 3 }} />
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: C.faint, fontFamily: fs }}>vs 11% com ferramentas tradicionais</div>
      </div>
    </div>
  );
}

function BenefitTypesCard() {
  const types = [
    { icon: BarChart3, label: 'Gráfico' }, { icon: CheckSquare, label: 'Checklist' },
    { icon: Quote, label: 'Citação' }, { icon: Target, label: 'KPI' },
    { icon: Clock, label: 'Timeline' }, { icon: Layers, label: 'Camadas' },
  ];
  return (
    <div style={{ background: C.card, border: `1px solid ${C.borderL}`, borderRadius: 18, padding: '24px 26px', textAlign: 'left', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={16} color={C.muted} />
          </div>
          <div style={{ fontSize: 11, color: C.faint, fontFamily: fs }}>Tipos de Cards Visuais</div>
        </div>
        <div style={{ fontSize: 10, color: C.muted, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', fontFamily: fs }}>+20 tipos</div>
      </div>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 700, color: 'rgba(140,210,160,0.9)', fontFamily: fs, letterSpacing: '-0.03em', lineHeight: 1 }}>+20</span>
      </div>
      <div style={{ fontSize: 13, color: C.muted, fontFamily: fs, marginBottom: 20 }}>formatos de cards para cada conteúdo</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {types.map(({ icon: Icon, label }, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
            <Icon size={16} color={C.muted} style={{ display: 'block', margin: '0 auto 5px' }} />
            <div style={{ fontSize: 8, color: C.faint, fontFamily: fs }}>{label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BenefitSpeedCard() {
  const STEPS = [
    { label: 'Análise do conteúdo', time: '0.8s' },
    { label: 'Estrutura do mapa', time: '2.4s' },
    { label: 'Criação dos cards', time: '6.1s' },
    { label: 'Finalização', time: '8.3s' },
  ];
  const [visibleCount, setVisibleCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    let s = 0;
    const numId = setInterval(() => { s += 0.1; setSeconds(parseFloat(s.toFixed(1))); if (s >= 8.3) clearInterval(numId); }, 50);
    STEPS.forEach((_, i) => {
      const t = setTimeout(() => setVisibleCount(i + 1), 400 + i * 420);
      return t;
    });
    return () => clearInterval(numId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div style={{ background: C.card, border: `1px solid ${C.borderL}`, borderRadius: 18, padding: '24px 26px', textAlign: 'left', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color={C.muted} />
          </div>
          <div style={{ fontSize: 11, color: C.faint, fontFamily: fs }}>Velocidade de Criação</div>
        </div>
        <div style={{ fontSize: 10, color: C.muted, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', fontFamily: fs }}>Geração</div>
      </div>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 700, color: 'rgba(140,210,160,0.9)', fontFamily: fs, letterSpacing: '-0.03em', lineHeight: 1 }}>{seconds.toFixed(1)}s</span>
      </div>
      <div style={{ fontSize: 13, color: C.muted, fontFamily: fs, marginBottom: 20 }}>tempo médio para gerar um mapa completo</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
        {STEPS.map((step, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: i < visibleCount ? 1 : 0.15, x: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: i < visibleCount ? 'rgba(140,210,160,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${i < visibleCount ? 'rgba(140,210,160,0.18)' : C.border}`, borderRadius: 8, transition: 'all 0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: i < visibleCount ? 'rgba(140,210,160,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${i < visibleCount ? 'rgba(140,210,160,0.4)' : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {i < visibleCount && <Check size={8} color="rgba(140,210,160,0.9)" strokeWidth={3} />}
              </div>
              <span style={{ fontSize: 11, color: i < visibleCount ? C.muted : C.faint, fontFamily: fs }}>{step.label}</span>
            </div>
            <span style={{ fontSize: 10, color: i < visibleCount ? 'rgba(140,210,160,0.7)' : C.faint, fontFamily: fs, fontWeight: 500 }}>{step.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BenefitAudienceCard() {
  const sparkData = [22, 31, 28, 45, 40, 58, 62, 71, 68, 82, 78, 91];
  const maxV = Math.max(...sparkData);
  return (
    <div style={{ background: C.card, border: `1px solid ${C.borderL}`, borderRadius: 18, padding: '24px 26px', textAlign: 'left', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={16} color={C.muted} />
          </div>
          <div style={{ fontSize: 11, color: C.faint, fontFamily: fs }}>Taxa de Retorno</div>
        </div>
        <div style={{ fontSize: 10, color: C.muted, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', fontFamily: fs }}>Mensal</div>
      </div>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 700, color: 'rgba(140,210,160,0.9)', fontFamily: fs, letterSpacing: '-0.03em', lineHeight: 1 }}>91%</span>
      </div>
      <div style={{ fontSize: 13, color: C.muted, fontFamily: fs, marginBottom: 20 }}>voltam para consumir mais conteúdo</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 52 }}>
          {sparkData.map((v, i) => (
            <motion.div key={i}
              initial={{ height: 0 }} whileInView={{ height: (v / maxV) * 48 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22,1,0.36,1] }}
              style={{ flex: 1, background: `rgba(255,255,255,${0.06 + (v / maxV) * 0.2})`, borderRadius: '2px 2px 0 0', border: `1px solid rgba(255,255,255,${0.04 + (v / maxV) * 0.1})` }} />
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 10, color: C.faint, fontFamily: fs }}>Crescimento consistente ao longo do tempo</div>
      </div>
    </div>
  );
}

function MindMapBenefitsGrid() {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, marginBottom: 16, fontFamily: fs }}>
          Com o MindWeavr é diferente
        </div>
        <h3 style={{ fontSize: 'clamp(20px, 2.8vw, 34px)', fontWeight: 500, color: C.text, letterSpacing: '-0.03em', fontFamily: fs, margin: 0, lineHeight: 1.2 }}>
          Resultados que <em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.6 }}>falam por si.</em>
        </h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, alignItems: 'stretch' }} className="benefits-grid">
        <FadeIn delay={0}><BenefitRetentionCard /></FadeIn>
        <FadeIn delay={0.07}><BenefitTypesCard /></FadeIn>
        <FadeIn delay={0.14}><BenefitSpeedCard /></FadeIn>
        <FadeIn delay={0.21}><BenefitAudienceCard /></FadeIn>
      </div>
    </div>
  );
}

/* ─── PAIN ───────────────────────────────────────────── */
function PainSection() {
  const pains = [
    {
      icon: LayoutTemplate, label: 'Google Slides', anim: { rotate: [0, -3, 3, 0] },
      text: 'É como assistir um professor chato em uma aula que nunca acaba. Sua audiência dorme na terceira lâmina.',
      visual: <SlidesVisual />,
    },
    {
      icon: FileText, label: 'Google Docs', anim: { y: [0, -3, 3, 0] },
      text: 'Baixam, salvam na pasta "ver depois" e nunca mais abrem. Você criou para o lixo digital.',
      visual: <DocsVisual />,
    },
    {
      icon: Table, label: 'Planilhas', anim: { scaleX: [1, 0.95, 1] },
      text: 'Linhas, colunas, fórmulas que explodem. Quanto mais você explica, mais as pessoas confundem.',
      visual: <PlanilhasVisual />,
    },
    {
      icon: Brain, label: 'Mapas Genéricos', anim: { opacity: [1, 0.6, 1] },
      text: 'Geram blocos de texto e chamam de mapa. Você acha que ta arrasando, mas é só mais texto com linhas.',
      visual: <MapasGenericosVisual />,
    },
  ];
  return (
    <section style={{ padding: '120px 24px', background: C.bg2 }}>
      <div style={{ maxWidth: 940, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, marginBottom: 24, fontFamily: fs }}>
            O problema que você conhece bem
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 500, letterSpacing: '-0.03em', color: C.text, marginBottom: 16, lineHeight: 1.15, fontFamily: fs }}>
            Sua audiência está cansada de
            <br /><em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.5 }}>conteúdo sem vida.</em>
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p style={{ fontSize: 16, fontWeight: 300, color: C.muted, maxWidth: 500, margin: '0 auto 60px', lineHeight: 1.65, fontFamily: fs }}>
            Criadores de conteúdo, infoprodutores e YouTubers perdem oportunidades todos os dias usando ferramentas que não foram feitas para eles.
          </p>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, margin: '0 auto 56px' }} className="pain-grid">
          {pains.map((p, i) => {
            const Icon = p.icon;
            return (
              <FadeIn key={i} delay={i * 0.07} style={{ height: '100%' }}>
                <div style={{ padding: '24px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, textAlign: 'left', transition: 'border-color 0.2s', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.borderL; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Icon size={16} color={C.faint} />
                    <span style={{ fontSize: 13, fontWeight: 400, color: C.muted, fontFamily: fs }}>{p.label}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 300, color: C.muted, lineHeight: 1.6, margin: 0, fontFamily: fs, flexShrink: 0 }}>{p.text}</p>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>{p.visual}</div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
      <style>{`@media (max-width:640px) { .pain-grid { grid-template-columns: 1fr !important; } .benefits-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* ─── STEP ANIMATIONS ────────────────────────────────── */
const TYPING_PHRASES = ['Estratégias para YouTube', 'Funil de vendas completo', 'Como monetizar no TikTok'];

function TypingStep() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    const full = TYPING_PHRASES[idx];
    let t: ReturnType<typeof setTimeout>;
    if (!erasing) {
      if (text.length < full.length) {
        t = setTimeout(() => setText(full.slice(0, text.length + 1)), 65);
      } else {
        t = setTimeout(() => setErasing(true), 1400);
      }
    } else {
      if (text.length > 0) {
        t = setTimeout(() => setText(text.slice(0, -1)), 30);
      } else {
        setErasing(false);
        setIdx(i => (i + 1) % TYPING_PHRASES.length);
      }
    }
    return () => clearTimeout(t);
  }, [text, idx, erasing]);

  return (
    <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 10 }}>
        <div style={{ fontSize: 9, color: C.vfaint, fontFamily: fs, marginBottom: 6 }}>Tema ou conteúdo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wand2 size={12} color={C.faint} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: C.muted, fontFamily: fs, flex: 1, minHeight: 18 }}>{text}
            <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }}
              style={{ display: 'inline-block', width: 1.5, height: 12, background: C.accent, marginLeft: 1, verticalAlign: 'text-bottom' }} />
          </span>
        </div>
      </div>
      <motion.div animate={{ opacity: text.length > 6 ? 1 : 0, y: text.length > 6 ? 0 : 4 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['YouTube', 'Conteúdo', 'Engajamento', 'SEO'].map((tag, i) => (
            <motion.span key={tag} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: text.length > 6 ? 1 : 0, scale: text.length > 6 ? 1 : 0.85 }}
              transition={{ delay: i * 0.08, duration: 0.25 }}
              style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, fontFamily: fs }}>
              {tag}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function CardsAppearingStep() {
  const [key, setKey] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setKey(k => k + 1), 3200);
    return () => clearInterval(id);
  }, []);
  const cards = [
    { icon: <BarChart3 size={14} color={C.faint} />, label: 'Engajamento', val: '82K' },
    { icon: <CheckSquare size={14} color={C.faint} />, label: 'Checklist', val: '3 tasks' },
    { icon: <TrendingUp size={14} color={C.faint} />, label: 'Crescimento', val: '+34%' },
    { icon: <Clock size={14} color={C.faint} />, label: 'Timeline', val: '4 etapas' },
  ];
  return (
    <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }} key={key}>
      {cards.map((c, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.88 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.18, duration: 0.3 }}
          style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {c.icon}
            <span style={{ fontSize: 9, color: C.faint, fontFamily: fs }}>{c.label}</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.text, fontFamily: fs, letterSpacing: '-0.03em' }}>{c.val}</span>
        </motion.div>
      ))}
    </div>
  );
}

function DragStep() {
  const dragAnim = { x: [0, 55, 80, 30, 0], y: [0, -14, 18, -8, 0] };
  const dragTrans = { duration: 4, repeat: Infinity, ease: 'easeInOut' as const };
  return (
    <div style={{ marginTop: 18, position: 'relative', height: 128, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
      {/* Static background card */}
      <div style={{ position: 'absolute', right: 18, bottom: 18, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 10, color: C.vfaint, fontFamily: fs }}>
        <div style={{ fontSize: 7, color: C.vfaint, marginBottom: 3, fontFamily: fs }}>CHECKLIST</div>
        Tarefas da semana
      </div>
      {/* Dragged card */}
      <motion.div animate={dragAnim} transition={dragTrans}
        style={{ position: 'absolute', top: 22, left: 18, padding: '9px 12px', background: C.card, border: `1px solid ${C.borderL}`, borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.5)', zIndex: 2, cursor: 'grab', userSelect: 'none' }}>
        <div style={{ fontSize: 7, color: C.faint, marginBottom: 3, fontFamily: fs }}>MÉTRICA</div>
        <div style={{ fontSize: 11, fontWeight: 500, color: C.text, fontFamily: fs, whiteSpace: 'nowrap' }}>Métricas YouTube</div>
      </motion.div>
      {/* Cursor — offset to card's bottom-right corner and shares exact same animation */}
      <motion.div animate={dragAnim} transition={{ ...dragTrans, delay: 0.04 }}
        style={{ position: 'absolute', top: 72, left: 108, zIndex: 3 }}>
        <MousePointer size={16} color={C.accent} />
      </motion.div>
      {/* Connection line hint */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.03)' }} />
    </div>
  );
}

function ShareStep() {
  const [shared, setShared] = useState(false);
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>, t3: ReturnType<typeof setTimeout>;
    const cycle = () => {
      setShared(false);
      t1 = setTimeout(() => setShared(true), 1400);
      t2 = setTimeout(() => { t3 = setTimeout(cycle, 800); }, 4000);
    };
    const start = setTimeout(cycle, 500);
    return () => { clearTimeout(start); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 12 }}>
        <div style={{ fontSize: 9, color: C.faint, marginBottom: 10, fontFamily: fs }}>Compartilhar mapa</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1, padding: '7px 10px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 9, color: C.vfaint, fontFamily: fs, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            mindweavr.app/mapa/xk92m...
          </div>
          <motion.div animate={{ scale: shared ? [1, 0.92, 1] : 1 }} transition={{ duration: 0.2 }}
            style={{ padding: '7px 14px', borderRadius: 7, background: shared ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.04)', border: `1px solid ${shared ? C.borderL : C.border}`, fontSize: 9, fontFamily: fs, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, transition: 'all 0.3s' }}>
            <AnimatePresence mode="wait">
              {shared ? (
                <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={9} color={C.accent} /><span style={{ color: C.accent }}>Copiado!</span>
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <span style={{ color: C.muted }}>Copiar</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[{ icon: <Link2 size={11} color={C.faint} />, l: 'Link direto' }, { icon: <Share2 size={11} color={C.faint} />, l: 'Incorporar' }].map(s => (
            <div key={s.l} style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              {s.icon}
              <span style={{ fontSize: 9, color: C.vfaint, fontFamily: fs }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── HOW IT WORKS ───────────────────────────────────── */
function HowSection() {
  const steps = [
    { icon: <Wand2 size={20} />, title: 'Digite seu tema ou cole seu conteúdo', desc: 'Escreva o assunto, cole um texto ou faça upload de um PDF. O sistema entende o contexto completo e estrutura tudo para você.', animation: <TypingStep /> },
    { icon: <Cpu size={20} />, title: 'Seu mapa visual é criado em segundos', desc: 'Em menos de 30 segundos você tem um mapa completo com 20+ tipos de blocos visuais: gráficos, timelines, checklists e muito mais.', animation: <CardsAppearingStep /> },
    { icon: <MousePointer size={20} />, title: 'Customize, arraste e conecte', desc: 'Mova os cards, edite o conteúdo, adicione novos blocos, conecte com setas personalizadas. Tudo interativo, tudo no mesmo lugar.', animation: <DragStep /> },
    { icon: <Share2 size={20} />, title: 'Compartilhe e encante sua audiência', desc: 'Use nos seus vídeos, aulas e apresentações. Sua audiência vai entender e lembrar muito mais do seu conteúdo.', animation: <ShareStep /> },
  ];
  return (
    <section id="how" style={{ padding: '120px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, marginBottom: 20, fontFamily: fs }}>Como funciona</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 500, letterSpacing: '-0.03em', color: C.text, lineHeight: 1.15, fontFamily: fs }}>
              Do texto ao mapa em{' '}
              <em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.55 }}>4 passos</em>
            </h2>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, alignItems: 'stretch' }} className="steps-grid">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.08} style={{ display: 'flex' }}>
              <div style={{ padding: '28px 30px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, transition: 'border-color 0.2s, transform 0.25s', position: 'relative', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.borderL; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
                <div style={{ position: 'absolute', right: 20, top: 14, fontSize: 56, fontWeight: 800, color: 'rgba(255,255,255,0.02)', lineHeight: 1, letterSpacing: '-0.05em', userSelect: 'none', fontFamily: fs }}>
                  0{i + 1}
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, marginBottom: 18 }}>{step.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 500, color: C.text, letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.3, fontFamily: fs }}>{step.title}</h3>
                <p style={{ fontSize: 13, fontWeight: 300, color: C.muted, lineHeight: 1.65, margin: 0, fontFamily: fs }}>{step.desc}</p>
                <div style={{ flex: 1 }}>{step.animation}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .steps-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* ─── FEATURES ───────────────────────────────────────── */
function FeaturesSection() {
  const features = [
    { icon: <Layers size={18} />, title: '20+ tipos de blocos visuais', desc: 'Gráficos, timelines, checklists, métricas, comparações, avaliações e muito mais.' },
    { icon: <Brain size={18} />, title: 'Geração inteligente de conteúdo', desc: 'Cole qualquer texto, PDF ou documento — o sistema estrutura tudo de forma visual.' },
    { icon: <Move size={18} />, title: 'Canvas totalmente interativo', desc: 'Arraste cards, faça zoom, mova conexões, reorganize sem limites.' },
    { icon: <Wand2 size={18} />, title: 'Expansão automática', desc: 'Clique em qualquer nó e peça para gerar conteúdo complementar automaticamente.' },
    { icon: <Link2 size={18} />, title: 'Conexões personalizadas', desc: 'Curvas bezier, linhas retas ou ângulos. Setas com estilos customizáveis.' },
    { icon: <ZoomIn size={18} />, title: 'Layouts múltiplos', desc: 'Top-down ou left-right para organizar seu mapa da forma ideal.' },
    { icon: <Target size={18} />, title: 'Edição inline completa', desc: 'Edite qualquer texto, número ou dado diretamente no card, sem modais.' },
    { icon: <Download size={18} />, title: 'Histórico e salvamento', desc: 'Todos os seus mapas ficam salvos na sua conta e acessíveis a qualquer momento.' },
  ];
  return (
    <section id="features" style={{ padding: '120px 24px', background: C.bg2 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, marginBottom: 20, fontFamily: fs }}>Funcionalidades</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 500, letterSpacing: '-0.03em', color: C.text, lineHeight: 1.15, marginBottom: 14, fontFamily: fs }}>
              Tudo que você precisa para criar
              <br /><em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.5 }}>conteúdo de impacto</em>
            </h2>
            <p style={{ fontSize: 15, fontWeight: 300, color: C.muted, maxWidth: 440, margin: '0 auto', fontFamily: fs }}>Uma ferramenta pensada do zero para criadores que querem se destacar.</p>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="feat-grid">
          {features.map((f, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div style={{ padding: '22px 20px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, transition: 'border-color 0.2s, transform 0.25s', height: '100%' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.borderL; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 7, letterSpacing: '-0.01em', fontFamily: fs }}>{f.title}</h3>
                <p style={{ fontSize: 12, fontWeight: 300, color: C.muted, lineHeight: 1.65, margin: 0, fontFamily: fs }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) { .feat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .feat-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

/* ─── CARD CAROUSEL (2-row infinite) ─────────────────── */
function MiniStatCard() {
  const mv = useMotionValue(78);
  const display = useTransform(mv, v => `${Math.round(v)}K`);
  useEffect(() => {
    const ctrl = fmAnimate(mv, [78, 100], { duration: 6, ease: 'linear', repeat: Infinity, repeatType: 'loop' });
    return ctrl.stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: fs }}>métricas</div>
      <motion.div style={{ fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: '-0.04em', lineHeight: 1, fontFamily: fs }}>{display}</motion.div>
      <div style={{ fontSize: 9, color: C.accent, display: 'flex', alignItems: 'center', gap: 2, marginTop: 4, fontFamily: fs }}><TrendingUp size={8} />+18%</div>
    </div>
  );
}

function MiniCheckCard() {
  const [c, setC] = useState(0);
  useEffect(() => { const id = setInterval(() => setC(n => (n >= 3 ? 0 : n + 1)), 900); return () => clearInterval(id); }, []);
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: fs }}>checklist</div>
      {['Roteiro', 'Thumbnail', 'Publicar'].map((item, i) => (
        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <motion.div animate={{ background: i < c ? 'rgba(255,255,255,0.1)' : 'transparent' }} transition={{ duration: 0.3 }}
            style={{ width: 10, height: 10, borderRadius: 3, border: `1.5px solid ${i < c ? 'rgba(255,255,255,0.25)' : C.vfaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {i < c && <Check size={6} color={C.accent} strokeWidth={3} />}
          </motion.div>
          <span style={{ fontSize: 9, color: i < c ? C.faint : C.text, textDecoration: i < c ? 'line-through' : 'none', fontFamily: fs, transition: 'all 0.3s' }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function MiniBarCard() {
  const [bk, setBk] = useState(0);
  useEffect(() => { const id = setInterval(() => setBk(k => k + 1), 3200); return () => clearInterval(id); }, []);
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: fs }}>engajamento</div>
      {[{ l: 'YT', p: 82 }, { l: 'IG', p: 67 }, { l: 'TK', p: 91 }].map((b, i) => (
        <div key={b.l} style={{ marginBottom: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: C.faint, marginBottom: 2, fontFamily: fs }}><span>{b.l}</span><span>{b.p}%</span></div>
          <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.04)' }}>
            <motion.div key={`${bk}-${i}`} initial={{ width: '0%' }} animate={{ width: `${b.p}%` }} transition={{ duration: 0.8, delay: i * 0.12, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 2, background: 'rgba(255,255,255,0.22)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniTimelineCard() {
  const [s, setS] = useState(0);
  useEffect(() => { const id = setInterval(() => setS(n => (n >= 3 ? 0 : n + 1)), 800); return () => clearInterval(id); }, []);
  const items = ['Ideia', 'Roteiro', 'Edição', 'Publ.'];
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: fs }}>timeline</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {items.map((item, i) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center' }}>
            <motion.div animate={{ background: i <= s ? 'rgba(255,255,255,0.2)' : 'transparent', borderColor: i <= s ? 'rgba(255,255,255,0.3)' : C.vfaint }}
              style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${i <= s ? 'rgba(255,255,255,0.3)' : C.vfaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.4s' }}>
              {i <= s && <Check size={7} color={C.accent} strokeWidth={3} />}
            </motion.div>
            {i < items.length - 1 && <div style={{ width: 16, height: 1.5, background: i < s ? 'rgba(255,255,255,0.15)' : C.vfaint, transition: 'all 0.4s' }} />}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {items.map((item, i) => <span key={item} style={{ fontSize: 7, color: i <= s ? C.muted : C.vfaint, fontFamily: fs, transition: 'all 0.3s', width: 34, textAlign: 'center' }}>{item}</span>)}
      </div>
    </div>
  );
}

function MiniRatingCard() {
  const [stars, setStars] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStars(n => (n >= 5 ? 0 : n + 1)), 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: fs }}>avaliação</div>
      <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div key={i} animate={{ scale: i < stars ? 1.15 : 0.9, opacity: i < stars ? 1 : 0.2 }}
            transition={{ duration: 0.25, type: 'spring', stiffness: 320, damping: 22 }}>
            <Star size={14} fill={i < stars ? C.accent : 'none'} color={i < stars ? C.accent : C.vfaint} />
          </motion.div>
        ))}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: '-0.04em', lineHeight: 1, fontFamily: fs }}>4.9</div>
    </div>
  );
}

function MiniHighlightCard() {
  const quotes = ['"Conteúdo visual retém 65% mais"', '"Seus mapas valem mais que slides"'];
  const [qi, setQi] = useState(0);
  useEffect(() => { const id = setInterval(() => setQi(n => (n + 1) % quotes.length), 3000); return () => clearInterval(id); }, []);
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: fs }}>insight</div>
      <Quote size={11} color={C.vfaint} style={{ marginBottom: 4 }} />
          <AnimatePresence mode="wait">
        <motion.p key={qi} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          style={{ fontSize: 10, fontWeight: 300, color: C.muted, lineHeight: 1.5, margin: 0, fontFamily: fs }}>{quotes[qi]}</motion.p>
      </AnimatePresence>
    </div>
  );
}

function MiniProgressCard() {
  const r = 22, circ = 2 * Math.PI * r;
  const pctMV = useMotionValue(0);
  const dashOffset = useTransform(pctMV, v => circ - (circ * v) / 100);
  const pctLabel = useTransform(pctMV, v => `${Math.round(v)}%`);
  useEffect(() => {
    const ctrl = fmAnimate(pctMV, [0, 100], { duration: 4, ease: 'linear', repeat: Infinity, repeatType: 'loop' });
    return ctrl.stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <motion.circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3"
            strokeDasharray={circ} strokeDashoffset={dashOffset}
            strokeLinecap="round" transform="rotate(-90 26 26)" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: C.text, fontFamily: fs }}>
          <motion.span>{pctLabel}</motion.span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 9, fontWeight: 500, color: C.text, fontFamily: fs }}>Progresso</div>
        <div style={{ fontSize: 8, color: C.faint, fontFamily: fs }}>do módulo</div>
      </div>
    </div>
  );
}

function MiniComparisonCard() {
  const [side, setSide] = useState(0);
  useEffect(() => { const id = setInterval(() => setSide(s => 1 - s), 1800); return () => clearInterval(id); }, []);
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: fs }}>comparação</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[{ l: 'Docs', icon: <FileText size={14} color={C.faint} /> }, { l: 'MindWeavr', icon: <Network size={14} color={C.accent} /> }].map((s, i) => (
          <motion.div key={s.l} animate={{ background: i === side ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)', borderColor: i === side ? C.borderL : C.border }}
            style={{ padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`, textAlign: 'center', transition: 'all 0.4s' }}>
            {s.icon}
            <div style={{ fontSize: 8, color: i === side ? C.text : C.faint, marginTop: 3, fontFamily: fs }}>{s.l}</div>
              </motion.div>
        ))}
      </div>
    </div>
  );
}

function MiniCountdownCard() {
  const [n, setN] = useState(10);
  useEffect(() => { const id = setInterval(() => setN(v => (v <= 0 ? 10 : v - 1)), 900); return () => clearInterval(id); }, []);
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: fs }}>countdown</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {String(n).padStart(2, '0').split('').map((d, i) => (
          <motion.div key={`${n}-${i}`} initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.15 }}
            style={{ width: 22, height: 28, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: C.text, fontFamily: fs }}>
            {d}
          </motion.div>
        ))}
        <span style={{ fontSize: 9, color: C.faint, alignSelf: 'flex-end', marginBottom: 3, fontFamily: fs }}>dias</span>
                </div>
    </div>
  );
}

/* ─── 12 NEW MINI CARD TYPES (row 2) ─────────────────── */
function MiniTableCard() {
  const [hl, setHl] = useState(0);
  useEffect(() => { const id = setInterval(() => setHl(r => (r + 1) % 3), 1200); return () => clearInterval(id); }, []);
  const rows = [['YouTube', '82K', '+18%'], ['Instagram', '45K', '+9%'], ['TikTok', '120K', '+34%']];
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7, fontFamily: fs }}>tabela</div>
      {rows.map((row, i) => (
        <motion.div key={i} animate={{ background: i === hl ? 'rgba(255,255,255,0.05)' : 'transparent' }} transition={{ duration: 0.3 }}
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 4, padding: '3px 4px', borderRadius: 4, marginBottom: 2 }}>
          {row.map((cell, ci) => <span key={ci} style={{ fontSize: 9, color: i === hl ? C.text : C.faint, fontFamily: fs, textAlign: ci > 0 ? 'right' : 'left' }}>{cell}</span>)}
              </motion.div>
      ))}
    </div>
  );
}

function MiniGaugeCard() {
  const gaugeMV = useMotionValue(0);
  const rotation = useTransform(gaugeMV, [0, 100], [-90, 90]);
  useEffect(() => {
    const ctrl = fmAnimate(gaugeMV, [0, 100], { duration: 3.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' });
    return ctrl.stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pctLabel = useTransform(gaugeMV, v => `${Math.round(v)}%`);
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: fs }}>gauge</div>
      <div style={{ position: 'relative', width: 60, height: 34, margin: '0 auto' }}>
        <svg width="60" height="34" viewBox="0 0 60 34">
          <path d="M 5,30 A 25,25 0 0,1 55,30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 5,30 A 25,25 0 0,1 55,30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" strokeLinecap="round" strokeDasharray="78.5" strokeDashoffset="20" />
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', transformOrigin: 'bottom center' }}>
          <motion.div style={{ width: 1.5, height: 22, background: C.accent, borderRadius: 1, transformOrigin: 'bottom center', rotate: rotation }} />
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: C.text, fontFamily: fs, marginTop: 4 }}>
        <motion.span>{pctLabel}</motion.span>
      </div>
    </div>
  );
}

function MiniPieCard() {
  const [seg, setSeg] = useState(0);
  useEffect(() => { const id = setInterval(() => setSeg(s => (s + 1) % 3), 1500); return () => clearInterval(id); }, []);
  const segs = [{ pct: 45, label: 'YT' }, { pct: 30, label: 'IG' }, { pct: 25, label: 'TK' }];
  const colors = ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.12)'];
  let cumAngle = -90;
  return (
    <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="44" height="44" viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
        {segs.map((s, i) => {
          const startAngle = cumAngle;
          const sweep = (s.pct / 100) * 360;
          cumAngle += sweep;
          const r = 18, cx = 22, cy = 22;
          const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
          const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
          const x2 = cx + r * Math.cos(((startAngle + sweep) * Math.PI) / 180);
          const y2 = cy + r * Math.sin(((startAngle + sweep) * Math.PI) / 180);
          return (
            <motion.path key={i} d={`M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${sweep > 180 ? 1 : 0},1 ${x2},${y2} Z`}
              animate={{ opacity: i === seg ? 1 : 0.4, scale: i === seg ? 1.05 : 1 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
              fill={colors[i]} transition={{ duration: 0.4 }} />
          );
        })}
      </svg>
      <div>
        <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontFamily: fs }}>canais</div>
        {segs.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
            <div style={{ width: 5, height: 5, borderRadius: 1, background: colors[i], flexShrink: 0 }} />
            <span style={{ fontSize: 8, color: i === seg ? C.text : C.faint, fontFamily: fs, transition: 'color 0.3s' }}>{s.label} {s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniListCard() {
  const [active, setActive] = useState(0);
  useEffect(() => { const id = setInterval(() => setActive(a => (a + 1) % 4), 900); return () => clearInterval(id); }, []);
  const items = ['Criar roteiro', 'Gravar vídeo', 'Editar cortes', 'Publicar'];
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7, fontFamily: fs }}>lista</div>
      {items.map((item, i) => (
        <motion.div key={item} animate={{ x: i === active ? 4 : 0 }} transition={{ duration: 0.25, type: 'spring', stiffness: 300 }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <motion.div animate={{ background: i <= active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.04)' }} transition={{ duration: 0.3 }}
            style={{ width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 7, fontWeight: 700, color: i <= active ? C.text : C.vfaint, fontFamily: fs }}>{i + 1}</span>
              </motion.div>
          <span style={{ fontSize: 9, color: i === active ? C.text : i < active ? C.faint : C.muted, fontFamily: fs, transition: 'color 0.3s' }}>{item}</span>
        </motion.div>
      ))}
    </div>
  );
}

function MiniFlowCard() {
  const [step, setStep] = useState(0);
  useEffect(() => { const id = setInterval(() => setStep(s => (s + 1) % 4), 900); return () => clearInterval(id); }, []);
  const steps = ['Topo', 'Meio', 'Fundo', 'Venda'];
  const widths = [100, 80, 60, 40];
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: fs }}>funil</div>
      {steps.map((s, i) => (
        <motion.div key={s} animate={{ background: i === step ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.05)' }} transition={{ duration: 0.3 }}
          style={{ height: 14, borderRadius: 3, margin: '0 auto 3px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: `${widths[i]}%` }}>
          <span style={{ fontSize: 7, color: i === step ? C.text : C.faint, fontFamily: fs }}>{s}</span>
        </motion.div>
      ))}
    </div>
  );
}

function MiniKPICard() {
  const kpiMV = useMotionValue(0);
  const kpiLabel = useTransform(kpiMV, v => `R$${(v * 12.5).toFixed(0)}`);
  useEffect(() => {
    const ctrl = fmAnimate(kpiMV, [0, 100], { duration: 5, ease: 'linear', repeat: Infinity, repeatType: 'loop' });
    return ctrl.stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5, fontFamily: fs }}>receita</div>
      <motion.div style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: '-0.04em', lineHeight: 1, fontFamily: fs }}>{kpiLabel}</motion.div>
      <div style={{ fontSize: 8, color: C.muted, marginTop: 4, fontFamily: fs }}>este mês</div>
      <div style={{ display: 'flex', gap: 1, marginTop: 8, alignItems: 'flex-end', height: 18 }}>
        {[4, 6, 5, 8, 7, 10, 9, 12].map((h, i) => (
          <motion.div key={i} initial={{ height: 0 }} animate={{ height: h * 1.5 }} transition={{ delay: i * 0.07, duration: 0.4, ease: 'easeOut' }}
            style={{ flex: 1, background: i === 7 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)', borderRadius: '1px 1px 0 0' }} />
        ))}
      </div>
    </div>
  );
}

function MiniVideoCard() {
  const [play, setPlay] = useState(false);
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>;
    const cycle = () => { setPlay(true); t1 = setTimeout(() => { setPlay(false); t2 = setTimeout(cycle, 1200); }, 2500); };
    const s = setTimeout(cycle, 800); return () => { clearTimeout(s); clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7, fontFamily: fs }}>vídeo</div>
      <div style={{ position: 'relative', height: 44, borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ scale: play ? [1, 0.9, 1] : 1 }} transition={{ duration: 0.3 }}
          style={{ width: 22, height: 22, borderRadius: '50%', background: play ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
          {play ? <Check size={10} color={C.accent} /> : <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `7px solid ${C.faint}`, marginLeft: 2 }} />}
                </motion.div>
        {play && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ position: 'absolute', bottom: 0, left: 0, height: 2, background: 'rgba(255,255,255,0.3)', width: '100%', transformOrigin: 'left' }} transition={{ duration: 2.5, ease: 'linear' }} />}
      </div>
    </div>
  );
}

function MiniCalendarCard() {
  const [day, setDay] = useState(5);
  useEffect(() => { const id = setInterval(() => setDay(d => d >= 28 ? 1 : d + 1), 400); return () => clearInterval(id); }, []);
  const days = Array.from({ length: 21 }, (_, i) => i + 1);
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7, fontFamily: fs }}>calendário</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {days.map(d => (
          <motion.div key={d} animate={{ background: d === day ? 'rgba(255,255,255,0.3)' : d < day ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)' }} transition={{ duration: 0.2 }}
            style={{ height: 10, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 5, color: d === day ? C.bg : C.vfaint, fontFamily: fs, fontWeight: d === day ? 700 : 400 }}>{d}</span>
              </motion.div>
        ))}
      </div>
    </div>
  );
}

function MiniHeatCard() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => { const id = setInterval(() => setPulse(p => (p + 1) % 12), 280); return () => clearInterval(id); }, []);
  const opacities = [0.04, 0.08, 0.14, 0.2, 0.1, 0.25, 0.18, 0.06, 0.3, 0.12, 0.22, 0.08];
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7, fontFamily: fs }}>heatmap</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3 }}>
        {opacities.map((op, i) => (
          <motion.div key={i} animate={{ background: `rgba(255,255,255,${i === pulse ? Math.min(op * 2.5, 0.5) : op})` }} transition={{ duration: 0.25 }}
            style={{ height: 12, borderRadius: 2 }} />
        ))}
      </div>
    </div>
  );
}

function MiniQuote2Card() {
  const [qi, setQi] = useState(0);
  const quotes = ['"Meu engajamento triplicou"', '"Nunca mais uso Canva"'];
  useEffect(() => { const id = setInterval(() => setQi(n => 1 - n), 2800); return () => clearInterval(id); }, []);
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: fs }}>depoimento</div>
      <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={9} fill={C.faint} color={C.faint} />)}</div>
      <AnimatePresence mode="wait">
        <motion.p key={qi} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          style={{ fontSize: 10, fontWeight: 300, color: C.muted, lineHeight: 1.5, margin: 0, fontFamily: fs }}>{quotes[qi]}</motion.p>
          </AnimatePresence>
        </div>
  );
}

function MiniSparkCard() {
  const pts = [20, 35, 28, 42, 38, 55, 48, 62, 58, 70];
  const pathD = pts.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * 14},${70 - y}`).join(' ');
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontFamily: fs }}>tendência</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: '-0.04em', fontFamily: fs }}>+127%</div>
      <svg width="126" height="36" viewBox="0 0 126 70" style={{ marginTop: 4, display: 'block' }}>
        <motion.path d={pathD} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2 }} />
      </svg>
    </div>
  );
}

function MiniStepsCard() {
  const [step, setStep] = useState(0);
  useEffect(() => { const id = setInterval(() => setStep(s => (s + 1) % 4), 900); return () => clearInterval(id); }, []);
  const steps = ['Planejar', 'Criar', 'Revisar', 'Publicar'];
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 7, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: fs }}>passos</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <motion.div animate={{ background: i <= step ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.04)', scale: i === step ? 1.1 : 1 }} transition={{ duration: 0.3 }}
              style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${i <= step ? 'rgba(255,255,255,0.3)' : C.vfaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {i < step && <Check size={8} color={C.accent} strokeWidth={2.5} />}
              {i === step && <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.accent }} />}
            </motion.div>
            {i < steps.length - 1 && <div style={{ width: 10, height: 1.5, background: i < step ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)' }} />}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
        {steps.map((s, i) => <span key={s} style={{ fontSize: 6, color: i <= step ? C.muted : C.vfaint, fontFamily: fs, width: 30, textAlign: 'center' }}>{s}</span>)}
      </div>
    </div>
  );
}

/* ─── CARD SPECS (factory approach — no pre-rendered JSX) ─ */
type CardType = 'stat'|'check'|'bar'|'comparison'|'highlight'|'rating'|'table'|'gauge'|'pie'|'list'|'flow'|'kpi'|'timeline'|'progress'|'countdown'|'video'|'calendar'|'heat'|'quote2'|'spark'|'steps';

function renderCard(type: CardType) {
  switch (type) {
    case 'stat':        return <MiniStatCard />;
    case 'check':       return <MiniCheckCard />;
    case 'bar':         return <MiniBarCard />;
    case 'comparison':  return <MiniComparisonCard />;
    case 'highlight':   return <MiniHighlightCard />;
    case 'rating':      return <MiniRatingCard />;
    case 'table':       return <MiniTableCard />;
    case 'gauge':       return <MiniGaugeCard />;
    case 'pie':         return <MiniPieCard />;
    case 'list':        return <MiniListCard />;
    case 'flow':        return <MiniFlowCard />;
    case 'kpi':         return <MiniKPICard />;
    case 'timeline':    return <MiniTimelineCard />;
    case 'progress':    return <MiniProgressCard />;
    case 'countdown':   return <MiniCountdownCard />;
    case 'video':       return <MiniVideoCard />;
    case 'calendar':    return <MiniCalendarCard />;
    case 'heat':        return <MiniHeatCard />;
    case 'quote2':      return <MiniQuote2Card />;
    case 'spark':       return <MiniSparkCard />;
    case 'steps':       return <MiniStepsCard />;
    default:            return null;
  }
}

const ROW1_SPECS: { w: number; h: number; type: CardType }[] = [
  { w: 186, h: 108, type: 'stat' }, { w: 202, h: 108, type: 'check' },
  { w: 196, h: 108, type: 'bar' }, { w: 192, h: 108, type: 'comparison' },
  { w: 212, h: 108, type: 'highlight' }, { w: 186, h: 108, type: 'rating' },
  { w: 198, h: 108, type: 'table' }, { w: 176, h: 108, type: 'gauge' },
  { w: 196, h: 108, type: 'pie' }, { w: 190, h: 108, type: 'kpi' },
];
const ROW2_SPECS: { w: number; h: number; type: CardType }[] = [
  { w: 202, h: 108, type: 'timeline' }, { w: 176, h: 108, type: 'progress' },
  { w: 192, h: 108, type: 'countdown' }, { w: 186, h: 108, type: 'list' },
  { w: 172, h: 108, type: 'flow' }, { w: 198, h: 108, type: 'video' },
  { w: 196, h: 108, type: 'calendar' }, { w: 178, h: 108, type: 'heat' },
  { w: 200, h: 108, type: 'quote2' }, { w: 168, h: 108, type: 'spark' },
  { w: 196, h: 108, type: 'steps' },
];

function CardCarousel() {
  const triple1 = [...ROW1_SPECS, ...ROW1_SPECS, ...ROW1_SPECS];
  const triple2 = [...ROW2_SPECS, ...ROW2_SPECS, ...ROW2_SPECS];
  return (
    <section style={{ padding: '120px 0', overflow: 'hidden', position: 'relative' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', marginBottom: 52 }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, marginBottom: 20, fontFamily: fs }}>
              20+ tipos de blocos visuais
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 500, letterSpacing: '-0.03em', color: C.text, lineHeight: 1.15, fontFamily: fs }}>
              Cada conteúdo tem o card{' '}
              <em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.5 }}>perfeito</em>
            </h2>
          </div>
        </FadeIn>
      </div>

      {/* Row 1: scroll left — 3× content for bulletproof seamless loop */}
      <div style={{ marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 12, width: 'max-content', animation: 'carousel-left 52s linear infinite', willChange: 'transform' }}>
          {triple1.map((card, i) => (
            <div key={i} style={{ width: card.w, height: card.h, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, flexShrink: 0, overflow: 'hidden' }}>
              {renderCard(card.type)}
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: scroll right — different cards, different speed */}
      <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 12, width: 'max-content', animation: 'carousel-right 60s linear infinite', willChange: 'transform' }}>
          {triple2.map((card, i) => (
            <div key={i} style={{ width: card.w, height: card.h, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, flexShrink: 0, overflow: 'hidden' }}>
              {renderCard(card.type)}
            </div>
          ))}
        </div>
      </div>

      {/* Edge fades */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 140, background: `linear-gradient(to right, ${C.bg}, transparent)`, pointerEvents: 'none', zIndex: 2 }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 140, background: `linear-gradient(to left, ${C.bg}, transparent)`, pointerEvents: 'none', zIndex: 2 }} />

      <style>{`
        @keyframes carousel-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        @keyframes carousel-right {
          0%   { transform: translateX(calc(-100% / 3)); }
          100% { transform: translateX(0); }
        }
        .carousel-wrap:hover > div { animation-play-state: paused; }
      `}</style>
    </section>
  );
}

/* ─── WHY DIFFERENT ──────────────────────────────────── */
function WhyDifferent() {
  const competitors = ['Miro', 'Notion', 'Coggle', 'Canva', 'PowerPoint'];
  const rows = [
    { feat: '20+ blocos visuais (gráficos, timelines, etc)', vals: [true, false, false, false, false, false] },
    { feat: 'Geração automática em segundos', vals: [true, false, false, false, false, false] },
    { feat: 'Canvas interativo com pan & zoom', vals: [true, true, false, true, false, false] },
    { feat: 'Layout vertical para Reels/Stories', vals: [true, false, false, false, false, false] },
    { feat: 'Expansão de conteúdo automática', vals: [true, false, false, false, false, false] },
    { feat: 'Feito para criadores de conteúdo', vals: [true, false, false, false, false, false] },
    { feat: 'Checklist, métricas, timelines nativas', vals: [true, '⚠', false, false, false, false] },
    { feat: 'Edição inline sem abrir modais', vals: [true, true, false, '⚠', false, false] },
    { feat: 'Histórico ilimitado de mapas', vals: [true, '⚠', true, '⚠', false, false] },
    { feat: 'Conexões bezier personalizadas', vals: [true, true, '⚠', false, false, false] },
  ];
  return (
    <section style={{ padding: '120px 24px', background: C.bg2 }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, marginBottom: 20, fontFamily: fs }}>Por que somos diferentes</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 500, letterSpacing: '-0.03em', color: C.text, lineHeight: 1.15, marginBottom: 14, fontFamily: fs }}>
              A única ferramenta feita
              <br /><em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.5 }}>para o seu tipo de conteúdo</em>
            </h2>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="why-different-table-wrap" style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: `1.8fr repeat(${competitors.length + 1}, minmax(48px, 1fr))`, padding: '14px 20px', borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)', overflowX: 'auto', minWidth: 0 }} className="why-different-grid">
              <span style={{ fontSize: 11, color: C.faint, fontFamily: fs }}>Funcionalidade</span>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.text, fontFamily: fs, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={10} color={C.muted} /> MindWeavr
                </span>
              </div>
              {competitors.map(comp => (
                <div key={comp} style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 10, color: C.faint, fontFamily: fs }}>{comp}</span>
                </div>
              ))}
            </div>
            {rows.map((row, i) => (
              <div key={i} className="why-different-grid" style={{
                display: 'grid', gridTemplateColumns: `1.8fr repeat(${competitors.length + 1}, minmax(48px, 1fr))`,
                padding: '11px 20px', borderBottom: i < rows.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none',
                transition: 'background 0.15s', minWidth: 0,
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.015)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                <span style={{ fontSize: 12, fontWeight: 300, color: C.muted, fontFamily: fs }}>{row.feat}</span>
                {row.vals.map((val, vi) => (
                  <div key={vi} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {val === true ? (
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={10} color={C.accent} strokeWidth={2.5} />
                      </div>
                    ) : val === false ? (
                      <X size={13} color={C.vfaint} strokeWidth={1.5} />
                    ) : (
                      <span style={{ fontSize: 13 }}>{val}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS CAROUSEL ──────────────────────────── */
function Testimonials() {
  const testimonials = [
    { name: 'Lucas Ferreira', role: 'YouTuber · 280K inscritos', handle: '@lucasferreira', avatar: 'LF', text: 'Antes eu passava horas montando apresentações no Canva. Agora em 30 segundos tenho um mapa visual completo para os meus vídeos. Minha retenção subiu 40%.' },
    { name: 'Ana Costa', role: 'Infoprodutora', handle: '@anacostacursos', avatar: 'AC', text: 'Uso o MindWeavr para estruturar cada módulo dos meus cursos. Meus alunos dizem que é muito mais fácil de entender do que textos ou slides normais.' },
    { name: 'Rafael Souza', role: 'Coach · 150K seguidores', handle: '@rafaelsouzacoach', avatar: 'RS', text: 'Ferramenta incrível. Coloco meu conteúdo e o sistema organiza tudo em um mapa visual super profissional. Meus clientes ficam impressionados.' },
    { name: 'Mariana Lima', role: 'Criadora de conteúdo', handle: '@marianalimaoficial', avatar: 'ML', text: 'Uso para criar roteiros visuais dos meus Reels. O layout vertical é perfeito e meus seguidores sempre pedem o link da ferramenta.' },
    { name: 'Pedro Alves', role: 'Infoprodutor · Vendas online', handle: '@pedroalvespro', avatar: 'PA', text: 'Revolucionou o jeito que apresento meus produtos. Agora faço um mapa visual do módulo antes de cada live e o resultado é muito melhor.' },
  ];
  const all = [...testimonials, ...testimonials];

  return (
    <section style={{ padding: '120px 0', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', marginBottom: 56 }}>
        <FadeIn>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, marginBottom: 20, fontFamily: fs }}>
              O que criadores estão dizendo
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 500, letterSpacing: '-0.03em', color: C.text, lineHeight: 1.15, fontFamily: fs }}>
              Aprovado por quem cria conteúdo
            </h2>
          </div>
        </FadeIn>
      </div>

      {/* Carousel */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 16, width: 'max-content', animation: 'carousel-left 45s linear infinite', paddingBottom: 4 }}>
          {all.map((t, i) => (
            <div key={i} style={{ width: 320, flexShrink: 0, padding: '24px 24px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 20 }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                {Array.from({ length: 5 }).map((_, si) => <Star key={si} size={11} fill={C.accent} color={C.accent} />)}
              </div>
              <Quote size={16} color={C.vfaint} style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 13, fontWeight: 300, color: C.muted, lineHeight: 1.7, marginBottom: 18, fontFamily: fs }}>{t.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: C.text, flexShrink: 0, fontFamily: fs }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text, fontFamily: fs }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 300, fontFamily: fs, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ color: C.faint }}>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    {t.handle}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edge fades */}
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 120, background: `linear-gradient(to right, ${C.bg}, transparent)`, pointerEvents: 'none', zIndex: 2 }} />
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 120, background: `linear-gradient(to left, ${C.bg}, transparent)`, pointerEvents: 'none', zIndex: 2 }} />
      </div>
    </section>
  );
}

/* ─── PRICING ────────────────────────────────────────── */
function PricingSection() {
  const { user } = useAuth();

  const plans = [
    {
      id: 'essencial', name: 'Essencial', monthly: 27, desc: 'Para começar a criar mapas visuais incríveis', popular: false,
      checkoutUrl: 'https://go.perfectpay.com.br/PPU38CQ8AMM',
      features: ['5 Mapas disponíveis', '20 tipos de blocos interativos', 'Dashboard interativo', 'Histórico de mapas'],
      notIncluded: ['Compartilhamento via link', 'Exportar PDF', 'Suporte prioritário'],
    },
    {
      id: 'creator', name: 'Creator', monthly: 47, desc: 'Para criadores de conteúdo sérios', popular: true,
      checkoutUrl: 'https://go.perfectpay.com.br/PPU38CQ8AMR',
      features: ['10 Mapas disponíveis', '50 tipos de blocos interativos', 'Tudo do Essencial', 'Compartilhamento via link'],
      notIncluded: ['Exportar PDF', 'Suporte prioritário'],
    },
    {
      id: 'pro', name: 'Pro', monthly: 97, desc: 'Para infoprodutores e equipes avançadas', popular: false,
      checkoutUrl: 'https://go.perfectpay.com.br/PPU38CQ8AMP',
      features: ['Mapas ilimitados', 'Blocos ilimitados', 'Tudo do Creator', 'Baixar mapa em PDF', 'Suporte prioritário', 'Comunidade fechada'],
      notIncluded: [],
    },
  ];

  return (
    <section id="pricing" style={{ padding: '120px 24px' }}>
      <div style={{ maxWidth: 1050, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, marginBottom: 20, fontFamily: fs }}>Planos e preços</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 500, letterSpacing: '-0.03em', color: C.text, lineHeight: 1.15, marginBottom: 14, fontFamily: fs }}>Simples e sem surpresas</h2>
            <p style={{ fontSize: 15, fontWeight: 300, color: C.muted, maxWidth: 400, margin: '0 auto', fontFamily: fs }}>Escolha o plano ideal para o seu volume de criação.</p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, alignItems: 'stretch' }} className="pricing-grid">
          {plans.map((plan, i) => (
            <FadeIn key={plan.id} delay={i * 0.08} style={{ display: 'flex' }}>
              <div style={{
                flex: 1, padding: '28px', display: 'flex', flexDirection: 'column',
                background: plan.popular ? 'rgba(255,255,255,0.08)' : C.card,
                border: `1px solid ${plan.popular ? 'rgba(255,255,255,0.2)' : C.border}`,
                borderRadius: 22, position: 'relative',
                boxShadow: plan.popular ? '0 24px 72px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                transform: plan.popular ? 'scale(1.025)' : 'none',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => { if (!plan.popular) (e.currentTarget as HTMLDivElement).style.borderColor = C.borderL; }}
                onMouseLeave={e => { if (!plan.popular) (e.currentTarget as HTMLDivElement).style.borderColor = C.border; }}>
                {plan.popular && <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: 100, background: C.text, color: C.bg, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: fs }}>Mais popular</div>}

                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 4, fontFamily: fs }}>{plan.name}</div>
                  <p style={{ fontSize: 12, fontWeight: 300, color: C.muted, lineHeight: 1.5, marginBottom: 16, fontFamily: fs }}>{plan.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 300, color: C.muted, fontFamily: fs }}>R$</span>
                    <span style={{ fontSize: 40, fontWeight: 600, color: C.text, letterSpacing: '-0.04em', lineHeight: 1, fontFamily: fs }}>{plan.monthly}</span>
                    <span style={{ fontSize: 13, fontWeight: 300, color: C.muted, fontFamily: fs }}>/mês</span>
                  </div>
                </div>

                {/* CTA — sempre abre checkout Perfect Pay (usuário logado pode precisar assinar/renovar) */}
                <a
                  href={plan.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', width: '100%', padding: '12px 20px', borderRadius: 100, textAlign: 'center', textDecoration: 'none', fontSize: 13, fontWeight: 500, marginBottom: 24, background: plan.popular ? C.text : 'transparent', border: `1px solid ${plan.popular ? 'transparent' : C.borderL}`, color: plan.popular ? C.bg : C.muted, transition: 'all 0.2s', fontFamily: fs, boxSizing: 'border-box' }}
                  onMouseEnter={e => { if (plan.popular) { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; } else { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLAnchorElement).style.color = C.text; } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; if (!plan.popular) { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = C.muted; } }}>
                  Assinar {plan.name}
                </a>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  {plan.features.map((feat, fi) => (
                    <div key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                      <div style={{ width: 15, height: 15, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <Check size={8} color={C.accent} strokeWidth={2.5} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 300, color: C.muted, fontFamily: fs }}>{feat}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feat, fi) => (
                    <div key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                      <div style={{ width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <X size={10} color='rgba(255,255,255,0.2)' strokeWidth={1.5} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.25)', fontFamily: fs, textDecoration: 'line-through', textDecorationColor: 'rgba(255,255,255,0.15)' }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .pricing-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────── */
function CTASection() {
  const { user } = useAuth();
  return (
    <section className="landing-cta-section" style={{ padding: '120px 24px', background: C.bg2 }}>
      <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <div className="landing-cta-inner" style={{ padding: '64px 48px', background: C.card, border: `1px solid ${C.borderL}`, borderRadius: 28, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 500, letterSpacing: '-0.035em', color: C.text, lineHeight: 1.15, marginBottom: 16, fontFamily: fs }}>
              Sua audiência merece
              <br /><em style={{ fontFamily: fp, fontStyle: 'italic', fontWeight: 400, opacity: 0.55 }}>muito mais do que texto.</em>
            </h2>
            <p style={{ fontSize: 15, fontWeight: 300, color: C.muted, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 36px', fontFamily: fs }}>
              Junte-se a centenas de criadores que já transformaram o jeito de apresentar conteúdo.
            </p>
            <Link href={user ? '/app' : '/login'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 100, background: C.text, color: C.bg, fontSize: 14, fontWeight: 500, textDecoration: 'none', boxShadow: '0 4px 24px rgba(255,255,255,0.1)', transition: 'all 0.2s', fontFamily: fs }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              {user ? 'Criar meu próximo mapa' : 'Começar agora'} <ArrowRight size={15} />
            </Link>
            <p style={{ fontSize: 11, color: C.faint, fontWeight: 300, marginTop: 16, fontFamily: fs }}>Sem taxas ocultas · Cancele quando quiser</p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── FOOTER ─────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: '48px 24px', background: C.bg }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
            <img src="/logo-mindweavr-black.png" alt="MindWeavr" style={{ height: 22, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: C.text, letterSpacing: '-0.02em', fontFamily: fs }}>MindWeavr</span>
          </div>
          <p style={{ fontSize: 12, color: C.faint, fontWeight: 300, maxWidth: 260, lineHeight: 1.65, fontFamily: fs }}>Transformando o jeito que criadores apresentam suas ideias.</p>
        </div>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {[{ label: 'Funcionalidades', href: '#features' }, { label: 'Como funciona', href: '#how' }, { label: 'Preços', href: '#pricing' }, { label: 'Entrar', href: '/login' }].map(l => (
            <a key={l.label} href={l.href} style={{ fontSize: 12, color: C.faint, textDecoration: 'none', fontWeight: 300, transition: 'color 0.2s', fontFamily: fs }}
              onMouseEnter={e => (e.currentTarget.style.color = C.muted)}
              onMouseLeave={e => (e.currentTarget.style.color = C.faint)}>
              {l.label}
            </a>
          ))}
        </div>
        <p style={{ fontSize: 11, color: C.vfaint, fontWeight: 300, fontFamily: fs }}>© {new Date().getFullYear()} MindWeavr</p>
      </div>
    </footer>
  );
}

/* ─── PAGE ───────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
      {/* UTMify Pixel + Facebook Ads tracking (página de vendas) */}
      <Script id="utmify-pixel" strategy="afterInteractive">
        {`window.pixelId = "69a4d1000134f2f5bf10ada0";
  var a = document.createElement("script");
  a.setAttribute("async", "");
  a.setAttribute("defer", "");
  a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
  document.head.appendChild(a);`}
      </Script>
      <Script
        src="https://cdn.utmify.com.br/scripts/utms/latest.js"
        strategy="afterInteractive"
        data-utmify-prevent-xcod-sck
        data-utmify-prevent-subids
      />
      <Navbar />
      <style>{`
        @media (max-width: 768px) {
          .landing-hero { padding-top: 100px !important; padding-left: 16px !important; padding-right: 16px !important; padding-bottom: 60px !important; }
          .landing-cta-btn { padding: 16px 28px !important; font-size: 15px !important; min-height: 52px; min-width: 160px; }
          .landing-dashboard-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; padding: 0 16px; }
          .landing-dashboard-wrap > div { min-width: 320px; }
          .why-different-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .why-different-grid { min-width: 560px; }
          .landing-cta-section { padding: 80px 16px !important; }
          .landing-cta-inner { padding: 40px 24px !important; }
        }
      `}</style>
      <HeroSection />
      <PainSection />
      <HowSection />
      <FeaturesSection />
      <CardCarousel />
      <WhyDifferent />
      <PricingSection />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
}

