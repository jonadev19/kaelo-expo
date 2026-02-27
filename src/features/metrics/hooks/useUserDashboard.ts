import { useUser } from "@/shared/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { fetchUserDashboard } from "../api";
import { metricsKeys } from "../keys";

export const useUserDashboard = () => {
    const user = useUser();
    const userId = user?.id ?? "";

    return useQuery({
        queryKey: metricsKeys.dashboard(userId),
        queryFn: () => fetchUserDashboard(userId),
        enabled: !!userId,
    });
};
