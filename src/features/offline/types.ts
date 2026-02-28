/**
 * Types for offline route storage and management
 */

export interface OfflineRouteData {
  /** Route ID */
  routeId: string;
  /** Route name */
  name: string;
  /** Full route detail JSON */
  routeDetail: string; // JSON stringified RouteDetailResponse
  /** Timestamp when downloaded */
  downloadedAt: number;
  /** Size in bytes (approximate) */
  sizeBytes: number;
  /** Whether map tiles are cached */
  mapTilesCached: boolean;
  /** Cover image local URI (if downloaded) */
  coverImageUri: string | null;
}

export interface DownloadProgress {
  routeId: string;
  /** 0-100 */
  percentage: number;
  status: "downloading" | "completed" | "failed" | "cancelled";
  error?: string;
}

export interface OfflineStorageInfo {
  /** Total routes downloaded */
  totalRoutes: number;
  /** Total bytes used */
  totalSizeBytes: number;
  /** Formatted size (e.g., "12.5 MB") */
  formattedSize: string;
}
