import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { searchRoutes } from "../api";
import { routeKeys } from "../keys";

const DEBOUNCE_MS = 300;

export const useRouteSearch = () => {
    const [searchText, setSearchText] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchText);
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [searchText]);

    const query = useQuery({
        queryKey: routeKeys.search(debouncedQuery),
        queryFn: () => searchRoutes(debouncedQuery),
        enabled: debouncedQuery.length >= 2,
    });

    const clearSearch = useCallback(() => {
        setSearchText("");
        setDebouncedQuery("");
    }, []);

    return {
        searchText,
        setSearchText,
        clearSearch,
        isSearching: debouncedQuery.length >= 2,
        ...query,
    };
};
