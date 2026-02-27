import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCancelOrder } from "../hooks/useCancelOrder";
import { useMyOrders } from "../hooks/useMyOrders";
import type { Order, OrderStatus } from "../types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
    pendiente: { label: "Pendiente", bg: "#FFF3E0", text: "#E65100" },
    confirmado: { label: "Confirmado", bg: "#E3F2FD", text: "#1565C0" },
    preparando: { label: "Preparando", bg: "#E3F2FD", text: "#1565C0" },
    listo: { label: "Listo", bg: "#E8F5E9", text: "#2E7D32" },
    entregado: { label: "Entregado", bg: "#E8F5E9", text: "#2E7D32" },
    cancelado: { label: "Cancelado", bg: "#FFEBEE", text: "#C62828" },
};

export default function MyOrdersScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data: orders, isLoading, refetch } = useMyOrders();
    const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

    const handleCancel = (orderId: string) => {
        Alert.alert(
            "Cancelar pedido",
            "¿Estás seguro de que deseas cancelar este pedido?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Sí, cancelar",
                    style: "destructive",
                    onPress: () =>
                        cancelOrder(orderId, {
                            onError: (err) => Alert.alert("Error", err.message),
                        }),
                },
            ],
        );
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderItem = ({ item }: { item: Order }) => {
        const config = STATUS_CONFIG[item.status];
        const canCancel = item.status === "pendiente" || item.status === "confirmado";

        return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.businessInfo}>
                        {item.business_logo_url ? (
                            <Image source={{ uri: item.business_logo_url }} style={styles.logo} />
                        ) : (
                            <View style={[styles.logoPlaceholder, { backgroundColor: colors.primaryLight }]}>
                                <Ionicons name="storefront" size={18} color={colors.primary} />
                            </View>
                        )}
                        <View style={styles.headerText}>
                            <Text style={[styles.businessName, { color: colors.text }]} numberOfLines={1}>
                                {item.business_name}
                            </Text>
                            <Text style={[styles.orderNumber, { color: colors.textTertiary }]}>
                                #{item.order_number}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.badge, { backgroundColor: config.bg }]}>
                        <Text style={[styles.badgeText, { color: config.text }]}>
                            {config.label}
                        </Text>
                    </View>
                </View>

                <View style={[styles.cardBody, { borderTopColor: colors.borderLight }]}>
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Total</Text>
                        <Text style={[styles.total, { color: colors.primary }]}>
                            ${item.total.toFixed(2)} MXN
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Fecha</Text>
                        <Text style={[styles.date, { color: colors.textSecondary }]}>
                            {formatDate(item.created_at)}
                        </Text>
                    </View>
                </View>

                {canCancel && (
                    <Pressable
                        style={[styles.cancelBtn, { backgroundColor: colors.errorBackground }]}
                        onPress={() => handleCancel(item.id)}
                        disabled={isCancelling}
                    >
                        {isCancelling ? (
                            <ActivityIndicator size="small" color={colors.error} />
                        ) : (
                            <>
                                <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                                <Text style={[styles.cancelText, { color: colors.error }]}>
                                    Cancelar Pedido
                                </Text>
                            </>
                        )}
                    </Pressable>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.navBar, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.navTitle, { color: colors.text }]}>Mis Pedidos</Text>
                <View style={{ width: 24 }} />
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : !orders || orders.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="receipt-outline" size={64} color={colors.textTertiary} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        Sin pedidos
                    </Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Tus pedidos aparecerán aquí
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    onRefresh={refetch}
                    refreshing={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    navBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    navTitle: { fontSize: 18, fontWeight: "700" },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    emptyTitle: { fontSize: 18, fontWeight: "700" },
    emptyText: { fontSize: 14 },
    list: { padding: 16, gap: 12 },
    card: {
        borderRadius: 14,
        borderWidth: 1,
        overflow: "hidden",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 14,
    },
    businessInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    logo: {
        width: 36,
        height: 36,
        borderRadius: 8,
    },
    logoPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: { flex: 1 },
    businessName: { fontSize: 15, fontWeight: "600" },
    orderNumber: { fontSize: 12, marginTop: 2 },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: { fontSize: 12, fontWeight: "700" },
    cardBody: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderTopWidth: 1,
        gap: 6,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    label: { fontSize: 13 },
    total: { fontSize: 15, fontWeight: "700" },
    date: { fontSize: 13 },
    cancelBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 12,
        marginHorizontal: 14,
        marginBottom: 14,
        borderRadius: 10,
    },
    cancelText: { fontSize: 14, fontWeight: "600" },
});
