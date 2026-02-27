// Types for business data returned by Supabase RPCs

export type BusinessType =
    | "restaurante"
    | "cafeteria"
    | "tienda"
    | "taller_bicicletas"
    | "hospedaje"
    | "farmacia"
    | "otro";

/** Business item returned by get_active_businesses RPC */
export interface BusinessListItem {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    business_type: BusinessType;
    cover_image_url: string | null;
    logo_url: string | null;
    average_rating: number | null;
    total_reviews: number;
    address: string;
    municipality: string | null;
    phone: string | null;
    whatsapp: string | null;
    business_hours: Record<string, unknown> | null;
    accepts_advance_orders: boolean;
    minimum_order_amount: number | null;
    lng: number;
    lat: number;
}

/** Product within a business detail */
export interface ProductItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: string | null;
    image_url: string | null;
    is_available: boolean;
    stock_quantity: number | null;
    is_cyclist_special: boolean;
}

/** Extended business detail from get_business_detail RPC */
export interface BusinessDetail extends BusinessListItem {
    photos: string[] | null;
    email: string | null;
    website: string | null;
}

/** Full response from get_business_detail RPC */
export interface BusinessDetailResponse {
    business: BusinessDetail | null;
    products: ProductItem[];
}

/** Filters for business listing */
export interface BusinessFilters {
    type?: BusinessType | null;
}
