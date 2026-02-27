import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { createRoute } from "../api/createRoute";
import { routeKeys } from "../keys";
import { useRouteCreationStore } from "../store/useRouteCreationStore";

/**
 * Mutation hook that saves the route (draft or published).
 * On success: invalidates route caches, navigates to route-detail, and resets the store.
 */
export function useRouteCreation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const store = useRouteCreationStore;

  return useMutation({
    mutationFn: async (status: "borrador" | "publicado") => {
      const state = store.getState();
      return createRoute(
        {
          draftPoints: state.draftPoints,
          snappedRoute: state.snappedRoute,
          waypoints: state.waypoints,
          businesses: state.businesses,
          details: state.details,
        },
        status,
      );
    },
    onSuccess: (routeId) => {
      queryClient.invalidateQueries({ queryKey: routeKeys.all });
      store.getState().reset();
      router.replace({
        pathname: "/route-detail" as any,
        params: { id: routeId },
      });
    },
  });
}
