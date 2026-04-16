import { getOfflineRoute } from "@/features/offline/api";
import { useQuery } from "@tanstack/react-query";
import { fetchRouteDetail } from "../api";
import { routeKeys } from "../keys";

async function fetchWithOfflineFallback(routeId: string) {
    try {
        return await fetchRouteDetail(routeId);
    } catch {
        // Network request failed — try offline cache
        const offline = await getOfflineRoute(routeId);
        if (offline) return offline.data;
        throw new Error("No se pudo cargar la ruta y no hay datos offline");
    }
}

export const useRouteDetail = (routeId: string) => {
    return useQuery({
        queryKey: routeKeys.detail(routeId),
        queryFn: () => fetchWithOfflineFallback(routeId),
        enabled: !!routeId,
    });
};
