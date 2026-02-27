import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface StarRatingProps {
    rating: number;
    size?: number;
    color?: string;
    interactive?: boolean;
    onRate?: (rating: number) => void;
}

export function StarRating({
    rating,
    size = 18,
    color = "#FFB800",
    interactive = false,
    onRate,
}: StarRatingProps) {
    const stars = [1, 2, 3, 4, 5];

    return (
        <View style={styles.container}>
            {stars.map((star) => {
                const filled = star <= rating;
                const half = !filled && star - 0.5 <= rating;

                return (
                    <Pressable
                        key={star}
                        onPress={() => interactive && onRate?.(star)}
                        disabled={!interactive}
                        hitSlop={interactive ? 8 : 0}
                        style={interactive ? styles.starTouchable : undefined}
                    >
                        <Ionicons
                            name={filled ? "star" : half ? "star-half" : "star-outline"}
                            size={size}
                            color={color}
                        />
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 2,
    },
    starTouchable: {
        padding: 4,
    },
});
