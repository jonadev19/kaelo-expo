import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BusinessSuggestionCard } from "../../components/creation/BusinessSuggestionCard";
import { RoutePolyline } from "../../components/creation/RoutePolyline";
import { StepHeader } from "../../components/creation/StepHeader";
import { useNearbyBusinesses } from "../../hooks/useNearbyBusinesses";
import { useRouteCreationStore } from "../../store/useRouteCreationStore";

export default function Step4BusinessesScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const snappedRoute = useRouteCreationStore((s) => s.snappedRoute);
  const businesses = useRouteCreationStore((s) => s.businesses);
  const setBusinesses = useRouteCreationStore((s) => s.setBusinesses);
  const toggleBusiness = useRouteCreationStore((s) => s.toggleBusiness);

  const geometry = snappedRoute?.geometry ?? null;
  const { data: nearbyBusinesses, isLoading } = useNearbyBusinesses(geometry);

  // Hydrate store with fetched businesses (preserve selection state)
  useEffect(() => {
    if (!nearbyBusinesses) return;
    const existingSelected = new Set(
      businesses.filter((b) => b.selected).map((b) => b.business_id),
    );
    const merged = nearbyBusinesses.map((b) => ({
      ...b,
      selected: existingSelected.has(b.business_id),
    }));
    setBusinesses(merged);
  }, [nearbyBusinesses]);

  const routeCoords = snappedRoute?.geometry.coordinates ?? [];
  const center: [number, number] = routeCoords.length
    ? routeCoords[Math.floor(routeCoords.length / 2)]
    : [-89.6237, 20.9674];

  const selectedCount = businesses.filter((b) => b.selected).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StepHeader step={4} title="Comercios" />

      {/* Mini map */}
      <View style={styles.miniMapWrapper}>
        <Mapbox.MapView
          style={styles.miniMap}
          styleURL={isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Outdoors}
          compassEnabled={false}
          logoEnabled={false}
          attributionEnabled={false}
          scaleBarEnabled={false}
        >
          <Mapbox.Camera
            defaultSettings={{ centerCoordinate: center, zoomLevel: 12 }}
          />
          {routeCoords.length >= 2 && (
            <RoutePolyline coordinates={routeCoords} color={colors.primary} width={4} />
          )}
          {/* Business markers */}
          {businesses.map((b) => (
            <Mapbox.MarkerView
              key={b.business_id}
              id={`biz-${b.business_id}`}
              coordinate={[b.lng, b.lat]}
            >
              <View
                style={[
                  styles.bizMarker,
                  {
                    backgroundColor: b.selected
                      ? colors.primary
                      : colors.surface,
                    borderColor: b.selected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="storefront"
                  size={14}
                  color={b.selected ? "#FFF" : colors.textSecondary}
                />
              </View>
            </Mapbox.MarkerView>
          ))}
        </Mapbox.MapView>
      </View>

      {/* Business list */}
      <View style={styles.listSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Comercios cercanos ({businesses.length})
          {selectedCount > 0 && (
            <Text style={{ color: colors.primary }}>
              {" "}
              — {selectedCount} seleccionado{selectedCount !== 1 ? "s" : ""}
            </Text>
          )}
        </Text>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : businesses.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <Ionicons name="storefront-outline" size={24} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No se encontraron comercios cercanos a la ruta
            </Text>
          </View>
        ) : (
          <FlatList
            data={businesses}
            keyExtractor={(b) => b.business_id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <BusinessSuggestionCard
                business={item}
                onToggle={() => toggleBusiness(item.business_id)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>

      {/* Bottom bar */}
      <View
        style={[styles.bottomBar, { backgroundColor: colors.background, paddingBottom: insets.bottom + 8 }]}
      >
        <Pressable
          style={styles.skipButton}
          onPress={() => router.push("/create-route/step5-review")}
        >
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            Omitir
          </Text>
        </Pressable>
        <Pressable
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/create-route/step5-review")}
        >
          <Text style={styles.nextButtonText}>Siguiente</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  miniMapWrapper: { height: 200 },
  miniMap: { flex: 1 },
  bizMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  listSection: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  listContent: { paddingBottom: 16 },
  loader: { marginTop: 40 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyText: { fontSize: 13, textAlign: "center" },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  skipButton: { paddingVertical: 12, paddingHorizontal: 16 },
  skipText: { fontSize: 14, fontWeight: "500" },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  nextButtonText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
});
