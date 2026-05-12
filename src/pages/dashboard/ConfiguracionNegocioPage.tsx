import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { CiDark, CiLight } from 'react-icons/ci';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';

export default function ConfiguracionNegocioPage() {
  const { tema, setTema } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--app-bg)' }}>
      <div style={{
        padding: '18px clamp(14px, 4vw, 28px)', borderBottom: '1px solid var(--app-border)',
        background: 'var(--app-bg-elevated)', flexShrink: 0,
      }}>
        <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.01em', fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
          Configuración
        </div>
        <div style={{ fontSize: 14, color: 'var(--app-muted)', marginTop: 6 }}>
          Preferencias de tu cuenta de negocio.
        </div>
      </div>

      <div className="ark-page-fade" style={{ padding: '24px clamp(14px, 4vw, 28px)', maxWidth: 720, width: '100%' }}>
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
          <p style={helperStyle}>Edita los datos de tu negocio en la sección de Perfil del negocio.</p>
          <button onClick={handleLogout} style={btnDanger}>
            Cerrar sesión
          </button>
        </section>
      </div>
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: 'var(--app-surface)', border: '1px solid var(--app-border)',
  borderRadius: 12, padding: 20, marginBottom: 16,
};
const sectionTitleStyle: CSSProperties = {
  fontSize: 14, fontWeight: 600, color: 'var(--app-text)', margin: 0,
};
const helperStyle: CSSProperties = {
  fontSize: 12, color: 'var(--app-muted)', marginTop: 4, marginBottom: 0,
};
const btnDanger: CSSProperties = {
  marginTop: 14, padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
  background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)',
  color: '#EF4444', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
};
