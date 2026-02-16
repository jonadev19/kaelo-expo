import type { BusinessType } from "./types";

export const businessKeys = {
    all: ["businesses"] as const,
    lists: (type?: BusinessType | null) =>
        [...businessKeys.all, "list", type ?? "all"] as const,
    detail: (id: string) => [...businessKeys.all, "detail", id] as const,
};
