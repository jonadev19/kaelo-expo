export type TransactionType =
  | "route_sale"
  | "route_purchase"
  | "withdrawal"
  | "refund"
  | "refund_reversal";

export type WithdrawalStatus =
  | "pendiente"
  | "procesando"
  | "completado"
  | "fallido"
  | "cancelado";

export interface WalletBalance {
  balance: number;
  totalEarnings: number;
  totalRoutesSold: number;
  isCreator: boolean;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  route_id: string | null;
  route_name: string | null;
  payment_intent_id: string | null;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: WithdrawalStatus;
  bank_clabe: string;
  bank_name: string;
  requested_at: string;
  processed_at: string | null;
  failure_reason: string | null;
}

export interface WalletSummary {
  currentBalance: number;
  monthSales: number;
  monthSalesCount: number;
  monthRefunds: number;
  monthWithdrawals: number;
  pendingWithdrawal: WithdrawalRequest | null;
}
