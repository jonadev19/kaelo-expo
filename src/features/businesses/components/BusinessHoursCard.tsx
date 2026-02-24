import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const DAY_NAMES = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const DAY_LABELS: Record<string, string> = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sábado",
    domingo: "Domingo",
};

interface BusinessHoursCardProps {
    hours: Record<string, { open: string; close: string } | null> | null;
}

function getCurrentDayName(): string {
    return DAY_NAMES[new Date().getDay()];
}

function isCurrentlyOpen(hours: Record<string, { open: string; close: string } | null> | null): boolean {
    if (!hours) return false;
    const today = getCurrentDayName();
    const todayHours = hours[today];
    if (!todayHours) return false;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
}

const ORDERED_DAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

export function BusinessHoursCard({ hours }: BusinessHoursCardProps) {
    const { colors } = useTheme();

    if (!hours || Object.keys(hours).length === 0) return null;

    const open = isCurrentlyOpen(hours);
    const today = getCurrentDayName();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="time-outline" size={18} color={colors.primary} />
                    <Text style={[styles.title, { color: colors.text }]}>Horarios</Text>
                </View>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: open ? "#E8F5E9" : "#FFEBEE" },
                    ]}
                >
                    <View
                        style={[
                            styles.statusDot,
                            { backgroundColor: open ? "#4CAF50" : "#F44336" },
                        ]}
                    />
                    <Text
                        style={[
                            styles.statusText,
                            { color: open ? "#2E7D32" : "#C62828" },
                        ]}
                    >
                        {open ? "Abierto" : "Cerrado"}
                    </Text>
                </View>
            </View>

            <View style={styles.hoursList}>
                {ORDERED_DAYS.map((day) => {
                    const dayHours = hours[day];
                    const isToday = day === today;
                    return (
                        <View
                            key={day}
                            style={[
                                styles.hoursRow,
                                isToday && {
                                    backgroundColor: colors.primaryLight,
                                    borderRadius: 8,
                                    paddingHorizontal: 8,
                                    marginHorizontal: -8,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.dayName,
                                    { color: isToday ? colors.primary : colors.textSecondary },
                                    isToday && { fontWeight: "700" },
                                ]}
                            >
                                {DAY_LABELS[day] ?? day}
                            </Text>
                            <Text
                                style={[
                                    styles.dayHours,
                                    { color: isToday ? colors.primary : colors.text },
                                    isToday && { fontWeight: "600" },
                                ]}
                            >
                                {dayHours
                                    ? `${dayHours.open} - ${dayHours.close}`
                                    : "Cerrado"}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 12 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    title: { fontSize: 17, fontWeight: "700" },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    statusText: { fontSize: 12, fontWeight: "600" },
    hoursList: { gap: 6 },
    hoursRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
    },
    dayName: { fontSize: 13 },
    dayHours: { fontSize: 13 },
});
