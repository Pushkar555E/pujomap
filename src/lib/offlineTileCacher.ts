/** Pre-cache OpenFreeMap vector tiles around Kolkata for offline browsing. */
import { KOLKATA_BOUNDS } from "./schema";

const STYLE_LIGHT = "https://tiles.openfreemap.org/styles/liberty";
const STYLE_DARK = "https://tiles.openfreemap.org/styles/dark";
const TILE_URL = "https://tiles.openfreemap.org/planet/latest";

function lon2tile(lon: number, zoom: number): number {
  return Math.floor(((lon + 180) / 360) * 2 ** zoom);
}

function lat2tile(lat: number, zoom: number): number {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      2 ** zoom,
  );
}

export type CacheProgress = {
  total: number;
  completed: number;
  percent: number;
  status: "idle" | "caching" | "done" | "error";
};

export async function precacheKolkataMapTiles(
  onProgress?: (p: CacheProgress) => void,
): Promise<{ success: boolean; cachedTilesCount: number }> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return { success: false, cachedTilesCount: 0 };
  }

  try {
    const cache = await caches.open("pujomap-tiles-v2-openfreemap");
    await Promise.all([cache.add(STYLE_LIGHT).catch(() => null), cache.add(STYLE_DARK).catch(() => null)]);

    // Keep the full PujoMap coverage (including North Kolkata and Salt Lake) available at usable zooms.
    const zooms = [10, 11, 12, 13, 14];
    const urls = new Set<string>();
    for (const z of zooms) {
      const minX = lon2tile(KOLKATA_BOUNDS.west, z);
      const maxX = lon2tile(KOLKATA_BOUNDS.east, z);
      const minY = lat2tile(KOLKATA_BOUNDS.north, z);
      const maxY = lat2tile(KOLKATA_BOUNDS.south, z);
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) urls.add(`${TILE_URL}/${z}/${x}/${y}.pbf`);
      }
    }

    let completed = 0;
    const all = [...urls];
    onProgress?.({ total: all.length, completed, percent: 0, status: "caching" });
    const batchSize = 6;
    for (let i = 0; i < all.length; i += batchSize) {
      await Promise.all(
        all.slice(i, i + batchSize).map(async (url) => {
          try {
            const hit = await cache.match(url);
            if (!hit) {
              const response = await fetch(url);
              if (response.ok) await cache.put(url, response);
            }
          } catch {
            // An individual tile can fail without blocking the rest of the offline area.
          } finally {
            completed++;
            onProgress?.({
              total: all.length,
              completed,
              percent: Math.min(100, Math.round((completed / all.length) * 100)),
              status: "caching",
            });
          }
        }),
      );
    }
    onProgress?.({ total: all.length, completed, percent: 100, status: "done" });
    return { success: true, cachedTilesCount: completed };
  } catch (err) {
    console.error("Failed to precache map tiles:", err);
    onProgress?.({ total: 0, completed: 0, percent: 0, status: "error" });
    return { success: false, cachedTilesCount: 0 };
  }
}
