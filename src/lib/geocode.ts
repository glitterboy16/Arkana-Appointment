export interface GeoPoint {
  lat: number;
  lon: number;
  displayName: string;
}

const CACHE_KEY = 'arkana.geocode.v1';

interface CacheEntry {
  ts: number;
  result: GeoPoint | null;
}

function readCache(): Record<string, CacheEntry> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeCache(map: Record<string, CacheEntry>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    /* quota — ignoramos */
  }
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function nominatimQuery(q: string): Promise<GeoPoint | null> {
  try {
    // countrycodes=es prioriza España. addressdetails ayuda con direcciones cortas.
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=es&addressdetails=0&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    const first = data[0];
    if (!first) return null;
    return { lat: parseFloat(first.lat), lon: parseFloat(first.lon), displayName: first.display_name };
  } catch {
    return null;
  }
}

/**
 * Geocode con Nominatim (OpenStreetMap). Es gratis y no requiere API key,
 * pero su política exige un único requester por dominio — el browser cumple
 * eso de forma natural. Cacheamos 24h en localStorage para no spammear.
 *
 * Estrategia: probamos varias variantes (con/sin "España", normalizando comas)
 * para tolerar direcciones incompletas tipo "Calle Mayor 3" o "Plaza España".
 */
export async function geocode(address: string): Promise<GeoPoint | null> {
  const raw = address.trim();
  if (!raw) return null;

  const cache = readCache();
  const hit = cache[raw];
  if (hit && Date.now() - hit.ts < ONE_DAY_MS) {
    return hit.result;
  }

  // Construimos variantes a probar en orden de especificidad
  const lower = raw.toLowerCase();
  const yaTieneEspana = lower.includes('españa') || lower.includes('spain');
  const candidatos: string[] = [];

  candidatos.push(raw);
  if (!yaTieneEspana) candidatos.push(`${raw}, España`);

  // Si la dirección no tiene coma, prueba a separar la última palabra como ciudad
  // (heurística simple para casos tipo "Calle Mayor 3 Madrid")
  if (!raw.includes(',')) {
    const partes = raw.split(/\s+/);
    if (partes.length > 2) {
      const ultima = partes[partes.length - 1];
      const resto = partes.slice(0, -1).join(' ');
      candidatos.push(`${resto}, ${ultima}, España`);
    }
  }

  let result: GeoPoint | null = null;
  for (const q of candidatos) {
    result = await nominatimQuery(q);
    if (result) break;
  }

  cache[raw] = { ts: Date.now(), result };
  writeCache(cache);
  return result;
}

export function osmEmbedUrl(point: GeoPoint, zoomDelta = 0.006): string {
  const bbox = [
    point.lon - zoomDelta,
    point.lat - zoomDelta * 0.55,
    point.lon + zoomDelta,
    point.lat + zoomDelta * 0.55,
  ].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${point.lat},${point.lon}`;
}

export function osmExternalUrl(point: GeoPoint): string {
  return `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lon}#map=17/${point.lat}/${point.lon}`;
}
