import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { Review } from "../types";
import { StarRating } from "./StarRating";

interface ReviewCardProps {
    review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
    const { colors } = useTheme();
    const userName = review.user?.full_name || "Usuario";
    const avatarUrl = review.user?.avatar_url;
    const date = new Date(review.created_at).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {/* Header: Avatar + Name + Date */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                    ) : (
                        <View
                            style={[
                                styles.avatar,
                                styles.avatarPlaceholder,
                                { backgroundColor: colors.primaryLight },
                            ]}
                        >
                            <Ionicons name="person" size={14} color={colors.primary} />
                        </View>
                    )}
                    <View>
                        <Text style={[styles.userName, { color: colors.text }]}>
                            {userName}
                        </Text>
                        <Text style={[styles.date, { color: colors.textTertiary }]}>
                            {date}
                        </Text>
                    </View>
                </View>
                <StarRating rating={review.rating} size={14} />
            </View>

            {/* Comment */}
            {review.comment && (
                <Text style={[styles.comment, { color: colors.textSecondary }]}>
                    {review.comment}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 14,
        borderRadius: 12,
        gap: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    avatarPlaceholder: {
        alignItems: "center",
        justifyContent: "center",
    },
    userName: {
        fontSize: 14,
        fontWeight: "600",
    },
    date: {
        fontSize: 11,
    },
    comment: {
        fontSize: 13,
        lineHeight: 19,
    },
});
