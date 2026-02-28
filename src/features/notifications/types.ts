export type NotificationType =
  | "order_status"
  | "order_paid"
  | "route_purchased"
  | "route_sold"
  | "payment_failed"
  | "refund_completed"
  | "withdrawal_requested"
  | "withdrawal_completed"
  | "general";

export interface AppNotification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  data: Record<string, any> | null;
  related_order_id: string | null;
  related_route_id: string | null;
  related_business_id: string | null;
  created_at: string;
}

export interface PushTokenRegistration {
  user_id: string;
  expo_push_token: string;
  device_id: string;
  platform: "ios" | "android";
}
