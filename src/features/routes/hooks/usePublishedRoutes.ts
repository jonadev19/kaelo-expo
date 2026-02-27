import { useQuery } from "@tanstack/react-query";
import { fetchPublishedRoutes } from "../api";
import { routeKeys } from "../keys";
import type { RouteFilters } from "../types";

export const usePublishedRoutes = (filters?: RouteFilters) => {
    return useQuery({
        queryKey: routeKeys.published(filters),
        queryFn: () => fetchPublishedRoutes(filters),
    });
};
