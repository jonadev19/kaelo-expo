import { useQuery } from "@tanstack/react-query";
import { fetchRoutes } from "../api";
import { routeKeys } from "../keys";

export const useRoutes = () => {
  return useQuery({
    queryKey: routeKeys.lists(),
    queryFn: fetchRoutes,
    staleTime: 1000 * 60 * 5, // Los datos se consideran "frescos" por 5 min
  });
};
