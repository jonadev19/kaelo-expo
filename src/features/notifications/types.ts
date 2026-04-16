/** Must match the CHECK constraint on notifications.notification_type */
export type NotificationType =
  | "orden_recibida"
  | "orden_lista"
  | "ruta_comprada"
  | "ruta_vendida"
  | "nueva_resena"
  | "pago_recibido"
  | "comercio_aprobado"
  | "ruta_aprobada"
  | "sistema";

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

