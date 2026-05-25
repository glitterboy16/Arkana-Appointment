import { useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LogoArkana } from '@/components/app/Shared';
import { Spinner } from '@/components/app/Spinner';
import MessageBox from '@/components/app/MessageBox';
import { useAuth } from '@/contexts/AuthContext';

export default function VerificarEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const { resendVerification } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setSending(true);
    setError(null);
    const { error: err } = await resendVerification(email || undefined);
    setSending(false);
    if (err) { setError(err); return; }
    setSent(true);
    setTimeout(() => setSent(false), 8000);
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <LogoArkana size={56} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={iconCircleStyle}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#648DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
        </div>

        <h1 style={titleStyle}>Confirma tu email</h1>
        <p style={subtitleStyle}>
          Te hemos enviado un enlace de verificación a{' '}
          {email
            ? <strong style={{ color: 'var(--app-text)', fontWeight: 600 }}>{email}</strong>
            : 'tu correo electrónico'
          }.
        </p>
        <p style={{ ...subtitleStyle, marginBottom: 24 }}>
          Haz clic en el enlace del email para activar tu cuenta. Si no lo ves,
          revisa la carpeta de spam.
        </p>

        {error && <MessageBox type="err" style={{ marginBottom: 14 }}>{error}</MessageBox>}
        {sent && <MessageBox type="ok" style={{ marginBottom: 14 }}>Enlace reenviado. Revisa tu bandeja de entrada.</MessageBox>}

        <button
          type="button"
          onClick={handleResend}
          disabled={sending}
          style={{
            ...secondaryBtnStyle,
            opacity: sending ? 0.7 : 1,
            cursor: sending ? 'not-allowed' : 'pointer',
            marginBottom: 12,
          }}
        >
          {sending && <Spinner size={14} color="#648DFF" trackColor="rgba(100,141,255,0.3)" />}
          {sending ? 'Enviando…' : 'Reenviar enlace de verificación'}
        </button>

        <Link to="/iniciarSesion" style={linkStyle}>
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: '100vh', background: 'var(--app-bg)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 24,
};

const cardStyle: CSSProperties = {
  width: '100%', maxWidth: 420,
  background: 'var(--app-surface)', border: '1px solid var(--app-border)',
  borderRadius: 16, padding: '32px 24px', backdropFilter: 'blur(12px)',
  color: 'var(--app-text)',
};

const iconCircleStyle: CSSProperties = {
  width: 60, height: 60, borderRadius: '50%',
  background: 'rgba(0,74,173,0.12)',
  border: '1px solid rgba(100,141,255,0.25)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

const titleStyle: CSSProperties = {
  fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 8,
  letterSpacing: '-0.01em', textAlign: 'center',
  color: 'var(--app-text)', fontFamily: "'SF Pro Display','Inter',sans-serif",
};

const subtitleStyle: CSSProperties = {
  fontSize: 13, color: 'var(--app-muted)', marginTop: 0, marginBottom: 8,
  textAlign: 'center', lineHeight: 1.6,
};

const secondaryBtnStyle: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  width: '100%', padding: '12px 0', borderRadius: 9,
  border: '1px solid rgba(100,141,255,0.35)',
  background: 'rgba(100,141,255,0.08)', color: '#648DFF', fontSize: 14, fontWeight: 600,
  fontFamily: 'inherit', cursor: 'pointer', boxSizing: 'border-box',
};

const linkStyle: CSSProperties = {
  display: 'block', textAlign: 'center', fontSize: 13,
  color: 'var(--app-muted)', textDecoration: 'none',
};
