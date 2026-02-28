/**
 * Query keys for offline routes
 */
export const offlineKeys = {
  all: ["offline"] as const,
  routes: () => [...offlineKeys.all, "routes"] as const,
  route: (id: string) => [...offlineKeys.all, "route", id] as const,
  isOffline: (id: string) => [...offlineKeys.all, "isOffline", id] as const,
  storageInfo: () => [...offlineKeys.all, "storageInfo"] as const,
};
