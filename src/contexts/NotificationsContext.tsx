import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type NotifKind =
  | 'cita_nueva'        // negocio: cliente reserva una cita
  | 'cita_confirmada'   // cliente: el negocio confirma su cita
  | 'cita_cancelada'    // ambos: contraparte cancela la cita
  | 'cita_reagendada';  // cliente: el negocio cambia fecha/hora

export interface NotifItem {
  id: string;
  citaId: string | null;
  kind: NotifKind;
  titulo: string;
  detalle: string;
  fecha: Date;
  leida: boolean;
}

interface NotifCtx {
  items: NotifItem[];
  unread: number;
  markAllRead: () => Promise<void>;
  clear: () => Promise<void>;
}

const NotificationsContext = createContext<NotifCtx | null>(null);

const MAX_ITEMS = 50;

interface NotifRow {
  id: string;
  cita_id: string | null;
  kind: NotifKind;
  titulo: string;
  detalle: string;
  leida: boolean;
  created_at: string;
}

function rowToItem(row: NotifRow): NotifItem {
  return {
    id: row.id,
    citaId: row.cita_id,
    kind: row.kind,
    titulo: row.titulo,
    detalle: row.detalle,
    leida: row.leida,
    fecha: new Date(row.created_at),
  };
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { session, usuario } = useAuth();
  const uid = usuario?.id;
  const [items, setItems] = useState<NotifItem[]>([]);

  // Carga inicial al loguearse o cambiar de usuario. Trae el historial completo
  // (limitado a MAX_ITEMS) desde Supabase, así el usuario ve también lo que se
  // generó mientras estaba desconectado.
  useEffect(() => {
    if (!uid) {
      setItems([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('id, cita_id, kind, titulo, detalle, leida, created_at')
        .eq('usuario_id', uid)
        .order('created_at', { ascending: false })
        .limit(MAX_ITEMS);

      if (cancelled || error || !data) return;
      setItems(data.map(d => rowToItem(d as NotifRow)));
    })();
    return () => { cancelled = true; };
  }, [uid]);

  // Suscripción realtime a INSERTs en notificaciones del usuario actual.
  // Cualquier cambio en `citas` dispara el trigger que inserta filas aquí,
  // y este canal nos las trae al instante.
  useEffect(() => {
    if (!session?.user || !uid) return;

    const channel = supabase
      .channel(`arkana-notifs-${uid}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: `usuario_id=eq.${uid}` },
        (payload) => {
          const row = payload.new as NotifRow;
          setItems(prev => {
            // Dedup por id (puede llegar también del polling visibility-change)
            if (prev.some(p => p.id === row.id)) return prev;
            return [rowToItem(row), ...prev].slice(0, MAX_ITEMS);
          });
        },
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [session?.user, uid]);

  // Fallback: al volver la pestaña al foco, recargamos por si realtime se cayó.
  useEffect(() => {
    if (!uid) return;
    const onVisible = async () => {
      if (document.hidden) return;
      const { data } = await supabase
        .from('notificaciones')
        .select('id, cita_id, kind, titulo, detalle, leida, created_at')
        .eq('usuario_id', uid)
        .order('created_at', { ascending: false })
        .limit(MAX_ITEMS);
      if (!data) return;
      setItems(data.map(d => rowToItem(d as NotifRow)));
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [uid]);

  const markAllRead = useCallback(async () => {
    if (!uid) return;
    const unreadIds = items.filter(n => !n.leida).map(n => n.id);
    if (unreadIds.length === 0) return;
    // Optimistic update
    setItems(prev => prev.map(n => ({ ...n, leida: true })));
    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .in('id', unreadIds);
    if (error) {
      // Rollback si falló
      setItems(prev => prev.map(n => unreadIds.includes(n.id) ? { ...n, leida: false } : n));
    }
  }, [uid, items]);

  const clear = useCallback(async () => {
    if (!uid) return;
    const prev = items;
    setItems([]);
    const { error } = await supabase
      .from('notificaciones')
      .delete()
      .eq('usuario_id', uid);
    if (error) {
      setItems(prev);
    }
  }, [uid, items]);

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
