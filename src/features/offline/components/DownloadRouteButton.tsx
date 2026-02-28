/**
 * Download button component for routes
 *
 * Shows download icon when not downloaded, checkmark when downloaded,
 * and progress indicator during download.
 */

import type { RouteDetailResponse } from "@/features/routes/types";
import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useDownloadRoute,
  useIsRouteOffline,
  useRemoveOfflineRoute,
} from "../hooks/useOffline";
import { useOfflineStore } from "../store/useOfflineStore";

interface DownloadRouteButtonProps {
  routeId: string;
  routeName: string;
  routeData: RouteDetailResponse;
  /** Compact mode shows only icon */
  compact?: boolean;
}

export function DownloadRouteButton({
  routeId,
  routeName,
  routeData,
  compact = false,
}: DownloadRouteButtonProps) {
  const { colors } = useTheme();
  const { data: isOffline, isLoading: checkLoading } =
    useIsRouteOffline(routeId);
  const { mutate: download, isPending: isDownloading } = useDownloadRoute();
  const { mutate: remove } = useRemoveOfflineRoute();
  const downloadProgress = useOfflineStore((s) => s.downloads[routeId]);

  const isActive = isDownloading || downloadProgress?.status === "downloading";

  const handlePress = () => {
    if (isActive) return;

    if (isOffline) {
      Alert.alert(
        "Eliminar descarga",
        "¿Quieres eliminar esta ruta descargada?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => remove(routeId),
          },
        ],
      );
      return;
    }

    download({ routeId, name: routeName, data: routeData });
  };

  if (checkLoading) {
    return (
      <View
        style={[
          compact ? styles.compactButton : styles.button,
          { backgroundColor: colors.surfaceSecondary },
        ]}
      >
        <ActivityIndicator size="small" color={colors.textSecondary} />
      </View>
    );
  }

  if (isActive) {
    return (
      <View
        style={[
          compact ? styles.compactButton : styles.button,
          { backgroundColor: colors.primaryLight ?? colors.primary + "20" },
        ]}
      >
        <ActivityIndicator size="small" color={colors.primary} />
        {!compact && (
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            Descargando...
          </Text>
        )}
      </View>
    );
  }

  if (isOffline) {
    return (
      <Pressable
        style={[
          compact ? styles.compactButton : styles.button,
          { backgroundColor: colors.success + "20" },
        ]}
        onPress={handlePress}
      >
        <Ionicons
          name="checkmark-circle"
          size={compact ? 20 : 18}
          color={colors.success}
        />
        {!compact && (
          <Text style={[styles.buttonText, { color: colors.success }]}>
            Descargada
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[
        compact ? styles.compactButton : styles.button,
        { backgroundColor: colors.surfaceSecondary },
      ]}
      onPress={handlePress}
    >
      <Ionicons
        name="cloud-download-outline"
        size={compact ? 20 : 18}
        color={colors.textSecondary}
      />
      {!compact && (
        <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
          Descargar
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  compactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
