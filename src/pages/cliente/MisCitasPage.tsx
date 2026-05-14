import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase, type EstadoCita } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { InlineLoader, Spinner } from '@/components/app/Spinner';
import ConfirmModal from '@/components/app/ConfirmModal';

interface CitaConDetalle {
  id: string;
  fecha: string;
  hora_inicio: string;
  estado: EstadoCita;
  notas: string | null;
  negocio: { id: string; nombre: string; slug: string; logo_url: string | null } | null;
  servicio: { id: string; nombre: string; duracion_min: number; precio_centimos: number } | null;
}

const ESTADO_LABEL: Record<EstadoCita, { label: string; color: string; bg: string }> = {
  new:       { label: 'Pendiente de revisar', color: '#648DFF', bg: 'rgba(100,141,255,0.18)' },
  pending:   { label: 'Pendiente',            color: '#F59E0B', bg: 'rgba(245,158,11,0.15)'  },
  confirmed: { label: 'Confirmada',           color: '#22C55E', bg: 'rgba(34,197,94,0.15)'   },
  cancelled: { label: 'Cancelada',            color: '#EF4444', bg: 'rgba(239,68,68,0.15)'   },
};

export default function MisCitasPage() {
  const { usuario } = useAuth();
  const [citas, setCitas] = useState<CitaConDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'proximas' | 'pasadas'>('proximas');
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [citaACancelar, setCitaACancelar] = useState<CitaConDetalle | null>(null);

  useEffect(() => {
    if (!usuario) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('citas')
        .select('id, fecha, hora_inicio, estado, notas, negocio:negocios(id, nombre, slug, logo_url), servicio:servicios(id, nombre, duracion_min, precio_centimos)')
        .eq('cliente_id', usuario.id)
        .order('fecha', { ascending: false })
        .order('hora_inicio', { ascending: false });
      if (!cancelled) {
        setCitas((data ?? []) as unknown as CitaConDetalle[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [usuario]);

  const hoy = format(new Date(), 'yyyy-MM-dd');

  const filtradas = useMemo(() => {
    return citas.filter(c => {
      if (filtro === 'proximas') return c.fecha >= hoy && c.estado !== 'cancelled';
      if (filtro === 'pasadas')  return c.fecha < hoy || c.estado === 'cancelled';
      return true;
    });
  }, [citas, filtro, hoy]);

  const confirmarCancelacion = async () => {
    if (!citaACancelar) return;
    const cita = citaACancelar;
    setMsg(null);
    setCancelandoId(cita.id);

    const { error } = await supabase
      .from('citas')
      .update({ estado: 'cancelled' })
      .eq('id', cita.id);

    setCancelandoId(null);
    setCitaACancelar(null);

    if (error) {
      setMsg({ type: 'err', text: 'No se pudo cancelar la cita. Intenta de nuevo.' });
      return;
    }
    setCitas(prev => prev.map(c => c.id === cita.id ? { ...c, estado: 'cancelled' } : c));
    setMsg({ type: 'ok', text: 'Cita cancelada' });
  };

  return (
    <div className="ark-page" style={{ maxWidth: 940, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Mis citas</h1>
        <p style={{ color: 'var(--app-muted)', fontSize: 15, marginTop: 8 }}>
          Tus reservas en los negocios.
        </p>
      </div>

      <div style={{
        display: 'flex', gap: 4, background: 'var(--app-surface)',
        padding: 4, borderRadius: 9, marginBottom: 20, width: 'fit-content',
        border: '1px solid var(--app-border)',
      }}>
        {(['proximas', 'pasadas', 'todas'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            background: filtro === f ? '#004AAD' : 'transparent',
            color: filtro === f ? '#FAFAFA' : 'var(--app-muted)',
            transition: 'all 150ms ease',
          }}>
            {f === 'proximas' ? 'Próximas' : f === 'pasadas' ? 'Pasadas' : 'Todas'}
          </button>
        ))}
      </div>

      {msg && (
        <div style={{
          background: msg.type === 'ok' ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)',
          border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
          borderRadius: 8, padding: '10px 14px', fontSize: 13,
          color: msg.type === 'ok' ? '#22C55E' : '#EF4444', marginBottom: 16,
        }}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <InlineLoader label="Cargando tus citas…" minHeight={220} />
      ) : filtradas.length === 0 ? (
        <div style={{
          background: 'var(--app-surface)', border: '1px dashed var(--app-border)',
          borderRadius: 12, padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: 'var(--app-muted)', marginBottom: 12 }}>
            {filtro === 'proximas' ? 'No tienes citas próximas.' : 'Sin citas para mostrar.'}
          </div>
          <Link to="/app/buscar" style={{
            display: 'inline-block', padding: '8px 16px', background: '#004AAD',
            color: '#FAFAFA', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
          }}>
            Buscar negocios
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtradas.map(c => {
            const estado = ESTADO_LABEL[c.estado];
            const esFutura = c.fecha >= hoy;
            const cancelable = esFutura && c.estado !== 'cancelled';
            const cancelando = cancelandoId === c.id;
            return (
              <div key={c.id} style={{
                background: 'var(--app-surface)', border: '1px solid var(--app-border)',
                borderRadius: 14, padding: 18,
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
              }}>
                {c.negocio?.logo_url ? (
                  <img src={c.negocio.logo_url} alt="" style={{ width: 54, height: 54, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 54, height: 54, borderRadius: 12, background: '#004AAD',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 700, flexShrink: 0, color: '#FAFAFA',
                  }}>
                    {c.negocio?.nombre?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                )}
                <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 3 }}>
                    {c.negocio?.nombre ?? 'Negocio eliminado'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--app-muted)' }}>
                    {c.servicio?.nombre ?? 'Servicio'} · {format(parseISO(c.fecha), "d 'de' MMMM", { locale: es })} · {c.hora_inicio.slice(0, 5)}
                  </div>
                </div>
                <span style={{
                  padding: '5px 11px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                  color: estado.color, background: estado.bg, whiteSpace: 'nowrap',
                }}>
                  {estado.label}
                </span>
                {cancelable && (
                  <button
                    onClick={() => setCitaACancelar(c)}
                    disabled={cancelando}
                    style={{
                      padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                      fontFamily: 'inherit', cursor: cancelando ? 'not-allowed' : 'pointer',
                      background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)',
                      color: '#EF4444', opacity: cancelando ? 0.6 : 1, whiteSpace: 'nowrap',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {cancelando && <Spinner size={12} color="#EF4444" />}
                    {cancelando ? 'Cancelando…' : 'Cancelar'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!citaACancelar}
        title="¿Cancelar esta cita?"
        message={citaACancelar ? (
          <>
            Vas a cancelar tu cita en <strong style={{ color: 'var(--app-text)' }}>{citaACancelar.negocio?.nombre ?? 'el negocio'}</strong> del <strong style={{ color: 'var(--app-text)' }}>{format(parseISO(citaACancelar.fecha), "d 'de' MMMM", { locale: es })}</strong> a las <strong style={{ color: 'var(--app-text)' }}>{citaACancelar.hora_inicio.slice(0, 5)}</strong>. Esta acción no se puede deshacer.
          </>
        ) : null}
        confirmLabel="Sí, cancelar"
        cancelLabel="No, volver"
        variant="danger"
        loading={!!cancelandoId}
        onConfirm={confirmarCancelacion}
        onCancel={() => { if (!cancelandoId) setCitaACancelar(null); }}
      />
    </div>
  );
}
