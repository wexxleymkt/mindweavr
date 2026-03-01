'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sun, Moon, Monitor, Bell, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

const C = {
  bg:      '#0a0a0a',
  card:    '#111111',
  border:  'rgba(255,255,255,0.08)',
  borderL: 'rgba(255,255,255,0.14)',
  text:    '#f0f0f0',
  muted:   'rgba(255,255,255,0.55)',
  faint:   'rgba(255,255,255,0.3)',
};
const fs = 'var(--font-inter, Inter, sans-serif)';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: C.faint, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
      <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {children}
      </div>
    </motion.div>
  );
}

function Row({ icon, label, children, last }: { icon: React.ReactNode; label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ padding: '16px 20px', borderBottom: last ? 'none' : `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ color: C.faint, display: 'flex' }}>{icon}</div>
        <span style={{ fontSize: 13, color: C.text, fontWeight: 400 }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [notifs, setNotifs] = useState(true);
  const [lang, setLang] = useState('pt-BR');

  const themes = [
    { id: 'dark',   icon: <Moon size={13} />,    label: 'Escuro' },
    { id: 'light',  icon: <Sun size={13} />,     label: 'Claro' },
    { id: 'system', icon: <Monitor size={13} />, label: 'Sistema' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: fs }}>
      {/* Top bar */}
      <div style={{ height: 54, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: `1px solid ${C.border}`, gap: 16 }}>
        <button onClick={() => router.push('/app')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.faint, cursor: 'pointer', fontSize: 13, fontWeight: 300, fontFamily: fs, transition: 'color 0.2s', padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = C.text)}
          onMouseLeave={e => (e.currentTarget.style.color = C.faint)}>
          <ArrowLeft size={14} /> Voltar ao app
        </button>
        <div style={{ width: 1, height: 18, background: C.border }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Configurações</span>
      </div>

      <div style={{ maxWidth: 580, margin: '0 auto', padding: '48px 24px' }}>

        {/* Aparência */}
        <Section title="Aparência">
          <Row icon={<Sun size={14} />} label="Tema" last>
            <div style={{ display: 'flex', gap: 4 }}>
              {themes.map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 100, border: `1px solid ${resolvedTheme === t.id || (t.id === 'system') ? C.borderL : C.border}`, background: resolvedTheme === t.id ? 'rgba(255,255,255,0.08)' : 'transparent', color: resolvedTheme === t.id ? C.text : C.faint, fontSize: 11, fontWeight: 400, cursor: 'pointer', fontFamily: fs, transition: 'all 0.2s' }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        {/* Idioma */}
        <Section title="Idioma e Região">
          <Row icon={<Globe size={14} />} label="Idioma" last>
            <select value={lang} onChange={e => setLang(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', color: C.text, fontSize: 12, fontFamily: fs, cursor: 'pointer', outline: 'none' }}>
              <option value="pt-BR">Português (BR)</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </Row>
        </Section>

        {/* Notificações */}
        <Section title="Notificações">
          <Row icon={<Bell size={14} />} label="Notificações do sistema" last>
            <button onClick={() => setNotifs(n => !n)}
              style={{ width: 40, height: 22, borderRadius: 100, border: 'none', background: notifs ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: C.text, position: 'absolute', top: 3, left: notifs ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
            </button>
          </Row>
        </Section>

        <p style={{ fontSize: 11, color: C.faint, fontWeight: 300, lineHeight: 1.6 }}>
          Mais configurações serão adicionadas em breve conforme a plataforma evolui.
        </p>
      </div>
    </div>
  );
}
