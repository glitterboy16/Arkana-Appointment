import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { LogoArkana } from '@/components/app/Shared';
import { Spinner } from '@/components/app/Spinner';
import MessageBox from '@/components/app/MessageBox';
import { useAuth } from '@/contexts/AuthContext';
import { emailValido } from '@/lib/validators';

// Página dedicada para solicitar el enlace de recuperación de contraseña.
// El enlace enviado por email redirige a /nueva-password.

export default function RecuperarPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'err' | 'ok'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!emailValido(email)) {
      setMessage({ type: 'err', text: 'Introduce un email válido' });
      return;
    }
    setSending(true);
    const { error } = await requestPasswordReset(email);
    setSending(false);
    if (error) {
      setMessage({ type: 'err', text: error });
      return;
    }
    setMessage({
      type: 'ok',
      text: 'Si el email existe en Arkana, recibirás un enlace para restablecer tu contraseña. Revisa también la carpeta de spam.',
    });
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <LogoArkana size={56} />
        </div>

        <h1 style={titleStyle}>Recuperar contraseña</h1>
        <p style={subtitleStyle}>
          Introduce el email de tu cuenta y te enviaremos un enlace para
          elegir una contraseña nueva.
        </p>

        {message && (
          <MessageBox type={message.type} style={{ marginBottom: 14 }}>
            {message.text}
          </MessageBox>
        )}

        {message?.type !== 'ok' && (
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setMessage(null); }}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              required
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending}
              style={{
                ...primaryBtnStyle,
                opacity: sending ? 0.7 : 1,
                cursor: sending ? 'not-allowed' : 'pointer',
                marginTop: 4,
              }}
            >
              {sending && <Spinner size={14} color="#FAFAFA" trackColor="rgba(250,250,250,0.35)" />}
              {sending ? 'Enviando…' : 'Enviar enlace'}
            </button>
          </form>
        )}

        <Link
          to="/iniciarSesion"
          style={{ ...linkBtnStyle, marginTop: message?.type === 'ok' ? 0 : 16 }}
        >
          {message?.type === 'ok' ? 'Volver al inicio de sesión' : '← Volver'}
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
  borderRadius: 16, padding: '28px 24px', backdropFilter: 'blur(12px)',
  color: 'var(--app-text)',
};

const titleStyle: CSSProperties = {
  fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 8,
  letterSpacing: '-0.01em', textAlign: 'center',
  color: 'var(--app-text)', fontFamily: "'SF Pro Display','Inter',sans-serif",
};

const subtitleStyle: CSSProperties = {
  fontSize: 13, color: 'var(--app-muted)', marginTop: 0, marginBottom: 18,
  textAlign: 'center', lineHeight: 1.5,
};

const inputStyle: CSSProperties = {
  width: '100%', boxSizing: 'border-box', background: 'var(--app-input-bg)',
  border: '1px solid var(--app-border)', borderRadius: 8, padding: '11px 14px',
  color: 'var(--app-text)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
};

const primaryBtnStyle: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  width: '100%', padding: '12px 0', borderRadius: 9, border: 'none',
  background: '#004AAD', color: '#FAFAFA', fontSize: 14, fontWeight: 700,
  fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'none',
  textAlign: 'center', boxSizing: 'border-box',
};

const linkBtnStyle: CSSProperties = {
  display: 'block', textAlign: 'center', fontSize: 13,
  color: 'var(--app-muted)', textDecoration: 'none',
};
