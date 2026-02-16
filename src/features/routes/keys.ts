import type { RouteFilters } from "./types";

export const routeKeys = {
  all: ["routes"] as const,
  lists: () => [...routeKeys.all, "list"] as const,
  published: (filters?: RouteFilters) =>
    [...routeKeys.all, "published", filters ?? {}] as const,
  detail: (id: string) => [...routeKeys.all, "detail", id] as const,
  search: (query: string) => [...routeKeys.all, "search", query] as const,
};
