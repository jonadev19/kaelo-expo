<<<<<<< HEAD
export const routeKeys = {
  all: ["routes"] as const,
  lists: () => [...routeKeys.all, "list"] as const,
  detail: (id: string) => [...routeKeys.all, "detail", id] as const,
=======
import type { RouteFilters } from "./types";

export const routeKeys = {
  all: ["routes"] as const,
  lists: () => [...routeKeys.all, "list"] as const,
  published: (filters?: RouteFilters) =>
    [...routeKeys.all, "published", filters ?? {}] as const,
  detail: (id: string) => [...routeKeys.all, "detail", id] as const,
  search: (query: string) => [...routeKeys.all, "search", query] as const,
  nearbyBusinesses: (geometry: object | null) =>
    [...routeKeys.all, "nearbyBusinesses", geometry ?? "none"] as const,
>>>>>>> 6641b1a67348778d6d81cb4e018da3214ab4d1fc
};
