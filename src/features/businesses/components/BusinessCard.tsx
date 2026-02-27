import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { BusinessListItem } from "../types";

const TYPE_LABELS: Record<string, string> = {
    restaurante: "Restaurante",
    cafeteria: "Cafetería",
    tienda: "Tienda",
    taller_bicicletas: "Taller",
    hospedaje: "Hospedaje",
    farmacia: "Farmacia",
    otro: "Otro",
};

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    restaurante: "restaurant",
    cafeteria: "cafe",
    tienda: "storefront",
    taller_bicicletas: "construct",
    hospedaje: "bed",
    farmacia: "medkit",
    otro: "business",
};

interface Props {
    business: BusinessListItem;
    onPress: (business: BusinessListItem) => void;
}

export const BusinessCard = ({ business, onPress }: Props) => {
    const { colors } = useTheme();
    const typeLabel = TYPE_LABELS[business.business_type] ?? business.business_type;
    const typeIcon: keyof typeof Ionicons.glyphMap =
        TYPE_ICONS[business.business_type] ?? "business";

    return (
        <Pressable
            style={[
                styles.card,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    shadowColor: colors.shadow,
                },
            ]}
            onPress={() => onPress(business)}
        >
            {/* Image */}
            <View style={styles.imageContainer}>
                {business.cover_image_url ? (
                    <Image
                        source={{ uri: business.cover_image_url }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View
                        style={[
                            styles.imagePlaceholder,
                            { backgroundColor: colors.surfaceSecondary },
                        ]}
                    >
                        <Ionicons name={typeIcon} size={28} color={colors.textTertiary} />
                    </View>
                )}
                {/* Logo overlay */}
                {business.logo_url && (
                    <View style={[styles.logoContainer, { borderColor: colors.card }]}>
                        <Image
                            source={{ uri: business.logo_url }}
                            style={styles.logo}
                            resizeMode="cover"
                        />
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text
                    style={[styles.name, { color: colors.text }]}
                    numberOfLines={1}
                >
                    {business.name}
                </Text>

                <View style={styles.typeRow}>
                    <Ionicons name={typeIcon} size={12} color={colors.primary} />
                    <Text style={[styles.typeText, { color: colors.primary }]}>
                        {typeLabel}
                    </Text>
                </View>

                {/* Rating */}
                <View style={styles.ratingRow}>
                    {business.average_rating != null && business.total_reviews > 0 ? (
                        <>
                            <Ionicons name="star" size={12} color={colors.rating} />
                            <Text style={[styles.ratingText, { color: colors.text }]}>
                                {business.average_rating.toFixed(1)}
                            </Text>
                            <Text
                                style={[styles.reviewCount, { color: colors.textTertiary }]}
                            >
                                ({business.total_reviews})
                            </Text>
                        </>
                    ) : (
                        <Text style={[styles.noRating, { color: colors.textTertiary }]}>
                            Sin reseñas
                        </Text>
                    )}
                </View>

                {/* Address */}
                <View style={styles.addressRow}>
                    <Ionicons
                        name="location-outline"
                        size={12}
                        color={colors.textTertiary}
                    />
                    <Text
                        style={[styles.addressText, { color: colors.textSecondary }]}
                        numberOfLines={1}
                    >
                        {business.address}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: "hidden",
        marginBottom: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    imageContainer: {
        height: 130,
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    logoContainer: {
        position: "absolute",
        bottom: -20,
        left: 16,
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 3,
        overflow: "hidden",
    },
    logo: {
        width: "100%",
        height: "100%",
    },
    content: {
        padding: 14,
        paddingTop: 16,
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: "700",
    },
    typeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    typeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: "600",
    },
    reviewCount: {
        fontSize: 11,
    },
    noRating: {
        fontSize: 12,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    addressText: {
        fontSize: 12,
        flex: 1,
    },
});
