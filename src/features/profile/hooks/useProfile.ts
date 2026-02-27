import { useAuthStore } from "@/shared/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "../api";
import { profileKeys } from "../keys";

export const useProfile = () => {
    const user = useAuthStore((state) => state.user);

    return useQuery({
        queryKey: profileKeys.detail(user?.id ?? ""),
        queryFn: () => fetchProfile(user!.id),
        enabled: !!user?.id,
    });
};
