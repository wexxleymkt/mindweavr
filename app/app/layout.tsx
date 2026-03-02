'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '2px solid var(--color-border)',
          borderTopColor: 'var(--color-text)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
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
