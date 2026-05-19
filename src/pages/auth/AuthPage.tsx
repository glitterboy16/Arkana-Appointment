import { useMemo, useState, type CSSProperties } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogoArkana } from '@/components/app/Shared';
import { Spinner } from '@/components/app/Spinner';
import { useAuth } from '@/contexts/AuthContext';

// ════════════════════════════════════════════════════════════════════
// AuthPage — Pantalla unica de inicio de sesion y registro.
//
// Permite al usuario elegir su rol (negocio o cliente) y, sobre esa
// eleccion, alterna entre los formularios de login y registro. La
// validacion se hace en tiempo real con regex; el envio real (signIn,
// signUpNegocio, signUpCliente) se delega al AuthContext.
// ════════════════════════════════════════════════════════════════════

type ModoAuth = 'login' | 'register';
type Rol = 'negocio' | 'cliente';

interface AuthPageProps {
  defaultMode?: ModoAuth;
}

// ─────────────────────────────────────────────────────────────────
// Iconos SVG inline (locales, sin dependencias)
// ─────────────────────────────────────────────────────────────────
const IconoNegocio = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconoCliente = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconoOjo = ({ open }: { open: boolean }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a19.83 19.83 0 015.06-6.06M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a19.86 19.86 0 01-3.16 4.19M1 1l22 22" />
    <path d="M9.5 9.5a3 3 0 004.24 4.24" />
  </svg>
);

const IconoCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconoX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────
// Regex de validacion (modernos, equilibrados entre estricto y usable)
// ─────────────────────────────────────────────────────────────────
const RE_EMAIL = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const RE_NOMBRE = /^[A-Za-zÀ-ÖØ-öø-ÿ' .\-]{2,60}$/;
const RE_NEGOCIO = /^[\w\sÀ-ÖØ-öø-ÿ&'.,\-]{2,80}$/;
const RE_TEL_ES = /^[6-9]\d{8}$/;
const RE_TEL_INTL = /^\+\d{7,15}$/;
const RE_PASS_MIN = /.{8,}/;
const RE_PASS_LOWER = /[a-z]/;
const RE_PASS_UPPER = /[A-Z]/;
const RE_PASS_DIGIT = /\d/;

interface ChecksContrasena {
  longitud: boolean;
  minuscula: boolean;
  mayuscula: boolean;
  numero: boolean;
}

/**
 * Evalua una contrasena y devuelve los checks individuales, un score
 * (0-4), una etiqueta legible y un color para la barra de fuerza.
 */
function evaluarContrasena(p: string): {
  checks: ChecksContrasena;
  score: number;
  etiqueta: string;
  color: string;
} {
  const checks: ChecksContrasena = {
    longitud: RE_PASS_MIN.test(p),
    minuscula: RE_PASS_LOWER.test(p),
    mayuscula: RE_PASS_UPPER.test(p),
    numero: RE_PASS_DIGIT.test(p),
  };
  const score = Object.values(checks).filter(Boolean).length;
  let etiqueta = 'Demasiado corta';
  let color = '#EF4444';
  if (score === 4) { etiqueta = 'Excelente'; color = '#22C55E'; }
  else if (score === 3) { etiqueta = 'Buena'; color = '#84CC16'; }
  else if (score === 2) { etiqueta = 'Aceptable'; color = '#F59E0B'; }
  return { checks, score, etiqueta, color };
}

/** Una contrasena solo es valida si cumple los 4 requisitos. */
function contrasenaValida(p: string): boolean {
  const { score } = evaluarContrasena(p);
  return score === 4;
}

interface EstadoFormulario {
  email: string;
  password: string;
  name: string;
  business: string;
  phone: string;
}

interface EstadoTocado {
  email: boolean;
  password: boolean;
  name: boolean;
  business: boolean;
  phone: boolean;
}

// ════════════════════════════════════════════════════════════════════
// Componente principal
// ════════════════════════════════════════════════════════════════════
export default function AuthPage({ defaultMode = 'login' }: AuthPageProps) {
  const [rol, setRol] = useState<Rol>('negocio');
  const [mode, setMode] = useState<ModoAuth>(defaultMode);
  const [form, setForm] = useState<EstadoFormulario>({
    email: '', password: '', name: '', business: '', phone: '',
  });
  const [touched, setTouched] = useState<EstadoTocado>({
    email: false, password: false, name: false, business: false, phone: false,
  });
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn, signUpNegocio, signUpCliente } = useAuth();

  const reset = () => { setError(null); setInfo(null); };

  const set = (k: keyof EstadoFormulario) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [k]: e.target.value });
    reset();
  };

  const onBlur = (k: keyof EstadoTocado) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
  };

  // ─────────────────────────────────────────────────────────────────
  // Validacion derivada en tiempo real
  // ─────────────────────────────────────────────────────────────────
  const emailValido = useMemo(() => RE_EMAIL.test(form.email), [form.email]);
  const nombreValido = useMemo(() => RE_NOMBRE.test(form.name.trim()), [form.name]);
  const negocioValido = useMemo(() => RE_NEGOCIO.test(form.business.trim()), [form.business]);
  const evalContrasena = useMemo(() => evaluarContrasena(form.password), [form.password]);
  const passOK = mode === 'login' ? form.password.length > 0 : contrasenaValida(form.password);
  const telefonoNorm = form.phone.trim().replace(/\s/g, '');
  const telefonoValido = RE_TEL_ES.test(telefonoNorm) || RE_TEL_INTL.test(telefonoNorm);

  const formularioValido = useMemo(() => {
    if (mode === 'login') return emailValido && form.password.length > 0;
    if (!emailValido || !passOK || !nombreValido) return false;
    if (rol === 'negocio') return negocioValido;
    return telefonoValido;
  }, [mode, emailValido, passOK, nombreValido, negocioValido, telefonoValido, form.password.length, rol]);

  // ─────────────────────────────────────────────────────────────────
  // Envio del formulario
  // ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setTouched({ email: true, password: true, name: true, business: true, phone: true });

    if (mode === 'login') {
      if (!emailValido) { setError('Introduce un email válido'); return; }
      if (!form.password) { setError('Introduce tu contraseña'); return; }
    } else {
      if (!nombreValido) { setError('Introduce tu nombre (2-60 caracteres, solo letras)'); return; }
      if (rol === 'negocio' && !negocioValido) { setError('Introduce el nombre del negocio (2-80 caracteres)'); return; }
      if (rol === 'cliente' && !telefonoValido) { setError('Introduce un teléfono válido (ej. 612345678 o +34612345678)'); return; }
      if (!emailValido) { setError('Introduce un email válido'); return; }
      if (!contrasenaValida(form.password)) { setError('La contraseña debe tener 8+ caracteres, mayúscula, minúscula y número'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error, rol: rolUsuario } = await signIn(form.email, form.password, rol);
        if (error) { setError(traducirErrorAuth(error)); return; }
        navigate(
          rolUsuario === 'admin' ? '/admin'
            : rolUsuario === 'negocio' ? '/panel'
            : '/app/buscar',
        );
      } else {
        if (rol === 'negocio') {
          const { error, needsConfirmation } = await signUpNegocio({
            email: form.email,
            password: form.password,
            nombre: form.name.trim(),
            nombreNegocio: form.business.trim(),
          });
          if (error) { setError(traducirErrorAuth(error)); return; }
          if (needsConfirmation) { setInfo('Revisa tu email para confirmar la cuenta, luego inicia sesión.'); setMode('login'); return; }
          navigate('/panel');
        } else {
          const { error, needsConfirmation } = await signUpCliente({
            email: form.email,
            password: form.password,
            nombre: form.name.trim(),
            telefono: telefonoNorm,
          });
          if (error) { setError(traducirErrorAuth(error)); return; }
          if (needsConfirmation) { setInfo('Revisa tu email para confirmar la cuenta, luego inicia sesión.'); setMode('login'); return; }
          navigate('/app/buscar');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Estilos en linea (la pagina no usa Tailwind, usa estilo "Apple" custom)
  // ─────────────────────────────────────────────────────────────────
  const inputBase: CSSProperties = {
    width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '11px 14px',
    color: '#FAFAFA', fontSize: 14, fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 150ms ease, background 150ms ease',
  };
  const inputStyle = (campoTocado: boolean, valido: boolean | null): CSSProperties => {
    if (!campoTocado || valido === null) return inputBase;
    return {
      ...inputBase,
      borderColor: valido ? 'rgba(34,197,94,0.45)' : 'rgba(239,68,68,0.45)',
      background: valido ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
    };
  };
  const labelStyle: CSSProperties = {
    fontSize: 12, color: 'rgba(250,250,250,0.55)', display: 'flex', justifyContent: 'space-between',
    marginBottom: 5,
  };
  const hintError: CSSProperties = { fontSize: 11, color: '#EF4444', marginTop: 5 };

  const tituloModo = mode === 'login' ? 'Accede a tu cuenta' : 'Crea tu cuenta gratuita';

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
          <Link to="/" style={{ display: 'inline-block', textDecoration: 'none', margin: '0 auto 14px' }} aria-label="Volver al inicio">
            <LogoArkana size={56} />
          </Link>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#FAFAFA', fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
            Arkana Appointments
          </div>
          <div style={{ fontSize: 13, color: 'rgba(250,250,250,0.45)', marginTop: 4 }}>
            {tituloModo}
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
                aria-pressed={active}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
                  border: active ? '1px solid rgba(100,141,255,0.60)' : '1px solid rgba(255,255,255,0.10)',
                  background: active ? 'rgba(100,141,255,0.12)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#FAFAFA' : 'rgba(250,250,250,0.45)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all 200ms ease',
                  minHeight: 76,
                }}
              >
                <span style={{ color: active ? '#648DFF' : 'rgba(250,250,250,0.35)' }}>
                  {r === 'negocio' ? <IconoNegocio /> : <IconoCliente />}
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
          <div role="tablist" style={{
            display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 9,
            padding: 3, marginBottom: 20,
          }}>
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                type="button"
                onClick={() => { setMode(m); reset(); }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 150ms ease',
                  background: mode === m ? '#004AAD' : 'transparent',
                  color: mode === m ? '#FAFAFA' : 'rgba(250,250,250,0.45)',
                  minHeight: 40,
                }}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {info && (
            <div role="status" style={{
              background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#22C55E', marginBottom: 16,
            }}>
              {info}
            </div>
          )}

          {error && (
            <div role="alert" style={{
              background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#EF4444', marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div>
                <label style={labelStyle}>
                  <span>Tu nombre</span>
                  {touched.name && nombreValido && <span style={{ color: '#22C55E' }}><IconoCheck /></span>}
                </label>
                <input
                  style={inputStyle(touched.name, form.name ? nombreValido : null)}
                  value={form.name}
                  onChange={set('name')}
                  onBlur={onBlur('name')}
                  placeholder="Nombre completo"
                  autoComplete="name"
                  required
                  aria-invalid={touched.name && !nombreValido}
                />
                {touched.name && form.name && !nombreValido && (
                  <div style={hintError}>Solo letras, espacios, apóstrofes o guiones. Mínimo 2 caracteres.</div>
                )}
              </div>
            )}
            {mode === 'register' && rol === 'negocio' && (
              <div>
                <label style={labelStyle}>
                  <span>Nombre del negocio</span>
                  {touched.business && negocioValido && <span style={{ color: '#22C55E' }}><IconoCheck /></span>}
                </label>
                <input
                  style={inputStyle(touched.business, form.business ? negocioValido : null)}
                  value={form.business}
                  onChange={set('business')}
                  onBlur={onBlur('business')}
                  placeholder="Ej. Clínica Dental Sonrisa"
                  autoComplete="organization"
                  required
                  aria-invalid={touched.business && !negocioValido}
                />
                {touched.business && form.business && !negocioValido && (
                  <div style={hintError}>Entre 2 y 80 caracteres.</div>
                )}
              </div>
            )}
            {mode === 'register' && rol === 'cliente' && (
              <div>
                <label style={labelStyle}>
                  <span>Teléfono</span>
                  {touched.phone && telefonoValido && <span style={{ color: '#22C55E' }}><IconoCheck /></span>}
                </label>
                <input
                  style={inputStyle(touched.phone, form.phone ? telefonoValido : null)}
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  onBlur={onBlur('phone')}
                  placeholder="612345678"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  aria-invalid={touched.phone && !telefonoValido}
                />
                {touched.phone && form.phone && !telefonoValido && (
                  <div style={hintError}>Formato no válido. Ej. 612345678 o +34612345678.</div>
                )}
              </div>
            )}
            <div>
              <label style={labelStyle}>
                <span>Correo electrónico</span>
                {touched.email && emailValido && <span style={{ color: '#22C55E' }}><IconoCheck /></span>}
              </label>
              <input
                style={inputStyle(touched.email, form.email ? emailValido : null)}
                type="email"
                value={form.email}
                onChange={set('email')}
                onBlur={onBlur('email')}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                required
                aria-invalid={touched.email && !emailValido}
              />
              {touched.email && form.email && !emailValido && (
                <div style={hintError}>Introduce un email con formato válido (usuario@dominio.com).</div>
              )}
            </div>
            <div>
              <label style={labelStyle}>
                <span>Contraseña</span>
                {mode === 'register' && form.password && (
                  <span style={{ color: evalContrasena.color, fontWeight: 600 }}>{evalContrasena.etiqueta}</span>
                )}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{
                    ...inputStyle(touched.password, form.password ? passOK : null),
                    paddingRight: 44,
                  }}
                  type={mostrarContrasena ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  onBlur={onBlur('password')}
                  placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  aria-invalid={mode === 'register' && touched.password && !passOK}
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena((v) => !v)}
                  aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'rgba(250,250,250,0.45)', padding: 8, display: 'inline-flex',
                  }}
                >
                  <IconoOjo open={mostrarContrasena} />
                </button>
              </div>

              {/* Barra de fuerza + checklist (solo en registro) */}
              {mode === 'register' && form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{
                    height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${(evalContrasena.score / 4) * 100}%`,
                      height: '100%', background: evalContrasena.color, transition: 'all 250ms ease',
                    }} />
                  </div>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginTop: 8,
                  }}>
                    <RequisitoContrasena ok={evalContrasena.checks.longitud} label="8+ caracteres" />
                    <RequisitoContrasena ok={evalContrasena.checks.minuscula} label="Una minúscula" />
                    <RequisitoContrasena ok={evalContrasena.checks.mayuscula} label="Una mayúscula" />
                    <RequisitoContrasena ok={evalContrasena.checks.numero} label="Un número" />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: '#648DFF', cursor: 'pointer' }}>¿Olvidaste tu contraseña?</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (touched.email && !formularioValido && mode === 'register')}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 9, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: '#004AAD', color: '#FAFAFA', fontSize: 15, fontWeight: 700,
                fontFamily: 'inherit', marginTop: 4, transition: 'all 150ms ease',
                opacity: loading ? 0.85 : 1,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                minHeight: 48,
              }}
            >
              {loading && <Spinner size={16} color="#FAFAFA" trackColor="rgba(250,250,250,0.35)" />}
              {loading ? 'Cargando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>

          {mode === 'register' && (
            <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.30)', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
              Al registrarte aceptas los <Link to="/legal/terminos" style={{ color: '#648DFF', textDecoration: 'none' }}>Términos de servicio</Link> y la <Link to="/legal/privacidad" style={{ color: '#648DFF', textDecoration: 'none' }}>Política de privacidad</Link>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(250,250,250,0.35)' }}>
          {mode === 'login' ? (
            <>¿No tienes cuenta?{' '}
              <button type="button" onClick={() => { setMode('register'); reset(); }} style={linkBtnStyle}>
                Regístrate gratis
              </button>
            </>
          ) : (
            <>¿Ya tienes cuenta?{' '}
              <button type="button" onClick={() => { setMode('login'); reset(); }} style={linkBtnStyle}>
                Inicia sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

const linkBtnStyle: CSSProperties = {
  background: 'transparent', border: 'none', color: '#648DFF', cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 12, fontWeight: 600, padding: 0,
};

/** Item visual de la checklist de requisitos de contrasena. */
function RequisitoContrasena({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, color: ok ? '#22C55E' : 'rgba(250,250,250,0.40)',
      transition: 'color 200ms ease',
    }}>
      <span style={{
        width: 14, height: 14, borderRadius: '50%',
        background: ok ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {ok ? <IconoCheck /> : <IconoX />}
      </span>
      {label}
    </div>
  );
}

/** Traduce los mensajes de error que devuelve Supabase Auth a algo amigable. */
function traducirErrorAuth(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos';
  if (msg.includes('Email not confirmed')) return 'Confirma tu email antes de iniciar sesión';
  if (msg.includes('User already registered')) return 'Este email ya está registrado';
  if (msg.includes('Password should be')) return 'La contraseña debe tener al menos 8 caracteres';
  if (msg.includes('Unable to validate')) return 'Email o contraseña incorrectos';
  return msg;
}
