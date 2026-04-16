import { supabase } from "@/lib/supabase";
import type { WalletBalance, WalletSummary, WalletTransaction, WithdrawalRequest } from "./types";

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
 * Fetch wallet transaction history.
 * Combines route sales from route_purchases and withdrawals from withdrawals table.
 */
export const fetchWalletTransactions = async (
  userId: string,
  limit = 50,
): Promise<WalletTransaction[]> => {
  // 1. Fetch sales (as creator)
  const { data: salesData, error: salesError } = await supabase
    .from("route_purchases")
    .select(
      "id, route_id, buyer_id, creator_earnings, amount_paid, payment_status, stripe_payment_id, purchased_at, routes(name, creator_id)",
    )
    .eq("payment_status", "completado")
    .order("purchased_at", { ascending: false })
    .limit(limit);

  if (salesError) throw new Error(salesError.message);

  // 2. Fetch withdrawals
  const { data: withdrawalData, error: withdrawalError } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  // If withdrawals table doesn't exist yet, we just handle the error gracefully
  const withdrawalRows = withdrawalError ? [] : (withdrawalData ?? []);

  const transactions: WalletTransaction[] = [];
  
  // Process Sales
  for (const row of (salesData as any[]) ?? []) {
    const isCreator = row.routes?.creator_id === userId;
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
  }

  // Process Withdrawals
  for (const row of withdrawalRows) {
    transactions.push({
      id: `wd-${row.id}`,
      user_id: userId,
      type: "withdrawal",
      amount: -Number(row.amount),
      description: `Retiro bancario (${row.status})`,
      route_id: null,
      route_name: null,
      payment_intent_id: row.stripe_transfer_id,
      created_at: row.created_at,
    });
  }

  // Sort by date descending and limit
  return transactions
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
};

/**
 * Fetch wallet monthly summary.
 */
export const fetchWalletSummary = async (
  userId: string,
): Promise<WalletSummary> => {
  const balance = await fetchWalletBalance(userId);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  // Get route IDs created by user
  const { data: userRoutes } = await supabase.from("routes").select("id").eq("creator_id", userId);
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

  // Get current month withdrawals
  const { data: monthWd } = await supabase
    .from("withdrawals")
    .select("amount")
    .eq("user_id", userId)
    .in("status", ["pending", "processing", "completed"])
    .gte("created_at", monthStart)
    .lte("created_at", monthEnd);
  
  const monthWithdrawalsTotal = (monthWd ?? []).reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Get latest pending withdrawal
  const { data: pendingWd } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    currentBalance: balance.balance,
    monthSales,
    monthSalesCount,
    monthRefunds,
    monthWithdrawals: monthWithdrawalsTotal,
    pendingWithdrawal: pendingWd ? {
      id: pendingWd.id,
      user_id: pendingWd.user_id,
      amount: Number(pendingWd.amount),
      status: "pendiente",
      bank_clabe: pendingWd.bank_clabe,
      bank_name: pendingWd.bank_name,
      requested_at: pendingWd.created_at,
      processed_at: null,
      failure_reason: pendingWd.error_message,
    } : null,
  };
};

/**
 * Request a withdrawal from the wallet.
 * This is now a production-ready flow that uses an atomic RPC in PostgreSQL.
 */
export const requestWithdrawal = async (
  userId: string,
  amount: number,
  bankClabe: string,
  bankName: string,
): Promise<string> => {
  // 1. Minimum amount validation
  if (amount < 500) throw new Error("El monto mínimo de retiro es $500 MXN");

  // 2. Call the atomic RPC to process everything in a single SQL transaction
  const { data: withdrawalId, error: rpcError } = await supabase.rpc(
    "process_withdrawal_request",
    {
      p_user_id: userId,
      p_amount: amount,
      p_bank_name: bankName,
      p_bank_clabe: bankClabe,
    }
  );

  if (rpcError) {
    if (rpcError.message.includes("Saldo insuficiente")) {
      throw new Error("No tienes saldo suficiente para este retiro.");
    }
    throw new Error("Error al procesar retiro: " + rpcError.message);
  }

  // 3. Create notification for record
  await supabase.from("notifications").insert({
    user_id: userId,
    notification_type: "withdrawal_requested",
    title: "Retiro solicitado",
    body: `Tu solicitud de retiro por $${amount} MXN ha sido registrada exitosamente.`,
    data: { withdrawal_id: withdrawalId }
  });

  return withdrawalId;
};

/**
 * Fetch full withdrawal history for a user.
 */
export const fetchWithdrawalHistory = async (
  userId: string,
): Promise<WithdrawalRequest[]> => {
  const { data, error } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map(row => ({
    id: row.id,
    user_id: row.user_id,
    amount: Number(row.amount),
    status: row.status === "pending" ? "pendiente" : row.status as any,
    bank_clabe: row.bank_clabe,
    bank_name: row.bank_name,
    requested_at: row.created_at,
    processed_at: row.updated_at,
    failure_reason: row.error_message,
  }));
};

