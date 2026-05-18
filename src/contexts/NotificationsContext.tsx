import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { supabase, type Cita, type EstadoCita, type RolUsuario } from '@/lib/supabase';
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
  /**
   * Silencia la próxima notificación que coincida con (citaId, kind) dentro de
   * los próximos 60 segundos. La usamos cuando el usuario realiza una acción
   * (cancelar / reagendar) él mismo, para no auto-notificarse.
   */
  silenceNext: (citaId: string, kind: NotifKind) => void;
}

const NotificationsContext = createContext<NotifCtx | null>(null);

const MAX_ITEMS = 30;
const POLL_INTERVAL_MS = 10_000;

// Claves de localStorage namespaced por (usuario, rol). El namespace por rol es
// necesario porque un mismo auth.users.id puede haber actuado primero como
// cliente y luego cambiar de rol; sin esto, el negocio veía notifs viejas con
// plantilla de cliente ("angelias confirmó tu cita") guardadas cuando rol era
// 'cliente'. Bumpeamos a v3 para invalidar las v2.
const storageKey = (uid: string, rol: RolUsuario) => `arkana.notifs.v3.${uid}.${rol}`;
const lastCheckKey = (uid: string, rol: RolUsuario) => `arkana.notifs.lastCheck.v3.${uid}.${rol}`;
const snapshotKey = (uid: string, rol: RolUsuario) => `arkana.notifs.citasSnapshot.v3.${uid}.${rol}`;

/**
 * Una sola vez por carga de app, eliminamos cualquier key antigua de notifs
 * (v1, v2, sin versión) para que no aparezcan en la UI tras el upgrade.
 * Se ejecuta de forma idempotente: si ya se hizo, no hace nada.
 */
const LEGACY_CLEANUP_FLAG = 'arkana.notifs.legacyCleaned.v3';
function cleanupLegacyNotifKeys() {
  try {
    if (localStorage.getItem(LEGACY_CLEANUP_FLAG)) return;
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      // Borramos cualquier key que empiece por "arkana.notifs." y NO sea v3
      if (k.startsWith('arkana.notifs.') && !k.startsWith('arkana.notifs.v3') && k !== LEGACY_CLEANUP_FLAG) {
        toRemove.push(k);
      }
    }
    toRemove.forEach(k => localStorage.removeItem(k));
    localStorage.setItem(LEGACY_CLEANUP_FLAG, '1');
  } catch {
    /* quota o privacy mode — ignoramos */
  }
}

/**
 * Borra TODAS las keys de notifs (cualquier versión) del usuario actual.
 * Se invoca desde signOut para evitar arrastre entre sesiones.
 */
export function clearAllNotifStorage() {
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('arkana.notifs.')) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  } catch { /* ignorar */ }
}

interface CitaSnapshot {
  estado: string;
  fecha: string;
  hora_inicio: string;
}

function loadStored(uid: string | undefined, rol: RolUsuario | undefined): NotifItem[] {
  if (!uid || !rol) return [];
  try {
    const raw = localStorage.getItem(storageKey(uid, rol));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Omit<NotifItem, 'fecha'> & { fecha: string }>;
    return parsed.map(n => ({ ...n, fecha: new Date(n.fecha) }));
  } catch {
    return [];
  }
}

