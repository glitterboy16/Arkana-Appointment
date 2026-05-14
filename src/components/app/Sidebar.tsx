import { Fragment, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArkanaIcons, Avatar, LogoArkana } from './Shared';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  id: string;
  icon: ReactNode;
  label: string;
  section?: string;
  path?: string;
  action?: () => void;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { negocio, signOut } = useAuth();

  const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard',    icon: ArkanaIcons.grid,     label: 'Panel principal',    section: 'GESTIÓN', path: '/panel' },
    { id: 'appointments', icon: ArkanaIcons.calendar, label: 'Mis citas',          path: '/panel/citas' },
    { id: 'notifications',icon: ArkanaIcons.bell,     label: 'Notificaciones',     path: '/panel/notificaciones' },
    { id: 'profile',      icon: ArkanaIcons.building, label: 'Perfil del negocio', path: '/panel/perfil' },
    { id: 'stats',        icon: ArkanaIcons.chart,    label: 'Estadísticas' },
    { id: 'qr',           icon: ArkanaIcons.qr,       label: 'Código QR' },
    {
      id: 'public', icon: ArkanaIcons.eye, label: 'Vista pública',
      section: 'ACCESOS RÁPIDOS',
      path: negocio ? `/n/${negocio.slug}` : undefined,
    },
    { id: 'settings', icon: ArkanaIcons.settings, label: 'Configuración', path: '/panel/configuracion' },
    {
      id: 'logout', icon: ArkanaIcons.logout, label: 'Cerrar sesión',
      action: async () => { await signOut(); navigate('/'); },
    },
  ];

  const isActive = (item: NavItem) => {
    if (!item.path) return false;
    if (item.path === '/panel') return location.pathname === '/panel';
    return location.pathname.startsWith(item.path);
  };

  const handleClick = (item: NavItem) => {
    if (item.action) { item.action(); return; }
    if (item.path) { navigate(item.path); onClose?.(); }
  };

  let lastSection: string | null = null;

  return (
    <aside className={`ark-sidebar${isOpen ? ' open' : ''}`}>
      <div style={{
        padding: '20px 18px 16px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--app-border)', flexShrink: 0, justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, background: '#004AAD', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <LogoArkana size={32} onBrand />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.01em' }}>Arkana</div>
            <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginTop: 1 }}>Appointments</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ark-only-mobile"
            aria-label="Cerrar menú"
            style={{
              width: 36, height: 36, borderRadius: 9, border: 'none',
              background: 'transparent', color: 'var(--app-muted)', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0,
            }}
          >
            {ArkanaIcons.close}
          </button>
        )}
      </div>

      <div style={{
        margin: '12px 12px 6px', background: 'var(--app-surface)',
        border: '1px solid var(--app-border)', borderRadius: 10, padding: '10px 12px',
        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
      }}>
        <Avatar name={negocio?.nombre ?? 'Negocio'} size={34} bg="#648DFF" />
        <div style={{ overflow: 'hidden', minWidth: 0 }}>
          <div style={{
            fontSize: 13.5, fontWeight: 600, color: 'var(--app-text)', lineHeight: 1.3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {negocio?.nombre ?? '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginTop: 2 }}>Plan Gratuito</div>
        </div>
      </div>

      <nav style={{ flex: 1, paddingBottom: 14 }}>
        {NAV_ITEMS.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          const active = isActive(item);
          const clickable = !!(item.path || item.action);
          return (
            <Fragment key={item.id}>
              {showSection && (
                <div style={{
                  fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase',
                  color: 'var(--app-subtle)', padding: '12px 18px 6px', fontFamily: 'monospace',
                }}>
                  {item.section}
                </div>
              )}
              <button
                onClick={() => handleClick(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  margin: '2px 10px', borderRadius: 8, fontSize: 14,
                  cursor: clickable ? 'pointer' : 'default',
                  transition: 'all 150ms ease',
                  color: active ? 'var(--app-text)' : 'var(--app-muted)',
                  background: active ? 'var(--app-nav-active)' : 'transparent',
                  fontWeight: active ? 600 : 500,
                  border: 'none',
                  width: 'calc(100% - 20px)',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  opacity: clickable ? 1 : 0.5,
                }}
                onMouseEnter={(e) => { if (!active && clickable) e.currentTarget.style.background = 'var(--app-nav-hover)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ opacity: active ? 1 : 0.65, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            </Fragment>
          );
        })}
      </nav>
    </aside>
  );
}
