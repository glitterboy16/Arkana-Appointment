import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { BiSearch, BiX } from 'react-icons/bi';
import { geocode } from '@/lib/geocode';
import { Spinner } from './Spinner';

// Leaflet en bundler — los iconos por defecto no resuelven. Usamos un icono SVG inline.
const pinIcon = L.divIcon({
  className: 'ark-map-pin',
  html: `
    <svg width="34" height="42" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12 17 25 17 25s17-13 17-25C34 7.6 26.4 0 17 0z" fill="#004AAD"/>
      <circle cx="17" cy="16" r="6" fill="#FAFAFA"/>
    </svg>
  `,
  iconSize: [34, 42],
  iconAnchor: [17, 42],
});

interface MapPickerProps {
  /** Posición inicial. Si es null se centra en España. */
  value: { lat: number; lng: number } | null;
  onChange: (next: { lat: number; lng: number } | null) => void;
  /** Texto de dirección que se usará para "Buscar en el mapa". */
  direccionInicial?: string;
}

const DEFAULT_CENTER: [number, number] = [40.4168, -3.7038]; // Madrid
const DEFAULT_ZOOM = 5;
const POSITION_ZOOM = 16;

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ pos }: { pos: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) {
      map.flyTo([pos.lat, pos.lng], POSITION_ZOOM, { duration: 0.6 });
    }
  }, [pos, map]);
  return null;
}

export default function MapPicker({ value, onChange, direccionInicial }: MapPickerProps) {
  const [buscando, setBuscando] = useState(false);
  const [busqueda, setBusqueda] = useState(direccionInicial ?? '');
  const markerRef = useRef<L.Marker | null>(null);

  const center = useMemo<[number, number]>(() => {
    if (value) return [value.lat, value.lng];
    return DEFAULT_CENTER;
  }, [value]);

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

  const handleMarkerDrag = () => {
    const m = markerRef.current;
    if (!m) return;
    const ll = m.getLatLng();
    onChange({ lat: ll.lat, lng: ll.lng });
  };

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
            background: '#004AAD', color: '#FAFAFA',
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

      <div style={mapWrapStyle}>
        <MapContainer
          center={center}
          zoom={value ? POSITION_ZOOM : DEFAULT_ZOOM}
          style={{ width: '100%', height: 320 }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={(lat, lng) => onChange({ lat, lng })} />
          <FlyTo pos={value} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={pinIcon}
              draggable
              eventHandlers={{ dragend: handleMarkerDrag }}
              ref={(ref) => { markerRef.current = ref as unknown as L.Marker | null; }}
            />
          )}
        </MapContainer>
      </div>

      <div style={{ fontSize: 11, color: 'var(--app-subtle)', lineHeight: 1.5 }}>
        {value
          ? <>Pin en <strong>{value.lat.toFixed(5)}, {value.lng.toFixed(5)}</strong>. Pulsa el mapa o arrastra el pin para ajustarlo.</>
          : <>Busca tu dirección o pulsa el mapa para colocar el pin de tu negocio.</>}
      </div>
    </div>
  );
}

const mapWrapStyle: CSSProperties = {
  borderRadius: 12,
  overflow: 'hidden',
  border: '1px solid var(--app-border)',
  background: 'var(--app-surface)',
};