function saveStored(uid: string | undefined, rol: RolUsuario | undefined, items: NotifItem[]) {
  if (!uid || !rol) return;
  try {
    localStorage.setItem(storageKey(uid, rol), JSON.stringify(items.slice(0, MAX_ITEMS)));
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
  const uid = usuario?.id;
  const rol = usuario?.rol;
  const [items, setItems] = useState<NotifItem[]>([]);
  const prevCitasRef = useRef<Map<string, Cita>>(new Map());
  // Map de `${citaId}-${kind}` → expiry timestamp para silencio temporal.
  const silenceRef = useRef<Map<string, number>>(new Map());

  // Limpieza única de keys legacy (v1/v2/sin versión) al montar.
  useEffect(() => { cleanupLegacyNotifKeys(); }, []);

  // Cargar/limpiar al cambiar de usuario o de rol. Si rol cambia para el mismo
  // uid (caso testing), las notifs del rol anterior no contaminan al actual.
  useEffect(() => {
    setItems(loadStored(uid, rol));
    prevCitasRef.current = new Map();
    silenceRef.current = new Map();
  }, [uid, rol]);

  const silenceNext = useCallback((citaId: string, kind: NotifKind) => {
    silenceRef.current.set(`${citaId}-${kind}`, Date.now() + 60_000);
  }, []);

  const push = useCallback((notif: Omit<NotifItem, 'id' | 'leida' | 'fecha'> & { fecha?: Date }) => {
    // ¿Estamos silenciando este (cita, kind)? Si sí, descartar y limpiar.
    const sKey = `${notif.citaId}-${notif.kind}`;
    const silencedUntil = silenceRef.current.get(sKey);
    if (silencedUntil && silencedUntil > Date.now()) {
      silenceRef.current.delete(sKey);
      return;
    }
    if (silencedUntil) silenceRef.current.delete(sKey); // expirado, limpiar

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
      saveStored(uid, rol, updated);
      return updated;
    });
  }, [uid, rol]);

  const markAllRead = useCallback(() => {
    setItems(prev => {
      if (prev.every(n => n.leida)) return prev;
      const updated = prev.map(n => ({ ...n, leida: true }));
      saveStored(uid, rol, updated);
      return updated;
    });
  }, [uid, rol]);

  const clear = useCallback(() => {
    setItems([]);
    saveStored(uid, rol, []);
  }, [uid, rol]);

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

          const cambioFecha = vieja.fecha !== nueva.fecha;
          const cambioHora = vieja.hora_inicio !== nueva.hora_inicio;
          const cambioEstado = vieja.estado !== nueva.estado;
          if (!cambioFecha && !cambioHora && !cambioEstado) return;

          if (usuario.rol === 'cliente') {
            // El cliente es notificado de los cambios hechos por el negocio.
            // Si fue él mismo quien canceló, su contexto silencia esa notif
            // (ver silenceNext en MisCitasPage).
            let negocioNombre = 'El negocio';
            const { data: neg } = await supabase
              .from('negocios')
              .select('nombre')
              .eq('id', nueva.negocio_id)
              .maybeSingle();
            if (neg?.nombre) negocioNombre = neg.nombre;

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
            return;
          }

          if (usuario.rol === 'negocio') {
            // El negocio se notifica cuando el CLIENTE cancela. Si fue el negocio
            // quien canceló, su propio contexto silencia la notif (ver CitasPage).
            if (cambioEstado && nueva.estado === 'cancelled' && vieja.estado !== 'cancelled') {
              push({
                citaId: nueva.id,
                kind: 'cita_cancelada',
                titulo: `${nueva.cliente_nombre} canceló su cita`,
                detalle: `${formatearFecha(nueva.fecha, nueva.hora_inicio)}`,
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
    const lastCheckLk = lastCheckKey(usuario.id, usuario.rol);
    let lastCheck = localStorage.getItem(lastCheckLk) ?? new Date().toISOString();

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
          localStorage.setItem(lastCheckLk, lastCheck);
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
      localStorage.setItem(lastCheckLk, lastCheck);
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

    const snapLk = snapshotKey(usuario.id, usuario.rol);
    // Snapshot inicial: leer lo que tengamos guardado en localStorage
    const loadSnapshot = (): Record<string, CitaSnapshot> => {
      try {
        const raw = localStorage.getItem(snapLk);
        return raw ? JSON.parse(raw) : {};
      } catch { return {}; }
    };
    const saveSnapshot = (snap: Record<string, CitaSnapshot>) => {
      try { localStorage.setItem(snapLk, JSON.stringify(snap)); } catch { /* ignorar */ }
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
    <NotificationsContext.Provider value={{ items, unread, markAllRead, clear, silenceNext }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationsProvider');
  return ctx;
}
