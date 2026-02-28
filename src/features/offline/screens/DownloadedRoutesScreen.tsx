/**
 * Screen showing all downloaded offline routes
 */

import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { clearAllOfflineData } from "../api";
import {
  useOfflineRoutes,
  useOfflineStorageInfo,
  useRemoveOfflineRoute,
} from "../hooks/useOffline";
import { offlineKeys } from "../keys";
import type { OfflineRouteData } from "../types";

export default function DownloadedRoutesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: routes = [], isLoading } = useOfflineRoutes();
  const { data: storageInfo } = useOfflineStorageInfo();
  const { mutate: removeRoute } = useRemoveOfflineRoute();

  const handleRemove = (routeId: string, name: string) => {
    Alert.alert("Eliminar descarga", `¿Eliminar "${name}" de descargas?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => removeRoute(routeId),
      },
    ]);
  };

  const handleClearAll = () => {
    if (routes.length === 0) return;
    Alert.alert(
      "Eliminar todas las descargas",
      `¿Eliminar ${routes.length} rutas descargadas?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar todo",
          style: "destructive",
          onPress: async () => {
            await clearAllOfflineData();
            queryClient.invalidateQueries({ queryKey: offlineKeys.all });
          },
        },
      ],
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderRoute = ({ item }: { item: OfflineRouteData }) => (
    <Pressable
      style={[styles.routeCard, { backgroundColor: colors.surface }]}
      onPress={() =>
        router.push({ pathname: "/route-detail", params: { id: item.routeId } })
      }
    >
      <View style={styles.routeInfo}>
        <View style={styles.routeHeader}>
          <Ionicons name="bicycle-outline" size={20} color={colors.primary} />
          <Text
            style={[styles.routeName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </View>
        <View style={styles.routeMeta}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatDate(item.downloadedAt)}
          </Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            •
          </Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatSize(item.sizeBytes)}
          </Text>
          {item.mapTilesCached && (
            <>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                •
              </Text>
              <View style={styles.tilesBadge}>
                <Ionicons name="map" size={12} color={colors.success} />
                <Text style={[styles.tilesText, { color: colors.success }]}>
                  Mapa
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
      <Pressable
        style={styles.removeButton}
        onPress={() => handleRemove(item.routeId, item.name)}
        hitSlop={8}
      >
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </Pressable>
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Ionicons
        name="cloud-download-outline"
        size={56}
        color={colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Sin descargas
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Descarga rutas para usarlas sin conexión a internet.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Storage info header */}
      {storageInfo && storageInfo.totalRoutes > 0 && (
        <View style={[styles.storageBar, { backgroundColor: colors.surface }]}>
          <View style={styles.storageInfo}>
            <Ionicons
              name="folder-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={[styles.storageText, { color: colors.textSecondary }]}>
              {storageInfo.totalRoutes} ruta
              {storageInfo.totalRoutes !== 1 ? "s" : ""} •{" "}
              {storageInfo.formattedSize}
            </Text>
          </View>
          <Pressable onPress={handleClearAll} hitSlop={8}>
            <Text style={[styles.clearText, { color: colors.error }]}>
              Limpiar todo
            </Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={routes}
        keyExtractor={(item) => item.routeId}
        renderItem={renderRoute}
        ListEmptyComponent={isLoading ? null : renderEmpty}
        contentContainerStyle={
          routes.length === 0 ? styles.emptyContainer : styles.list
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  storageBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  storageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  storageText: {
    fontSize: 13,
  },
  clearText: {
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  routeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  routeInfo: {
    flex: 1,
    gap: 6,
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  routeName: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  routeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 30,
  },
  metaText: {
    fontSize: 12,
  },
  tilesBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  tilesText: {
    fontSize: 11,
    fontWeight: "600",
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
