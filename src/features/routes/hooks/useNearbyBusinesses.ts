import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { routeKeys } from "../keys";
import type { DraftBusiness } from "../store/useRouteCreationStore";

interface NearbyBusinessRow {
  id: string;
  name: string;
  business_type: string;
  cover_image_url: string | null;
  average_rating: number | null;
  address: string;
  phone: string | null;
  lng: number;
  lat: number;
  distance_from_route_m: number;
}

async function fetchNearbyBusinesses(
  geojson: object,
): Promise<DraftBusiness[]> {
  // @ts-expect-error — RPC defined in migration, not yet in generated types
  const { data, error } = await supabase.rpc("find_businesses_near_geojson", {
    p_geojson: geojson,
    p_radius_m: 2000,
  });

  if (error) throw new Error(error.message);

  return ((data as NearbyBusinessRow[]) ?? []).map((b) => ({
    business_id: b.id,
    name: b.name,
    business_type: b.business_type,
    cover_image_url: b.cover_image_url,
    average_rating: b.average_rating,
    address: b.address,
    phone: b.phone,
    lng: b.lng,
    lat: b.lat,
    distance_from_route_m: b.distance_from_route_m,
    notes: null,
    selected: false,
  }));
}

/**
 * Fetches businesses near the current snapped route geometry.
 * Only runs when a valid geometry is provided.
 */
export function useNearbyBusinesses(
  geometry: { type: "LineString"; coordinates: [number, number][] } | null,
) {
  return useQuery({
    queryKey: routeKeys.nearbyBusinesses(geometry),
    queryFn: () => fetchNearbyBusinesses(geometry!),
    enabled: !!geometry && geometry.coordinates.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}
