import { useTheme } from "@/shared/hooks/useTheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Achievement } from "../types";
import { ACHIEVEMENT_META } from "../types";

interface AchievementBadgeProps {
    achievement: Achievement;
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
    const { colors } = useTheme();
    const meta = ACHIEVEMENT_META[achievement.achievement_type];
    const progress = achievement.progress_target > 0
        ? Math.min(achievement.progress_current / achievement.progress_target, 1)
        : 0;

    if (!meta) return null;

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: colors.surface,
                    opacity: achievement.is_unlocked ? 1 : 0.5,
                },
            ]}
        >
            <Text style={styles.emoji}>{meta.icon}</Text>
            <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={1}
            >
                {meta.title}
            </Text>
            <Text
                style={[styles.description, { color: colors.textTertiary }]}
                numberOfLines={2}
            >
                {meta.description}
            </Text>

            {/* Progress bar */}
            {!achievement.is_unlocked && (
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                backgroundColor: colors.primary,
                                width: `${progress * 100}%`,
                            },
                        ]}
                    />
                </View>
            )}

            {achievement.is_unlocked && (
                <Text style={[styles.unlocked, { color: colors.success }]}>
                    ✓ Desbloqueado
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        padding: 12,
        borderRadius: 14,
        alignItems: "center",
        gap: 4,
        width: "48%",
    },
    emoji: {
        fontSize: 28,
    },
    title: {
        fontSize: 12,
        fontWeight: "700",
        textAlign: "center",
    },
    description: {
        fontSize: 10,
        textAlign: "center",
        lineHeight: 14,
    },
    progressTrack: {
        width: "100%",
        height: 4,
        borderRadius: 2,
        marginTop: 4,
    },
    progressFill: {
        height: "100%",
        borderRadius: 2,
    },
    unlocked: {
        fontSize: 10,
        fontWeight: "600",
        marginTop: 2,
    },
});
