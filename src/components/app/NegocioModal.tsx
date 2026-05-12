import { useEffect, useState, type CSSProperties } from 'react';
import { ArkanaIcons } from './Shared';
import { Spinner, Skeleton } from './Spinner';
import { supabase, type Negocio, type Servicio } from '@/lib/supabase';
import { geocode, osmEmbedUrl, osmExternalUrl, type GeoPoint } from '@/lib/geocode';

interface NegocioModalProps {
  negocio: Negocio | null;
  onClose: () => void;
  onReservar: (negocio: Negocio) => void;
}

function formatPrecio(centimos: number): string {
  if (centimos === 0) return 'Gratis';
  return `${(centimos / 100).toFixed(centimos % 100 === 0 ? 0 : 2)}€`;
}

export default function NegocioModal({ negocio, onClose, onReservar }: NegocioModalProps) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loadingServicios, setLoadingServicios] = useState(true);
  const [punto, setPunto] = useState<GeoPoint | null>(null);
  const [geoState, setGeoState] = useState<'idle' | 'loading' | 'ready' | 'empty' | 'error'>('idle');

  // Bloquear scroll del body cuando el modal está abierto y cerrar con ESC
  useEffect(() => {
    if (!negocio) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [negocio, onClose]);

  // Cargar servicios al abrir
  useEffect(() => {
    if (!negocio) { setServicios([]); setLoadingServicios(true); return; }
    let cancelled = false;
    setLoadingServicios(true);
    (async () => {
      const { data } = await supabase
        .from('servicios')
        .select('*')
        .eq('negocio_id', negocio.id)
        .eq('activo', true)
        .order('created_at');
      if (!cancelled) {
        setServicios((data as Servicio[]) ?? []);
        setLoadingServicios(false);
      }
    })();
    return () => { cancelled = true; };
  }, [negocio]);

  // Geocodificar la dirección
  useEffect(() => {
    if (!negocio?.direccion?.trim()) {
      setPunto(null);
      setGeoState('empty');
      return;
    }
    let cancelled = false;
    setGeoState('loading');
    setPunto(null);
    (async () => {
      try {
        const p = await geocode(negocio.direccion!);
        if (cancelled) return;
        if (p) { setPunto(p); setGeoState('ready'); }
        else   { setPunto(null); setGeoState('empty'); }
      } catch {
        if (!cancelled) setGeoState('error');
      }
    })();
    return () => { cancelled = true; };
  }, [negocio?.direccion]);

  if (!negocio) return null;

  return (
    <div onClick={onClose} className="ark-modal-overlay">
      <div
        onClick={(e) => e.stopPropagation()}
        className="ark-negocio-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Perfil de ${negocio.nombre}`}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 2,
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.55)', color: '#FAFAFA',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
          }}
        >
          {ArkanaIcons.close}
        </button>

        <div className="ark-negocio-modal-scroll">
          {/* HEADER */}
          <div style={{
            padding: '24px 22px 18px',
            background: 'linear-gradient(180deg, rgba(0,74,173,0.18) 0%, transparent 100%)',
            borderBottom: '1px solid var(--app-border)',
          }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {negocio.logo_url ? (
                <img
                  src={negocio.logo_url}
                  alt=""
                  style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 72, height: 72, borderRadius: 14, background: '#004AAD',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, fontWeight: 700, color: '#FAFAFA', flexShrink: 0,
                }}>
                  {negocio.nombre.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{
                  margin: 0, fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 700,
                  letterSpacing: '-0.02em', color: 'var(--app-text)', lineHeight: 1.2,
                }}>
                  {negocio.nombre}
                </h2>
                {negocio.categoria && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#648DFF', fontWeight: 600 }}>
                    {negocio.categoria}
                  </div>
                )}
                {(negocio.rating > 0 || negocio.resenas > 0) && (
                  <div style={{
                    marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 12, color: 'var(--app-muted)',
                  }}>
                    <span style={{ color: '#F59E0B' }}>★</span>
                    <span style={{ color: 'var(--app-text)', fontWeight: 600 }}>{negocio.rating.toFixed(1)}</span>
                    <span>·</span>
                    <span>{negocio.resenas} reseña{negocio.resenas === 1 ? '' : 's'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          {negocio.descripcion && (
            <section style={sectionStyle}>
              <div style={sectionTitleStyle}>Sobre el negocio</div>
              <p style={{ fontSize: 14, color: 'var(--app-muted)', lineHeight: 1.55, margin: 0 }}>
                {negocio.descripcion}
              </p>
            </section>
          )}

          {/* CONTACTO */}
          <section style={sectionStyle}>
            <div style={sectionTitleStyle}>Contacto</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {negocio.telefono ? (
                <a
                  href={`tel:${negocio.telefono}`}
                  style={contactItemStyle}
                >
                  <span style={contactIconStyle}>📞</span>
                  <span style={{ fontSize: 14, color: 'var(--app-text)' }}>{negocio.telefono}</span>
                </a>
              ) : (
                <div style={contactItemStyle}>
                  <span style={contactIconStyle}>📞</span>
                  <span style={{ fontSize: 14, color: 'var(--app-subtle)' }}>Sin teléfono publicado</span>
                </div>
              )}
              {negocio.direccion ? (
                <div style={contactItemStyle}>
                  <span style={contactIconStyle}>📍</span>
                  <span style={{ fontSize: 14, color: 'var(--app-text)' }}>{negocio.direccion}</span>
                </div>
              ) : (
                <div style={contactItemStyle}>
                  <span style={contactIconStyle}>📍</span>
                  <span style={{ fontSize: 14, color: 'var(--app-subtle)' }}>Sin dirección publicada</span>
                </div>
              )}
            </div>
          </section>

          {/* SERVICIOS */}
          <section style={sectionStyle}>
            <div style={sectionTitleStyle}>Servicios</div>
            {loadingServicios ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={servicioRowStyle}>
                    <Skeleton width="55%" height={14} />
                    <Skeleton width={50} height={14} />
                  </div>
                ))}
              </div>
            ) : servicios.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--app-subtle)' }}>
                Este negocio aún no ha publicado servicios.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {servicios.map(s => (
                  <div key={s.id} style={servicioRowStyle}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--app-text)' }}>
                        {s.nombre}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginTop: 2 }}>
                        {s.duracion_min} min
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#648DFF', whiteSpace: 'nowrap' }}>
                      {formatPrecio(s.precio_centimos)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* MAPA */}
          <section style={{ ...sectionStyle, paddingBottom: 24 }}>
            <div style={sectionTitleStyle}>Ubicación</div>
            {geoState === 'loading' && (
              <div style={mapPlaceholderStyle}>
                <Spinner size={20} />
                <span style={{ marginTop: 8 }}>Buscando en el mapa…</span>
              </div>
            )}
            {geoState === 'empty' && (
              <div style={{ ...mapPlaceholderStyle, color: 'var(--app-subtle)' }}>
                {negocio.direccion
                  ? 'No se pudo localizar esta dirección en el mapa.'
                  : 'Sin dirección para mostrar.'}
              </div>
            )}
            {geoState === 'error' && (
              <div style={{ ...mapPlaceholderStyle, color: 'var(--app-subtle)' }}>
                Error al cargar el mapa.
              </div>
            )}
            {geoState === 'ready' && punto && (
              <div style={{
                borderRadius: 12, overflow: 'hidden', border: '1px solid var(--app-border)',
                background: 'var(--app-surface)',
              }}>
                <iframe
                  title={`Mapa de ${negocio.nombre}`}
                  src={osmEmbedUrl(punto)}
                  style={{ width: '100%', height: 240, border: 0, display: 'block' }}
                  loading="lazy"
                />
                <a
                  href={osmExternalUrl(punto)}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{
                    display: 'block', textAlign: 'center', fontSize: 12, padding: '10px 12px',
                    color: '#648DFF', textDecoration: 'none', borderTop: '1px solid var(--app-border)',
                    fontWeight: 600,
                  }}
                >
                  Abrir en OpenStreetMap ↗
                </a>
              </div>
            )}
          </section>
        </div>

        {/* CTA fijo abajo */}
        <div style={{
          padding: '12px 18px calc(12px + env(safe-area-inset-bottom, 0px))',
          borderTop: '1px solid var(--app-border)',
          background: 'var(--app-bg-elevated)',
          display: 'flex', gap: 10, flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              flex: '0 1 auto', padding: '12px 18px', borderRadius: 10,
              background: 'transparent', border: '1px solid var(--app-border)',
              color: 'var(--app-muted)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Volver
          </button>
          <button
            onClick={() => onReservar(negocio)}
            style={{
              flex: 1, padding: '12px 18px', borderRadius: 10, border: 'none',
              background: '#004AAD', color: '#FAFAFA',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#0057CC'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#004AAD'; }}
          >
            Reservar cita
          </button>
        </div>
      </div>
    </div>
  );
}

const sectionStyle: CSSProperties = {
  padding: '18px 22px',
  borderBottom: '1px solid var(--app-border)',
};
const sectionTitleStyle: CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--app-subtle)', marginBottom: 12,
};
const contactItemStyle: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit',
};
const contactIconStyle: CSSProperties = {
  width: 32, height: 32, borderRadius: 8, background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
};
const servicioRowStyle: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
  padding: '10px 0', borderBottom: '1px solid var(--app-border)',
};
const mapPlaceholderStyle: CSSProperties = {
  height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  borderRadius: 12, border: '1px dashed var(--app-border)',
  background: 'var(--app-surface)', color: 'var(--app-muted)', fontSize: 13,
};
