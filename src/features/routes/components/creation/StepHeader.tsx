import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouteCreationStore } from "../../store/useRouteCreationStore";

interface StepHeaderProps {
  step: number;
  totalSteps?: number;
  title: string;
  onBack?: () => void;
}

export function StepHeader({
  step,
  totalSteps = 5,
  title,
  onBack,
}: StepHeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reset = useRouteCreationStore((s) => s.reset);

  const handleClose = useCallback(() => {
    Alert.alert(
      "Descartar ruta",
      "Se perderán todos los cambios. ¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Descartar",
          style: "destructive",
          onPress: () => {
            reset();
            router.back();
          },
        },
      ],
    );
  }, [reset, router]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }, [onBack, router]);

  const progress = step / totalSteps;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4, backgroundColor: colors.background }]}>
      <View style={styles.row}>
        {step > 1 ? (
          <Pressable onPress={handleBack} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}

        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.step, { color: colors.textSecondary }]}>
            Paso {step} de {totalSteps}
          </Text>
        </View>

        <Pressable onPress={handleClose} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
  },
  center: {
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  step: {
    fontSize: 12,
    marginTop: 1,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
});
