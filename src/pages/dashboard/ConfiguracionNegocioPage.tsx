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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#080C3E' }}>
      <div style={{
        padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: '#050A30', flexShrink: 0,
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#FAFAFA', fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
          Configuración
        </div>
        <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.45)', marginTop: 4 }}>
          Preferencias de tu cuenta de negocio.
        </div>
      </div>

      <div style={{ padding: '24px 28px', maxWidth: 720 }}>
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
                    background: active ? 'rgba(100,141,255,0.12)' : 'rgba(255,255,255,0.04)',
                    border: active ? '1px solid rgba(100,141,255,0.55)' : '1px solid rgba(255,255,255,0.10)',
                    color: '#FAFAFA', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    transition: 'all 150ms ease',
                  }}
                >
                  <Icon
                    size={26}
                    style={active
                      ? { color: '#648DFF', fill: 'currentColor', stroke: 'currentColor', strokeWidth: 0 }
                      : { color: 'rgba(250,250,250,0.55)', fill: 'none', stroke: 'currentColor', strokeWidth: 1 }
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
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12, padding: 20, marginBottom: 16,
};
const sectionTitleStyle: CSSProperties = {
  fontSize: 14, fontWeight: 600, color: '#FAFAFA', margin: 0,
};
const helperStyle: CSSProperties = {
  fontSize: 12, color: 'rgba(250,250,250,0.55)', marginTop: 4, marginBottom: 0,
};
const btnDanger: CSSProperties = {
  marginTop: 14, padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
  background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)',
  color: '#EF4444', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
};
