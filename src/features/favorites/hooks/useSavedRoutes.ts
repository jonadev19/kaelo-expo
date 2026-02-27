import { useUser } from "@/shared/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { fetchSavedRoutes } from "../api";
import { favoriteKeys } from "../keys";

export const useSavedRoutes = () => {
    const user = useUser();
    const userId = user?.id ?? "";

    return useQuery({
        queryKey: favoriteKeys.list(userId),
        queryFn: () => fetchSavedRoutes(userId),
        enabled: !!userId,
    });
};
