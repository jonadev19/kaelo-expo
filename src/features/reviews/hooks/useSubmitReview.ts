import { routeKeys } from "@/features/routes/keys";
import { useUser } from "@/shared/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitReview } from "../api";
import { reviewKeys } from "../keys";
import type { ReviewFormData } from "../types";

export const useSubmitReview = (routeId: string) => {
    const user = useUser();
    const userId = user?.id ?? "";
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: ReviewFormData) =>
            submitReview(userId, formData),
        onSuccess: () => {
            // Invalidate reviews list and route detail (for updated avg rating)
            queryClient.invalidateQueries({
                queryKey: reviewKeys.route(routeId),
            });
            queryClient.invalidateQueries({
                queryKey: routeKeys.detail(routeId),
            });
        },
    });
};
