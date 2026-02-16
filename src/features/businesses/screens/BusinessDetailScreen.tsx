import ENV from "@/config/env";
import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBusinessDetail } from "../hooks/useBusinessDetail";
import type { ProductItem } from "../types";

Mapbox.setAccessToken(ENV.MAPBOX_ACCESS_TOKEN);

const TYPE_LABELS: Record<string, string> = {
    restaurante: "Restaurante",
    cafeteria: "Cafetería",
    tienda: "Tienda",
    taller_bicicletas: "Taller de Bicicletas",
    hospedaje: "Hospedaje",
    farmacia: "Farmacia",
    otro: "Comercio",
};

export default function BusinessDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data, isLoading, error } = useBusinessDetail(id ?? "");
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !data?.business) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                    No se pudo cargar el comercio
                </Text>
                <Pressable
                    style={[styles.backBtn, { backgroundColor: colors.primary }]}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backBtnText}>Volver</Text>
                </Pressable>
            </View>
        );
    }

    const { business, products } = data;
    const typeLabel = TYPE_LABELS[business.business_type] ?? business.business_type;

    // Group products by category
    const productsByCategory: Record<string, ProductItem[]> = {};
    products.forEach((p) => {
        const cat = p.category ?? "General";
        if (!productsByCategory[cat]) productsByCategory[cat] = [];
        productsByCategory[cat].push(p);
    });

    const openPhone = () => {
        if (business.phone) Linking.openURL(`tel:${business.phone}`);
    };

    const openWhatsApp = () => {
        if (business.whatsapp)
            Linking.openURL(`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={styles.hero}>
                    {business.cover_image_url ? (
                        <Image
                            source={{ uri: business.cover_image_url }}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            style={[styles.heroImage, { backgroundColor: colors.surfaceSecondary }]}
                        />
                    )}
                    <View style={styles.heroOverlay} />

                    <View style={[styles.navBar, { top: insets.top }]}>
                        <Pressable
                            style={[styles.navBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                        </Pressable>
                    </View>

                    <View style={styles.heroBottom}>
                        {business.logo_url && (
                            <View style={[styles.logo, { borderColor: colors.background }]}>
                                <Image
                                    source={{ uri: business.logo_url }}
                                    style={styles.logoImg}
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                        <View style={styles.heroText}>
                            <View style={styles.typeBadgeRow}>
                                <View
                                    style={[styles.typeBadge, { backgroundColor: colors.primary }]}
                                >
                                    <Text style={styles.typeBadgeText}>{typeLabel}</Text>
                                </View>
                            </View>
                            <Text style={styles.heroTitle}>{business.name}</Text>
                        </View>
                    </View>
                </View>

                {/* Rating bar */}
                <View
                    style={[
                        styles.ratingBar,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                >
                    <View style={styles.ratingItem}>
                        <Ionicons name="star" size={18} color={colors.rating} />
                        <Text style={[styles.ratingValue, { color: colors.text }]}>
                            {business.average_rating != null && business.total_reviews > 0
                                ? business.average_rating.toFixed(1)
                                : "—"}
                        </Text>
                        <Text style={[styles.ratingLabel, { color: colors.textTertiary }]}>
                            {business.total_reviews > 0
                                ? `${business.total_reviews} reseñas`
                                : "Sin reseñas"}
                        </Text>
                    </View>
                    {business.municipality && (
                        <>
                            <View
                                style={[styles.ratingDivider, { backgroundColor: colors.border }]}
                            />
                            <View style={styles.ratingItem}>
                                <Ionicons
                                    name="location-outline"
                                    size={18}
                                    color={colors.primary}
                                />
                                <Text style={[styles.ratingValue, { color: colors.text }]}>
                                    {business.municipality}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Description */}
                {business.description && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Acerca de
                        </Text>
                        <Text style={[styles.descText, { color: colors.textSecondary }]}>
                            {business.description}
                        </Text>
                    </View>
                )}

                {/* Contact Actions */}
                <View style={styles.actionsRow}>
                    {business.phone && (
                        <Pressable
                            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={openPhone}
                        >
                            <Ionicons name="call-outline" size={20} color={colors.primary} />
                            <Text style={[styles.actionText, { color: colors.text }]}>
                                Llamar
                            </Text>
                        </Pressable>
                    )}
                    {business.whatsapp && (
                        <Pressable
                            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={openWhatsApp}
                        >
                            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                            <Text style={[styles.actionText, { color: colors.text }]}>
                                WhatsApp
                            </Text>
                        </Pressable>
                    )}
                </View>

                {/* Info Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Información
                    </Text>
                    <View style={styles.infoList}>
                        <InfoRow
                            icon="location-outline"
                            text={business.address}
                            colors={colors}
                        />
                        {business.phone && (
                            <InfoRow icon="call-outline" text={business.phone} colors={colors} />
                        )}
                        {business.email && (
                            <InfoRow icon="mail-outline" text={business.email} colors={colors} />
                        )}
                        {business.website && (
                            <InfoRow icon="globe-outline" text={business.website} colors={colors} />
                        )}
                        {business.accepts_advance_orders && (
                            <InfoRow
                                icon="cart-outline"
                                text={`Pedidos anticipados${business.minimum_order_amount ? ` (mín. $${business.minimum_order_amount})` : ""}`}
                                colors={colors}
                            />
                        )}
                    </View>
                </View>

                {/* Mini Map */}
                {business.lat && business.lng && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Ubicación
                        </Text>
                        <View style={[styles.miniMap, { borderColor: colors.border }]}>
                            <Mapbox.MapView
                                style={styles.mapView}
                                styleURL={isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Street}
                                scrollEnabled={false}
                                pitchEnabled={false}
                                rotateEnabled={false}
                                logoEnabled={false}
                                attributionEnabled={false}
                                scaleBarEnabled={false}
                            >
                                <Mapbox.Camera
                                    defaultSettings={{
                                        centerCoordinate: [business.lng, business.lat],
                                        zoomLevel: 15,
                                    }}
                                />
                                <Mapbox.PointAnnotation
                                    id="business-pin"
                                    coordinate={[business.lng, business.lat]}
                                >
                                    <View style={[styles.mapPin, { backgroundColor: colors.primary }]}>
                                        <Ionicons name="storefront" size={14} color="#FFFFFF" />
                                    </View>
                                </Mapbox.PointAnnotation>
                            </Mapbox.MapView>
                        </View>
                    </View>
                )}

                {/* Products */}
                {products.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Productos ({products.length})
                        </Text>
                        {Object.entries(productsByCategory).map(([category, items]) => (
                            <View key={category} style={styles.productCategory}>
                                <Text
                                    style={[styles.categoryTitle, { color: colors.textSecondary }]}
                                >
                                    {category}
                                </Text>
                                {items.map((product) => (
                                    <View
                                        key={product.id}
                                        style={[
                                            styles.productCard,
                                            { backgroundColor: colors.surface, borderColor: colors.border },
                                        ]}
                                    >
                                        <View style={styles.productContent}>
                                            <View style={styles.productHeader}>
                                                <Text
                                                    style={[styles.productName, { color: colors.text }]}
                                                    numberOfLines={1}
                                                >
                                                    {product.name}
                                                </Text>
                                                {product.is_cyclist_special && (
                                                    <View
                                                        style={[
                                                            styles.specialBadge,
                                                            { backgroundColor: colors.primaryLight },
                                                        ]}
                                                    >
                                                        <Ionicons
                                                            name="bicycle"
                                                            size={10}
                                                            color={colors.primary}
                                                        />
                                                        <Text
                                                            style={[
                                                                styles.specialText,
                                                                { color: colors.primary },
                                                            ]}
                                                        >
                                                            Ciclista
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            {product.description && (
                                                <Text
                                                    style={[
                                                        styles.productDesc,
                                                        { color: colors.textSecondary },
                                                    ]}
                                                    numberOfLines={2}
                                                >
                                                    {product.description}
                                                </Text>
                                            )}
                                            <Text
                                                style={[styles.productPrice, { color: colors.primary }]}
                                            >
                                                ${product.price.toFixed(2)} MXN
                                            </Text>
                                        </View>
                                        {product.image_url && (
                                            <Image
                                                source={{ uri: product.image_url }}
                                                style={styles.productImage}
                                                resizeMode="cover"
                                            />
                                        )}
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: insets.bottom + 20 }} />
            </ScrollView>
        </View>
    );
}

function InfoRow({
    icon,
    text,
    colors,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
    colors: any;
}) {
    return (
        <View style={styles.infoRow}>
            <Ionicons name={icon} size={16} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    errorText: { fontSize: 15 },
    backBtn: {
        marginTop: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backBtnText: { color: "#FFFFFF", fontWeight: "600" },
    hero: { height: 240, position: "relative" },
    heroImage: { width: "100%", height: "100%" },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    navBar: {
        position: "absolute",
        left: 16,
        right: 16,
        flexDirection: "row",
        zIndex: 10,
    },
    navBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    heroBottom: {
        position: "absolute",
        bottom: 16,
        left: 20,
        right: 20,
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 12,
    },
    logo: {
        width: 56,
        height: 56,
        borderRadius: 14,
        borderWidth: 3,
        overflow: "hidden",
    },
    logoImg: { width: "100%", height: "100%" },
    heroText: { flex: 1, gap: 4 },
    typeBadgeRow: { flexDirection: "row" },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },
    typeBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
    heroTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
    ratingBar: {
        flexDirection: "row",
        marginHorizontal: 16,
        marginTop: -16,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    ratingItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    ratingValue: { fontSize: 14, fontWeight: "700" },
    ratingLabel: { fontSize: 11 },
    ratingDivider: { width: 1, height: "80%", alignSelf: "center" },
    section: { marginTop: 24, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
    descText: { fontSize: 14, lineHeight: 22 },
    actionsRow: {
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 20,
        marginTop: 16,
    },
    actionBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    actionText: { fontSize: 14, fontWeight: "600" },
    infoList: { gap: 10 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    infoText: { fontSize: 13, flex: 1 },
    miniMap: {
        height: 160,
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 1,
    },
    mapView: { flex: 1 },
    mapPin: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    productCategory: { marginBottom: 16 },
    categoryTitle: {
        fontSize: 13,
        fontWeight: "600",
        textTransform: "uppercase",
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    productCard: {
        flexDirection: "row",
        borderRadius: 12,
        borderWidth: 1,
        overflow: "hidden",
        marginBottom: 8,
    },
    productContent: { flex: 1, padding: 12, gap: 3 },
    productHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
    productName: { fontSize: 14, fontWeight: "600", flex: 1 },
    specialBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    specialText: { fontSize: 10, fontWeight: "600" },
    productDesc: { fontSize: 12, lineHeight: 16 },
    productPrice: { fontSize: 14, fontWeight: "700", marginTop: 4 },
    productImage: { width: 80, height: "100%" },
});
