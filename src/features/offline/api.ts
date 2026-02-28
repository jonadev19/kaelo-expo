/**
 * Offline route storage API
 *
 * Uses AsyncStorage for route metadata/detail and expo-file-system for images.
 * Mapbox tile caching is handled via @rnmapbox/maps offlineManager.
 */

import type { RouteDetailResponse } from "@/features/routes/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OfflineRouteData, OfflineStorageInfo } from "./types";

const OFFLINE_ROUTES_KEY = "offline_routes_index";
const ROUTE_DATA_PREFIX = "offline_route_";

// ─── Index management ────────────────────────────────────────────

async function getIndex(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(OFFLINE_ROUTES_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function setIndex(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(OFFLINE_ROUTES_KEY, JSON.stringify(ids));
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Save a route for offline access
 */
export async function saveRouteOffline(
  routeId: string,
  name: string,
  data: RouteDetailResponse,
): Promise<OfflineRouteData> {
  const json = JSON.stringify(data);
  const sizeBytes = new Blob([json]).size;

  // Download cover image if available
  let coverImageUri: string | null = null;
  if (data.route?.cover_image_url) {
    try {
      const FS = (await import("expo-file-system")) as any;
      const docDir = FS.documentDirectory ?? FS.default?.documentDirectory;
      if (docDir) {
        const ext =
          data.route.cover_image_url.split(".").pop()?.split("?")[0] ?? "jpg";
        const localUri = `${docDir}offline_cover_${routeId}.${ext}`;
        const downloadFn = FS.downloadAsync ?? FS.default?.downloadAsync;
        if (downloadFn) {
          const result = await downloadFn(data.route.cover_image_url, localUri);
          coverImageUri = result.uri;
        }
      }
    } catch {
      // File system not available or download failed — skip image
    }
  }

  const offlineData: OfflineRouteData = {
    routeId,
    name,
    routeDetail: json,
    downloadedAt: Date.now(),
    sizeBytes,
    mapTilesCached: false,
    coverImageUri,
  };

  // Save route data
  await AsyncStorage.setItem(
    `${ROUTE_DATA_PREFIX}${routeId}`,
    JSON.stringify(offlineData),
  );

  // Update index
  const index = await getIndex();
  if (!index.includes(routeId)) {
    index.push(routeId);
    await setIndex(index);
  }

  // Try to cache map tiles
  try {
    await cacheMapTiles(routeId, data);
    offlineData.mapTilesCached = true;
    await AsyncStorage.setItem(
      `${ROUTE_DATA_PREFIX}${routeId}`,
      JSON.stringify(offlineData),
    );
  } catch {
    // Map tile caching is best-effort
  }

  return offlineData;
}

/**
 * Cache map tiles for a route's bounding box
 */
async function cacheMapTiles(
  routeId: string,
  data: RouteDetailResponse,
): Promise<void> {
  const coords = data.route?.route_geojson?.coordinates;
  if (!coords || coords.length === 0) return;

  // Calculate bounding box with padding
  let minLng = Infinity,
    maxLng = -Infinity,
    minLat = Infinity,
    maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  // Add 10% padding
  const lngPad = (maxLng - minLng) * 0.1;
  const latPad = (maxLat - minLat) * 0.1;

  const Mapbox = (await import("@rnmapbox/maps")).default;

  await Mapbox.offlineManager.createPack(
    {
      name: `route_${routeId}`,
      styleURL: Mapbox.StyleURL.Outdoors,
      bounds: [
        [minLng - lngPad, minLat - latPad],
        [maxLng + lngPad, maxLat + latPad],
      ],
      minZoom: 10,
      maxZoom: 16,
    },
    (_region, status) => {
      // Progress callback — we don't track this granularly
      if (status?.percentage === 100) {
        // Done
      }
    },
    (_region, error) => {
      console.warn("Offline pack error:", error);
    },
  );
}

/**
 * Get a saved offline route
 */
export async function getOfflineRoute(
  routeId: string,
): Promise<{ meta: OfflineRouteData; data: RouteDetailResponse } | null> {
  const raw = await AsyncStorage.getItem(`${ROUTE_DATA_PREFIX}${routeId}`);
  if (!raw) return null;

  const meta: OfflineRouteData = JSON.parse(raw);
  const data: RouteDetailResponse = JSON.parse(meta.routeDetail);
  return { meta, data };
}

/**
 * Check if a route is saved offline
 */
export async function isRouteOffline(routeId: string): Promise<boolean> {
  const index = await getIndex();
  return index.includes(routeId);
}

/**
 * Get all offline routes (metadata only, not full detail)
 */
export async function getAllOfflineRoutes(): Promise<OfflineRouteData[]> {
  const index = await getIndex();
  const routes: OfflineRouteData[] = [];

  for (const id of index) {
    const raw = await AsyncStorage.getItem(`${ROUTE_DATA_PREFIX}${id}`);
    if (raw) {
      routes.push(JSON.parse(raw));
    }
  }

  return routes;
}

/**
 * Remove a route from offline storage
 */
export async function removeOfflineRoute(routeId: string): Promise<void> {
  // Remove data
  await AsyncStorage.removeItem(`${ROUTE_DATA_PREFIX}${routeId}`);

  // Update index
  const index = await getIndex();
  await setIndex(index.filter((id) => id !== routeId));

  // Remove cached cover image
  try {
    const FS = (await import("expo-file-system")) as any;
    const docDir = FS.documentDirectory ?? FS.default?.documentDirectory;
    const readDir = FS.readDirectoryAsync ?? FS.default?.readDirectoryAsync;
    const delFile = FS.deleteAsync ?? FS.default?.deleteAsync;
    if (docDir && readDir && delFile) {
      const files = await readDir(docDir);
      const coverFile = files.find((f: string) =>
        f.startsWith(`offline_cover_${routeId}`),
      );
      if (coverFile) {
        await delFile(`${docDir}${coverFile}`, { idempotent: true });
      }
    }
  } catch {
    // Best-effort cleanup
  }

  // Remove map tile pack
  try {
    const Mapbox = (await import("@rnmapbox/maps")).default;
    await Mapbox.offlineManager.deletePack(`route_${routeId}`);
  } catch {
    // Best-effort cleanup
  }
}

/**
 * Get offline storage usage information
 */
export async function getOfflineStorageInfo(): Promise<OfflineStorageInfo> {
  const routes = await getAllOfflineRoutes();
  const totalSizeBytes = routes.reduce((sum, r) => sum + r.sizeBytes, 0);

  let formattedSize: string;
  if (totalSizeBytes < 1024) {
    formattedSize = `${totalSizeBytes} B`;
  } else if (totalSizeBytes < 1024 * 1024) {
    formattedSize = `${(totalSizeBytes / 1024).toFixed(1)} KB`;
  } else {
    formattedSize = `${(totalSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return {
    totalRoutes: routes.length,
    totalSizeBytes,
    formattedSize,
  };
}

/**
 * Clear all offline data
 */
export async function clearAllOfflineData(): Promise<void> {
  const index = await getIndex();

  for (const id of index) {
    await removeOfflineRoute(id);
  }

  await AsyncStorage.removeItem(OFFLINE_ROUTES_KEY);
}
