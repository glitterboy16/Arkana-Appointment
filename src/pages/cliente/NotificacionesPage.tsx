import { useEffect, useState } from 'react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase, type EstadoCita } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface CitaEvento {
  id: string;
  fecha: string;
  hora_inicio: string;
  estado: EstadoCita;
  created_at: string;
  negocio: { nombre: string } | null;
  servicio: { nombre: string } | null;
}

interface Notificacion {
  id: string;
  titulo: string;
  detalle: string;
  fecha: Date;
  color: string;
  bg: string;
  icono: string;
}

function citaToNotificacion(c: CitaEvento): Notificacion {
  const negocio = c.negocio?.nombre ?? 'Un negocio';
  const fechaCita = format(parseISO(c.fecha), "d 'de' MMMM 'a las' HH:mm", { locale: es }).replace('00:00', c.hora_inicio.slice(0, 5));
  switch (c.estado) {
    case 'confirmed':
      return {
        id: c.id, color: '#22C55E', bg: 'rgba(34,197,94,0.12)', icono: '✓',
        titulo: `${negocio} confirmó tu cita`,
        detalle: `${c.servicio?.nombre ?? 'Servicio'} · ${fechaCita}`,
        fecha: new Date(c.created_at),
      };
    case 'cancelled':
      return {
        id: c.id, color: '#EF4444', bg: 'rgba(239,68,68,0.12)', icono: '✕',
        titulo: `${negocio} canceló tu cita`,
        detalle: `${c.servicio?.nombre ?? 'Servicio'} · ${fechaCita}`,
        fecha: new Date(c.created_at),
      };
    case 'pending':
      return {
        id: c.id, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icono: '⏱',
        titulo: `Tu cita en ${negocio} está pendiente`,
        detalle: `${c.servicio?.nombre ?? 'Servicio'} · ${fechaCita}`,
        fecha: new Date(c.created_at),
      };
    default:
      return {
        id: c.id, color: '#648DFF', bg: 'rgba(100,141,255,0.12)', icono: '•',
        titulo: `Cita reservada en ${negocio}`,
        detalle: `${c.servicio?.nombre ?? 'Servicio'} · ${fechaCita}`,
        fecha: new Date(c.created_at),
      };
  }
}

export default function NotificacionesPage() {
  const { usuario } = useAuth();
  const [notis, setNotis] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('citas')
        .select('id, fecha, hora_inicio, estado, created_at, negocio:negocios(nombre), servicio:servicios(nombre)')
        .eq('cliente_id', usuario.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (!cancelled) {
        setNotis(((data ?? []) as unknown as CitaEvento[]).map(citaToNotificacion));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [usuario]);

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Notificaciones</h1>
        <p style={{ color: 'var(--app-muted)', fontSize: 14, marginTop: 6 }}>
          Actividad reciente de tus citas.
        </p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--app-subtle)', fontSize: 14 }}>Cargando…</div>
      ) : notis.length === 0 ? (
        <div style={{
          background: 'var(--app-surface)', border: '1px dashed var(--app-border)',
          borderRadius: 12, padding: 40, textAlign: 'center', color: 'var(--app-muted)',
        }}>
          No tienes notificaciones por ahora.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notis.map(n => (
            <div key={n.id} style={{
              background: 'var(--app-surface)', border: '1px solid var(--app-border)',
              borderRadius: 10, padding: 14,
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: n.bg,
                color: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, flexShrink: 0,
              }}>
                {n.icono}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{n.titulo}</div>
                <div style={{ fontSize: 12, color: 'var(--app-muted)' }}>{n.detalle}</div>
                <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginTop: 4 }}>
                  hace {formatDistanceToNow(n.fecha, { locale: es })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
