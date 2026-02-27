import { supabase } from "@/lib/supabase";
import type { Achievement, ActivityRecord, UserDashboard } from "./types";

/**
 * Fetch user dashboard summary from the pre-computed view.
 */
export const fetchUserDashboard = async (
    userId: string,
): Promise<UserDashboard | null> => {
    const { data, error } = await supabase
        .from("user_dashboard_summary")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error) {
        // PGRST116 = no rows found, which is ok for new users
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
    }
    return data as unknown as UserDashboard;
};

/**
 * Fetch all achievements for a user (both locked and unlocked).
 */
export const fetchUserAchievements = async (
    userId: string,
): Promise<Achievement[]> => {
    const { data, error } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", userId)
        .order("is_unlocked", { ascending: false })
        .order("progress_current", { ascending: false });

    if (error) throw new Error(error.message);
    return (data as unknown as Achievement[]) ?? [];
};

/**
 * Fetch recent activity (route completions).
 */
export const fetchRecentActivity = async (
    userId: string,
    limit = 10,
): Promise<ActivityRecord[]> => {
    const { data, error } = await supabase
        .from("route_completions")
        .select(
            `
            id, route_id, status, completion_percentage,
            distance_actual_km, avg_speed_kmh, calories_burned,
            total_duration, started_at, completed_at,
            route:routes (name, difficulty)
        `,
        )
        .eq("user_id", userId)
        .order("started_at", { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);
    return (data as unknown as ActivityRecord[]) ?? [];
};
