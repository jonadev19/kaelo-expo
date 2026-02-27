import { supabase } from "@/lib/supabase";
import type { BusinessReviewFormData, Review, ReviewFormData } from "./types";

/**
 * Fetch reviews for a route, joined with user profile info.
 */
export const fetchRouteReviews = async (
    routeId: string,
): Promise<Review[]> => {
    const { data, error } = await supabase
        .from("reviews")
        .select(
            `
            id, user_id, route_id, business_id, rating, comment,
            review_type, status, photos, created_at, updated_at,
            user:profiles!user_id (full_name, avatar_url)
        `,
        )
        .eq("route_id", routeId)
        .eq("status", "aprobado")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data as unknown as Review[]) ?? [];
};

/**
 * Submit a new review.
 */
export const submitReview = async (
    userId: string,
    formData: ReviewFormData,
): Promise<Review> => {
    const { data, error } = await supabase
        .from("reviews")
        .insert({
            user_id: userId,
            route_id: formData.route_id,
            review_type: "ruta",
            rating: formData.rating,
            comment: formData.comment || null,
        } as any)
        .select()
        .single();

    if (error) {
        if (error.code === "23505") {
            throw new Error("Ya dejaste una reseña en esta ruta");
        }
        throw new Error(error.message);
    }
    return data as unknown as Review;
};

/**
 * Fetch reviews for a business, joined with user profile info.
 */
export const fetchBusinessReviews = async (
    businessId: string,
): Promise<Review[]> => {
    const { data, error } = await supabase
        .from("reviews")
        .select(
            `
            id, user_id, route_id, business_id, rating, comment,
            review_type, status, photos, created_at, updated_at,
            user:profiles!user_id (full_name, avatar_url)
        `,
        )
        .eq("business_id", businessId)
        .eq("status", "aprobado")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data as unknown as Review[]) ?? [];
};

/**
 * Submit a new business review.
 */
export const submitBusinessReview = async (
    userId: string,
    formData: BusinessReviewFormData,
): Promise<Review> => {
    const { data, error } = await supabase
        .from("reviews")
        .insert({
            user_id: userId,
            business_id: formData.business_id,
            review_type: "comercio",
            rating: formData.rating,
            comment: formData.comment || null,
        } as any)
        .select()
        .single();

    if (error) {
        if (error.code === "23505") {
            throw new Error("Ya dejaste una reseña en este comercio");
        }
        throw new Error(error.message);
    }
    return data as unknown as Review;
};

/**
 * Delete own review.
 */
export const deleteReview = async (reviewId: string): Promise<void> => {
    const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

    if (error) throw new Error(error.message);
};
