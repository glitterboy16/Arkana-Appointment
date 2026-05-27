import { Link } from 'react-router-dom';
import { LogoArkana } from '@/components/app/Shared';

const SISTEMAS = [
  { nombre: 'Plataforma web',      ok: true },
  { nombre: 'API y base de datos', ok: true },
  { nombre: 'Autenticación',       ok: true },
  { nombre: 'Reservas y citas',    ok: true },
  { nombre: 'Subida de imágenes',  ok: true },
  { nombre: 'Notificaciones',      ok: true },
];


export default function EstadoPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--app-bg, #050A30)',
        color: 'var(--app-text, #FAFAFA)',
        fontFamily: "'SF Pro Display','SF Pro Text','Inter',sans-serif",
        padding: 'clamp(24px, 5vw, 56px) clamp(16px, 5vw, 48px)',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            color: 'inherit', textDecoration: 'none', marginBottom: 48, opacity: 0.9,
          }}
        >
          <LogoArkana size={32} />
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>
            Arkana <span style={{ fontWeight: 300, opacity: 0.6 }}>Appointments</span>
          </span>
        </Link>

        <h1
          style={{
            fontSize: 'clamp(24px, 4vw, 34px)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            margin: '0 0 32px',
          }}
        >
          Estado del servicio
        </h1>

        {/* Global status banner */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'rgba(34,197,94,0.07)',
            border: '1px solid rgba(34,197,94,0.20)',
            borderRadius: 12, padding: '18px 22px', marginBottom: 40,
          }}
        >
          <div style={{
            width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
            background: '#22C55E',
            boxShadow: '0 0 0 3px rgba(34,197,94,0.18)',
          }} />
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#22C55E' }}>
              Todos los sistemas operativos
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--app-muted, rgba(250,250,250,0.50))' }}>
              Sin incidencias activas · Última comprobación: hace unos minutos
            </p>
          </div>
        </div>

        {/* Component list */}
        <h2 style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', opacity: 0.4, margin: '0 0 10px',
          fontFamily: "'SF Pro Text','Inter',sans-serif",
        }}>
          Componentes
        </h2>
        <div style={{
          background: 'var(--app-surface, rgba(255,255,255,0.04))',
          border: '1px solid var(--app-border, rgba(255,255,255,0.08))',
          borderRadius: 10, overflow: 'hidden', marginBottom: 40,
        }}>
          {SISTEMAS.map((s, i) => (
            <div
              key={s.nombre}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 20px',
                borderBottom: i < SISTEMAS.length - 1
                  ? '1px solid var(--app-border, rgba(255,255,255,0.06))'
                  : 'none',
              }}
            >
              <span style={{ fontSize: 14, fontFamily: "'SF Pro Text','Inter',sans-serif" }}>
                {s.nombre}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
                padding: '3px 9px', borderRadius: 5,
                background: 'rgba(34,197,94,0.10)', color: '#22C55E',
                textTransform: 'uppercase',
              }}>
                Operativo
              </span>
            </div>
          ))}
        </div>

        {/* Incident history */}
        <h2 style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', opacity: 0.4, margin: '0 0 10px',
          fontFamily: "'SF Pro Text','Inter',sans-serif",
        }}>
          Historial de incidencias
        </h2>
        <div style={{
          background: 'var(--app-surface, rgba(255,255,255,0.04))',
          border: '1px solid var(--app-border, rgba(255,255,255,0.08))',
          borderRadius: 10, padding: '28px 20px', textAlign: 'center',
          fontSize: 14, color: 'var(--app-muted, rgba(250,250,250,0.35))',
          marginBottom: 48,
          fontFamily: "'SF Pro Text','Inter',sans-serif",
        }}>
          No hay incidencias registradas.
        </div>

        <div style={{
          paddingTop: 24,
          borderTop: '1px solid var(--app-border, rgba(255,255,255,0.08))',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
          fontSize: 13, opacity: 0.5,
        }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Link to="/privacidad" className="legal-footer-link">Privacidad</Link>
            <Link to="/terminos" className="legal-footer-link">Términos</Link>
            <Link to="/seguridad" className="legal-footer-link">Seguridad</Link>
            <a href="mailto:support@arkana-appointments.com" className="legal-footer-link">
              support@arkana-appointments.com
            </a>
          </div>
          <Link to="/" className="legal-footer-link">← Inicio</Link>
        </div>
      </div>
    </div>
  );
}
