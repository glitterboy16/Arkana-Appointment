import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoArkana } from '@/components/app/Shared';
import { FullScreenLoader, Spinner } from '@/components/app/Spinner';
import MessageBox from '@/components/app/MessageBox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { contrasenaValida, PASSWORD_REQUISITOS_MSG } from '@/lib/validators';

// Destino del enlace que llega por email cuando el usuario solicita
// restablecer la contraseña. Supabase intercambia el token de la URL por
// una sesión temporal de tipo 'recovery' y dispara el evento
// PASSWORD_RECOVERY en onAuthStateChange; lo escuchamos para saber
// cuándo es seguro mostrar el formulario.

export default function RecuperarPasswordPage() {
  const navigate = useNavigate();
  const { session, changePassword, signOut } = useAuth();
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  // Si llegamos con sesión activa (token ya intercambiado por Supabase
  // antes de montar la página), arrancamos listos. Si no, esperamos al
  // evento PASSWORD_RECOVERY del listener global de auth.
  const [ready, setReady] = useState(() => !!session);

  useEffect(() => {
    if (session) { setReady(true); return; }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    // Si tras 4s no llega ningún evento, asumimos enlace caducado o
    // mal copiado y revelamos la pantalla de "Enlace no válido" en lugar
    // de dejar al usuario mirando un spinner.
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
    if (!contrasenaValida(pass)) {
      setError(PASSWORD_REQUISITOS_MSG);
      return;
    }
    if (pass !== pass2) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    const { error: errCambio } = await changePassword(pass);
    setLoading(false);
    if (errCambio) {
      setError(errCambio);
      return;
    }
    setDone(true);
  };

  const handleVolver = async () => {
    // Cerramos la sesión de recovery para forzar un login limpio con la
    // contraseña nueva (más predecible que reutilizar la sesión temporal).
    await signOut();
    navigate('/iniciarSesion');
  };

  if (!ready) {
    return <FullScreenLoader label="Validando enlace…" />;
  }

  // Si llegamos aquí sin sesión, el enlace ya caducó o fue mal copiado.
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
          <Link to="/iniciarSesion" style={primaryBtnStyle}>Volver al inicio de sesión</Link>
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
            Tu contraseña se ha cambiado correctamente. Ya puedes iniciar sesión
            con la nueva.
          </p>
          <button onClick={handleVolver} style={primaryBtnStyle}>Ir a iniciar sesión</button>
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

        {error && (
          <MessageBox type="err" style={{ marginBottom: 14 }}>{error}</MessageBox>
        )}

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

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--app-muted)' }}>
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
            Mostrar contraseña
          </label>

          <button
            type="submit"
            disabled={loading || !ok}
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
  color: 'var(--app-text)',
  fontFamily: "'SF Pro Display','Inter',sans-serif",
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

