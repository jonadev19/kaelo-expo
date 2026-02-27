import { useQuery } from "@tanstack/react-query";
import { fetchBusinessReviews } from "../api";
import { reviewKeys } from "../keys";

export const useBusinessReviews = (businessId: string) => {
    return useQuery({
        queryKey: reviewKeys.business(businessId),
        queryFn: () => fetchBusinessReviews(businessId),
        enabled: !!businessId,
    });
};
