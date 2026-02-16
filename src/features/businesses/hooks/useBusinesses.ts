import { useQuery } from "@tanstack/react-query";
import { fetchBusinesses } from "../api";
import { businessKeys } from "../keys";
import type { BusinessType } from "../types";

export const useBusinesses = (type?: BusinessType | null) => {
    return useQuery({
        queryKey: businessKeys.lists(type),
        queryFn: () => fetchBusinesses(type),
    });
};
