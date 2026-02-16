import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteCard } from "../components/RouteCard";
import { usePublishedRoutes } from "../hooks/usePublishedRoutes";
import { useRouteSearch } from "../hooks/useRouteSearch";
import type { RouteListItem } from "../types";

export default function Routes() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    searchText,
    setSearchText,
    clearSearch,
    isSearching,
    data: searchResults,
    isLoading: isSearchLoading,
  } = useRouteSearch();

  const { data: allRoutes = [], isLoading: isRoutesLoading } =
    usePublishedRoutes();

  const displayRoutes = isSearching ? searchResults ?? [] : allRoutes;
  const isLoading = isSearching ? isSearchLoading : isRoutesLoading;

  const handleRoutePress = useCallback(
    (route: RouteListItem) => {
      router.push({ pathname: "/route-detail" as any, params: { id: route.id } });
    },
    [router],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Rutas</Text>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textTertiary}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por nombre o lugar..."
            placeholderTextColor={colors.inputPlaceholder}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <Pressable onPress={clearSearch} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textTertiary}
              />
            </Pressable>
          )}
        </View>

        {/* Result count */}
        {!isLoading && (
          <Text style={[styles.resultCount, { color: colors.textTertiary }]}>
            {displayRoutes.length}{" "}
            {displayRoutes.length === 1 ? "ruta" : "rutas"}
            {isSearching ? ` para "${searchText}"` : " disponibles"}
          </Text>
        )}
      </View>

      {/* Route List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : displayRoutes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name={isSearching ? "search-outline" : "bicycle-outline"}
            size={48}
            color={colors.textTertiary}
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {isSearching
              ? `No se encontraron rutas para "${searchText}"`
              : "No hay rutas disponibles"}
          </Text>
          {isSearching && (
            <Pressable
              style={[styles.clearBtn, { backgroundColor: colors.primary }]}
              onPress={clearSearch}
            >
              <Text style={styles.clearBtnText}>Limpiar búsqueda</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={displayRoutes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 16 },
          ]}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <RouteCard route={item} onPress={handleRoutePress} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  resultCount: {
    fontSize: 12,
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  cardWrapper: {
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  clearBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  clearBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
});
