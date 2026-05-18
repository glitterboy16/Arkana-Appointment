import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { BiBell, BiCheck, BiX, BiRefresh, BiCalendarPlus } from 'react-icons/bi';
import { useNotifications, type NotifKind } from '@/contexts/NotificationsContext';
import { useAuth } from '@/contexts/AuthContext';

const KIND_STYLE: Record<NotifKind, { color: string; bg: string; icono: ReactNode }> = {
  cita_nueva:       { color: '#648DFF', bg: 'rgba(100,141,255,0.15)', icono: <BiCalendarPlus size={18} /> },
  cita_confirmada:  { color: '#22C55E', bg: 'rgba(34,197,94,0.15)',   icono: <BiCheck size={20} /> },
  cita_cancelada:   { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   icono: <BiX size={20} /> },
  cita_reagendada:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  icono: <BiRefresh size={18} /> },
};

interface NotificationsBellProps {
  iconColor?: string;
}

export default function NotificationsBell({ iconColor }: NotificationsBellProps) {
  const { items, unread, markAllRead, clear } = useNotifications();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const citasPath = usuario?.rol === 'cliente' ? '/app/citas' : '/panel/citas';

  const handleItemClick = () => {
    setOpen(false);
    navigate(citasPath);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleToggle = () => {
    setOpen(prev => {
      const next = !prev;
      if (next && unread > 0) {
        // Marca como leídas al abrir, pero da un instante para que el usuario
        // vea el badge antes (mejor UX que cambiar el badge de golpe).
        setTimeout(() => markAllRead(), 800);
      }
      return next;
    });
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Notificaciones${unread ? ` (${unread} sin leer)` : ''}`}
        style={{
          position: 'relative', background: 'transparent', border: 'none',
          padding: 6, borderRadius: 8, cursor: 'pointer',
          color: iconColor ?? 'var(--app-muted)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 150ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--app-nav-hover)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <BiBell size={20} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            minWidth: 16, height: 16, padding: '0 4px',
            borderRadius: 9999, background: '#EF4444', color: '#FAFAFA',
            fontSize: 10, fontWeight: 700, lineHeight: '16px', textAlign: 'center',
            boxShadow: '0 0 0 2px var(--app-bg-elevated)',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notificaciones"
          className="ark-notif-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 80,
            width: 'min(340px, calc(100vw - 24px))',
            maxHeight: 'min(440px, 70vh)',
            display: 'flex', flexDirection: 'column',
            background: 'var(--app-bg-elevated)',
            border: '1px solid var(--app-border)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            animation: 'ark-fade-in 200ms ease-out both',
          }}
        >
          <div style={{
            padding: '12px 14px', borderBottom: '1px solid var(--app-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text)' }}>Notificaciones</div>
            {items.length > 0 && (
              <button
                onClick={clear}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--app-muted)', fontSize: 11, fontFamily: 'inherit', padding: 4,
                }}
              >
                Vaciar
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {items.length === 0 ? (
              <div style={{
                padding: '36px 20px', textAlign: 'center', color: 'var(--app-subtle)', fontSize: 13,
              }}>
                Cuando haya actividad nueva aparecerá aquí.
              </div>
            ) : (
              items.map(n => {
                const s = KIND_STYLE[n.kind];
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={handleItemClick}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '11px 14px', borderBottom: '1px solid var(--app-border)',
                      background: n.leida ? 'transparent' : 'rgba(100,141,255,0.06)',
                      transition: 'background 150ms ease',
                      width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--app-nav-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = n.leida ? 'transparent' : 'rgba(100,141,255,0.06)'; }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: s.bg, color: s.color, fontWeight: 700, fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {s.icono}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: 'var(--app-text)',
                        lineHeight: 1.35,
                      }}>
                        {n.titulo}
                      </div>
                      <div style={{
                        fontSize: 11, color: 'var(--app-muted)', marginTop: 2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {n.detalle}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--app-subtle)', marginTop: 3 }}>
                        hace {formatDistanceToNow(n.fecha, { locale: es })}
                      </div>
                    </div>
                    {!n.leida && (
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%', background: '#648DFF',
                        marginTop: 6, flexShrink: 0,
                      }} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
