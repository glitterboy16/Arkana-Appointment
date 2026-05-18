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
        left: 'max(16px, env(safe-area-inset-left))',
        right: 'max(16px, env(safe-area-inset-right))',
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        maxWidth: 520,
        marginLeft: 'auto',
        marginRight: 'auto',
        background: 'rgba(10, 10, 14, 0.92)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 14,
        padding: '16px 18px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
        color: '#FAFAFA',
        fontFamily: "'SF Pro Display','Inter',sans-serif",
        fontSize: 13,
        lineHeight: 1.55,
      }}
    >
      <div style={{ marginBottom: 14 }}>
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
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => persist('rejected')}
          style={{
            padding: '8px 14px',
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
            padding: '8px 14px',
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
