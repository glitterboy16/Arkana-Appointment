import { Fragment, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArkanaIcons, Avatar } from './Shared';
import logoIcon from '@/assets/logo-icon.svg';

interface NavItem {
  id: string;
  icon: ReactNode;
  label: string;
  section?: string;
  path?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    icon: ArkanaIcons.grid,     label: 'Panel principal',    section: 'GESTIÓN', path: '/panel' },
  { id: 'appointments', icon: ArkanaIcons.calendar, label: 'Mis citas',          path: '/panel/citas' },
  { id: 'profile',      icon: ArkanaIcons.building, label: 'Perfil del negocio', path: '/panel/perfil' },
  { id: 'stats',        icon: ArkanaIcons.chart,    label: 'Estadísticas' },
  { id: 'qr',           icon: ArkanaIcons.qr,       label: 'Código QR' },
  { id: 'public',       icon: ArkanaIcons.eye,      label: 'Vista pública',      section: 'ACCESOS RÁPIDOS', path: '/n/sonrisa' },
  { id: 'settings',     icon: ArkanaIcons.settings, label: 'Configuración' },
  { id: 'logout',       icon: ArkanaIcons.logout,   label: 'Cerrar sesión',      path: '/' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (item: NavItem) => {
    if (!item.path) return false;
    if (item.path === '/panel') return location.pathname === '/panel';
    return location.pathname.startsWith(item.path);
  };

  const handleClick = (item: NavItem) => {
    if (item.path) navigate(item.path);
  };

  let lastSection: string | null = null;

  return (
    <aside style={{ width: 220, height: '100%', background: '#050A30', borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{ padding: '18px 16px 14px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, background: '#004AAD', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={logoIcon} alt="" style={{ width: 22, height: 22, objectFit: 'contain', filter: 'brightness(10)' }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.01em' }}>Arkana</div>
          <div style={{ fontSize: 10, color: 'rgba(250,250,250,0.4)', marginTop: 1 }}>Appointments</div>
        </div>
      </div>

      <div style={{ margin: '10px 10px 4px', background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, padding: '8px 10px',
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <Avatar name="Clínica Dental Sonrisa" size={26} bg="#648DFF" />
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#FAFAFA', lineHeight: 1.3 }}>Clínica Dental Sonrisa</div>
          <div style={{ fontSize: 10, color: 'rgba(250,250,250,0.40)', marginTop: 1 }}>Plan Profesional</div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          const active = isActive(item);
          return (
            <Fragment key={item.id}>
              {showSection && (
                <div style={{ fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase',
                  color: 'rgba(250,250,250,0.30)', padding: '10px 16px 4px', fontFamily: 'monospace' }}>
                  {item.section}
                </div>
              )}
              <button
                onClick={() => handleClick(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                  margin: '1px 8px', borderRadius: 7, fontSize: 13,
                  cursor: item.path ? 'pointer' : 'default',
                  transition: 'all 150ms ease',
                  color: active ? '#FAFAFA' : 'rgba(250,250,250,0.60)',
                  background: active ? 'rgba(100,141,255,0.15)' : 'transparent',
                  fontWeight: active ? 600 : 400,
                  border: 'none',
                  width: 'calc(100% - 16px)',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  opacity: item.path ? 1 : 0.5,
                }}
              >
                <span style={{ opacity: active ? 1 : 0.65, flexShrink: 0, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                {item.label}
              </button>
            </Fragment>
          );
        })}
      </nav>
    </aside>
  );
}
