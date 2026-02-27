import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    subtitle?: string;
    accentColor?: string;
}

export function StatCard({
    icon,
    label,
    value,
    subtitle,
    accentColor,
}: StatCardProps) {
    const { colors } = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View
                style={[
                    styles.iconContainer,
                    { backgroundColor: accentColor ? `${accentColor}20` : colors.primaryLight },
                ]}
            >
                <Ionicons
                    name={icon}
                    size={22}
                    color={accentColor ?? colors.primary}
                />
            </View>
            <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
                {label}
            </Text>
            {subtitle && (
                <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
                    {subtitle}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 14,
        borderRadius: 14,
        alignItems: "center",
        gap: 4,
        flex: 1,
        minWidth: "45%",
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    value: {
        fontSize: 22,
        fontWeight: "800",
    },
    label: {
        fontSize: 12,
        fontWeight: "500",
    },
    subtitle: {
        fontSize: 10,
    },
});
