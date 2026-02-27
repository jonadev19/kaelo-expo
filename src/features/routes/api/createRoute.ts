import { supabase } from "@/lib/supabase";
import type { RouteCreationStore } from "../store/useRouteCreationStore";

/** Generate a URL-safe slug from a route name */
function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // strip diacritics
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") +
    "-" +
    Date.now().toString(36)
  );
}

type StoreSnapshot = Pick<
  RouteCreationStore,
  "draftPoints" | "snappedRoute" | "waypoints" | "businesses" | "details"
>;

/**
 * Upload cover image to Supabase Storage and return the public URL.
 * Returns null if no image is provided.
 */
async function uploadCoverImage(
  uri: string | null,
): Promise<string | null> {
  if (!uri) return null;

  const fileName = `route-covers/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from("images")
    .upload(fileName, blob, { contentType: "image/jpeg", upsert: false });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Serializes the creation store state and calls the create_route RPC.
 * Returns the new route UUID.
 */
export async function createRoute(
  snapshot: StoreSnapshot,
  status: "borrador" | "publicado",
): Promise<string> {
  const { snappedRoute, waypoints, businesses, details } = snapshot;

  // Upload cover image if present
  const coverImageUrl = await uploadCoverImage(details.cover_image_uri);

  const slug = generateSlug(details.name);

  // Build geometries
  const routeGeojson = snappedRoute
    ? { type: "LineString", coordinates: snappedRoute.geometry.coordinates }
    : null;

  const coords = snappedRoute?.geometry.coordinates;
  const startPointGeojson = coords?.length
    ? { type: "Point", coordinates: coords[0] }
    : null;
  const endPointGeojson =
    coords && coords.length > 1
      ? { type: "Point", coordinates: coords[coords.length - 1] }
      : null;

  // Serialize waypoints
  const waypointsPayload = waypoints.map((wp, i) => ({
    name: wp.name,
    description: wp.description,
    waypoint_type: wp.waypoint_type,
    lng: wp.lng,
    lat: wp.lat,
    image_url: wp.image_url,
    order_index: i,
  }));

  // Serialize businesses (only selected ones)
  const businessesPayload = businesses
    .filter((b) => b.selected)
    .map((b, i) => ({
      business_id: b.business_id,
      distance_from_route_m: b.distance_from_route_m,
      order_index: i,
      notes: b.notes,
    }));

  // Calculate duration: use manual value or estimate from directions
  const durationMin =
    details.estimated_duration_min ??
    (snappedRoute ? Math.round(snappedRoute.duration / 60) : null);

  // @ts-expect-error — RPC defined in migration, not yet in generated types
  const { data, error } = await supabase.rpc("create_route", {
    p_name: details.name,
    p_description: details.description || null,
    p_slug: slug,
    p_route_geojson: routeGeojson,
    p_start_point_geojson: startPointGeojson,
    p_end_point_geojson: endPointGeojson,
    p_distance_km: snappedRoute
      ? +(snappedRoute.distance / 1000).toFixed(2)
      : 0,
    p_elevation_gain_m: 0,
    p_estimated_duration_min: durationMin,
    p_difficulty: details.difficulty,
    p_terrain_type: details.terrain_type,
    p_status: status,
    p_price: details.is_free ? 0 : details.price,
    p_is_free: details.is_free,
    p_cover_image_url: coverImageUrl,
    p_tags: details.tags,
    p_municipality: details.municipality || null,
    p_waypoints: waypointsPayload,
    p_businesses: businessesPayload,
  });

  if (error) throw new Error(error.message);
  return data as string;
}
