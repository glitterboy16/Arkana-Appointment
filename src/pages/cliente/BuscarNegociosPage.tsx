import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Negocio } from '@/lib/supabase';
import { InlineLoader, Skeleton } from '@/components/app/Spinner';

type NegocioConServicios = Negocio & { servicios: { nombre: string }[] };

export default function BuscarNegociosPage() {
  const [negocios, setNegocios] = useState<NegocioConServicios[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [categoria, setCategoria] = useState<string>('todas');
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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 26px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
          Buscar negocios
        </h1>
        <p style={{ color: 'var(--app-muted)', fontSize: 14, marginTop: 6 }}>
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
              onClick={() => navigate(`/n/${n.slug}`)}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {n.logo_url ? (
                  <img src={n.logo_url} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, background: '#004AAD',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: '#FAFAFA',
                  }}>
                    {n.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: 15, fontWeight: 600, lineHeight: 1.3,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {n.nombre}
                  </div>
                  {n.categoria && (
                    <div style={{ fontSize: 11, color: '#648DFF', marginTop: 2 }}>{n.categoria}</div>
                  )}
                </div>
              </div>
              {n.descripcion && (
                <div style={{
                  fontSize: 12, color: 'var(--app-muted)', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {n.descripcion}
                </div>
              )}
              {n.direccion && (
                <div style={{ fontSize: 11, color: 'var(--app-subtle)' }}>
                  📍 {n.direccion}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle: CSSProperties = {
  background: 'var(--app-input-bg)', border: '1px solid var(--app-border)',
  borderRadius: 8, padding: '10px 14px', color: 'var(--app-text)', fontSize: 14,
  fontFamily: 'inherit', outline: 'none',
};
