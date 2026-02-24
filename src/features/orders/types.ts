import type { ProductItem } from "@/features/businesses/types";

export interface CartItem {
    product: ProductItem;
    quantity: number;
}

export interface OrderFormData {
    business_id: string;
    items: {
        product_id: string;
        quantity: number;
        notes?: string;
    }[];
    notes?: string;
    pickup_time: string; // ISO timestamp
}

export type OrderStatus =
    | "pendiente"
    | "confirmado"
    | "preparando"
    | "listo"
    | "entregado"
    | "cancelado";

export interface Order {
    id: string;
    order_number: string;
    business_id: string;
    status: OrderStatus;
    subtotal: number;
    platform_fee: number;
    total: number;
    estimated_pickup_time: string;
    notes: string | null;
    created_at: string;
    business_name: string;
    business_logo_url: string | null;
}
