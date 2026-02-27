import { useQuery } from "@tanstack/react-query";
import { fetchRouteReviews } from "../api";
import { reviewKeys } from "../keys";

export const useRouteReviews = (routeId: string) => {
    return useQuery({
        queryKey: reviewKeys.route(routeId),
        queryFn: () => fetchRouteReviews(routeId),
        enabled: !!routeId,
    });
};
