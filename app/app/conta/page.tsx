'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, Crown, Map, Calendar, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

const PLAN_LABELS: Record<string, string> = {
  essencial: 'Essencial',
  creator:   'Creator',
  pro:       'Pro',
};

const PLAN_DETAILS: Record<string, { maps: string; blocks: string; color: string }> = {
  essencial: { maps: '5 mapas',      blocks: '20 tipos de blocos',       color: 'rgba(255,255,255,0.3)' },
  creator:   { maps: '10 mapas',     blocks: '50 tipos de blocos',       color: 'rgba(255,255,255,0.55)' },
  pro:       { maps: 'Ilimitados',   blocks: 'Blocos ilimitados',        color: 'rgba(255,255,255,0.85)' },
};

export default function ContaPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const planDetails = PLAN_DETAILS[profile?.plan ?? 'essencial'];

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: newName.trim(), updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      setEditName(false);
      setMsg('Nome atualizado com sucesso!');
    } catch {
      setMsg('Erro ao atualizar nome.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d?: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

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
        <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Minha conta</span>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>

        {/* Avatar + nome */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: `1px solid ${C.borderL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: '-0.02em' }}>
              {(profile?.full_name ?? user?.email ?? '?').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 500, color: C.text, letterSpacing: '-0.02em' }}>
                {profile?.full_name || 'Usuário'}
              </div>
              <div style={{ fontSize: 13, color: C.muted, fontWeight: 300, marginTop: 2 }}>{user?.email}</div>
            </div>
          </div>
        </motion.div>

        {/* Plan card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.06 }}>
          <div style={{ padding: '20px 24px', borderRadius: 16, border: `1px solid ${C.borderL}`, background: 'rgba(255,255,255,0.04)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Crown size={15} color={planDetails.color} />
                <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>Plano {PLAN_LABELS[profile?.plan ?? 'essencial']}</span>
              </div>
              <button onClick={() => router.push('/#pricing')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 100, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: fs, transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.borderL; (e.currentTarget as HTMLButtonElement).style.color = C.text; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.muted; }}>
                Ver planos
              </button>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { icon: <Map size={11} />, label: planDetails.maps },
                { icon: <Shield size={11} />, label: planDetails.blocks },
                { icon: <Calendar size={11} />, label: `Ativo desde ${formatDate(profile?.credits_reset_at)}` },
              ].map((item, i) => (
                <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, fontSize: 11, color: C.muted, fontWeight: 300 }}>
                  {item.icon} {item.label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Info fields */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
          <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 20 }}>

            {/* Nome */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <User size={13} color={C.faint} />
                  <div>
                    <div style={{ fontSize: 10, color: C.faint, fontWeight: 300, marginBottom: 2 }}>Nome completo</div>
                    {editName ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          autoFocus
                          style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.borderL}`, borderRadius: 8, padding: '5px 10px', color: C.text, fontSize: 13, fontFamily: fs, outline: 'none', width: 200 }}
                        />
                        <button onClick={handleSaveName} disabled={saving}
                          style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: C.text, color: C.bg, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: fs }}>
                          {saving ? '...' : 'Salvar'}
                        </button>
                        <button onClick={() => { setEditName(false); setNewName(profile?.full_name ?? ''); }}
                          style={{ padding: '5px 8px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.faint, fontSize: 12, cursor: 'pointer', fontFamily: fs }}>
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 400 }}>{profile?.full_name || '—'}</div>
                    )}
                  </div>
                </div>
                {!editName && (
                  <button onClick={() => { setEditName(true); setNewName(profile?.full_name ?? ''); }}
                    style={{ background: 'none', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontFamily: fs, transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.borderL; (e.currentTarget as HTMLButtonElement).style.color = C.text; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.faint; }}>
                    Editar
                  </button>
                )}
              </div>
            </div>

            {/* Email */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={13} color={C.faint} />
                <div>
                  <div style={{ fontSize: 10, color: C.faint, fontWeight: 300, marginBottom: 2 }}>Email</div>
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 400 }}>{user?.email}</div>
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={13} color={C.faint} />
                <div>
                  <div style={{ fontSize: 10, color: C.faint, fontWeight: 300, marginBottom: 2 }}>WhatsApp</div>
                  <div style={{ fontSize: 13, color: profile?.whatsapp ? C.text : C.faint, fontWeight: 400 }}>
                    {profile?.whatsapp ? `(${profile.whatsapp.slice(0, 2)}) ${profile.whatsapp.slice(2, 7)}-${profile.whatsapp.slice(7)}` : 'Não informado'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feedback message */}
        {msg && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: msg.includes('Erro') ? '#f87171' : 'rgba(100,210,130,0.9)', fontWeight: 300 }}>
            {msg}
          </motion.p>
        )}
      </div>
    </div>
  );
}
