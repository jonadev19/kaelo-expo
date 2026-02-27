import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AchievementBadge } from "../components/AchievementBadge";
import { StatCard } from "../components/StatCard";
import { useAchievements } from "../hooks/useAchievements";
import { useUserDashboard } from "../hooks/useUserDashboard";

export default function MetricsDashboardScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data: dashboard, isLoading: dashLoading } = useUserDashboard();
    const { data: achievements = [], isLoading: achLoading } = useAchievements();

    const isLoading = dashLoading || achLoading;

    const formatNumber = (n: number) =>
        n.toLocaleString("es-MX", { maximumFractionDigits: 1 });

    const formatDuration = (hours: number) => {
        if (hours < 1) return `${Math.round(hours * 60)} min`;
        return `${formatNumber(hours)} h`;
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
                    Mi Actividad
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : !dashboard ? (
                <View style={styles.centered}>
                    <Ionicons
                        name="bicycle-outline"
                        size={64}
                        color={colors.textTertiary}
                    />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        Sin actividad aún
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Completa tu primera ruta para ver tus estadísticas
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={[
                        styles.content,
                        { paddingBottom: insets.bottom + 20 },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <StatCard
                            icon="navigate-outline"
                            label="Distancia Total"
                            value={`${formatNumber(dashboard.total_distance_km ?? 0)} km`}
                            accentColor="#4ECDC4"
                        />
                        <StatCard
                            icon="flag-outline"
                            label="Rutas Completadas"
                            value={(dashboard.total_routes_completed ?? 0).toString()}
                            accentColor="#FF6B6B"
                        />
                        <StatCard
                            icon="flame-outline"
                            label="Calorías"
                            value={formatNumber(dashboard.total_calories_burned ?? 0)}
                            accentColor="#FFB800"
                        />
                        <StatCard
                            icon="time-outline"
                            label="Tiempo Total"
                            value={formatDuration(dashboard.total_duration_hours ?? 0)}
                            accentColor="#A78BFA"
                        />
                        <StatCard
                            icon="speedometer-outline"
                            label="Velocidad Prom."
                            value={`${formatNumber(dashboard.avg_speed_kmh ?? 0)} km/h`}
                            accentColor="#38BDF8"
                        />
                        <StatCard
                            icon="trending-up-outline"
                            label="Elevación"
                            value={`${formatNumber(dashboard.total_elevation_gain_m ?? 0)} m`}
                            accentColor="#34D399"
                        />
                    </View>

                    {/* Points */}
                    <View
                        style={[
                            styles.pointsCard,
                            { backgroundColor: colors.primary },
                        ]}
                    >
                        <Ionicons name="trophy" size={28} color="#FFFFFF" />
                        <View>
                            <Text style={styles.pointsValue}>
                                {(dashboard.total_points ?? 0).toLocaleString("es-MX")} pts
                            </Text>
                            <Text style={styles.pointsLabel}>Puntos acumulados</Text>
                        </View>
                    </View>

                    {/* Achievements */}
                    {achievements.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Logros ({dashboard.unlocked_achievements ?? 0}/{dashboard.total_achievements ?? 0})
                            </Text>
                            <View style={styles.achievementsGrid}>
                                {achievements.map((ach) => (
                                    <AchievementBadge key={ach.id} achievement={ach} />
                                ))}
                            </View>
                        </View>
                    )}
                </ScrollView>
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
    content: {
        padding: 16,
        gap: 16,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    pointsCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: 18,
        borderRadius: 16,
    },
    pointsValue: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "800",
    },
    pointsLabel: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 13,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    achievementsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "space-between",
    },
});
