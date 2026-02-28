import { difficulty as difficultyColors } from "@/constants/Colors";
import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import type { RouteListItem } from "../types";

const CARD_WIDTH = Dimensions.get("window").width * 0.72;

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

// Gradient pairs for placeholder backgrounds based on difficulty
const DIFFICULTY_GRADIENTS: Record<string, [string, string]> = {
    facil: ["#43e97b", "#38f9d7"],
    moderada: ["#f6d365", "#fda085"],
    dificil: ["#f093fb", "#f5576c"],
    experto: ["#4facfe", "#00f2fe"],
};

interface Props {
    route: RouteListItem;
    onPress: (route: RouteListItem) => void;
    variant?: "carousel" | "list";
}

export const RouteCard = ({ route, onPress, variant = "carousel" }: Props) => {
    const { colors, isDark } = useTheme();
    const isList = variant === "list";

    const diffColor = DIFFICULTY_COLORS[route.difficulty] ?? colors.textSecondary;
    const diffLabel = DIFFICULTY_LABELS[route.difficulty] ?? route.difficulty;
    const gradientColors = DIFFICULTY_GRADIENTS[route.difficulty] ?? ["#667eea", "#764ba2"];

    return (
        <Pressable
            style={[
                styles.card,
                isList && styles.cardList,
                {
                    backgroundColor: colors.card,
                    shadowColor: isDark ? "#000" : "#64748b",
                },
            ]}
            onPress={() => onPress(route)}
        >
            {/* Image / Gradient header */}
            <View style={styles.imageContainer}>
                {route.cover_image_url ? (
                    <Image
                        source={{ uri: route.cover_image_url }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientPlaceholder}
                    >
                        <Ionicons name="bicycle" size={24} color="rgba(255,255,255,0.7)" />
                    </LinearGradient>
                )}

                {/* Price badge */}
                <View
                    style={[
                        styles.priceBadge,
                        {
                            backgroundColor: route.is_free
                                ? "rgba(16,185,129,0.9)"
                                : "rgba(245,158,11,0.9)",
                        },
                    ]}
                >
                    <Text style={styles.priceText}>
                        {route.is_free ? "Gratis" : `$${route.price}`}
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
                    <View
                        style={[styles.diffBadge, { backgroundColor: diffColor + "18" }]}
                    >
                        <View style={[styles.diffDot, { backgroundColor: diffColor }]} />
                        <Text style={[styles.diffText, { color: diffColor }]}>
                            {diffLabel}
                        </Text>
                    </View>

                    <View style={styles.metaItem}>
                        <Ionicons name="navigate-outline" size={11} color={colors.textSecondary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            {route.distance_km} km
                        </Text>
                    </View>

                    {route.estimated_duration_min != null && (
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                {route.estimated_duration_min} min
                            </Text>
                        </View>
                    )}

                    {route.total_reviews > 0 && (
                        <View style={styles.metaItem}>
                            <Ionicons name="star" size={11} color={colors.rating} />
                            <Text style={[styles.ratingText, { color: colors.text }]}>
                                {route.average_rating.toFixed(1)}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        borderRadius: 16,
        overflow: "hidden",
        marginRight: 10,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    },
    cardList: {
        width: "100%",
        marginRight: 0,
        marginBottom: 12,
    },
    imageContainer: {
        width: "100%",
        height: 90,
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    gradientPlaceholder: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    priceBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    priceText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    content: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 5,
    },
    name: {
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: -0.3,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },
    diffBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 3,
    },
    diffDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },
    diffText: {
        fontSize: 11,
        fontWeight: "600",
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    metaText: {
        fontSize: 11,
    },
    ratingText: {
        fontSize: 11,
        fontWeight: "600",
    },
});
