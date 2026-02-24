import { useUser } from "@/shared/store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { checkRouteSaved, toggleSaveRoute } from "../api";
import { favoriteKeys } from "../keys";

/**
 * Hook to check if a route is saved and toggle it.
 */
export const useToggleSave = (routeId: string) => {
    const user = useUser();
    const userId = user?.id ?? "";
    const queryClient = useQueryClient();

    const { data: isSaved = false, isLoading } = useQuery({
        queryKey: favoriteKeys.check(userId, routeId),
        queryFn: () => checkRouteSaved(userId, routeId),
        enabled: !!userId && !!routeId,
    });

    const mutation = useMutation({
        mutationFn: () => toggleSaveRoute(userId, routeId),
        onMutate: async () => {
            // Optimistic update
            await queryClient.cancelQueries({
                queryKey: favoriteKeys.check(userId, routeId),
            });
            const previous = queryClient.getQueryData(
                favoriteKeys.check(userId, routeId),
            );
            queryClient.setQueryData(
                favoriteKeys.check(userId, routeId),
                !isSaved,
            );
            return { previous };
        },
        onError: (err, _vars, context) => {
            // Rollback on error
            queryClient.setQueryData(
                favoriteKeys.check(userId, routeId),
                context?.previous,
            );
            Alert.alert("Error", (err as Error).message || "No se pudo guardar la ruta");
        },
        onSettled: () => {
            // Invalidate both the check and the full list
            queryClient.invalidateQueries({
                queryKey: favoriteKeys.check(userId, routeId),
            });
            queryClient.invalidateQueries({
                queryKey: favoriteKeys.list(userId),
            });
        },
    });

    return {
        isSaved,
        isLoading,
        toggle: mutation.mutate,
        isToggling: mutation.isPending,
    };
};
