import { useAuthStore } from "@/shared/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../api";
import { profileKeys } from "../keys";

export const useUpdateProfile = () => {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (updates: {
            full_name?: string;
            bio?: string;
            phone?: string;
            avatar_url?: string;
        }) => {
            if (!user?.id) throw new Error("No autenticado");
            return updateProfile(user.id, updates);
        },
        onSuccess: () => {
            if (user?.id) {
                queryClient.invalidateQueries({
                    queryKey: profileKeys.detail(user.id),
                });
            }
        },
    });
};
