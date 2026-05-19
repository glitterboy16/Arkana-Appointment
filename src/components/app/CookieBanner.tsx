import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'arkana.cookies.consent.v1';

type Consent = 'accepted' | 'rejected';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const persist = (value: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // localStorage bloqueado (modo privado): el banner volverá a aparecer
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      style={{
        position: 'fixed',
        zIndex: 9999,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        boxSizing: 'border-box',
        padding: 'clamp(14px, 3.5vw, 20px) clamp(16px, 4vw, 32px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + clamp(14px, 3.5vw, 20px))',
        background: 'rgba(10, 10, 14, 0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.45)',
        color: '#FAFAFA',
        fontFamily: "'SF Pro Display','Inter',sans-serif",
        fontSize: 13,
        lineHeight: 1.55,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: '1 1 280px', minWidth: 0 }}>
        Usamos solo cookies técnicas necesarias para que la app funcione. No hay rastreo
        publicitario.{' '}
        <Link
          to="/privacidad"
          style={{ color: '#648DFF', textDecoration: 'underline', textUnderlineOffset: 2 }}
        >
          Más información
        </Link>
        .
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => persist('rejected')}
          style={{
            padding: '9px 16px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'transparent',
            color: 'rgba(250,250,250,0.85)',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Solo necesarias
        </button>
        <button
          type="button"
          onClick={() => persist('accepted')}
          style={{
            padding: '9px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#648DFF',
            color: '#FAFAFA',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
