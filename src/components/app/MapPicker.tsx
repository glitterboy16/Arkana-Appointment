import { useEffect, useRef, useState, type CSSProperties } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import toast from 'react-hot-toast';
import { BiSearch, BiX } from 'react-icons/bi';
import { geocode } from '@/lib/geocode';
import { Spinner } from './Spinner';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

interface MapPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (next: { lat: number; lng: number } | null) => void;
  direccionInicial?: string;
}

const DEFAULT_CENTER: [number, number] = [-3.7038, 40.4168]; // Madrid (Mapbox usa [lng, lat])
const DEFAULT_ZOOM = 5;
const POSITION_ZOOM = 15;

// Estilo dark moderno alineado con el tema de la app.
// Cambia a 'mapbox://styles/mapbox/streets-v12' si prefieres modo claro.
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

export default function MapPicker({ value, onChange, direccionInicial }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [buscando, setBuscando] = useState(false);
  const [busqueda, setBusqueda] = useState(direccionInicial ?? '');

  // Inicializa el mapa UNA SOLA VEZ. Las actualizaciones del marker se manejan abajo.
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // ya inicializado
    if (!MAPBOX_TOKEN) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: value ? [value.lng, value.lat] : DEFAULT_CENTER,
      zoom: value ? POSITION_ZOOM : DEFAULT_ZOOM,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('click', (e) => {
      onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    mapRef.current = map;

    // Si ya hay un valor inicial, dibujamos el marker
    if (value) {
      drawMarker(value.lat, value.lng);
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincroniza marker con value externo (búsqueda, clear, etc.)
  useEffect(() => {
    if (!mapRef.current) return;
    if (value) {
      drawMarker(value.lat, value.lng);
      mapRef.current.flyTo({ center: [value.lng, value.lat], zoom: POSITION_ZOOM, duration: 800 });
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  function drawMarker(lat: number, lng: number) {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
      return;
    }
    const el = document.createElement('div');
    el.innerHTML = `
      <svg width="34" height="42" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">
        <path d="M17 0C7.6 0 0 7.6 0 17c0 12 17 25 17 25s17-13 17-25C34 7.6 26.4 0 17 0z" fill="#648DFF"/>
        <circle cx="17" cy="16" r="6" fill="#FAFAFA"/>
      </svg>
    `;
    el.style.cursor = 'grab';

    const marker = new mapboxgl.Marker({ element: el, draggable: true, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    marker.on('dragend', () => {
      const ll = marker.getLngLat();
      onChange({ lat: ll.lat, lng: ll.lng });
    });

    markerRef.current = marker;
  }

  const handleBuscar = async () => {
    const q = busqueda.trim();
    if (!q) {
      toast.error('Escribe una dirección para buscarla');
      return;
    }
    setBuscando(true);
    const p = await geocode(q);
    setBuscando(false);
    if (!p) {
      toast.error('No encontré esa dirección. Prueba con más detalles (ciudad, código postal).');
      return;
    }
    onChange({ lat: p.lat, lng: p.lon });
  };

  // Sin token: placeholder informativo
  if (!MAPBOX_TOKEN) {
    return (
      <div style={{
        padding: 24, borderRadius: 12,
        border: '1px dashed var(--app-border)',
        background: 'var(--app-surface)',
        textAlign: 'center', fontSize: 13, color: 'var(--app-muted)', lineHeight: 1.6,
      }}>
        Falta la variable <code style={{ color: '#648DFF' }}>VITE_MAPBOX_TOKEN</code> en <code>.env.local</code>.
        <br />
        Crea una cuenta gratis en <a href="https://account.mapbox.com" target="_blank" rel="noreferrer" style={{ color: '#648DFF' }}>mapbox.com</a> y copia el default public token.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <BiSearch
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--app-subtle)' }}
          />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleBuscar(); } }}
            placeholder="Buscar dirección…"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--app-input-bg)', border: '1px solid var(--app-border)',
              borderRadius: 8, padding: '10px 14px 10px 36px',
              color: 'var(--app-text)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleBuscar}
          disabled={buscando}
          style={{
            padding: '10px 16px', borderRadius: 8, border: 'none',
            background: '#648DFF', color: '#FAFAFA',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
            cursor: buscando ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            opacity: buscando ? 0.7 : 1,
          }}
        >
          {buscando ? <Spinner size={14} color="#FAFAFA" trackColor="rgba(250,250,250,0.35)" /> : <BiSearch size={14} />}
          {buscando ? 'Buscando…' : 'Buscar'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'transparent', color: 'var(--app-muted)',
              border: '1px solid var(--app-border)',
              fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
            title="Quitar ubicación"
          >
            <BiX size={16} /> Quitar
          </button>
        )}
      </div>

      <div ref={containerRef} style={mapWrapStyle} />

      <div style={{ fontSize: 11, color: 'var(--app-subtle)', lineHeight: 1.5 }}>
        {value
          ? <>Pin en <strong>{value.lat.toFixed(5)}, {value.lng.toFixed(5)}</strong>. Pulsa el mapa o arrastra el pin para ajustarlo.</>
          : <>Busca tu dirección o pulsa el mapa para colocar el pin de tu negocio.</>}
      </div>
    </div>
  );
}

const mapWrapStyle: CSSProperties = {
  width: '100%',
  height: 340,
  borderRadius: 12,
  overflow: 'hidden',
  border: '1px solid var(--app-border)',
  background: 'var(--app-surface)',
};
