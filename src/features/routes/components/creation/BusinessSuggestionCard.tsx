import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { DraftBusiness } from "../../store/useRouteCreationStore";

interface BusinessSuggestionCardProps {
  business: DraftBusiness;
  onToggle: () => void;
}

export function BusinessSuggestionCard({
  business,
  onToggle,
}: BusinessSuggestionCardProps) {
  const { colors } = useTheme();
  const distanceKm = business.distance_from_route_m
    ? (business.distance_from_route_m / 1000).toFixed(1)
    : null;

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: business.selected ? colors.primary : colors.border,
          borderWidth: business.selected ? 2 : 1,
        },
      ]}
      onPress={onToggle}
    >
      {business.cover_image_url ? (
        <Image
          source={{ uri: business.cover_image_url }}
          style={styles.image}
        />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="storefront-outline" size={24} color={colors.textTertiary} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {business.name}
        </Text>
        <Text style={[styles.type, { color: colors.textSecondary }]}>
          {business.business_type}
        </Text>
        <View style={styles.meta}>
          {distanceKm && (
            <Text style={[styles.distance, { color: colors.textTertiary }]}>
              {distanceKm} km
            </Text>
          )}
          {business.average_rating != null && business.average_rating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={colors.rating} />
              <Text style={[styles.rating, { color: colors.textSecondary }]}>
                {business.average_rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: business.selected
              ? colors.primary
              : "transparent",
            borderColor: business.selected ? colors.primary : colors.border,
          },
        ]}
      >
        {business.selected && (
          <Ionicons name="checkmark" size={16} color="#FFF" />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
  },
  type: {
    fontSize: 12,
    marginTop: 2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  distance: {
    fontSize: 11,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rating: {
    fontSize: 11,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
