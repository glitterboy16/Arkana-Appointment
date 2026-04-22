import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase, type EstadoCita } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
  new:       { label: 'Pendiente de revisar', color: '#FAFAFA', bg: 'rgba(100,141,255,0.18)' },
  pending:   { label: 'Pendiente',            color: '#F59E0B', bg: 'rgba(245,158,11,0.15)'  },
  confirmed: { label: 'Confirmada',           color: '#22C55E', bg: 'rgba(34,197,94,0.15)'   },
  cancelled: { label: 'Cancelada',            color: '#EF4444', bg: 'rgba(239,68,68,0.15)'   },
};

export default function MisCitasPage() {
  const { usuario } = useAuth();
  const [citas, setCitas] = useState<CitaConDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'proximas' | 'pasadas'>('proximas');

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

  const filtradas = useMemo(() => {
    const hoy = format(new Date(), 'yyyy-MM-dd');
    return citas.filter(c => {
      if (filtro === 'proximas') return c.fecha >= hoy && c.estado !== 'cancelled';
      if (filtro === 'pasadas')  return c.fecha < hoy || c.estado === 'cancelled';
      return true;
    });
  }, [citas, filtro]);

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Mis citas</h1>
        <p style={{ color: 'rgba(250,250,250,0.55)', fontSize: 14, marginTop: 6 }}>
          Tus reservas en los negocios.
        </p>
      </div>

      <div style={{
        display: 'flex', gap: 4, background: 'rgba(255,255,255,0.06)',
        padding: 4, borderRadius: 9, marginBottom: 20, width: 'fit-content',
      }}>
        {(['proximas', 'pasadas', 'todas'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            background: filtro === f ? '#004AAD' : 'transparent',
            color: filtro === f ? '#FAFAFA' : 'rgba(250,250,250,0.55)',
            transition: 'all 150ms ease',
          }}>
            {f === 'proximas' ? 'Próximas' : f === 'pasadas' ? 'Pasadas' : 'Todas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'rgba(250,250,250,0.45)', fontSize: 14 }}>Cargando…</div>
      ) : filtradas.length === 0 ? (
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.10)',
          borderRadius: 12, padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: 'rgba(250,250,250,0.55)', marginBottom: 12 }}>
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
            return (
              <div key={c.id} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 12, padding: 16,
                display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
              }}>
                {c.negocio?.logo_url ? (
                  <img src={c.negocio.logo_url} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 48, height: 48, borderRadius: 10, background: '#004AAD',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17, fontWeight: 700, flexShrink: 0,
                  }}>
                    {c.negocio?.nombre?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                )}
                <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
                    {c.negocio?.nombre ?? 'Negocio eliminado'}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.55)' }}>
                    {c.servicio?.nombre ?? 'Servicio'} · {format(parseISO(c.fecha), "d 'de' MMMM", { locale: es })} · {c.hora_inicio.slice(0, 5)}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  color: estado.color, background: estado.bg, whiteSpace: 'nowrap',
                }}>
                  {estado.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
