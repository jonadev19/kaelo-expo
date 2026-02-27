import { supabase } from "@/lib/supabase";
import type {
    BusinessDetailResponse,
    BusinessListItem,
    BusinessType,
} from "./types";

/**
 * Fetch active businesses with optional type filter.
 * Uses the `get_active_businesses` Supabase RPC.
 */
export const fetchBusinesses = async (
    type?: BusinessType | null,
): Promise<BusinessListItem[]> => {
    // @ts-expect-error — RPC function defined in migration, not yet in generated types
    const { data, error } = await supabase.rpc("get_active_businesses", {
        p_type: type ?? null,
    });

    if (error) throw new Error(error.message);
    return (data as BusinessListItem[]) ?? [];
};

/**
 * Search businesses by name/description with optional type filter.
 */
export const searchBusinesses = async (
    query: string,
    type?: BusinessType | null,
): Promise<BusinessListItem[]> => {
    // @ts-expect-error — RPC function defined in migration, not yet in generated types
    const { data, error } = await supabase.rpc("search_businesses", {
        p_query: query,
        p_type: type ?? null,
    });

    if (error) throw new Error(error.message);
    return (data as BusinessListItem[]) ?? [];
};

/**
 * Fetch a single business's full detail with products.
 * Uses the `get_business_detail` Supabase RPC.
 */
export const fetchBusinessDetail = async (
    businessId: string,
): Promise<BusinessDetailResponse> => {
    // @ts-expect-error — RPC function defined in migration, not yet in generated types
    const { data, error } = await supabase.rpc("get_business_detail", {
        p_business_id: businessId,
    });

    if (error) throw new Error(error.message);

    const result = data as BusinessDetailResponse;
    return {
        business: result?.business ?? null,
        products: result?.products ?? [],
    };
};
