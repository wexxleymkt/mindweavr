'use client';

import { motion } from 'framer-motion';

export function WelcomeScreen() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '12px',
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: '11px',
          fontWeight: 300,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-faint)',
        }}
      >
        Digite um tema acima para começar
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{
          fontSize: '80px',
          opacity: 0.06,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        ◎
      </motion.div>
    </div>
  );
}
