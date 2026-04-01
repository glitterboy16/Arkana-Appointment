import { useState, type CSSProperties } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoIcon from '@/assets/logo-icon.svg';

type AuthMode = 'login' | 'register';

interface AuthPageProps {
  defaultMode?: AuthMode;
}

export default function AuthPage({ defaultMode = 'login' }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [form, setForm] = useState({ email: '', password: '', name: '', business: '' });
  const navigate = useNavigate();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = () => {
    navigate('/panel');
  };

  const inputStyle: CSSProperties = {
    width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '11px 14px',
    color: '#FAFAFA', fontSize: 14, fontFamily: 'inherit', outline: 'none',
  };
  const labelStyle: CSSProperties = { fontSize: 12, color: 'rgba(250,250,250,0.55)', display: 'block', marginBottom: 5 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050A30', overflow: 'auto', padding: 24, position: 'relative' }}>
      <div style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse,rgba(0,74,173,0.20) 0%,transparent 70%)',
        pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#004AAD',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <img src={logoIcon} alt="" style={{ width: 34, height: 34, objectFit: 'contain', filter: 'brightness(10)' }} />
            </div>
          </Link>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#FAFAFA',
            fontFamily: "'SF Pro Display','Inter',sans-serif" }}>Arkana Appointments</div>
          <div style={{ fontSize: 13, color: 'rgba(250,250,250,0.45)', marginTop: 4 }}>
            {mode === 'login' ? 'Accede a tu panel de gestión' : 'Crea tu cuenta gratuita'}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 16, padding: '28px 28px', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 9,
            padding: 3, marginBottom: 24 }}>
            {(['login', 'register'] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} style={{
                flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 150ms ease',
                background: mode === m ? '#004AAD' : 'transparent',
                color: mode === m ? '#FAFAFA' : 'rgba(250,250,250,0.45)',
              }}>
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <>
                <div>
                  <label style={labelStyle}>Tu nombre</label>
                  <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="Nombre completo" />
                </div>
                <div>
                  <label style={labelStyle}>Nombre del negocio</label>
                  <input style={inputStyle} value={form.business} onChange={set('business')} placeholder="Ej. Clínica Dental Sonrisa" />
                </div>
              </>
            )}
            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="correo@negocio.com" />
            </div>
            <div>
              <label style={labelStyle}>Contraseña</label>
              <input style={inputStyle} type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
            </div>
            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -6 }}>
                <span style={{ fontSize: 12, color: '#648DFF', cursor: 'pointer' }}>¿Olvidaste tu contraseña?</span>
              </div>
            )}
            <button type="submit" style={{
              width: '100%', padding: '13px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: '#004AAD', color: '#FAFAFA', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
              marginTop: 4, transition: 'all 150ms ease',
            }}>
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>

          {mode === 'register' && (
            <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.30)', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
              Al registrarte aceptas los <span style={{ color: '#648DFF' }}>Términos de servicio</span> y la <span style={{ color: '#648DFF' }}>Política de privacidad</span>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(250,250,250,0.35)' }}>
          {mode === 'login' ? (
            <>¿No tienes cuenta? <span style={{ color: '#648DFF', cursor: 'pointer', fontWeight: 600 }} onClick={() => setMode('register')}>Regístrate gratis</span></>
          ) : (
            <>¿Ya tienes cuenta? <span style={{ color: '#648DFF', cursor: 'pointer', fontWeight: 600 }} onClick={() => setMode('login')}>Inicia sesión</span></>
          )}
        </div>
      </div>
    </div>
  );
}
