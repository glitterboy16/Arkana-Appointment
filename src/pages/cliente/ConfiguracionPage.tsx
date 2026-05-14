import { type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { CiDark, CiLight } from 'react-icons/ci';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';

export default function ConfiguracionPage() {
  const { tema, setTema } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="ark-page" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Configuración</h1>
        <p style={{ color: 'var(--app-muted)', fontSize: 15, marginTop: 8 }}>
          Preferencias de tu cuenta.
        </p>
      </div>

      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Apariencia</h2>
        <p style={helperStyle}>Elige cómo quieres ver la aplicación.</p>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          {(['oscuro', 'claro'] as const).map(t => {
            const active = tema === t;
            const Icon = t === 'oscuro' ? CiDark : CiLight;
            return (
              <button
                key={t}
                onClick={() => setTema(t)}
                style={{
                  flex: 1, padding: '14px 12px', borderRadius: 10, cursor: 'pointer',
                  background: active ? 'rgba(100,141,255,0.12)' : 'var(--app-surface)',
                  border: active ? '1px solid rgba(100,141,255,0.55)' : '1px solid var(--app-border)',
                  color: 'var(--app-text)', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  transition: 'all 150ms ease',
                }}
              >
                <Icon
                  size={26}
                  style={active
                    ? { color: '#648DFF', fill: 'currentColor', stroke: 'currentColor', strokeWidth: 0 }
                    : { color: 'var(--app-muted)', fill: 'none', stroke: 'currentColor', strokeWidth: 1 }
                  }
                />
                Modo {t === 'oscuro' ? 'oscuro' : 'claro'}
              </button>
            );
          })}
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Cuenta</h2>
        <p style={helperStyle}>Edita tus datos personales y tu foto en la sección de Mi perfil.</p>
        <button onClick={handleLogout} style={btnDanger}>
          Cerrar sesión
        </button>
      </section>
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: 'var(--app-surface)', border: '1px solid var(--app-border)',
  borderRadius: 14, padding: 24, marginBottom: 18,
};
const sectionTitleStyle: CSSProperties = {
  fontSize: 16, fontWeight: 700, color: 'var(--app-text)', margin: 0, letterSpacing: '-0.01em',
};
const helperStyle: CSSProperties = {
  fontSize: 13, color: 'var(--app-muted)', marginTop: 6, marginBottom: 0,
};
const btnDanger: CSSProperties = {
  marginTop: 16, padding: '11px 18px', borderRadius: 9, cursor: 'pointer',
  background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)',
  color: '#EF4444', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
};
