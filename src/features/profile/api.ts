import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface ProfileStats {
    routes_completed: number;
    total_distance_km: number;
    unique_routes: number;
}

/**
 * Fetch user profile from the profiles table.
 */
export const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error && error.code !== "PGRST116") {
        // PGRST116 = "no rows found" — not an error for us
        throw new Error(error.message);
    }
    return data ?? null;
};

/**
 * Update user profile fields.
 */
export const updateProfile = async (
    userId: string,
    updates: Database["public"]["Tables"]["profiles"]["Update"],
): Promise<Profile> => {
    const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select("*")
        .single();

    if (error) throw new Error(error.message);
    return data;
};

/**
 * Fetch profile stats from route_completions table.
 */
export const fetchProfileStats = async (
    userId: string,
): Promise<ProfileStats> => {
    const { data, error } = await supabase
        .from("route_completions")
        .select("distance_actual_km, route_id")
        .eq("user_id", userId)
        .eq("status", "completado");

    if (error) throw new Error(error.message);

    const completions = data ?? [];
    const uniqueRoutes = new Set(completions.map((c) => c.route_id));

    return {
        routes_completed: completions.length,
        total_distance_km: completions.reduce(
            (sum, c) => sum + (c.distance_actual_km ?? 0),
            0,
        ),
        unique_routes: uniqueRoutes.size,
    };
};
