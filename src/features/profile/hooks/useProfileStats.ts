import { useAuthStore } from "@/shared/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { fetchProfileStats } from "../api";
import { profileKeys } from "../keys";

export const useProfileStats = () => {
    const user = useAuthStore((state) => state.user);

    return useQuery({
        queryKey: profileKeys.stats(user?.id ?? ""),
        queryFn: () => fetchProfileStats(user!.id),
        enabled: !!user?.id,
    });
};
