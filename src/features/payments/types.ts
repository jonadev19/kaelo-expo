// Types for payment processing with Stripe

export type PaymentStatus =
  | "pendiente"
  | "completado"
  | "reembolsado"
  | "fallido";

export type PaymentMethod = "tarjeta" | "efectivo" | "wallet";

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface RoutePurchaseRequest {
  routeId: string;
  buyerId: string;
}

export interface OrderPaymentRequest {
  orderId: string;
  customerId: string;
  amount: number;
}

export interface RoutePurchase {
  id: string;
  route_id: string;
  buyer_id: string;
  amount_paid: number;
  creator_earnings: number;
  platform_fee: number;
  payment_status: PaymentStatus;
  stripe_payment_id: string | null;
  refund_requested_at: string | null;
  refund_reason: string | null;
  refunded_at: string | null;
  purchased_at: string;
}

export interface PurchaseCheckResult {
  purchased: boolean;
  purchase?: RoutePurchase;
}
