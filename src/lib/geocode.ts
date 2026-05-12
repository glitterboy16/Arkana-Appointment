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

/**
 * Geocode con Nominatim (OpenStreetMap). Es gratis y no requiere API key,
 * pero su política exige un único requester por dominio — el browser cumple
 * eso de forma natural. Cacheamos 24h en localStorage para no spammear.
 */
export async function geocode(address: string): Promise<GeoPoint | null> {
  const query = address.trim();
  if (!query) return null;

  const cache = readCache();
  const hit = cache[query];
  if (hit && Date.now() - hit.ts < ONE_DAY_MS) {
    return hit.result;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'es' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    const first = data[0];
    const result: GeoPoint | null = first
      ? { lat: parseFloat(first.lat), lon: parseFloat(first.lon), displayName: first.display_name }
      : null;
    cache[query] = { ts: Date.now(), result };
    writeCache(cache);
    return result;
  } catch {
    return null;
  }
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
