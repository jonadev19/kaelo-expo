/**
 * Hooks for offline route management
 */

import type { RouteDetailResponse } from "@/features/routes/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import {
  getAllOfflineRoutes,
  getOfflineRoute,
  getOfflineStorageInfo,
  isRouteOffline,
  removeOfflineRoute,
  saveRouteOffline,
} from "../api";
import { offlineKeys } from "../keys";
import { useOfflineStore } from "../store/useOfflineStore";

/**
 * Check if a route is available offline
 */
export function useIsRouteOffline(routeId: string) {
  return useQuery({
    queryKey: offlineKeys.isOffline(routeId),
    queryFn: () => isRouteOffline(routeId),
    enabled: !!routeId,
    staleTime: Infinity, // Only changes when we download/remove
  });
}

/**
 * Get an offline route's data
 */
export function useOfflineRoute(routeId: string) {
  return useQuery({
    queryKey: offlineKeys.route(routeId),
    queryFn: () => getOfflineRoute(routeId),
    enabled: !!routeId,
    staleTime: Infinity,
  });
}

/**
 * Get all downloaded routes
 */
export function useOfflineRoutes() {
  return useQuery({
    queryKey: offlineKeys.routes(),
    queryFn: getAllOfflineRoutes,
    staleTime: 30_000,
  });
}

/**
 * Get storage usage info
 */
export function useOfflineStorageInfo() {
  return useQuery({
    queryKey: offlineKeys.storageInfo(),
    queryFn: getOfflineStorageInfo,
    staleTime: 30_000,
  });
}

/**
 * Download a route for offline use
 */
export function useDownloadRoute() {
  const queryClient = useQueryClient();
  const setProgress = useOfflineStore((s) => s.setProgress);
  const removeDownload = useOfflineStore((s) => s.removeDownload);

  return useMutation({
    mutationFn: async ({
      routeId,
      name,
      data,
    }: {
      routeId: string;
      name: string;
      data: RouteDetailResponse;
    }) => {
      setProgress(routeId, {
        routeId,
        percentage: 10,
        status: "downloading",
      });

      try {
        const result = await saveRouteOffline(routeId, name, data);

        setProgress(routeId, {
          routeId,
          percentage: 100,
          status: "completed",
        });

        // Clear progress after a delay
        setTimeout(() => removeDownload(routeId), 2000);

        return result;
      } catch (error) {
        setProgress(routeId, {
          routeId,
          percentage: 0,
          status: "failed",
          error: error instanceof Error ? error.message : "Error desconocido",
        });
        throw error;
      }
    },
    onSuccess: (_, { routeId }) => {
      queryClient.invalidateQueries({
        queryKey: offlineKeys.isOffline(routeId),
      });
      queryClient.invalidateQueries({ queryKey: offlineKeys.routes() });
      queryClient.invalidateQueries({ queryKey: offlineKeys.storageInfo() });
    },
    onError: () => {
      Alert.alert(
        "Error de descarga",
        "No se pudo descargar la ruta. Intenta de nuevo.",
      );
    },
  });
}

/**
 * Remove a downloaded route
 */
export function useRemoveOfflineRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: string) => removeOfflineRoute(routeId),
    onSuccess: (_, routeId) => {
      queryClient.invalidateQueries({
        queryKey: offlineKeys.isOffline(routeId),
      });
      queryClient.invalidateQueries({ queryKey: offlineKeys.routes() });
      queryClient.invalidateQueries({ queryKey: offlineKeys.storageInfo() });
    },
  });
}
