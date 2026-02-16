import { difficulty as difficultyColors } from "@/constants/Colors";
import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import {
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import type { RouteListItem } from "../types";

const CARD_WIDTH = Dimensions.get("window").width * 0.78;

const DIFFICULTY_LABELS: Record<string, string> = {
    facil: "Fácil",
    moderada: "Moderada",
    dificil: "Difícil",
    experto: "Experto",
};

const DIFFICULTY_COLORS: Record<string, string> = {
    facil: difficultyColors.easy,
    moderada: difficultyColors.moderate,
    dificil: difficultyColors.hard,
    experto: difficultyColors.expert,
};

interface Props {
    route: RouteListItem;
    onPress: (route: RouteListItem) => void;
}

export const RouteCard = ({ route, onPress }: Props) => {
    const { colors } = useTheme();

    const diffColor = DIFFICULTY_COLORS[route.difficulty] ?? colors.textSecondary;
    const diffLabel = DIFFICULTY_LABELS[route.difficulty] ?? route.difficulty;

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
            onPress={() => onPress(route)}
        >
            {/* Cover Image */}
            <View style={styles.imageContainer}>
                {route.cover_image_url ? (
                    <Image
                        source={{ uri: route.cover_image_url }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View
                        style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceSecondary }]}
                    >
                        <Ionicons name="bicycle" size={32} color={colors.textTertiary} />
                    </View>
                )}
                {/* Price Badge */}
                <View
                    style={[
                        styles.priceBadge,
                        {
                            backgroundColor: route.is_free
                                ? colors.freeBadge
                                : colors.premiumBadge,
                        },
                    ]}
                >
                    <Text style={styles.priceText}>
                        {route.is_free ? "Gratis" : `$${route.price} MXN`}
                    </Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text
                    style={[styles.name, { color: colors.text }]}
                    numberOfLines={1}
                >
                    {route.name}
                </Text>

                <View style={styles.metaRow}>
                    {/* Difficulty badge */}
                    <View
                        style={[styles.diffBadge, { backgroundColor: diffColor + "20" }]}
                    >
                        <View
                            style={[styles.diffDot, { backgroundColor: diffColor }]}
                        />
                        <Text style={[styles.diffText, { color: diffColor }]}>
                            {diffLabel}
                        </Text>
                    </View>

                    {/* Distance */}
                    <View style={styles.metaItem}>
                        <Ionicons
                            name="navigate-outline"
                            size={13}
                            color={colors.textSecondary}
                        />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            {route.distance_km} km
                        </Text>
                    </View>

                    {/* Duration */}
                    {route.estimated_duration_min && (
                        <View style={styles.metaItem}>
                            <Ionicons
                                name="time-outline"
                                size={13}
                                color={colors.textSecondary}
                            />
                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                {route.estimated_duration_min} min
                            </Text>
                        </View>
                    )}
                </View>

                {/* Rating */}
                {route.total_reviews > 0 && (
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={13} color={colors.rating} />
                        <Text style={[styles.ratingText, { color: colors.text }]}>
                            {route.average_rating.toFixed(1)}
                        </Text>
                        <Text style={[styles.reviewCount, { color: colors.textTertiary }]}>
                            ({route.total_reviews})
                        </Text>
                    </View>
                )}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        borderRadius: 16,
        borderWidth: 1,
        overflow: "hidden",
        marginRight: 12,
        // iOS shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        // Android shadow
        elevation: 4,
    },
    imageContainer: {
        height: 120,
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
    priceBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priceText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    content: {
        padding: 12,
        gap: 6,
    },
    name: {
        fontSize: 15,
        fontWeight: "700",
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    diffBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 4,
    },
    diffDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    diffText: {
        fontSize: 11,
        fontWeight: "600",
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    metaText: {
        fontSize: 12,
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
});
