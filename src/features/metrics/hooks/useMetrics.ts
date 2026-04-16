import { useUser } from "@/shared/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { fetchRecentActivity } from "../api";
import { metricsKeys } from "../keys";

/**
 * Hook to fetch the current user's recent activity (route completions).
 */
export const useRecentActivity = (limit = 10) => {
    const user = useUser();
    const userId = user?.id ?? "";

    return useQuery({
        queryKey: [...metricsKeys.activity(userId), { limit }],
        queryFn: () => fetchRecentActivity(userId, limit),
        enabled: !!userId,
    });
};
