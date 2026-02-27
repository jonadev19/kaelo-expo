export interface Review {
    id: string;
    user_id: string;
    route_id: string | null;
    business_id: string | null;
    rating: number;
    comment: string | null;
    review_type: string;
    status: string;
    photos: string[];
    created_at: string;
    updated_at: string;
    // Joined profile data
    user?: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

export interface ReviewFormData {
    route_id: string;
    rating: number;
    comment?: string;
}

export interface BusinessReviewFormData {
    business_id: string;
    rating: number;
    comment?: string;
}
