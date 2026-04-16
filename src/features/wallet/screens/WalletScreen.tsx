import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TransactionItem } from "../components/TransactionItem";
import { WithdrawalModal } from "../components/WithdrawalModal";
import {
  useWalletBalance,
  useWalletSummary,
  useWalletTransactions,
} from "../hooks/useWallet";

export default function WalletScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showWithdrawal, setShowWithdrawal] = useState(false);

  const { data: balance, isLoading: balanceLoading } = useWalletBalance();
  const { data: summary, isLoading: summaryLoading } = useWalletSummary();
  const { data: transactions = [], isLoading: txLoading } =
    useWalletTransactions();

  const isLoading = balanceLoading || summaryLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={[styles.backBtn, { backgroundColor: colors.surfaceSecondary }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Mi Wallet
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Balance Card */}
            <View
              style={[styles.balanceCard, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.balanceLabel}>Balance Disponible</Text>
              <Text style={styles.balanceAmount}>
                ${(balance?.balance ?? 0).toFixed(2)} MXN
              </Text>
              <Pressable
                style={styles.withdrawButton}
                onPress={() => setShowWithdrawal(true)}
                disabled={(balance?.balance ?? 0) < 500}
              >
                <Ionicons
                  name="arrow-up-circle-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.withdrawButtonText}>Solicitar Retiro</Text>
              </Pressable>
              {(balance?.balance ?? 0) < 500 && (
                <Text style={styles.minWithdrawalNote}>
                  Mínimo $500 MXN para retirar
                </Text>
              )}
            </View>

            {/* Pending Withdrawal Banner */}
            {summary?.pendingWithdrawal && (
              <View
                style={[
                  styles.pendingWithdrawalCard,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.freeBadge + "40",
                  },
                ]}
              >
                <View style={styles.pendingHeader}>
                  <Ionicons name="time-outline" size={20} color={colors.freeBadge} />
                  <Text style={[styles.pendingTitle, { color: colors.text }]}>
                    Retiro en proceso
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: colors.freeBadge + "20" }]}>
                    <Text style={[styles.statusText, { color: colors.freeBadge }]}>
                      {summary.pendingWithdrawal.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.pendingContent}>
                  <Text style={[styles.pendingAmount, { color: colors.text }]}>
                    ${summary.pendingWithdrawal.amount.toFixed(2)} MXN
                  </Text>
                  <Text style={[styles.pendingDate, { color: colors.textTertiary }]}>
                    Solicitado el {new Date(summary.pendingWithdrawal.requested_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.pendingNote, { color: colors.textSecondary }]}>
                  Se depositará en tu cuenta {summary.pendingWithdrawal.bank_name} (***{summary.pendingWithdrawal.bank_clabe.slice(-4)})
                </Text>
              </View>
            )}

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="trending-up"
                  size={20}
                  color={colors.freeBadge}
                />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  ${(balance?.totalEarnings ?? 0).toFixed(2)}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textTertiary }]}
                >
                  Total ganado
                </Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="map" size={20} color={colors.premiumBadge} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {balance?.totalRoutesSold ?? 0}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textTertiary }]}
                >
                  Rutas vendidas
                </Text>
              </View>
            </View>

            {/* Monthly Summary */}
            {summary && (
              <View
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Resumen del Mes
                </Text>
                <View style={styles.summaryRow}>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Ventas
                  </Text>
                  <Text
                    style={[styles.summaryValue, { color: colors.freeBadge }]}
                  >
                    +${summary.monthSales.toFixed(2)} ({summary.monthSalesCount}{" "}
                    rutas)
                  </Text>
                </View>
                {summary.monthRefunds > 0 && (
                  <View style={styles.summaryRow}>
                    <Text
                      style={[
                        styles.summaryLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Reembolsos
                    </Text>
                    <Text
                      style={[styles.summaryValue, { color: colors.error }]}
                    >
                      -${summary.monthRefunds.toFixed(2)}
                    </Text>
                  </View>
                )}
                {summary.monthWithdrawals > 0 && (
                  <View style={styles.summaryRow}>
                    <Text
                      style={[
                        styles.summaryLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Retiros
                    </Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      -${summary.monthWithdrawals.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Transaction History */}
            <View style={styles.transactionsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Historial
              </Text>
              {txLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ marginTop: 20 }}
                />
              ) : transactions.length === 0 ? (
                <View
                  style={[
                    styles.emptyState,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <Ionicons
                    name="receipt-outline"
                    size={40}
                    color={colors.textTertiary}
                  />
                  <Text
                    style={[styles.emptyText, { color: colors.textTertiary }]}
                  >
                    Aún no tienes transacciones
                  </Text>
                </View>
              ) : (
                transactions.map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        visible={showWithdrawal}
        onClose={() => setShowWithdrawal(false)}
        currentBalance={balance?.balance ?? 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    paddingTop: 60,
    alignItems: "center",
  },
  balanceCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    gap: 8,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  balanceAmount: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
  },
  withdrawButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginTop: 8,
  },
  withdrawButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  minWithdrawalNote: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  pendingWithdrawalCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    gap: 10,
  },
  pendingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pendingTitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  pendingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendingAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  pendingDate: {
    fontSize: 12,
  },
  pendingNote: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: "italic",
  },
  transactionsSection: {
    marginTop: 24,
    gap: 10,
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    padding: 32,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
  },
});
