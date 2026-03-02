'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const C = {
  bg:      '#0a0a0a',
  card:    '#111111',
  border:  'rgba(255,255,255,0.08)',
  borderL: 'rgba(255,255,255,0.14)',
  text:    '#ffffff',
  muted:   'rgba(255,255,255,0.55)',
  faint:   'rgba(255,255,255,0.3)',
};
const fs = 'var(--font-inter, Inter, sans-serif)';
const fp = 'var(--font-playfair, Georgia, serif)';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRecover, setShowRecover] = useState(false);
  const [recoverSent, setRecoverSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) router.push('/app');
  }, [user, authLoading, router]);

  // Format WhatsApp input: keep only digits, apply (XX) XXXXX-XXXX mask
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    let masked = digits;
    if (digits.length > 2) masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length > 7) masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    setWhatsapp(masked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (mode === 'login') {
        if (showRecover) {
          if (!email.trim()) throw new Error('Informe seu email para recuperar a senha.');
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/login?recovered=1` });
          if (error) throw error;
          setRecoverSent(true);
          setSuccess('Enviamos um link para redefinir sua senha no seu email. Verifique sua caixa de entrada.');
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          router.push('/app');
        }
      } else {
        if (password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');
        if (password !== confirmPassword) throw new Error('As senhas não coincidem. Confira e tente novamente.');

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              whatsapp: whatsapp.replace(/\D/g, ''),
            },
          },
        });
        if (error) throw error;
        setSuccess('Conta criada! Confirme seu email (se necessário) e faça login.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(
        msg.includes('Invalid login')        ? 'Email ou senha incorretos.'
        : msg.includes('already registered') ? 'Este email já está cadastrado.'
        : msg.includes('Email not confirmed') ? 'Confirme seu email antes de entrar.'
        : msg
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden', fontFamily: fs }}>

      {/* Glow */}
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Back */}
      <Link href="/" style={{ position: 'absolute', top: 24, left: 24, display: 'inline-flex', alignItems: 'center', gap: 6, color: C.faint, textDecoration: 'none', fontSize: 13, fontWeight: 300, fontFamily: fs, transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.color = C.text)}
        onMouseLeave={e => (e.currentTarget.style.color = C.faint)}>
        <ArrowLeft size={14} />
        Voltar
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 400, background: C.card, border: `1px solid ${C.border}`, borderRadius: 22, padding: '40px 36px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
            <img
              src="/logo-mindweavr-black.png"
              alt="MindWeavr"
              style={{ height: 28, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
            />
            <span style={{ fontSize: 18, fontWeight: 500, color: C.text, letterSpacing: '-0.03em', fontFamily: fs }}>
              MindWeavr
            </span>
          </div>
          <p style={{ fontSize: 13, color: C.faint, fontWeight: 300, fontFamily: fs }}>
            {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 3, marginBottom: 24 }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(null); setShowRecover(false); setRecoverSent(false); setConfirmPassword(''); }}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 400, cursor: 'pointer', transition: 'all 0.2s', background: mode === m ? 'rgba(255,255,255,0.08)' : 'transparent', color: mode === m ? C.text : C.faint, fontFamily: fs }}>
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Signup-only fields */}
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Field
                  icon={<User size={13} />}
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
                <Field
                  icon={<Phone size={13} />}
                  type="tel"
                  placeholder="WhatsApp (XX) XXXXX-XXXX"
                  value={whatsapp}
                  onChange={handleWhatsappChange}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Field icon={<Mail size={13} />} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />

          {mode === 'login' && showRecover ? (
            <p style={{ fontSize: 12, color: C.muted, fontFamily: fs }}>
              Digite o email da sua conta e enviaremos um link para redefinir a senha.
            </p>
          ) : (
            <>
              <div style={{ position: 'relative' }}>
                <Field
                  icon={<Lock size={13} />}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required={!showRecover}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.faint, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>

              {mode === 'signup' && (
                <Field
                  icon={<Lock size={13} />}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              )}
            </>
          )}

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(220,60,60,0.08)', border: '1px solid rgba(220,60,60,0.2)', color: 'rgba(255,130,130,0.9)', fontSize: 12, fontWeight: 300, fontFamily: fs }}>
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(100,210,130,0.08)', border: '1px solid rgba(100,210,130,0.2)', color: 'rgba(140,210,160,0.9)', fontSize: 12, fontWeight: 300, fontFamily: fs }}>
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {mode === 'login' && showRecover && (
            <button type="button" onClick={() => { setShowRecover(false); setError(null); setSuccess(null); setRecoverSent(false); }}
              style={{ marginTop: 4, padding: '8px 12px', border: 'none', background: 'transparent', color: C.muted, fontSize: 12, cursor: 'pointer', fontFamily: fs }}>
              ← Voltar ao login
            </button>
          )}

          <button type="submit" disabled={loading}
            style={{ marginTop: 4, padding: '13px 20px', borderRadius: 12, border: 'none', background: loading ? 'rgba(255,255,255,0.06)' : C.text, color: loading ? C.faint : '#0a0a0a', fontSize: 14, fontWeight: 500, cursor: loading ? 'default' : 'pointer', transition: 'all 0.2s', fontFamily: fs, letterSpacing: '-0.01em' }}
            onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 13, height: 13, border: `2px solid ${C.border}`, borderTopColor: C.muted, borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                {mode === 'login' && showRecover ? 'Enviando...' : mode === 'login' ? 'Entrando...' : 'Criando conta...'}
              </span>
            ) : mode === 'login' && showRecover ? 'Enviar link de recuperação' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        {mode === 'login' && !showRecover && !recoverSent && (
          <p style={{ marginTop: 10, textAlign: 'center', fontSize: 12, fontFamily: fs }}>
            <button type="button" onClick={() => setShowRecover(true)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 12 }}>
              Esqueci minha senha
            </button>
          </p>
        )}

        {mode === 'login' && (
          <p style={{ marginTop: 18, textAlign: 'center', fontSize: 12, color: C.faint, fontWeight: 300, fontFamily: fs }}>
            Ainda não tem conta?{' '}
            <a href="/#pricing" style={{ color: C.muted, fontSize: 12, fontWeight: 400, textDecoration: 'underline', fontFamily: fs }}>
              Escolha um plano
            </a>
          </p>
        )}
        {mode === 'signup' && (
          <p style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 300, lineHeight: 1.5, fontFamily: fs }}>
            Após criar a conta, ative um plano com o mesmo e-mail para acessar a aplicação.
          </p>
        )}

        <p style={{ marginTop: mode === 'login' ? 8 : 18, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 300, lineHeight: 1.5, fontFamily: fs }}>
          Ao continuar você concorda com nossos{' '}
          <span style={{ color: C.faint }}>Termos de Uso</span> e{' '}
          <span style={{ color: C.faint }}>Política de Privacidade</span>
        </p>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Field({ icon, type, placeholder, value, onChange, required }: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{ width: '100%', padding: '12px 14px 12px 38px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#ffffff', fontSize: 13, fontWeight: 300, outline: 'none', fontFamily: 'var(--font-inter, Inter, sans-serif)', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
      />
    </div>
  );
}
