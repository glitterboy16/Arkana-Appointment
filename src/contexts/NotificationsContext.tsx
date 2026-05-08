import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { supabase, type Cita, type EstadoCita } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type NotifKind =
  | 'cita_nueva'        // negocio: cliente reserva una cita
  | 'cita_confirmada'   // cliente: el negocio confirma su cita
  | 'cita_cancelada'    // ambos: contraparte cancela la cita
  | 'cita_reagendada';  // cliente: el negocio cambia fecha/hora

export interface NotifItem {
  id: string;          // notif local id
  citaId: string;
  kind: NotifKind;
  titulo: string;
  detalle: string;
  fecha: Date;
  leida: boolean;
}

interface NotifCtx {
  items: NotifItem[];
  unread: number;
  markAllRead: () => void;
  clear: () => void;
}

const NotificationsContext = createContext<NotifCtx | null>(null);

const STORAGE_KEY = 'arkana.notifs.v1';
const LAST_CHECK_KEY = 'arkana.notifs.lastCheck.v1';
const CITAS_SNAPSHOT_KEY = 'arkana.notifs.citasSnapshot.v1';
const MAX_ITEMS = 30;
const POLL_INTERVAL_MS = 10_000;

interface CitaSnapshot {
  estado: string;
  fecha: string;
  hora_inicio: string;
}

function loadStored(): NotifItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Omit<NotifItem, 'fecha'> & { fecha: string }>;
    return parsed.map(n => ({ ...n, fecha: new Date(n.fecha) }));
  } catch {
    return [];
  }
}

function saveStored(items: NotifItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    /* quota o privacy mode — ignoramos */
  }
}

function nombreEstado(estado: EstadoCita): string {
  return estado === 'confirmed' ? 'confirmada'
    : estado === 'cancelled' ? 'cancelada'
    : estado === 'pending'   ? 'pendiente'
    : 'nueva';
}

