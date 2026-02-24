import type { BusinessType } from "./types";

export const businessKeys = {
    all: ["businesses"] as const,
    lists: (type?: BusinessType | null) =>
        [...businessKeys.all, "list", type ?? "all"] as const,
    detail: (id: string) => [...businessKeys.all, "detail", id] as const,
    search: (query: string, type?: BusinessType | null) =>
        [...businessKeys.all, "search", query, type ?? "all"] as const,
};
