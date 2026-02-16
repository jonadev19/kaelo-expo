import { useQuery } from "@tanstack/react-query";
import { fetchBusinessDetail } from "../api";
import { businessKeys } from "../keys";

export const useBusinessDetail = (businessId: string) => {
    return useQuery({
        queryKey: businessKeys.detail(businessId),
        queryFn: () => fetchBusinessDetail(businessId),
        enabled: !!businessId,
    });
};
