'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

const STEPS = [
  'Analisando o tema...',
  'Estruturando conceitos...',
  'Criando conexões...',
  'Adicionando detalhes...',
  'Finalizando...',
];

const STEP_INTERVAL_MS = 5500; // Um passo a cada ~5,5s — não dá falsa impressão de pronto

interface Props {
  prompt: string;
}

export function LoadingAnimation({ prompt }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';
  const logoFilter = isDark ? 'brightness(0) invert(1)' : 'none';

  const [currentStep, setCurrentStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '40px',
        padding: '40px 24px',
      }}
    >
      {/* Logo MindWeavr + círculos pulsando */}
      <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 38 + i * 24,
              height: 38 + i * 24,
              borderRadius: '50%',
              border: '2px solid var(--color-border)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
            }}
            animate={{
              scale: [1, 1.22, 1],
              opacity: [0.75, 0.35, 0.75],
              borderColor: ['var(--color-border)', 'var(--color-border-hover)', 'var(--color-border)'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.25,
            }}
          />
        ))}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/logo-mindweavr-black.png"
            alt="MindWeavr"
            style={{
              height: 42,
              width: 'auto',
              objectFit: 'contain',
              filter: logoFilter,
              opacity: 0.95,
            }}
          />
        </div>
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center' }}>
        <motion.h3
          style={{
            fontSize: '18px',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: 'var(--color-text)',
            marginBottom: '8px',
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Criando mapa mental
        </motion.h3>
        <p
          style={{
            fontSize: '12px',
            fontWeight: 300,
            color: 'var(--color-faint)',
            maxWidth: '280px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          &ldquo;{prompt}&rdquo;
        </p>
      </div>

      {/* Steps — só o passo atual em destaque, avança a cada ~5,5s */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '220px' }}>
        {STEPS.map((step, i) => (
          <motion.div
            key={step}
            initial={false}
            animate={{
              opacity: i === currentStep ? 1 : 0.35,
            }}
            transition={{ duration: 0.35 }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <motion.div
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: i === currentStep ? 'var(--color-accent)' : 'var(--color-faint)',
                flexShrink: 0,
              }}
              animate={{ scale: i === currentStep ? 1 : 0.6 }}
              transition={{ duration: 0.25 }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: i === currentStep ? 500 : 300,
                color: i === currentStep ? 'var(--color-text)' : 'var(--color-muted)',
              }}
            >
              {step}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Barra indeterminada — não “preenche” em 3s; indica que ainda está processando */}
      <div
        style={{
          width: '200px',
          height: '3px',
          background: 'var(--color-border)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            width: '40%',
            background: 'var(--color-muted)',
            borderRadius: '2px',
          }}
          animate={{ x: ['-100%', '350%'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <p style={{ fontSize: 11, color: 'var(--color-faint)', marginTop: -8 }}>
        Pode levar até 2–3 minutos com documentos
      </p>
    </div>
  );
}
