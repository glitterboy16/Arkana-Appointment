import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { BiPhone, BiMap, BiSolidStar, BiX } from 'react-icons/bi';
import { Spinner, Skeleton } from './Spinner';
import { supabase, type Negocio, type Servicio } from '@/lib/supabase';
import { geocode, type GeoPoint } from '@/lib/geocode';
import MapViewer from './MapViewer';

interface NegocioModalProps {
  negocio: Negocio | null;
  onClose: () => void;
  onReservar: (negocio: Negocio) => void;
}

function formatPrecio(centimos: number): string {
  if (centimos === 0) return 'Gratis';
  return `${(centimos / 100).toFixed(centimos % 100 === 0 ? 0 : 2)}€`;
}

interface NegocioFoto {
  id: string;
  foto_url: string;
  orden: number;
}

export default function NegocioModal({ negocio, onClose, onReservar }: NegocioModalProps) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loadingServicios, setLoadingServicios] = useState(true);
  const [fotos, setFotos] = useState<NegocioFoto[]>([]);
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);
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

  // Cargar servicios y galería al abrir
  useEffect(() => {
    if (!negocio) {
      setServicios([]); setLoadingServicios(true); setFotos([]);
      return;
    }
    let cancelled = false;
    setLoadingServicios(true);
    (async () => {
      const [{ data: svcs }, { data: gFotos }] = await Promise.all([
        supabase
          .from('servicios')
          .select('*')
          .eq('negocio_id', negocio.id)
          .eq('activo', true)
          .order('created_at'),
        supabase
          .from('negocio_fotos')
          .select('id, foto_url, orden')
          .eq('negocio_id', negocio.id)
          .order('orden'),
      ]);
      if (!cancelled) {
        setServicios((svcs as Servicio[]) ?? []);
        setFotos((gFotos as NegocioFoto[]) ?? []);
        setLoadingServicios(false);
      }
    })();
    return () => { cancelled = true; };
  }, [negocio]);

  // Resolver ubicación: primero lat/lng guardados, después geocode de la dirección.
  useEffect(() => {
    if (!negocio) return;
    // 1. Si el negocio ya tiene su lat/lng exactos (puestos desde el mapa), úsalos.
    if (negocio.lat != null && negocio.lng != null) {
      setPunto({
        lat: negocio.lat,
        lon: negocio.lng,
        displayName: negocio.direccion ?? negocio.nombre,
      });
      setGeoState('ready');
      return;
    }
    // 2. Sin posición exacta: intentamos geocodificar la dirección como antes.
    if (!negocio.direccion?.trim()) {
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
  }, [negocio]);

  if (!negocio) return null;

  return createPortal(
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
            width: 38, height: 38, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.55)', color: '#FAFAFA',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
          }}
        >
          <BiX size={22} />
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
                    <BiSolidStar size={14} style={{ color: '#F59E0B' }} />
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

          {/* GALERÍA */}
          {fotos.length > 0 && (
            <section style={sectionStyle}>
              <div style={sectionTitleStyle}>Galería</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: 8,
              }}>
                {fotos.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFotoAmpliada(f.foto_url)}
                    style={{
                      position: 'relative', aspectRatio: '1 / 1', borderRadius: 10,
                      overflow: 'hidden', border: '1px solid var(--app-border)',
                      background: 'var(--app-surface)', padding: 0, cursor: 'pointer',
                    }}
                    aria-label="Ampliar foto"
                  >
                    <img
                      src={f.foto_url}
                      alt=""
                      loading="lazy"
                      style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%', objectFit: 'cover',
                        transition: 'transform 200ms ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                    />
                  </button>
                ))}
              </div>
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
                  <span style={contactIconStyle}><BiPhone size={18} /></span>
                  <span style={{ fontSize: 15, color: 'var(--app-text)' }}>{negocio.telefono}</span>
                </a>
              ) : (
                <div style={contactItemStyle}>
                  <span style={contactIconStyle}><BiPhone size={18} /></span>
                  <span style={{ fontSize: 15, color: 'var(--app-subtle)' }}>Sin teléfono publicado</span>
                </div>
              )}
              {negocio.direccion ? (
                <div style={contactItemStyle}>
                  <span style={contactIconStyle}><BiMap size={18} /></span>
                  <span style={{ fontSize: 15, color: 'var(--app-text)' }}>{negocio.direccion}</span>
                </div>
              ) : (
                <div style={contactItemStyle}>
                  <span style={contactIconStyle}><BiMap size={18} /></span>
                  <span style={{ fontSize: 15, color: 'var(--app-subtle)' }}>Sin dirección publicada</span>
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
              <MapViewer
                lat={punto.lat}
                lng={punto.lon}
                titulo={negocio.nombre}
                height={240}
              />
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

      {fotoAmpliada && (
        <div
          onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 10,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, cursor: 'zoom-out',
            animation: 'ark-fade-in 180ms ease-out both',
          }}
          role="dialog"
          aria-label="Foto ampliada"
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setFotoAmpliada(null); }}
            aria-label="Cerrar"
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 40, height: 40, borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.12)', color: '#FAFAFA',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(6px)',
            }}
          >
            <BiX size={24} />
          </button>
          <img
            src={fotoAmpliada}
            alt=""
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>,
    document.body,
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
  width: 36, height: 36, borderRadius: 9, background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  color: '#648DFF', flexShrink: 0,
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
