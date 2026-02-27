export interface SavedRoute {
    id: string;
    user_id: string;
    route_id: string;
    created_at: string | null;
    // Joined route data
    route?: {
        id: string;
        name: string;
        slug: string;
        distance_km: number;
        difficulty: string | null;
        terrain_type: string | null;
        cover_image_url: string | null;
        municipality: string | null;
        average_rating: number | null;
    };
}
