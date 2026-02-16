import ENV from "@/config/env";
import { difficulty as difficultyColors } from "@/constants/Colors";
import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WaypointItem } from "../components/WaypointItem";
import { useRouteDetail } from "../hooks/useRouteDetail";
import type { RouteWaypoint } from "../types";

Mapbox.setAccessToken(ENV.MAPBOX_ACCESS_TOKEN);

const SCREEN_WIDTH = Dimensions.get("window").width;

const DIFF_LABELS: Record<string, string> = {
    facil: "Fácil",
    moderada: "Moderada",
    dificil: "Difícil",
    experto: "Experto",
};

const DIFF_COLORS: Record<string, string> = {
    facil: difficultyColors.easy,
    moderada: difficultyColors.moderate,
    dificil: difficultyColors.hard,
    experto: difficultyColors.expert,
};

const TERRAIN_LABELS: Record<string, string> = {
    asfalto: "Asfalto",
    terraceria: "Terracería",
    mixto: "Mixto",
};

export default function RouteDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data, isLoading, error } = useRouteDetail(id ?? "");
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    if (isLoading) {
        return (
            <View
                style={[styles.centered, { backgroundColor: colors.background }]}
            >
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !data?.route) {
        return (
            <View
                style={[styles.centered, { backgroundColor: colors.background }]}
            >
                <Ionicons
                    name="alert-circle-outline"
                    size={48}
                    color={colors.error}
                />
                <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                    No se pudo cargar la ruta
                </Text>
                <Pressable
                    style={[styles.backButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Volver</Text>
                </Pressable>
            </View>
        );
    }

    const { route, waypoints, businesses } = data;
    const diffColor = DIFF_COLORS[route.difficulty] ?? colors.textSecondary;
    const diffLabel = DIFF_LABELS[route.difficulty] ?? route.difficulty;
    const terrainLabel = TERRAIN_LABELS[route.terrain_type] ?? route.terrain_type;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View style={styles.hero}>
                    {route.cover_image_url ? (
                        <Image
                            source={{ uri: route.cover_image_url }}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            style={[
                                styles.heroImage,
                                { backgroundColor: colors.surfaceSecondary },
                            ]}
                        />
                    )}
                    {/* Gradient overlay */}
                    <View style={styles.heroOverlay} />

                    {/* Navigation bar */}
                    <View style={[styles.navBar, { top: insets.top }]}>
                        <Pressable
                            style={[styles.navButton, { backgroundColor: "rgba(0,0,0,0.35)" }]}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                        </Pressable>
                    </View>

                    {/* Hero title */}
                    <View style={[styles.heroContent, { bottom: 20 }]}>
                        <View style={[styles.diffBadge, { backgroundColor: diffColor }]}>
                            <Text style={styles.diffBadgeText}>{diffLabel}</Text>
                        </View>
                        <Text style={styles.heroTitle}>{route.name}</Text>
                        {route.municipality && (
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={14} color="#FFFFFFCC" />
                                <Text style={styles.locationText}>{route.municipality}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Stats Bar */}
                <View
                    style={[
                        styles.statsBar,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                >
                    <StatItem
                        icon="navigate-outline"
                        value={`${route.distance_km} km`}
                        label="Distancia"
                        colors={colors}
                    />
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <StatItem
                        icon="trending-up-outline"
                        value={
                            route.elevation_gain_m
                                ? `${route.elevation_gain_m} m`
                                : "—"
                        }
                        label="Elevación"
                        colors={colors}
                    />
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <StatItem
                        icon="time-outline"
                        value={
                            route.estimated_duration_min
                                ? `${route.estimated_duration_min} min`
                                : "—"
                        }
                        label="Duración"
                        colors={colors}
                    />
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <StatItem
                        icon="star"
                        value={
                            route.total_reviews > 0
                                ? route.average_rating.toFixed(1)
                                : "—"
                        }
                        label={
                            route.total_reviews > 0
                                ? `${route.total_reviews} reseñas`
                                : "Sin reseñas"
                        }
                        colors={colors}
                    />
                </View>

                {/* Description */}
                {route.description && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Descripción
                        </Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            {route.description}
                        </Text>
                    </View>
                )}

                {/* Info chips */}
                <View style={styles.infoChipsRow}>
                    <View style={[styles.infoChip, { backgroundColor: colors.surfaceSecondary }]}>
                        <Ionicons name="trail-sign-outline" size={14} color={colors.primary} />
                        <Text style={[styles.infoChipText, { color: colors.text }]}>
                            {terrainLabel}
                        </Text>
                    </View>
                    <View style={[styles.infoChip, { backgroundColor: colors.surfaceSecondary }]}>
                        <Ionicons
                            name={route.is_free ? "pricetag-outline" : "card-outline"}
                            size={14}
                            color={route.is_free ? colors.freeBadge : colors.premiumBadge}
                        />
                        <Text style={[styles.infoChipText, { color: colors.text }]}>
                            {route.is_free ? "Gratis" : `$${route.price} MXN`}
                        </Text>
                    </View>
                </View>

                {/* Route Map */}
                {(route.route_geojson || route.start_lat) && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Mapa de la ruta
                        </Text>
                        <View style={[styles.mapContainer, { borderColor: colors.border }]}>
                            <Mapbox.MapView
                                style={styles.mapView}
                                styleURL={isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Outdoors}
                                scrollEnabled={false}
                                pitchEnabled={false}
                                rotateEnabled={false}
                                logoEnabled={false}
                                attributionEnabled={false}
                                scaleBarEnabled={false}
                            >
                                <Mapbox.Camera
                                    defaultSettings={{
                                        centerCoordinate: [route.start_lng, route.start_lat],
                                        zoomLevel: 12,
                                    }}
                                />
                                {/* Route path */}
                                {route.route_geojson && (
                                    <Mapbox.ShapeSource
                                        id="route-path"
                                        shape={{
                                            type: "Feature",
                                            properties: {},
                                            geometry: route.route_geojson,
                                        }}
                                    >
                                        <Mapbox.LineLayer
                                            id="route-line"
                                            style={{
                                                lineColor: colors.mapRoute,
                                                lineWidth: 4,
                                                lineCap: "round",
                                                lineJoin: "round",
                                            }}
                                        />
                                    </Mapbox.ShapeSource>
                                )}
                                {/* Waypoint markers */}
                                {waypoints.map((wp: RouteWaypoint) => (
                                    <Mapbox.PointAnnotation
                                        key={wp.id}
                                        id={`wp-${wp.id}`}
                                        coordinate={[wp.lng, wp.lat]}
                                    >
                                        <View style={[styles.waypointDot, { backgroundColor: colors.mapPOI }]}>
                                            <View style={styles.waypointDotInner} />
                                        </View>
                                    </Mapbox.PointAnnotation>
                                ))}
                            </Mapbox.MapView>
                        </View>
                    </View>
                )}

                {/* Waypoints */}
                {waypoints.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Puntos de interés ({waypoints.length})
                        </Text>
                        {waypoints.map((wp: RouteWaypoint, index: number) => (
                            <WaypointItem
                                key={wp.id}
                                name={wp.name}
                                description={wp.description}
                                waypointType={wp.waypoint_type}
                                orderIndex={wp.order_index}
                                isLast={index === waypoints.length - 1}
                            />
                        ))}
                    </View>
                )}

                {/* Nearby Businesses */}
                {businesses.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Comercios cercanos ({businesses.length})
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.businessCarousel}
                        >
                            {businesses.map((biz) => (
                                <Pressable
                                    key={biz.id}
                                    style={[
                                        styles.bizCard,
                                        { backgroundColor: colors.card, borderColor: colors.cardBorder },
                                    ]}
                                    onPress={() =>
                                        router.push({
                                            pathname: "/business-detail" as any,
                                            params: { id: biz.id },
                                        })
                                    }
                                >
                                    {biz.cover_image_url ? (
                                        <Image
                                            source={{ uri: biz.cover_image_url }}
                                            style={styles.bizImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View
                                            style={[
                                                styles.bizImage,
                                                { backgroundColor: colors.surfaceSecondary },
                                            ]}
                                        />
                                    )}
                                    <View style={styles.bizContent}>
                                        <Text
                                            style={[styles.bizName, { color: colors.text }]}
                                            numberOfLines={1}
                                        >
                                            {biz.name}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.bizType,
                                                { color: colors.textSecondary },
                                            ]}
                                        >
                                            {biz.business_type}
                                        </Text>
                                        {biz.distance_from_route_m != null && (
                                            <Text
                                                style={[
                                                    styles.bizDistance,
                                                    { color: colors.textTertiary },
                                                ]}
                                            >
                                                A {(biz.distance_from_route_m / 1000).toFixed(1)} km
                                            </Text>
                                        )}
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Tags */}
                {route.tags && route.tags.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Etiquetas
                        </Text>
                        <View style={styles.tagsRow}>
                            {route.tags.map((tag: string) => (
                                <View
                                    key={tag}
                                    style={[
                                        styles.tag,
                                        { backgroundColor: colors.surfaceSecondary },
                                    ]}
                                >
                                    <Text
                                        style={[styles.tagText, { color: colors.textSecondary }]}
                                    >
                                        #{tag}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Bottom spacer */}
                <View style={{ height: insets.bottom + 80 }} />
            </ScrollView>
        </View>
    );
}

// Helper component for stats bar
function StatItem({
    icon,
    value,
    label,
    colors,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    label: string;
    colors: any;
}) {
    return (
        <View style={styles.statItem}>
            <Ionicons name={icon} size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    errorText: {
        fontSize: 15,
    },
    backButton: {
        marginTop: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    hero: {
        height: 280,
        position: "relative",
    },
    heroImage: {
        width: "100%",
        height: "100%",
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    navBar: {
        position: "absolute",
        left: 16,
        right: 16,
        flexDirection: "row",
        zIndex: 10,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    heroContent: {
        position: "absolute",
        left: 20,
        right: 20,
        gap: 6,
    },
    diffBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    diffBadgeText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },
    heroTitle: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "800",
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    locationText: {
        color: "#FFFFFFCC",
        fontSize: 13,
    },
    statsBar: {
        flexDirection: "row",
        marginHorizontal: 16,
        marginTop: -24,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
        gap: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: "700",
    },
    statLabel: {
        fontSize: 10,
    },
    statDivider: {
        width: 1,
        height: "80%",
        alignSelf: "center",
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
    },
    infoChipsRow: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 20,
        marginTop: 16,
    },
    infoChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    infoChipText: {
        fontSize: 13,
        fontWeight: "500",
    },
    mapContainer: {
        height: 200,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
    },
    mapView: {
        flex: 1,
    },
    waypointDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    waypointDotInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#FFFFFF",
    },
    businessCarousel: {
        gap: 12,
    },
    bizCard: {
        width: 160,
        borderRadius: 14,
        borderWidth: 1,
        overflow: "hidden",
    },
    bizImage: {
        width: "100%",
        height: 90,
    },
    bizContent: {
        padding: 10,
        gap: 2,
    },
    bizName: {
        fontSize: 13,
        fontWeight: "600",
    },
    bizType: {
        fontSize: 11,
        textTransform: "capitalize",
    },
    bizDistance: {
        fontSize: 11,
    },
    tagsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    tagText: {
        fontSize: 12,
    },
});
