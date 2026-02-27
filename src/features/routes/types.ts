// Types for route data returned by Supabase RPCs

export type RouteDifficulty = "facil" | "moderada" | "dificil" | "experto";
export type RouteTerrainType = "asfalto" | "terraceria" | "mixto";
export type WaypointType =
    | "inicio"
    | "fin"
    | "cenote"
    | "zona_arqueologica"
    | "mirador"
    | "restaurante"
    | "tienda"
    | "taller_bicicletas"
    | "descanso"
    | "punto_agua"
    | "peligro"
    | "foto"
    | "otro";

/** Route item returned by get_published_routes / search_routes RPCs */
export interface RouteListItem {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    distance_km: number;
    elevation_gain_m: number | null;
    estimated_duration_min: number | null;
    difficulty: RouteDifficulty;
    terrain_type: RouteTerrainType;
    price: number;
    is_free: boolean;
    cover_image_url: string | null;
    tags: string[];
    municipality: string | null;
    average_rating: number;
    total_reviews: number;
    creator_id: string;
    start_lng: number;
    start_lat: number;
    end_lng: number | null;
    end_lat: number | null;
    created_at: string;
    route_geojson: {
        type: "LineString";
        coordinates: [number, number][];
    } | null;
}

/** Extended route detail returned by get_route_detail RPC */
export interface RouteDetail extends RouteListItem {
    photos: string[];
    purchase_count: number;
    status: string;
    route_geojson: {
        type: "LineString";
        coordinates: [number, number][];
    } | null;
}

/** Waypoint returned within route detail */
export interface RouteWaypoint {
    id: string;
    name: string;
    description: string | null;
    waypoint_type: WaypointType;
    image_url: string | null;
    order_index: number;
    lng: number;
    lat: number;
}

/** Business item returned within route detail */
export interface RouteBusinessItem {
    id: string;
    name: string;
    business_type: string;
    cover_image_url: string | null;
    average_rating: number | null;
    address: string;
    phone: string | null;
    lng: number;
    lat: number;
    distance_from_route_m: number | null;
}

/** Full response from get_route_detail RPC */
export interface RouteDetailResponse {
    route: RouteDetail | null;
    waypoints: RouteWaypoint[];
    businesses: RouteBusinessItem[];
}

/** Filters for route queries */
export interface RouteFilters {
    difficulty?: RouteDifficulty | null;
    terrain?: RouteTerrainType | null;
    maxDistance?: number | null;
    minDistance?: number | null;
}
