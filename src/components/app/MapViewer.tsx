import { useEffect, useRef, type CSSProperties } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

interface MapViewerProps {
  lat: number;
  lng: number;
  /** Altura del mapa en píxeles. Por defecto 240. */
  height?: number;
  /** Nombre que se muestra en un popup opcional sobre el marker. */
  titulo?: string;
  /** Si true, muestra un botón flotante para abrir Google Maps. */
  showGoogleMapsLink?: boolean;
}

const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';
const ZOOM = 15;

const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(hover: none)').matches;
};

export default function MapViewer({ lat, lng, height = 240, titulo, showGoogleMapsLink = true }: MapViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;
    if (!MAPBOX_TOKEN) return;

    const touch = isTouchDevice();

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [lng, lat],
      zoom: ZOOM,
      attributionControl: true,
      interactive: true,
      // Modal/embed: requerir dos dedos en móvil para no atrapar el scroll.
      cooperativeGestures: touch,
      pitchWithRotate: false,
      dragRotate: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false, visualizePitch: false }), 'top-right');

    const el = document.createElement('div');
    el.className = 'ark-map-marker';
    el.innerHTML = `
      <div class="ark-map-marker-pulse"></div>
      <svg width="34" height="42" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg" class="ark-map-marker-pin">
        <path d="M17 0C7.6 0 0 7.6 0 17c0 12 17 25 17 25s17-13 17-25C34 7.6 26.4 0 17 0z" fill="#648DFF"/>
        <circle cx="17" cy="16" r="6" fill="#FAFAFA"/>
      </svg>
    `;

    const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .addTo(map);

    if (titulo) {
      const popup = new mapboxgl.Popup({ offset: 36, closeButton: false }).setHTML(
        `<div style="font-size: 12px; font-weight: 600; color: #050A30; padding: 2px 4px;">${titulo}</div>`,
      );
      marker.setPopup(popup);
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualiza la posición si cambian las coords
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter([lng, lat]);
  }, [lat, lng]);

  if (!MAPBOX_TOKEN) {
    return (
      <div style={{
        height, borderRadius: 12, border: '1px dashed var(--app-border)',
        background: 'var(--app-surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, color: 'var(--app-muted)', textAlign: 'center', padding: 16,
      }}>
        Falta VITE_MAPBOX_TOKEN para mostrar el mapa
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--app-border)' }}>
      <div ref={containerRef} style={{ width: '100%', height } satisfies CSSProperties} />
      {showGoogleMapsLink && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute', bottom: 10, left: 10,
            padding: '8px 14px', borderRadius: 10,
            background: 'rgba(5,10,48,0.88)', color: '#FAFAFA',
            fontSize: 12, fontWeight: 600, textDecoration: 'none',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.16)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          Abrir en Google Maps ↗
        </a>
      )}
    </div>
  );
}
