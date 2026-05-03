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
        padding: '18px 16px 14px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid var(--app-border)', flexShrink: 0, justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, background: '#004AAD', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <LogoArkana size={22} onBrand />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.01em' }}>Arkana</div>
            <div style={{ fontSize: 10, color: 'var(--app-subtle)', marginTop: 1 }}>Appointments</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ark-only-mobile"
            aria-label="Cerrar menú"
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: 'transparent', color: 'var(--app-muted)', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0,
            }}
          >
            {ArkanaIcons.close}
          </button>
        )}
      </div>

      <div style={{
        margin: '10px 10px 4px', background: 'var(--app-surface)',
        border: '1px solid var(--app-border)', borderRadius: 8, padding: '8px 10px',
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
      }}>
        <Avatar name={negocio?.nombre ?? 'Negocio'} size={26} bg="#648DFF" />
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: 'var(--app-text)', lineHeight: 1.3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {negocio?.nombre ?? '—'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--app-subtle)', marginTop: 1 }}>Plan Gratuito</div>
        </div>
      </div>

      <nav style={{ flex: 1, paddingBottom: 12 }}>
        {NAV_ITEMS.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          const active = isActive(item);
          const clickable = !!(item.path || item.action);
          return (
            <Fragment key={item.id}>
              {showSection && (
                <div style={{
                  fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase',
                  color: 'var(--app-subtle)', padding: '10px 16px 4px', fontFamily: 'monospace',
                }}>
                  {item.section}
                </div>
              )}
              <button
                onClick={() => handleClick(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                  margin: '1px 8px', borderRadius: 7, fontSize: 13,
                  cursor: clickable ? 'pointer' : 'default',
                  transition: 'all 150ms ease',
                  color: active ? 'var(--app-text)' : 'var(--app-muted)',
                  background: active ? 'var(--app-nav-active)' : 'transparent',
                  fontWeight: active ? 600 : 400,
                  border: 'none',
                  width: 'calc(100% - 16px)',
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
