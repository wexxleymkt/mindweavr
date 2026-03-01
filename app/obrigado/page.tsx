'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Check, Mail, UserPlus, LogIn, MessageCircle, ArrowRight } from 'lucide-react';

const WHATSAPP_NUMBER = '5511999999999'; // Substitua pelo número real
const WHATSAPP_MSG    = encodeURIComponent('Olá! Acabei de comprar o MindWeavr e preciso de ajuda para criar minha conta.');

const steps = [
  {
    icon: Mail,
    num: '1',
    title: 'Confira seu e-mail',
    desc: 'A Perfect Pay enviou a confirmação da compra. O e-mail usado na compra é o único válido para criar sua conta no MindWeavr.',
  },
  {
    icon: UserPlus,
    num: '2',
    title: 'Cadastre-se com esse e-mail',
    desc: 'Acesse mindweavr.app, clique em "Entrar" e crie sua conta usando exatamente o mesmo e-mail da compra.',
  },
  {
    icon: LogIn,
    num: '3',
    title: 'Pronto',
    desc: 'Ao fazer login, seu plano é ativado automaticamente. Não é necessário fazer mais nada.',
  },
];

export default function ObrigadoPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';
  const logoFilter = isDark ? 'brightness(0) invert(1)' : 'none';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 40 }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo-mindweavr-black.png" alt="MindWeavr" style={{ height: 24, width: 'auto', objectFit: 'contain', filter: logoFilter }} />
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>MindWeavr</span>
        </Link>
      </motion.div>

      {/* Conteúdo principal — sem fundo cinza ao redor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          width: '100%',
          maxWidth: 880,
          padding: '0 24px',
        }}
      >
        {/* Ícone de confirmação */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.25 }}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--color-bg2)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text)',
            }}
          >
            <Check size={28} strokeWidth={2.2} />
          </motion.div>
        </div>

        {/* Título — maior e em destaque */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 10, lineHeight: 1.2 }}>
            Compra confirmada.
          </h1>
          <p style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text)', opacity: 0.9, marginBottom: 8, lineHeight: 1.4 }}>
            Ative sua conta em minutos.
          </p>
          <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.55, maxWidth: 480, margin: '0 auto' }}>
            Bem-vindo ao MindWeavr. Siga os passos abaixo para ativar sua conta e acessar o app.
          </p>
        </div>

        {/* Passos — horizontal, blocos largos (referência das imagens) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
          marginBottom: 28,
        }}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            const numStr = String(i + 1).padStart(2, '0');
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08, duration: 0.35 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  padding: '24px 20px',
                  minHeight: 200,
                  position: 'relative',
                  borderRadius: 16,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg2)',
                }}
              >
                {/* Ícone canto superior esquerdo */}
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text)',
                  flexShrink: 0,
                  marginBottom: 12,
                }}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                {/* Número grande e discreto (faded) */}
                <div style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  fontSize: 32,
                  fontWeight: 700,
                  color: 'var(--color-faint)',
                  opacity: 0.35,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}>
                  {numStr}
                </div>
                {/* Título em destaque */}
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.35, marginBottom: 10 }}>
                  {step.title}
                </div>
                {/* Descrição com boa leitura */}
                <div style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.55, flex: 1 }}>
                  {step.desc}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Aviso — mesmo largura dos passos, texto em uma linha */}
        <div style={{
          marginBottom: 28,
          padding: '14px 20px',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg2)',
          width: '100%',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 13,
            color: 'var(--color-muted)',
            lineHeight: 1.55,
            margin: 0,
            whiteSpace: 'nowrap',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Importante:</span> Só o e-mail usado na compra libera acesso ao plano. Se você se cadastrar com outro e-mail, o plano não será ativado.
          </p>
        </div>

        {/* Botões: Criar conta + Suporte lado a lado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 14 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 24px',
                borderRadius: 12,
                background: 'var(--color-text)',
                color: 'var(--color-bg)',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
            >
              Criar minha conta agora
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </motion.div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text)',
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'border-color 0.18s, background 0.18s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = 'var(--color-border-hover)';
              el.style.background = 'var(--color-bg2)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = 'var(--color-border)';
              el.style.background = 'transparent';
            }}
          >
            <MessageCircle size={16} strokeWidth={1.8} />
            Suporte via WhatsApp
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
