import { useQuery } from "@tanstack/react-query";
<<<<<<< HEAD
import { fetchRoutes } from "../api";
import { routeKeys } from "../keys";

export const useRoutes = () => {
  return useQuery({
    queryKey: routeKeys.lists(),
    queryFn: fetchRoutes,
    staleTime: 1000 * 60 * 5, // Los datos se consideran "frescos" por 5 min
  });
};

// const query = useRoutes();
=======
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
>>>>>>> 6641b1a67348778d6d81cb4e018da3214ab4d1fc
