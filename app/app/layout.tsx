'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const AUTH_LOAD_TIMEOUT_MS = 12_000;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), AUTH_LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  const done = loading === false || timedOut;

  useEffect(() => {
    if (done && !user) {
      router.push('/login');
    }
  }, [user, done, router]);

  if (loading && !timedOut) {
    return (
      <div
        suppressHydrationWarning
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '2px solid var(--color-border)',
            borderTopColor: 'var(--color-text)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 300 }}>
          Carregando...
        </span>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