function formatearFecha(fecha: string, hora: string): string {
  // YYYY-MM-DD → DD/MM
  const [, m, d] = fecha.split('-');
  return `${d}/${m} a las ${hora.slice(0, 5)}`;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { session, usuario, negocio } = useAuth();
  const [items, setItems] = useState<NotifItem[]>(() => loadStored());
  const prevCitasRef = useRef<Map<string, Cita>>(new Map());

  const push = useCallback((notif: Omit<NotifItem, 'id' | 'leida' | 'fecha'> & { fecha?: Date }) => {
    setItems(prev => {
      // Dedup: no repetir la misma notif (mismo citaId + mismo kind) si ya existe.
      // Realtime y polling pueden disparar el mismo evento — esto los unifica.
      if (prev.some(p => p.citaId === notif.citaId && p.kind === notif.kind)) {
        return prev;
      }
      const next: NotifItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        leida: false,
        fecha: notif.fecha ?? new Date(),
        ...notif,
      };
      const updated = [next, ...prev].slice(0, MAX_ITEMS);
      saveStored(updated);
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setItems(prev => {
      if (prev.every(n => n.leida)) return prev;
      const updated = prev.map(n => ({ ...n, leida: true }));
      saveStored(updated);
      return updated;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    saveStored([]);
  }, []);

  useEffect(() => {
    if (!session?.user || !usuario) return;

    // Filtros realtime: el negocio escucha por negocio_id, el cliente por cliente_id.
    let filter: string | null = null;
    if (usuario.rol === 'negocio' && negocio?.id) {
      filter = `negocio_id=eq.${negocio.id}`;
    } else if (usuario.rol === 'cliente') {
      filter = `cliente_id=eq.${usuario.id}`;
    }
    if (!filter) return;

    const channel = supabase
      .channel(`arkana-citas-${usuario.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'citas', filter },
        async (payload) => {
          const cita = payload.new as Cita;
          prevCitasRef.current.set(cita.id, cita);

          // Solo los negocios reciben notificaciones de citas NUEVAS.
          if (usuario.rol !== 'negocio') return;

          // Resolver nombre de servicio (no viene en el payload de realtime)
          let servicioNombre = 'una cita';
          const { data: srv } = await supabase
            .from('servicios')
            .select('nombre')
            .eq('id', cita.servicio_id)
            .maybeSingle();
          if (srv?.nombre) servicioNombre = srv.nombre;

          push({
            citaId: cita.id,
            kind: 'cita_nueva',
            titulo: `Nueva cita de ${cita.cliente_nombre}`,
            detalle: `${servicioNombre} · ${formatearFecha(cita.fecha, cita.hora_inicio)}`,
          });
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'citas', filter },
        async (payload) => {
          const nueva = payload.new as Cita;
          const vieja = (payload.old as Cita) ?? prevCitasRef.current.get(nueva.id);
          prevCitasRef.current.set(nueva.id, nueva);

          if (!vieja) return;

          // Solo los clientes son notificados de cambios. El negocio que cambia
          // el estado no debe recibir notificación de su propia acción.
          if (usuario.rol !== 'cliente') return;

          // Recuperar nombre del negocio para enriquecer el mensaje
          let negocioNombre = 'El negocio';
          const { data: neg } = await supabase
            .from('negocios')
            .select('nombre')
            .eq('id', nueva.negocio_id)
            .maybeSingle();
          if (neg?.nombre) negocioNombre = neg.nombre;

          const cambioFecha = vieja.fecha !== nueva.fecha;
          const cambioHora = vieja.hora_inicio !== nueva.hora_inicio;
          const cambioEstado = vieja.estado !== nueva.estado;

          if (cambioFecha || cambioHora) {
            push({
              citaId: nueva.id,
              kind: 'cita_reagendada',
              titulo: `${negocioNombre} reagendó tu cita`,
              detalle: `Nueva fecha: ${formatearFecha(nueva.fecha, nueva.hora_inicio)}`,
            });
            return;
          }
          if (cambioEstado) {
            if (nueva.estado === 'confirmed') {
              push({
                citaId: nueva.id,
                kind: 'cita_confirmada',
                titulo: `${negocioNombre} confirmó tu cita`,
                detalle: `${formatearFecha(nueva.fecha, nueva.hora_inicio)}`,
              });
            } else if (nueva.estado === 'cancelled') {
              push({
                citaId: nueva.id,
                kind: 'cita_cancelada',
                titulo: `${negocioNombre} canceló tu cita`,
                detalle: `Estado anterior: ${nombreEstado(vieja.estado)}`,
              });
            }
          }
        },
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [session?.user, usuario, negocio?.id, push]);

  // Polling de respaldo para el NEGOCIO: detecta citas nuevas creadas por
  // clientes incluso si realtime de Supabase está caído.
  useEffect(() => {
    if (!session?.user || !usuario || usuario.rol !== 'negocio' || !negocio?.id) return;

    let cancelled = false;
    let lastCheck = localStorage.getItem(LAST_CHECK_KEY) ?? new Date().toISOString();

    const pollOnce = async () => {
      const since = lastCheck;
      const { data, error } = await supabase
        .from('citas')
        .select('id, cliente_nombre, servicio_id, fecha, hora_inicio, created_at')
        .eq('negocio_id', negocio.id)
        .gt('created_at', since)
        .order('created_at', { ascending: false })
        .limit(20);

      if (cancelled || error || !data || data.length === 0) {
        if (!cancelled && !error) {
          lastCheck = new Date().toISOString();
          localStorage.setItem(LAST_CHECK_KEY, lastCheck);
        }
        return;
      }

      for (const c of data as Array<Pick<Cita, 'id' | 'cliente_nombre' | 'servicio_id' | 'fecha' | 'hora_inicio'>>) {
        let servicioNombre = 'una cita';
        const { data: srv } = await supabase
          .from('servicios')
          .select('nombre')
          .eq('id', c.servicio_id)
          .maybeSingle();
        if (srv?.nombre) servicioNombre = srv.nombre;

        push({
          citaId: c.id,
          kind: 'cita_nueva',
          titulo: `Nueva cita de ${c.cliente_nombre}`,
          detalle: `${servicioNombre} · ${formatearFecha(c.fecha, c.hora_inicio)}`,
        });
      }

      lastCheck = new Date().toISOString();
      localStorage.setItem(LAST_CHECK_KEY, lastCheck);
    };

    void pollOnce();
    const interval = window.setInterval(() => { void pollOnce(); }, POLL_INTERVAL_MS);
    const onVisible = () => { if (!document.hidden) void pollOnce(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [session?.user, usuario, negocio?.id, push]);

  // Polling de respaldo para el CLIENTE: si realtime falla, comparamos un
  // snapshot de las citas del cliente con el estado actual cada 10s. Cualquier
  // cambio de fecha/hora o estado dispara la notificacion correspondiente.
  // La dedup por (citaId+kind) en push() evita duplicados con realtime.
  useEffect(() => {
    if (!session?.user || !usuario || usuario.rol !== 'cliente') return;

    let cancelled = false;

    // Snapshot inicial: leer lo que tengamos guardado en localStorage
    const loadSnapshot = (): Record<string, CitaSnapshot> => {
      try {
        const raw = localStorage.getItem(CITAS_SNAPSHOT_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch { return {}; }
    };
    const saveSnapshot = (snap: Record<string, CitaSnapshot>) => {
      try { localStorage.setItem(CITAS_SNAPSHOT_KEY, JSON.stringify(snap)); } catch { /* ignorar */ }
    };

    let snapshot = loadSnapshot();
    const negocioNombreCache = new Map<string, string>();

    const resolverNegocioNombre = async (negocioId: string): Promise<string> => {
      const cached = negocioNombreCache.get(negocioId);
      if (cached) return cached;
      const { data } = await supabase
        .from('negocios')
        .select('nombre')
        .eq('id', negocioId)
        .maybeSingle();
      const nombre = data?.nombre ?? 'El negocio';
      negocioNombreCache.set(negocioId, nombre);
      return nombre;
    };

    const pollOnce = async () => {
      const { data, error } = await supabase
        .from('citas')
        .select('id, negocio_id, fecha, hora_inicio, estado')
        .eq('cliente_id', usuario.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (cancelled || error || !data) return;

      const nextSnapshot: Record<string, CitaSnapshot> = {};
      for (const c of data as Array<Pick<Cita, 'id' | 'negocio_id' | 'fecha' | 'hora_inicio' | 'estado'>>) {
        const actual: CitaSnapshot = { estado: c.estado, fecha: c.fecha, hora_inicio: c.hora_inicio };
        nextSnapshot[c.id] = actual;

        const previo = snapshot[c.id];
        if (!previo) continue; // primera vez que vemos esta cita: no emitir

        const cambioFecha = previo.fecha !== actual.fecha;
        const cambioHora  = previo.hora_inicio !== actual.hora_inicio;
        const cambioEstado = previo.estado !== actual.estado;
        if (!cambioFecha && !cambioHora && !cambioEstado) continue;

        const negocioNombre = await resolverNegocioNombre(c.negocio_id);

        if (cambioFecha || cambioHora) {
          push({
            citaId: c.id,
            kind: 'cita_reagendada',
            titulo: `${negocioNombre} reagendó tu cita`,
            detalle: `Nueva fecha: ${formatearFecha(actual.fecha, actual.hora_inicio)}`,
          });
          continue;
        }
        if (cambioEstado) {
          if (actual.estado === 'confirmed') {
            push({
              citaId: c.id,
              kind: 'cita_confirmada',
              titulo: `${negocioNombre} confirmó tu cita`,
              detalle: formatearFecha(actual.fecha, actual.hora_inicio),
            });
          } else if (actual.estado === 'cancelled') {
            push({
              citaId: c.id,
              kind: 'cita_cancelada',
              titulo: `${negocioNombre} canceló tu cita`,
              detalle: `Estado anterior: ${nombreEstado(previo.estado as Cita['estado'])}`,
            });
          }
        }
      }

      snapshot = nextSnapshot;
      saveSnapshot(snapshot);
    };

    void pollOnce();
    const interval = window.setInterval(() => { void pollOnce(); }, POLL_INTERVAL_MS);
    const onVisible = () => { if (!document.hidden) void pollOnce(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [session?.user, usuario, push]);

  const unread = items.filter(n => !n.leida).length;

  return (
    <NotificationsContext.Provider value={{ items, unread, markAllRead, clear }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationsProvider');
  return ctx;
}
