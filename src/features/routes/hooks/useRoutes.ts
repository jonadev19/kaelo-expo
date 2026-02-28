import { useQuery } from "@tanstack/react-query";
import { fetchPublishedRoutes } from "../api";
import { routeKeys } from "../keys";

/**
 * Legacy hook — fetches all published routes with no filters.
 * Prefer usePublishedRoutes for new code.
 */
export const useRoutes = () => {
  return useQuery({
    queryKey: routeKeys.lists(),
    queryFn: () => fetchPublishedRoutes(),
    staleTime: 1000 * 60 * 5,
  });
};
