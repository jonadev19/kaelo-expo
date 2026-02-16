import { supabase } from "@/lib/supabase";
import type {
  RouteDetailResponse,
  RouteFilters,
  RouteListItem,
} from "./types";

/**
 * Fetch published routes with optional filters.
 * Uses the `get_published_routes` Supabase RPC.
 */
export const fetchPublishedRoutes = async (
  filters?: RouteFilters,
): Promise<RouteListItem[]> => {
  // @ts-expect-error — RPC function defined in migration, not yet in generated types
  const { data, error } = await supabase.rpc("get_published_routes", {
    p_difficulty: filters?.difficulty ?? null,
    p_terrain: filters?.terrain ?? null,
    p_max_distance: filters?.maxDistance ?? null,
    p_min_distance: filters?.minDistance ?? null,
  });

  if (error) throw new Error(error.message);
  return (data as RouteListItem[]) ?? [];
};

/**
 * Fetch a single route's full detail (route + waypoints + businesses).
 * Uses the `get_route_detail` Supabase RPC.
 */
export const fetchRouteDetail = async (
  routeId: string,
): Promise<RouteDetailResponse> => {
  // @ts-expect-error — RPC function defined in migration, not yet in generated types
  const { data, error } = await supabase.rpc("get_route_detail", {
    p_route_id: routeId,
  });

  if (error) throw new Error(error.message);

  const result = data as RouteDetailResponse;
  return {
    route: result?.route ?? null,
    waypoints: result?.waypoints ?? [],
    businesses: result?.businesses ?? [],
  };
};

/**
 * Search routes by name, description, or municipality.
 * Uses the `search_routes` Supabase RPC.
 */
export const searchRoutes = async (
  query: string,
): Promise<RouteListItem[]> => {
  if (!query.trim()) return [];

  // @ts-expect-error — RPC function defined in migration, not yet in generated types
  const { data, error } = await supabase.rpc("search_routes", {
    p_query: query.trim(),
  });

  if (error) throw new Error(error.message);
  return (data as RouteListItem[]) ?? [];
};
