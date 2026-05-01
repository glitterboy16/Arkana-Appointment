import type { CSSProperties, ReactNode, MouseEventHandler } from 'react';
import logoOscuro from '@/assets/Logo Arkana 1.svg';
import logoClaro from '@/assets/Logo Arkana 2.svg';
import { useTheme } from '@/hooks/useTheme';

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'new';

interface LogoArkanaProps {
  size?: number;
  style?: CSSProperties;
}

export function LogoArkana({ size = 22, style }: LogoArkanaProps) {
  const { tema } = useTheme();
  const src = tema === 'claro' ? logoClaro : logoOscuro;
  return (
    <img
      src={src}
      alt=""
      style={{ width: size, height: size, objectFit: 'contain', ...style }}
    />
  );
}

export const ArkanaIcons = {
  grid: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  building: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  chart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  qr: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <line x1="14" y1="14" x2="14" y2="14" /><line x1="21" y1="14" x2="21" y2="14" />
      <line x1="14" y1="21" x2="21" y2="21" /><line x1="21" y1="17" x2="21" y2="21" />
    </svg>
  ),
  eye: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  check: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  user: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  arrowUp: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
    </svg>
  ),
  star: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

interface BadgeProps {
  status: AppointmentStatus;
}

export function Badge({ status }: BadgeProps) {
  const map: Record<AppointmentStatus, { label: string; bg: string; color: string; dot: string }> = {
    confirmed: { label: 'Confirmada', bg: 'rgba(34,197,94,0.12)', color: '#22C55E', dot: '#22C55E' },
    pending:   { label: 'Pendiente',  bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', dot: '#F59E0B' },
    cancelled: { label: 'Cancelada',  bg: 'rgba(239,68,68,0.12)',  color: '#EF4444', dot: '#EF4444' },
    new:       { label: 'Nueva',      bg: 'rgba(100,141,255,0.12)', color: '#648DFF', dot: '#648DFF' },
  };
  const s = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600,
      padding: '3px 9px', borderRadius: 9999, background: s.bg, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

interface AvatarProps {
  name: string;
  size?: number;
  bg?: string;
}

export function Avatar({ name, size = 32, bg = '#004AAD' }: AvatarProps) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: size / 3, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: '#FAFAFA', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

type BtnVariant = 'primary' | 'accent' | 'ghost' | 'outline';
type BtnSize = 'sm' | 'md' | 'lg';

interface BtnProps {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function Btn({ children, variant = 'primary', size = 'md', onClick, style, type = 'button', disabled }: BtnProps) {
  const variants: Record<BtnVariant, CSSProperties> = {
    primary: { background: '#004AAD', color: '#FAFAFA', border: 'none' },
    accent:  { background: '#648DFF', color: '#FAFAFA', border: 'none' },
    ghost:   { background: 'rgba(255,255,255,0.08)', color: '#FAFAFA', border: '1px solid rgba(255,255,255,0.12)' },
    outline: { background: 'transparent', color: '#648DFF', border: '1px solid #648DFF' },
  };
  const sizes: Record<BtnSize, CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: 12, borderRadius: 6 },
    md: { padding: '9px 18px', fontSize: 13, borderRadius: 8 },
    lg: { padding: '13px 26px', fontSize: 15, borderRadius: 10 },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'inherit',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 150ms ease',
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
