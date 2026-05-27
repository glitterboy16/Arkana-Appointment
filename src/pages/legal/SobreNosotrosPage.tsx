import { Link } from 'react-router-dom';
import { BiLogoGithub } from 'react-icons/bi';
import { LogoArkana } from '@/components/app/Shared';

export default function SobreNosotrosPage() {
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
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
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
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            margin: '0 0 14px',
          }}
        >
          Sobre el proyecto
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--app-muted)', margin: '0 0 48px', fontFamily: "'SF Pro Text','Inter',sans-serif" }}>
          Arkana Appointments nació de una necesidad real: dar a cualquier negocio la posibilidad
          de gestionar citas de forma sencilla, sin fricciones para el cliente y sin depender de
          llamadas o mensajes de WhatsApp.
        </p>

        {/* Tarjeta del autor */}
        <div
          style={{
            background: 'rgba(0,74,173,0.08)',
            border: '1px solid rgba(100,141,255,0.18)',
            borderRadius: 16,
            padding: 'clamp(24px, 4vw, 36px)',
            marginBottom: 48,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #004AAD 0%, #648DFF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontWeight: 700, color: '#FAFAFA',
              }}
            >
              A
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>
                Ángel Andrés Villorina Cambero
              </p>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--app-muted)', fontFamily: "'SF Pro Text','Inter',sans-serif" }}>
                Desarrollador · Formación Profesional Superior en DAW
              </p>
              <a
                href="https://github.com/glitterboy16"
                target="_blank"
                rel="noreferrer noopener"
                className="ark-chip-link"
              >
                <BiLogoGithub size={16} />
                github.com/glitterboy16
              </a>
            </div>
          </div>
        </div>

        {/* Secciones */}
        <div style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--app-muted)', fontFamily: "'SF Pro Text','Inter',sans-serif" }}>
          <Section title="El proyecto">
            <p>
              Arkana Appointments es el proyecto final que presentaré para obtener el título de
              Técnico Superior en Desarrollo de Aplicaciones Web (DAW). He invertido mucho
              tiempo y esfuerzo en este proyecto, del que estoy especialmente orgulloso.
            </p>
            <p>
              No es un ejercicio académico convencional: es una aplicación real, desplegada en
              producción, con usuarios activos, base de datos en la nube y flujos de autenticación
              completos. Funciona hoy mismo.
            </p>
          </Section>

          <Section title="Qué hace Arkana">
            <p>
              Los negocios crean su perfil, definen servicios y horarios, y obtienen un código QR
              único. Sus clientes escanean el QR y reservan en segundos, sin registrarse, sin
              descargas y sin llamar por teléfono.
            </p>
            <p>
              La plataforma incluye panel de gestión de citas, estadísticas, galería de fotos,
              ubicación en mapa, sistema de notificaciones y panel de administración para gestionar
              todos los usuarios.
            </p>
          </Section>

          <Section title="Stack tecnológico">
            <ul style={{ paddingLeft: 20, margin: '0 0 0' }}>
              <li><strong style={{ color: 'var(--app-text, #FAFAFA)' }}>Frontend:</strong> React 19 + TypeScript + Tailwind CSS v4 + Vite</li>
              <li><strong style={{ color: 'var(--app-text, #FAFAFA)' }}>Backend:</strong> Supabase (PostgreSQL + Auth + Storage + Edge Functions)</li>
              <li><strong style={{ color: 'var(--app-text, #FAFAFA)' }}>Despliegue:</strong> Vercel (CI/CD automático desde GitHub)</li>
              <li><strong style={{ color: 'var(--app-text, #FAFAFA)' }}>Mapas:</strong> Mapbox</li>
              <li><strong style={{ color: 'var(--app-text, #FAFAFA)' }}>Seguridad:</strong> Row Level Security en base de datos, JWT, bcrypt</li>
            </ul>
          </Section>

          <Section title="Contacto">
            <p>
              Si tienes alguna pregunta sobre el proyecto o quieres contactar conmigo,
              puedes escribirme a{' '}
              <a href="mailto:support@arkana-appointments.com" style={{ color: 'var(--app-accent, #648DFF)', textDecoration: 'none' }}>
                support@arkana-appointments.com
              </a>{' '}
              o encontrarme en{' '}
              <a href="https://github.com/glitterboy16" target="_blank" rel="noreferrer" style={{ color: 'var(--app-accent, #648DFF)', textDecoration: 'none' }}>
                GitHub
              </a>.
            </p>
          </Section>
        </div>

        <div style={{
          marginTop: 56, paddingTop: 24,
          borderTop: '1px solid var(--app-border, rgba(255,255,255,0.08))',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
          fontSize: 13, opacity: 0.5,
        }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Link to="/privacidad" className="legal-footer-link">Privacidad</Link>
            <Link to="/terminos" className="legal-footer-link">Términos</Link>
            <Link to="/estado" className="legal-footer-link">Estado</Link>
          </div>
          <Link to="/" className="legal-footer-link">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{
        fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em',
        color: 'var(--app-text, #FAFAFA)', margin: '0 0 12px',
        fontFamily: "'SF Pro Display','Inter',sans-serif",
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
