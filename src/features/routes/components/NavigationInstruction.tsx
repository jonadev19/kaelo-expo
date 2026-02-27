import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NavigationStep } from "../types/navigation";

interface Props {
  currentStep: NavigationStep | null;
  distanceToNextStep: number;
}

const MANEUVER_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "turn-left": "arrow-back",
  "turn-right": "arrow-forward",
  "sharp left": "return-down-back",
  "sharp right": "return-down-forward",
  "slight left": "arrow-back",
  "slight right": "arrow-forward",
  straight: "arrow-up",
  uturn: "return-up-back",
  depart: "navigate",
  arrive: "flag",
  "roundabout-left": "sync",
  "roundabout-right": "sync",
  roundabout: "sync",
  merge: "git-merge",
  fork: "git-branch",
  "off ramp": "exit-outline",
  "on ramp": "enter-outline",
};

function getManeuverIcon(step: NavigationStep): keyof typeof Ionicons.glyphMap {
  const { type, modifier } = step.maneuver;

  // Check modifier first (more specific)
  if (modifier && MANEUVER_ICONS[modifier]) {
    return MANEUVER_ICONS[modifier];
  }
  // Then type
  if (MANEUVER_ICONS[type]) {
    return MANEUVER_ICONS[type];
  }
  // Default
  return "arrow-up";
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function NavigationInstruction({ currentStep, distanceToNextStep }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!currentStep) return null;

  const icon = getManeuverIcon(currentStep);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          paddingTop: insets.top + 8,
          shadowColor: "#000",
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <Ionicons name={icon} size={28} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.distance, { color: colors.primary }]}>
            {formatDistance(distanceToNextStep)}
          </Text>
          <Text
            style={[styles.instruction, { color: colors.text }]}
            numberOfLines={2}
          >
            {currentStep.instruction}
          </Text>
          {currentStep.name ? (
            <Text
              style={[styles.streetName, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {currentStep.name}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  distance: {
    fontSize: 22,
    fontWeight: "800",
  },
  instruction: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  streetName: {
    fontSize: 12,
    marginTop: 2,
  },
});
