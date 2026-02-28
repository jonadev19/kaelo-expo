import { useAuthStore } from "@/shared/store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import {
  fetchWalletBalance,
  fetchWalletSummary,
  fetchWalletTransactions,
  requestWithdrawal,
} from "../api";
import { walletKeys } from "../keys";

/**
 * Hook to fetch the current user's wallet balance.
 */
export const useWalletBalance = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: walletKeys.balance(user?.id ?? ""),
    queryFn: () => fetchWalletBalance(user!.id),
    enabled: !!user,
  });
};

/**
 * Hook to fetch wallet transaction history.
 */
export const useWalletTransactions = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: walletKeys.transactions(user?.id ?? ""),
    queryFn: () => fetchWalletTransactions(user!.id),
    enabled: !!user,
  });
};

/**
 * Hook to fetch wallet monthly summary.
 */
export const useWalletSummary = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: walletKeys.summary(user?.id ?? ""),
    queryFn: () => fetchWalletSummary(user!.id),
    enabled: !!user,
  });
};

/**
 * Hook to request a withdrawal.
 */
export const useWithdrawal = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      amount,
      bankClabe,
      bankName,
    }: {
      amount: number;
      bankClabe: string;
      bankName: string;
    }) => {
      if (!user) throw new Error("Debes iniciar sesión");
      await requestWithdrawal(user.id, amount, bankClabe, bankName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: walletKeys.all,
      });
      Alert.alert(
        "Solicitud enviada",
        "Tu retiro será procesado en 3-5 días hábiles. Recibirás una notificación cuando esté listo.",
      );
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error.message || "No se pudo procesar la solicitud de retiro.",
      );
    },
  });

  return {
    requestWithdrawal: mutation.mutate,
    isRequesting: mutation.isPending,
    error: mutation.error,
  };
};
