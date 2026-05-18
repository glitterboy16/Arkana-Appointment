import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LogoArkana } from '@/components/app/Shared';

interface Props {
  title: string;
  updated: string;
  children: ReactNode;
}

export default function LegalLayout({ title, updated, children }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--app-bg, #0A0A0A)',
        color: 'var(--app-text, #FAFAFA)',
        fontFamily: "'SF Pro Display','Inter',sans-serif",
        padding: 'clamp(24px, 5vw, 56px) clamp(16px, 5vw, 48px)',
      }}
    >
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
            letterSpacing: '-0.02em',
            margin: '0 0 8px',
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: 13, opacity: 0.55, margin: '0 0 36px' }}>
          Última actualización: {updated}
        </p>

        <div
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: 'var(--app-muted, rgba(250,250,250,0.78))',
          }}
        >
          {children}
        </div>

        <div
          style={{
            marginTop: 56,
            paddingTop: 24,
            borderTop: '1px solid var(--app-border, rgba(255,255,255,0.08))',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            opacity: 0.6,
          }}
        >
          <Link to="/privacidad" style={{ color: 'inherit', textDecoration: 'none' }}>
            Política de privacidad
          </Link>
          <Link to="/terminos" style={{ color: 'inherit', textDecoration: 'none' }}>
            Términos de uso
          </Link>
        </div>
      </div>
    </div>
  );
}
