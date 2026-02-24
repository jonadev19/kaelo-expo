import { supabase } from "@/lib/supabase";
import type { Order, OrderFormData } from "./types";

export const createOrder = async (
    customerId: string,
    formData: OrderFormData,
): Promise<string> => {
    // @ts-expect-error — RPC function defined in migration, not yet in generated types
    const { data, error } = await supabase.rpc("create_order", {
        p_customer_id: customerId,
        p_business_id: formData.business_id,
        p_items: formData.items,
        p_notes: formData.notes ?? null,
        p_pickup_time: formData.pickup_time,
    });

    if (error) throw new Error(error.message);
    return data as string;
};

export const fetchMyOrders = async (customerId: string): Promise<Order[]> => {
    const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, business_id, status, subtotal, platform_fee, total, estimated_pickup_time, notes, created_at, businesses(name, logo_url)")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (data as any[]).map((row) => ({
        id: row.id,
        order_number: row.order_number,
        business_id: row.business_id,
        status: row.status,
        subtotal: Number(row.subtotal),
        platform_fee: Number(row.platform_fee),
        total: Number(row.total),
        estimated_pickup_time: row.estimated_pickup_time,
        notes: row.notes,
        created_at: row.created_at,
        business_name: row.businesses?.name ?? "Comercio",
        business_logo_url: row.businesses?.logo_url ?? null,
    }));
};

export const cancelOrder = async (orderId: string, customerId: string): Promise<void> => {
    // @ts-expect-error — RPC function defined in migration, not yet in generated types
    const { error } = await supabase.rpc("cancel_order", {
        p_order_id: orderId,
        p_customer_id: customerId,
    });

    if (error) throw new Error(error.message);
};
