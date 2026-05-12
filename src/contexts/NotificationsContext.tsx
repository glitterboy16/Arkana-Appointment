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
const MAX_ITEMS = 30;

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

// Beep simple con Web Audio API (no requiere asset). El AudioContext queda
// "suspended" hasta el primer gesto del usuario, así que la primera carga
// puede ser silenciosa — eso es OK: el dropdown aún se enciende.
let audioCtx: AudioContext | null = null;
function playNotificationSound() {
  try {
    if (!audioCtx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      audioCtx = new Ctor();
    }
    if (audioCtx.state === 'suspended') void audioCtx.resume();
    const now = audioCtx.currentTime;
    const tones = [880, 1175];
    tones.forEach((freq, i) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = now + i * 0.12;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(start);
      osc.stop(start + 0.32);
    });
  } catch {
    /* sin audio — silenciosamente */
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
    playNotificationSound();
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
