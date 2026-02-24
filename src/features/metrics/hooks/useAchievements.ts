import { useUser } from "@/shared/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { fetchUserAchievements } from "../api";
import { metricsKeys } from "../keys";

export const useAchievements = () => {
    const user = useUser();
    const userId = user?.id ?? "";

    return useQuery({
        queryKey: metricsKeys.achievements(userId),
        queryFn: () => fetchUserAchievements(userId),
        enabled: !!userId,
    });
};
