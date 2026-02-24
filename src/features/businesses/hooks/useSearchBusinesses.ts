import { useQuery } from "@tanstack/react-query";
import { searchBusinesses } from "../api";
import { businessKeys } from "../keys";
import type { BusinessType } from "../types";

export const useSearchBusinesses = (
    query: string,
    type?: BusinessType | null,
) => {
    return useQuery({
        queryKey: businessKeys.search(query, type),
        queryFn: () => searchBusinesses(query, type),
        enabled: query.trim().length >= 2,
    });
};
