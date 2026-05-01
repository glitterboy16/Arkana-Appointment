import { useState, type CSSProperties } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogoArkana } from '@/components/app/Shared';
import { useAuth } from '@/contexts/AuthContext';

type AuthMode = 'login' | 'register';
type Rol = 'negocio' | 'cliente';

interface AuthPageProps {
  defaultMode?: AuthMode;
}

const IconNegocio = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconCliente = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function AuthPage({ defaultMode = 'login' }: AuthPageProps) {
  const [rol, setRol] = useState<Rol>('negocio');
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [form, setForm] = useState({ email: '', password: '', name: '', business: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn, signUpNegocio, signUpCliente } = useAuth();

  const reset = () => { setError(null); setInfo(null); };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [k]: e.target.value });
    reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();

    if (!form.email || !form.password) {
      setError('Completa el email y la contraseña');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error, rol: rolUsuario } = await signIn(form.email, form.password, rol);
        if (error) { setError(traducirError(error)); return; }
        navigate(rolUsuario === 'negocio' ? '/panel' : '/app/buscar');
      } else {
        if (!form.name.trim()) { setError('Introduce tu nombre'); return; }
        if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }

        if (rol === 'negocio') {
          if (!form.business.trim()) { setError('Introduce el nombre de tu negocio'); return; }
          const { error, needsConfirmation } = await signUpNegocio({
            email: form.email,
            password: form.password,
            nombre: form.name.trim(),
            nombreNegocio: form.business.trim(),
          });
          if (error) { setError(traducirError(error)); return; }
          if (needsConfirmation) { setInfo('Revisa tu email para confirmar la cuenta, luego inicia sesión.'); setMode('login'); return; }
          navigate('/panel');
        } else {
          const telefono = form.phone.trim().replace(/\s/g, '');
          if (!telefono) { setError('Introduce tu teléfono'); return; }
          if (!/^[6-9]\d{8}$|^\+\d{7,15}$/.test(telefono)) {
            setError('Introduce un número de teléfono válido (ej. 612345678 o +34612345678)');
            return;
          }
          const { error, needsConfirmation } = await signUpCliente({
            email: form.email,
            password: form.password,
            nombre: form.name.trim(),
            telefono,
          });
          if (error) { setError(traducirError(error)); return; }
          if (needsConfirmation) { setInfo('Revisa tu email para confirmar la cuenta, luego inicia sesión.'); setMode('login'); return; }
          navigate('/app/buscar');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: CSSProperties = {
    width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '11px 14px',
    color: '#FAFAFA', fontSize: 14, fontFamily: 'inherit', outline: 'none',
  };
  const labelStyle: CSSProperties = {
    fontSize: 12, color: 'rgba(250,250,250,0.55)', display: 'block', marginBottom: 5,
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050A30', overflow: 'auto', padding: 24, position: 'relative',
    }}>
      <div style={{
        position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse,rgba(0,74,173,0.20) 0%,transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, background: '#004AAD',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
            }}>
              <LogoArkana size={34} onBrand />
            </div>
          </Link>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#FAFAFA', fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
            Arkana Appointments
          </div>
          <div style={{ fontSize: 13, color: 'rgba(250,250,250,0.45)', marginTop: 4 }}>
            {mode === 'login' ? 'Accede a tu cuenta' : 'Crea tu cuenta gratuita'}
          </div>
        </div>

        {/* Selector de rol */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {(['negocio', 'cliente'] as Rol[]).map((r) => {
            const active = rol === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => { setRol(r); reset(); }}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
                  border: active ? '1px solid rgba(100,141,255,0.60)' : '1px solid rgba(255,255,255,0.10)',
                  background: active ? 'rgba(100,141,255,0.12)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#FAFAFA' : 'rgba(250,250,250,0.45)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all 200ms ease',
                }}
              >
                <span style={{ color: active ? '#648DFF' : 'rgba(250,250,250,0.35)' }}>
                  {r === 'negocio' ? <IconNegocio /> : <IconCliente />}
                </span>
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>
                  {r === 'negocio' ? 'Soy un negocio' : 'Soy un cliente'}
                </span>
                <span style={{ fontSize: 11, color: 'rgba(250,250,250,0.35)', textAlign: 'center', lineHeight: 1.4, paddingInline: 8 }}>
                  {r === 'negocio' ? 'Gestiona citas y clientes' : 'Consulta y gestiona tus reservas'}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 16, padding: '24px 24px', backdropFilter: 'blur(12px)',
        }}>
          {/* Tabs login / registro */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 9,
            padding: 3, marginBottom: 20,
          }}>
            {(['login', 'register'] as const).map((m) => (
              <button key={m} type="button" onClick={() => { setMode(m); reset(); }} style={{
                flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 150ms ease',
                background: mode === m ? '#004AAD' : 'transparent',
                color: mode === m ? '#FAFAFA' : 'rgba(250,250,250,0.45)',
              }}>
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {info && (
            <div style={{
              background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#22C55E', marginBottom: 16,
            }}>
              {info}
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#EF4444', marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div>
                <label style={labelStyle}>Tu nombre</label>
                <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="Nombre completo" />
              </div>
            )}
            {mode === 'register' && rol === 'negocio' && (
              <div>
                <label style={labelStyle}>Nombre del negocio</label>
                <input style={inputStyle} value={form.business} onChange={set('business')} placeholder="Ej. Clínica Dental Sonrisa" />
              </div>
            )}
            {mode === 'register' && rol === 'cliente' && (
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input
                  style={inputStyle}
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="612345678"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>
            )}
            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="correo@ejemplo.com" autoComplete="email" />
            </div>
            <div>
              <label style={labelStyle}>Contraseña</label>
              <input style={inputStyle} type="password" value={form.password} onChange={set('password')} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>
            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -6 }}>
                <span style={{ fontSize: 12, color: '#648DFF', cursor: 'pointer' }}>¿Olvidaste tu contraseña?</span>
              </div>
            )}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px 0', borderRadius: 9, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: '#004AAD', color: '#FAFAFA', fontSize: 15, fontWeight: 700,
              fontFamily: 'inherit', marginTop: 4, transition: 'all 150ms ease',
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Cargando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
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
            <>¿No tienes cuenta?{' '}
              <span style={{ color: '#648DFF', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setMode('register'); reset(); }}>
                Regístrate gratis
              </span>
            </>
          ) : (
            <>¿Ya tienes cuenta?{' '}
              <span style={{ color: '#648DFF', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setMode('login'); reset(); }}>
                Inicia sesión
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function traducirError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos';
  if (msg.includes('Email not confirmed')) return 'Confirma tu email antes de iniciar sesión';
  if (msg.includes('User already registered')) return 'Este email ya está registrado';
  if (msg.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres';
  if (msg.includes('Unable to validate')) return 'Email o contraseña incorrectos';
  return msg;
}
