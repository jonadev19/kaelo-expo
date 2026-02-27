import { supabase } from "@/lib/supabase";
import type { SavedRoute } from "./types";

/**
 * Fetch all saved routes for a user, joined with route details.
 */
export const fetchSavedRoutes = async (
    userId: string,
): Promise<SavedRoute[]> => {
    const { data, error } = await supabase
        .from("saved_routes")
        .select(
            `
            id, user_id, route_id, created_at,
            route:routes (
                id, name, slug, distance_km, difficulty,
                terrain_type, cover_image_url, municipality, average_rating
            )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data as unknown as SavedRoute[]) ?? [];
};

/**
 * Check if a route is saved by the current user.
 */
export const checkRouteSaved = async (
    userId: string,
    routeId: string,
): Promise<boolean> => {
    const { count, error } = await supabase
        .from("saved_routes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("route_id", routeId);

    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
};

/**
 * Toggle save/unsave a route for the current user.
 * Returns true if saved, false if unsaved.
 */
export const toggleSaveRoute = async (
    userId: string,
    routeId: string,
): Promise<boolean> => {
    // Check if already saved
    const isSaved = await checkRouteSaved(userId, routeId);

    if (isSaved) {
        const { error } = await supabase
            .from("saved_routes")
            .delete()
            .eq("user_id", userId)
            .eq("route_id", routeId);

        if (error) throw new Error(error.message);
        return false;
    } else {
        const { error } = await supabase
            .from("saved_routes")
            .insert({ user_id: userId, route_id: routeId });

        if (error) throw new Error(error.message);
        return true;
    }
};
