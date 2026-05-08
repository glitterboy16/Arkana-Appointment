import { type ReactNode } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { BiCheck, BiX, BiRefresh, BiCalendarPlus, BiBellOff } from 'react-icons/bi';
import { useNotifications, type NotifKind } from '@/contexts/NotificationsContext';

const KIND_STYLE: Record<NotifKind, { color: string; bg: string; icono: ReactNode }> = {
  cita_nueva:      { color: '#648DFF', bg: 'rgba(100,141,255,0.12)', icono: <BiCalendarPlus size={20} /> },
  cita_confirmada: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   icono: <BiCheck size={22} /> },
  cita_cancelada:  { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icono: <BiX size={22} /> },
  cita_reagendada: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icono: <BiRefresh size={20} /> },
};

export default function NotificacionesPage() {
  const { items, clear } = useNotifications();

  return (
    <div className="ark-page" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(26px, 5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Notificaciones</h1>
          <p style={{ color: 'var(--app-muted)', fontSize: 15, marginTop: 8 }}>
            Actividad reciente de tus citas.
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clear}
            style={{
              background: 'transparent', border: '1px solid var(--app-border)',
              color: 'var(--app-muted)', padding: '8px 14px', borderRadius: 8,
              fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            Vaciar todo
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div style={{
          background: 'var(--app-surface)', border: '1px dashed var(--app-border)',
          borderRadius: 12, padding: 48, textAlign: 'center', color: 'var(--app-muted)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <BiBellOff size={32} style={{ opacity: 0.5 }} />
          <div style={{ fontSize: 14 }}>No tienes notificaciones por ahora.</div>
          <div style={{ fontSize: 12, color: 'var(--app-subtle)' }}>
            Cuando haya nuevas citas o cambios aparecerán aquí.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(n => {
            const s = KIND_STYLE[n.kind];
            return (
              <div key={n.id} style={{
                background: n.leida ? 'var(--app-surface)' : 'rgba(100,141,255,0.06)',
                border: '1px solid var(--app-border)',
                borderRadius: 12, padding: 16,
                display: 'flex', alignItems: 'flex-start', gap: 14,
                transition: 'background 150ms ease',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', background: s.bg,
                  color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {s.icono}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{n.titulo}</div>
                  <div style={{ fontSize: 13, color: 'var(--app-muted)' }}>{n.detalle}</div>
                  <div style={{ fontSize: 12, color: 'var(--app-subtle)', marginTop: 5 }}>
                    hace {formatDistanceToNow(n.fecha, { locale: es })}
                  </div>
                </div>
                {!n.leida && (
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', background: '#648DFF',
                    marginTop: 6, flexShrink: 0,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
