import { businessKeys } from "@/features/businesses/keys";
import { useUser } from "@/shared/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitBusinessReview } from "../api";
import { reviewKeys } from "../keys";
import type { BusinessReviewFormData } from "../types";

export const useSubmitBusinessReview = (businessId: string) => {
    const user = useUser();
    const userId = user?.id ?? "";
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: BusinessReviewFormData) =>
            submitBusinessReview(userId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: reviewKeys.business(businessId),
            });
            queryClient.invalidateQueries({
                queryKey: businessKeys.detail(businessId),
            });
        },
    });
};
