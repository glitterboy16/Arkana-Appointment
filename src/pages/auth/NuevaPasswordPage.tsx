import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoArkana } from '@/components/app/Shared';
import { FullScreenLoader, Spinner } from '@/components/app/Spinner';
import MessageBox from '@/components/app/MessageBox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { contrasenaValida, PASSWORD_REQUISITOS_MSG } from '@/lib/validators';

// Destino del enlace de recuperación enviado por email. Supabase intercambia
// el token de la URL por una sesión temporal de tipo 'recovery' y dispara el
// evento PASSWORD_RECOVERY en onAuthStateChange.

export default function NuevaPasswordPage() {
  const navigate = useNavigate();
  const { session, changePassword, signOut } = useAuth();
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(() => !!session);

  useEffect(() => {
    if (session) { setReady(true); return; }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    const fallback = window.setTimeout(() => setReady(true), 4000);
    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(fallback);
    };
  }, [session]);

  const ok = useMemo(() => contrasenaValida(pass) && pass === pass2, [pass, pass2]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!contrasenaValida(pass)) { setError(PASSWORD_REQUISITOS_MSG); return; }
    if (pass !== pass2) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    const { error: errCambio } = await changePassword(pass);
    setLoading(false);
    if (errCambio) { setError(errCambio); return; }
    setDone(true);
  };

  const handleVolver = async () => {
    await signOut();
    navigate('/iniciarSesion');
  };

  if (!ready) return <FullScreenLoader label="Validando enlace…" />;

  if (!session) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <LogoArkana size={56} />
          </div>
          <h1 style={titleStyle}>Enlace no válido</h1>
          <p style={subtitleStyle}>
            El enlace para restablecer tu contraseña ha caducado o ya se ha usado.
            Vuelve a pedirlo desde la pantalla de inicio de sesión.
          </p>
          <Link to="/recuperar-password" className="ark-auth-btn-primary" style={primaryBtnStyle}>Pedir nuevo enlace</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <LogoArkana size={56} />
          </div>
          <h1 style={titleStyle}>Contraseña actualizada</h1>
          <p style={subtitleStyle}>
            Tu contraseña se ha cambiado correctamente. Ya puedes iniciar sesión con la nueva.
          </p>
          <button onClick={handleVolver} className="ark-auth-btn-primary" style={primaryBtnStyle}>Ir a iniciar sesión</button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <LogoArkana size={56} />
        </div>
        <h1 style={titleStyle}>Elige una contraseña nueva</h1>
        <p style={subtitleStyle}>
          Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.
        </p>

        {error && <MessageBox type="err" style={{ marginBottom: 14 }}>{error}</MessageBox>}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            style={inputStyle}
            type={show ? 'text' : 'password'}
            value={pass}
            onChange={(e) => { setPass(e.target.value); setError(null); }}
            placeholder="Contraseña nueva"
            autoComplete="new-password"
            required
          />
          <input
            style={inputStyle}
            type={show ? 'text' : 'password'}
            value={pass2}
            onChange={(e) => { setPass2(e.target.value); setError(null); }}
            placeholder="Repite la contraseña"
            autoComplete="new-password"
            required
          />
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--app-muted)', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)}
              style={{ accentColor: 'var(--app-accent, #648DFF)', width: 14, height: 14, cursor: 'pointer' }} />
            Mostrar contraseña
          </label>
          <button
            type="submit"
            disabled={loading || !ok}
            className="ark-auth-btn-primary"
            style={{
              ...primaryBtnStyle,
              opacity: loading || !ok ? 0.7 : 1,
              cursor: loading || !ok ? 'not-allowed' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading && <Spinner size={14} color="#FAFAFA" trackColor="rgba(250,250,250,0.35)" />}
            {loading ? 'Guardando…' : 'Guardar contraseña'}
          </button>
        </form>
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
  background: 'var(--app-primary, #004AAD)', color: 'var(--app-text, #FAFAFA)', fontSize: 14, fontWeight: 700,
  fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'none',
  textAlign: 'center', boxSizing: 'border-box',
};
