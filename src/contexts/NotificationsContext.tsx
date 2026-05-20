import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  const { usuario } = useAuth();
  const uid = usuario?.id;
  const [items, setItems] = useState<NotifItem[]>([]);

  // Carga inicial al cambiar de usuario. Trae el historial completo (capado
  // a MAX_ITEMS) desde Supabase, así el usuario ve también lo que se generó
  // mientras estaba desconectado. Realtime se encarga del resto en vivo.
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
  // El canal vive mientras dure este uid; los refresh de token no lo tiran.
  useEffect(() => {
    if (!uid) return;

    const channel = supabase
      .channel(`arkana-notifs-${uid}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: `usuario_id=eq.${uid}` },
        (payload) => {
          const row = payload.new as NotifRow;
          setItems(prev => {
            if (prev.some(p => p.id === row.id)) return prev;
            return [rowToItem(row), ...prev].slice(0, MAX_ITEMS);
          });
        },
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [uid]);

  const markAllRead = useCallback(async () => {
    if (!uid) return;
    let unreadIds: string[] = [];
    setItems(prev => {
      unreadIds = prev.filter(n => !n.leida).map(n => n.id);
      if (unreadIds.length === 0) return prev;
      return prev.map(n => ({ ...n, leida: true }));
    });
    if (unreadIds.length === 0) return;
    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .in('id', unreadIds);
    if (error) {
      const failedIds = new Set(unreadIds);
      setItems(prev => prev.map(n => failedIds.has(n.id) ? { ...n, leida: false } : n));
    }
  }, [uid]);

  const clear = useCallback(async () => {
    if (!uid) return;
    let prev: NotifItem[] = [];
    setItems(curr => { prev = curr; return []; });
    const { error } = await supabase
      .from('notificaciones')
      .delete()
      .eq('usuario_id', uid);
    if (error) setItems(prev);
  }, [uid]);

  const unread = useMemo(() => items.filter(n => !n.leida).length, [items]);

  const value = useMemo(
    () => ({ items, unread, markAllRead, clear }),
    [items, unread, markAllRead, clear],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationsProvider');
  return ctx;
}
