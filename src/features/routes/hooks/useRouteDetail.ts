import { useQuery } from "@tanstack/react-query";
import { fetchRouteDetail } from "../api";
import { routeKeys } from "../keys";

export const useRouteDetail = (routeId: string) => {
    return useQuery({
        queryKey: routeKeys.detail(routeId),
        queryFn: () => fetchRouteDetail(routeId),
        enabled: !!routeId,
    });
};
