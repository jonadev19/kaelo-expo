import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSavedRoutes } from "../hooks/useSavedRoutes";
import type { SavedRoute } from "../types";

export default function SavedRoutesScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data: savedRoutes = [], isLoading, refetch } = useSavedRoutes();

    const renderItem = ({ item }: { item: SavedRoute }) => {
        const route = item.route;
        if (!route) return null;

        return (
            <Pressable
                style={[styles.card, { backgroundColor: colors.surface }]}
                onPress={() =>
                    router.push({
                        pathname: "/route-detail" as any,
                        params: { id: route.id },
                    })
                }
            >
                {route.cover_image_url ? (
                    <Image
                        source={{ uri: route.cover_image_url }}
                        style={styles.cardImage}
                    />
                ) : (
                    <View
                        style={[
                            styles.cardImage,
                            styles.cardImagePlaceholder,
                            { backgroundColor: colors.primaryLight },
                        ]}
                    >
                        <Ionicons name="bicycle" size={28} color={colors.primary} />
                    </View>
                )}

                <View style={styles.cardContent}>
                    <Text
                        style={[styles.cardTitle, { color: colors.text }]}
                        numberOfLines={1}
                    >
                        {route.name}
                    </Text>

                    <View style={styles.cardMeta}>
                        <Ionicons
                            name="resize-outline"
                            size={14}
                            color={colors.textSecondary}
                        />
                        <Text style={[styles.cardMetaText, { color: colors.textSecondary }]}>
                            {route.distance_km} km
                        </Text>

                        <Ionicons
                            name="speedometer-outline"
                            size={14}
                            color={colors.textSecondary}
                            style={{ marginLeft: 12 }}
                        />
                        <Text style={[styles.cardMetaText, { color: colors.textSecondary }]}>
                            {route.difficulty}
                        </Text>
                    </View>

                    {route.municipality && (
                        <View style={styles.cardMeta}>
                            <Ionicons
                                name="location-outline"
                                size={14}
                                color={colors.textTertiary}
                            />
                            <Text
                                style={[styles.cardMetaText, { color: colors.textTertiary }]}
                            >
                                {route.municipality}
                            </Text>
                        </View>
                    )}

                    <Text style={[styles.savedDate, { color: colors.textTertiary }]}>
                        Guardada {new Date(item.created_at ?? "").toLocaleDateString("es-MX")}
                    </Text>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textTertiary}
                    style={styles.chevron}
                />
            </Pressable>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top + 8,
                        backgroundColor: colors.background,
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Rutas Guardadas
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : savedRoutes.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons
                        name="heart-outline"
                        size={64}
                        color={colors.textTertiary}
                    />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        No tienes rutas guardadas
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Toca el ❤️ en cualquier ruta para guardarla aquí
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={savedRoutes}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={[
                        styles.list,
                        { paddingBottom: insets.bottom + 20 },
                    ]}
                    onRefresh={refetch}
                    refreshing={isLoading}
                />
            )}
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
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
    },
    headerSpacer: {
        width: 40,
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: "center",
    },
    list: {
        padding: 16,
        gap: 12,
    },
    card: {
        flexDirection: "row",
        borderRadius: 12,
        overflow: "hidden",
        alignItems: "center",
    },
    cardImage: {
        width: 80,
        height: 80,
    },
    cardImagePlaceholder: {
        alignItems: "center",
        justifyContent: "center",
    },
    cardContent: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 2,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "600",
    },
    cardMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 2,
    },
    cardMetaText: {
        fontSize: 13,
    },
    savedDate: {
        fontSize: 11,
        marginTop: 4,
    },
    chevron: {
        marginRight: 12,
    },
});
