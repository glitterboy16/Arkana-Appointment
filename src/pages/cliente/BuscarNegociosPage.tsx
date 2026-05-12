import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiMap } from 'react-icons/bi';
import { supabase, type Negocio } from '@/lib/supabase';
import { InlineLoader, Skeleton } from '@/components/app/Spinner';
import NegocioModal from '@/components/app/NegocioModal';

type NegocioConServicios = Negocio & { servicios: { nombre: string }[] };

export default function BuscarNegociosPage() {
  const [negocios, setNegocios] = useState<NegocioConServicios[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [categoria, setCategoria] = useState<string>('todas');
  const [seleccionado, setSeleccionado] = useState<Negocio | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('negocios')
        .select('*, servicios(nombre)')
        .order('created_at', { ascending: false });
      if (!cancelled) {
        setNegocios((data ?? []) as NegocioConServicios[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    negocios.forEach(n => { if (n.categoria) set.add(n.categoria); });
    return ['todas', ...Array.from(set).sort()];
  }, [negocios]);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return negocios.filter(n => {
      if (categoria !== 'todas' && n.categoria !== categoria) return false;
      if (!q) return true;
      return (
        n.nombre.toLowerCase().includes(q) ||
        (n.descripcion ?? '').toLowerCase().includes(q) ||
        (n.categoria ?? '').toLowerCase().includes(q) ||
        (n.direccion ?? '').toLowerCase().includes(q) ||
        (n.servicios ?? []).some(s => s.nombre.toLowerCase().includes(q))
      );
    });
  }, [negocios, query, categoria]);

  const sinNegociosRegistrados = !loading && negocios.length === 0;

  return (
    <div className="ark-page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
          Buscar negocios
        </h1>
        <p style={{ color: 'var(--app-muted)', fontSize: 15, marginTop: 8 }}>
          Encuentra el negocio que buscas y reserva tu cita.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, servicio o categoría…"
          style={{ ...inputStyle, flex: '1 1 260px', minWidth: 0 }}
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          style={{ ...inputStyle, minWidth: 160, cursor: 'pointer', flex: '0 1 220px' }}
        >
          {categorias.map(c => (
            <option key={c} value={c} style={{ background: 'var(--app-bg-elevated)', color: 'var(--app-text)' }}>
              {c === 'todas' ? 'Todas las categorías' : c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              background: 'var(--app-surface)', border: '1px solid var(--app-border)',
              borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Skeleton width={44} height={44} radius={10} />
                <div style={{ flex: 1 }}>
                  <Skeleton width="70%" height={14} />
                  <div style={{ marginTop: 6 }}><Skeleton width="40%" height={10} /></div>
                </div>
              </div>
              <Skeleton height={10} />
              <Skeleton width="60%" height={10} />
            </div>
          ))}
          <div style={{ gridColumn: '1/-1' }}><InlineLoader label="Buscando negocios…" minHeight={40} /></div>
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{
          background: 'var(--app-surface)', border: '1px dashed var(--app-border)',
          borderRadius: 12, padding: 40, textAlign: 'center', color: 'var(--app-muted)',
        }}>
          {sinNegociosRegistrados
            ? 'Aún no hay negocios registrados en Arkana.'
            : `No se han encontrado negocios${query ? ` para "${query}"` : ''}.`}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtrados.map(n => (
            <button
              key={n.id}
              onClick={() => setSeleccionado(n)}
              style={{
                background: 'var(--app-surface)', border: '1px solid var(--app-border)',
                borderRadius: 12, padding: 18, cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit', color: 'var(--app-text)',
                display: 'flex', flexDirection: 'column', gap: 10,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(100,141,255,0.10)'; e.currentTarget.style.borderColor = 'rgba(100,141,255,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--app-surface)'; e.currentTarget.style.borderColor = 'var(--app-border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {n.logo_url ? (
                  <img src={n.logo_url} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 52, height: 52, borderRadius: 12, background: '#004AAD',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 19, fontWeight: 700, color: '#FAFAFA', flexShrink: 0,
                  }}>
                    {n.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                  <div style={{
                    fontSize: 16, fontWeight: 600, lineHeight: 1.3,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {n.nombre}
                  </div>
                  {n.categoria && (
                    <div style={{ fontSize: 12, color: '#648DFF', marginTop: 3, fontWeight: 500 }}>{n.categoria}</div>
                  )}
                </div>
              </div>
              {n.descripcion && (
                <div style={{
                  fontSize: 13, color: 'var(--app-muted)', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {n.descripcion}
                </div>
              )}
              {n.direccion && (
                <div style={{ fontSize: 12, color: 'var(--app-subtle)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <BiMap size={14} />
                  <span>{n.direccion}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <NegocioModal
        negocio={seleccionado}
        onClose={() => setSeleccionado(null)}
        onReservar={(neg) => {
          setSeleccionado(null);
          navigate(`/n/${neg.slug}`);
        }}
      />
    </div>
  );
}

const inputStyle: CSSProperties = {
  background: 'var(--app-input-bg)', border: '1px solid var(--app-border)',
  borderRadius: 9, padding: '12px 15px', color: 'var(--app-text)', fontSize: 15,
  fontFamily: 'inherit', outline: 'none',
};
