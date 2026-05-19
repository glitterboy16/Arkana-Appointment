import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import toast from 'react-hot-toast';
import { BiSearch, BiX, BiCurrentLocation, BiMap } from 'react-icons/bi';
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

// Detección "touch primario" — usamos coarse-pointer + hover:none para no
// pillar laptops con pantalla táctil. Si es true activamos cooperativeGestures
// para que el scroll vertical de la página no se quede atrapado por el mapa.
const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(hover: none)').matches;
};

export default function MapPicker({ value, onChange, direccionInicial }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [buscando, setBuscando] = useState(false);
  const [busqueda, setBusqueda] = useState(direccionInicial ?? '');
  const [tapMode, setTapMode] = useState(false); // móvil: tap-to-place explícito
  const [locating, setLocating] = useState(false);

  // Inicializa el mapa UNA SOLA VEZ. Las actualizaciones del marker se manejan abajo.
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // ya inicializado
    if (!MAPBOX_TOKEN) return;

    const touch = isTouchDevice();

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: value ? [value.lng, value.lat] : DEFAULT_CENTER,
      zoom: value ? POSITION_ZOOM : DEFAULT_ZOOM,
      attributionControl: true,
      // En móvil: cooperativeGestures requiere "dos dedos" para mover el mapa,
      // así el scroll vertical de la página no se queda atrapado. En desktop
      // se mantiene la interacción libre con un dedo / rueda.
      cooperativeGestures: touch,
      pitchWithRotate: false,
      dragRotate: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false, visualizePitch: false }), 'top-right');
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
        showAccuracyCircle: true,
        showUserHeading: false,
      }),
      'top-right',
    );

    // Click handler: en touch, sólo coloca si tapMode está activo
    // (esto evita pins accidentales al hacer scroll/pan). En desktop, siempre.
    map.on('click', (e) => {
      if (touch && !tapModeRef.current) return;
      onChangeRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      tapModeRef.current = false;
      setTapMode(false);
    });

    mapRef.current = map;

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

  // Necesitamos leer tapMode dentro del callback de mapbox sin re-crear el mapa.
  const tapModeRef = useRef(false);
  useEffect(() => { tapModeRef.current = tapMode; }, [tapMode]);

  // Sincroniza marker con value externo (búsqueda, clear, geolocate, etc.)
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
    el.className = 'ark-map-marker';
    el.innerHTML = `
      <div class="ark-map-marker-pulse"></div>
      <svg width="34" height="42" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg" class="ark-map-marker-pin">
        <path d="M17 0C7.6 0 0 7.6 0 17c0 12 17 25 17 25s17-13 17-25C34 7.6 26.4 0 17 0z" fill="#648DFF"/>
        <circle cx="17" cy="16" r="6" fill="#FAFAFA"/>
      </svg>
    `;

    const marker = new mapboxgl.Marker({ element: el, draggable: true, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    marker.on('dragend', () => {
      const ll = marker.getLngLat();
      onChangeRef.current({ lat: ll.lat, lng: ll.lng });
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

  const handleUsarMiUbicacion = () => {
    if (!navigator.geolocation) {
      toast.error('Tu dispositivo no soporta geolocalización');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success('Ubicación detectada');
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Permiso denegado. Activa la ubicación en tu navegador.');
        } else {
          toast.error('No se pudo obtener tu ubicación');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
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
    <div className="ark-map-picker">
      <div className="ark-map-picker-controls">
        <div className="ark-map-picker-search">
          <BiSearch size={16} className="ark-map-picker-search-icon" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleBuscar(); } }}
            placeholder="Buscar dirección…"
            type="search"
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            className="ark-map-picker-input"
          />
        </div>
        <button
          type="button"
          onClick={handleBuscar}
          disabled={buscando}
          className="ark-map-picker-btn ark-map-picker-btn-primary"
        >
          {buscando ? <Spinner size={14} color="#FAFAFA" trackColor="rgba(250,250,250,0.35)" /> : <BiSearch size={14} />}
          <span>{buscando ? 'Buscando…' : 'Buscar'}</span>
        </button>
        <button
          type="button"
          onClick={handleUsarMiUbicacion}
          disabled={locating}
          className="ark-map-picker-btn ark-map-picker-btn-ghost"
          title="Usar mi ubicación actual"
        >
          {locating ? <Spinner size={14} /> : <BiCurrentLocation size={14} />}
          <span>Mi ubicación</span>
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ark-map-picker-btn ark-map-picker-btn-ghost"
            title="Quitar ubicación"
          >
            <BiX size={16} /> <span>Quitar</span>
          </button>
        )}
      </div>

      <div className="ark-map-picker-canvas-wrap">
        <div ref={containerRef} className="ark-map-picker-canvas" />
        {/* Botón flotante visible sólo en touch — activa modo "tap-to-place" */}
        <button
          type="button"
          onClick={() => setTapMode((m) => !m)}
          className={`ark-map-picker-tap-btn${tapMode ? ' is-active' : ''}`}
          aria-pressed={tapMode}
        >
          <BiMap size={14} />
          {tapMode ? 'Toca el mapa para colocar el pin' : 'Colocar pin con un toque'}
        </button>
      </div>

      <div className="ark-map-picker-hint">
        {value
          ? <>Pin en <strong>{value.lat.toFixed(5)}, {value.lng.toFixed(5)}</strong>. Arrastra el pin o pulsa el botón <BiCurrentLocation size={11} style={{ verticalAlign: '-1px' }} /> para reajustar.</>
          : <>Busca tu dirección, usa tu ubicación o activa <strong>Colocar pin con un toque</strong> para tocar el mapa.</>}
      </div>
    </div>
  );
}
