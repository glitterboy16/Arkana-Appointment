import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LogoArkana } from '@/components/app/Shared';

interface Props {
  title: string;
  updated: string;
  children: ReactNode;
}

const LEGAL_STYLES = `
  .legal-content h2 {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.01em;
    margin: 36px 0 10px;
    color: var(--app-text, #FAFAFA);
  }
  .legal-content h3 {
    font-size: 15px;
    font-weight: 600;
    margin: 24px 0 8px;
    color: var(--app-text, #FAFAFA);
  }
  .legal-content p {
    margin: 0 0 16px;
  }
  .legal-content ul {
    padding-left: 20px;
    margin: 0 0 16px;
  }
  .legal-content li {
    margin-bottom: 8px;
  }
  .legal-content a {
    color: var(--app-accent, #648DFF);
    text-decoration: none;
  }
  .legal-content a:hover {
    text-decoration: underline;
  }
  .legal-content strong {
    color: var(--app-text, #FAFAFA);
    font-weight: 600;
  }
  .legal-footer-link {
    color: inherit;
    text-decoration: none;
    transition: opacity 0.15s;
  }
  .legal-footer-link:hover {
    opacity: 1 !important;
  }
`;

export default function LegalLayout({ title, updated, children }: Props) {
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
      <style>{LEGAL_STYLES}</style>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            color: 'inherit',
            textDecoration: 'none',
            marginBottom: 32,
            opacity: 0.9,
          }}
        >
          <LogoArkana size={32} />
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>
            Arkana <span style={{ fontWeight: 300, opacity: 0.6 }}>Appointments</span>
          </span>
        </Link>

        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            margin: '0 0 8px',
            color: 'var(--app-text, #FAFAFA)',
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: 13, opacity: 0.45, margin: '0 0 40px', fontFamily: "'SF Pro Text','Inter',sans-serif" }}>
          Última actualización: {updated}
        </p>

        <div
          className="legal-content"
          style={{
            fontSize: 15,
            lineHeight: 1.75,
            color: 'var(--app-muted, rgba(250,250,250,0.75))',
            fontFamily: "'SF Pro Text','Inter',sans-serif",
          }}
        >
          {children}
        </div>

        <div
          style={{
            marginTop: 64,
            paddingTop: 24,
            borderTop: '1px solid var(--app-border, rgba(255,255,255,0.08))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 13,
            opacity: 0.5,
          }}
        >
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Link to="/privacidad" className="legal-footer-link">Privacidad</Link>
            <Link to="/terminos" className="legal-footer-link">Términos</Link>
            <Link to="/seguridad" className="legal-footer-link">Seguridad</Link>
            <Link to="/estado" className="legal-footer-link">Estado</Link>
          </div>
          <Link to="/" className="legal-footer-link">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
