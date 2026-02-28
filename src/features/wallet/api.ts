import { supabase } from "@/lib/supabase";
import type { WalletBalance, WalletSummary, WalletTransaction } from "./types";

/**
 * Fetch the current user's wallet balance and creator stats.
 */
export const fetchWalletBalance = async (
  userId: string,
): Promise<WalletBalance> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("wallet_balance, total_earnings, total_routes_sold, is_creator")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);

  return {
    balance: Number(data?.wallet_balance) || 0,
    totalEarnings: Number(data?.total_earnings) || 0,
    totalRoutesSold: Number(data?.total_routes_sold) || 0,
    isCreator: data?.is_creator ?? false,
  };
};

/**
 * Fetch wallet transaction history from route_purchases.
 * Since wallet_transactions table doesn't exist yet, we derive
 * transactions from route_purchases where the user is buyer or creator.
 */
export const fetchWalletTransactions = async (
  userId: string,
  limit = 50,
): Promise<WalletTransaction[]> => {
  // Fetch sales (as creator)
  const { data: salesData, error: salesError } = await supabase
    .from("route_purchases")
    .select(
      "id, route_id, buyer_id, creator_earnings, platform_fee, amount_paid, payment_status, stripe_payment_id, purchased_at, routes(name, creator_id)",
    )
    .eq("payment_status", "completado")
    .order("purchased_at", { ascending: false })
    .limit(limit);

  if (salesError) throw new Error(salesError.message);

  const transactions: WalletTransaction[] = [];
  const rows = (salesData as any[]) ?? [];

  for (const row of rows) {
    const isCreator = row.routes?.creator_id === userId;
    const isBuyer = row.buyer_id === userId;

    if (isCreator) {
      transactions.push({
        id: `sale-${row.id}`,
        user_id: userId,
        type: "route_sale",
        amount: Number(row.creator_earnings),
        description: `Venta: ${row.routes?.name ?? "Ruta"}`,
        route_id: row.route_id,
        route_name: row.routes?.name ?? null,
        payment_intent_id: row.stripe_payment_id,
        created_at: row.purchased_at,
      });
    }

    if (isBuyer) {
      transactions.push({
        id: `purchase-${row.id}`,
        user_id: userId,
        type: "route_purchase",
        amount: -Number(row.amount_paid),
        description: `Compra: ${row.routes?.name ?? "Ruta"}`,
        route_id: row.route_id,
        route_name: row.routes?.name ?? null,
        payment_intent_id: row.stripe_payment_id,
        created_at: row.purchased_at,
      });
    }
  }

  // Sort by date descending
  transactions.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return transactions.slice(0, limit);
};

/**
 * Fetch wallet monthly summary.
 */
export const fetchWalletSummary = async (
  userId: string,
): Promise<WalletSummary> => {
  // Current balance
  const balance = await fetchWalletBalance(userId);

  // This month's date range
  const now = new Date();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  ).toISOString();

  // Month sales (as creator) — get routes created by user
  const { data: userRoutes } = await supabase
    .from("routes")
    .select("id")
    .eq("creator_id", userId);

  const routeIds = (userRoutes ?? []).map((r: any) => r.id);

  let monthSales = 0;
  let monthSalesCount = 0;
  let monthRefunds = 0;

  if (routeIds.length > 0) {
    const { data: monthPurchases } = await supabase
      .from("route_purchases")
      .select("creator_earnings, payment_status")
      .in("route_id", routeIds)
      .gte("purchased_at", monthStart)
      .lte("purchased_at", monthEnd);

    for (const p of (monthPurchases ?? []) as any[]) {
      if (p.payment_status === "completado") {
        monthSales += Number(p.creator_earnings);
        monthSalesCount++;
      } else if (p.payment_status === "reembolsado") {
        monthRefunds += Number(p.creator_earnings);
      }
    }
  }

  return {
    currentBalance: balance.balance,
    monthSales,
    monthSalesCount,
    monthRefunds,
    monthWithdrawals: 0, // TODO: when withdrawals table exists
    pendingWithdrawal: null, // TODO: when withdrawals table exists
  };
};

/**
 * Request a withdrawal from the wallet.
 * For now, this creates a notification to admin since
 * the withdrawals table doesn't exist yet.
 */
export const requestWithdrawal = async (
  userId: string,
  amount: number,
  bankClabe: string,
  bankName: string,
): Promise<void> => {
  // Verify balance
  const balance = await fetchWalletBalance(userId);
  if (balance.balance < amount) {
    throw new Error("Balance insuficiente");
  }
  if (amount < 500) {
    throw new Error("El monto mínimo de retiro es $500 MXN");
  }

  // Deduct from wallet immediately (optimistic)
  const newBalance = balance.balance - amount;
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ wallet_balance: newBalance })
    .eq("id", userId);

  if (updateError) throw new Error(updateError.message);

  // Create a notification record as a withdrawal request
  // In production, this would go to a withdrawals table + Stripe Connect
  await supabase.from("notifications").insert({
    user_id: userId,
    notification_type: "withdrawal_requested",
    title: "Solicitud de retiro",
    body: `Has solicitado un retiro de $${amount.toFixed(2)} MXN a la cuenta ${bankClabe.slice(-4)}. Procesamiento: 3-5 días hábiles.`,
    data: {
      amount,
      bank_clabe: bankClabe,
      bank_name: bankName,
      status: "pendiente",
    },
  });
};
