import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCreateOrder } from "../hooks/useCreateOrder";
import { useCartStore } from "../store/useCartStore";

export default function CartScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const {
        items,
        businessId,
        businessName,
        updateQuantity,
        removeItem,
        clear,
        getTotal,
    } = useCartStore();

    const [notes, setNotes] = useState("");
    const [pickupHour, setPickupHour] = useState("");
    const [pickupMinute, setPickupMinute] = useState("");

    const { mutate: createOrder, isPending } = useCreateOrder();

    const subtotal = getTotal();
    const platformFee = Math.round(subtotal * 0.1 * 100) / 100;
    const total = subtotal + platformFee;

    const handleConfirm = () => {
        if (!businessId) return;

        // Validate pickup time
        const hour = parseInt(pickupHour, 10);
        const minute = parseInt(pickupMinute, 10);
        if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            Alert.alert("Hora inválida", "Ingresa una hora de recogida válida (HH:MM)");
            return;
        }

        const pickupTime = new Date();
        pickupTime.setHours(hour, minute, 0, 0);
        if (pickupTime <= new Date()) {
            pickupTime.setDate(pickupTime.getDate() + 1);
        }

        createOrder(
            {
                business_id: businessId,
                items: items.map((i) => ({
                    product_id: i.product.id,
                    quantity: i.quantity,
                })),
                notes: notes.trim() || undefined,
                pickup_time: pickupTime.toISOString(),
            },
            {
                onSuccess: () => {
                    clear();
                    Alert.alert(
                        "Pedido confirmado",
                        "Tu pedido ha sido enviado al comercio. Te notificaremos cuando esté listo.",
                        [{ text: "Ver mis pedidos", onPress: () => router.replace("/my-orders" as any) }],
                    );
                },
                onError: (error) => {
                    Alert.alert("Error", error.message);
                },
            },
        );
    };

    if (items.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
                    <Pressable onPress={() => router.back()} hitSlop={12}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </Pressable>
                    <Text style={[styles.navTitle, { color: colors.text }]}>Carrito</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={64} color={colors.textTertiary} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        Tu carrito está vacío
                    </Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Agrega productos desde un comercio
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Nav */}
            <View
                style={[
                    styles.navBar,
                    { paddingTop: insets.top + 8, borderBottomColor: colors.border },
                ]}
            >
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.navTitle, { color: colors.text }]}>Carrito</Text>
                <Pressable onPress={() => Alert.alert("Vaciar carrito", "¿Eliminar todos los productos?", [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Vaciar", style: "destructive", onPress: clear },
                ])} hitSlop={12}>
                    <Ionicons name="trash-outline" size={22} color={colors.error} />
                </Pressable>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: 200 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Business name */}
                <View style={styles.section}>
                    <View style={styles.businessRow}>
                        <Ionicons name="storefront" size={18} color={colors.primary} />
                        <Text style={[styles.businessName, { color: colors.text }]}>
                            {businessName}
                        </Text>
                    </View>
                </View>

                {/* Items */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Productos
                    </Text>
                    {items.map((item) => (
                        <View
                            key={item.product.id}
                            style={[
                                styles.itemCard,
                                { backgroundColor: colors.surface, borderColor: colors.border },
                            ]}
                        >
                            {item.product.image_url && (
                                <Image
                                    source={{ uri: item.product.image_url }}
                                    style={styles.itemImage}
                                    resizeMode="cover"
                                />
                            )}
                            <View style={styles.itemInfo}>
                                <Text
                                    style={[styles.itemName, { color: colors.text }]}
                                    numberOfLines={1}
                                >
                                    {item.product.name}
                                </Text>
                                <Text style={[styles.itemPrice, { color: colors.primary }]}>
                                    ${(item.product.price * item.quantity).toFixed(2)}
                                </Text>
                            </View>
                            <View style={styles.qtyControls}>
                                <Pressable
                                    style={[styles.qtyBtn, { backgroundColor: colors.surfaceSecondary }]}
                                    onPress={() =>
                                        item.quantity === 1
                                            ? removeItem(item.product.id)
                                            : updateQuantity(item.product.id, item.quantity - 1)
                                    }
                                >
                                    <Ionicons
                                        name={item.quantity === 1 ? "trash-outline" : "remove"}
                                        size={16}
                                        color={item.quantity === 1 ? colors.error : colors.text}
                                    />
                                </Pressable>
                                <Text style={[styles.qtyText, { color: colors.text }]}>
                                    {item.quantity}
                                </Text>
                                <Pressable
                                    style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                                    onPress={() =>
                                        updateQuantity(item.product.id, item.quantity + 1)
                                    }
                                >
                                    <Ionicons name="add" size={16} color="#FFFFFF" />
                                </Pressable>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Notas (opcional)
                    </Text>
                    <TextInput
                        style={[
                            styles.notesInput,
                            {
                                backgroundColor: colors.inputBackground,
                                color: colors.text,
                                borderColor: colors.inputBorder,
                            },
                        ]}
                        placeholder="Instrucciones especiales..."
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        numberOfLines={3}
                        maxLength={300}
                        value={notes}
                        onChangeText={setNotes}
                        textAlignVertical="top"
                    />
                </View>

                {/* Pickup time */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Hora de recogida
                    </Text>
                    <View style={styles.timeRow}>
                        <TextInput
                            style={[
                                styles.timeInput,
                                {
                                    backgroundColor: colors.inputBackground,
                                    color: colors.text,
                                    borderColor: colors.inputBorder,
                                },
                            ]}
                            placeholder="HH"
                            placeholderTextColor={colors.textTertiary}
                            keyboardType="number-pad"
                            maxLength={2}
                            value={pickupHour}
                            onChangeText={setPickupHour}
                        />
                        <Text style={[styles.timeSeparator, { color: colors.text }]}>:</Text>
                        <TextInput
                            style={[
                                styles.timeInput,
                                {
                                    backgroundColor: colors.inputBackground,
                                    color: colors.text,
                                    borderColor: colors.inputBorder,
                                },
                            ]}
                            placeholder="MM"
                            placeholderTextColor={colors.textTertiary}
                            keyboardType="number-pad"
                            maxLength={2}
                            value={pickupMinute}
                            onChangeText={setPickupMinute}
                        />
                    </View>
                </View>

                {/* Summary */}
                <View style={[styles.section, styles.summarySection]}>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                            Subtotal
                        </Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>
                            ${subtotal.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                            Comisión de servicio (10%)
                        </Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>
                            ${platformFee.toFixed(2)}
                        </Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryRow}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                        <Text style={[styles.totalValue, { color: colors.primary }]}>
                            ${total.toFixed(2)} MXN
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View
                style={[
                    styles.bottomBar,
                    {
                        backgroundColor: colors.background,
                        borderTopColor: colors.border,
                        paddingBottom: insets.bottom + 12,
                    },
                ]}
            >
                <Pressable
                    style={[
                        styles.confirmBtn,
                        { backgroundColor: colors.primary },
                        isPending && { opacity: 0.6 },
                    ]}
                    onPress={handleConfirm}
                    disabled={isPending}
                >
                    {isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.confirmText}>
                                Confirmar Pedido — ${total.toFixed(2)}
                            </Text>
                        </>
                    )}
                </Pressable>
            </View>
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
    scrollView: { flex: 1 },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    emptyTitle: { fontSize: 18, fontWeight: "700" },
    emptyText: { fontSize: 14 },
    section: { paddingHorizontal: 20, marginTop: 20 },
    sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
    businessRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    businessName: { fontSize: 16, fontWeight: "600" },
    itemCard: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        overflow: "hidden",
        marginBottom: 8,
    },
    itemImage: { width: 60, height: 60 },
    itemInfo: { flex: 1, padding: 10, gap: 2 },
    itemName: { fontSize: 14, fontWeight: "600" },
    itemPrice: { fontSize: 14, fontWeight: "700" },
    qtyControls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingRight: 12,
    },
    qtyBtn: {
        width: 30,
        height: 30,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    qtyText: { fontSize: 15, fontWeight: "700", minWidth: 20, textAlign: "center" },
    notesInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        minHeight: 70,
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    timeInput: {
        borderWidth: 1,
        borderRadius: 12,
        width: 60,
        height: 48,
        textAlign: "center",
        fontSize: 18,
        fontWeight: "700",
    },
    timeSeparator: { fontSize: 24, fontWeight: "700" },
    summarySection: {
        gap: 8,
        marginTop: 24,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    summaryLabel: { fontSize: 14 },
    summaryValue: { fontSize: 14, fontWeight: "600" },
    divider: { height: 1, marginVertical: 4 },
    totalLabel: { fontSize: 16, fontWeight: "700" },
    totalValue: { fontSize: 18, fontWeight: "800" },
    bottomBar: {
        borderTopWidth: 1,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    confirmBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 16,
        borderRadius: 14,
    },
    confirmText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
