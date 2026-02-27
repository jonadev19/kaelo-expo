import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RoutePolyline } from "../../components/creation/RoutePolyline";
import { StepHeader } from "../../components/creation/StepHeader";
import { useRouteCreation } from "../../hooks/useRouteCreation";
import { useRouteCreationStore } from "../../store/useRouteCreationStore";

export default function Step5ReviewScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const snappedRoute = useRouteCreationStore((s) => s.snappedRoute);
  const waypoints = useRouteCreationStore((s) => s.waypoints);
  const businesses = useRouteCreationStore((s) => s.businesses);
  const details = useRouteCreationStore((s) => s.details);

  const selectedBusinesses = businesses.filter((b) => b.selected);
  const { mutate: save, isPending } = useRouteCreation();

  const routeCoords = snappedRoute?.geometry.coordinates ?? [];
  const center: [number, number] = routeCoords.length
    ? routeCoords[Math.floor(routeCoords.length / 2)]
    : [-89.6237, 20.9674];

  const distanceKm = snappedRoute
    ? (snappedRoute.distance / 1000).toFixed(1)
    : "0";
  const durationMin = details.estimated_duration_min
    ?? (snappedRoute ? Math.round(snappedRoute.duration / 60) : 0);

  const handleSave = (status: "borrador" | "publicado") => {
    if (isPending) return;
    save(status, {
      onError: (err) => {
        Alert.alert("Error", err.message);
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StepHeader step={5} title="Revisar" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Map preview */}
        <View style={styles.miniMapWrapper}>
          <Mapbox.MapView
            style={styles.miniMap}
            styleURL={isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Outdoors}
            compassEnabled={false}
            logoEnabled={false}
            attributionEnabled={false}
            scaleBarEnabled={false}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Mapbox.Camera
              defaultSettings={{ centerCoordinate: center, zoomLevel: 11 }}
            />
            {routeCoords.length >= 2 && (
              <RoutePolyline coordinates={routeCoords} color={colors.primary} width={4} />
            )}
          </Mapbox.MapView>
        </View>

        {/* Cover image */}
        {details.cover_image_uri && (
          <Image source={{ uri: details.cover_image_uri }} style={styles.coverPreview} />
        )}

        {/* Route name */}
        <Text style={[styles.routeName, { color: colors.text }]}>
          {details.name || "Sin nombre"}
        </Text>

        {details.description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {details.description}
          </Text>
        ) : null}

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatBox label="Distancia" value={`${distanceKm} km`} icon="bicycle" colors={colors} />
          <StatBox label="Duración" value={`${durationMin} min`} icon="time" colors={colors} />
          <StatBox label="Dificultad" value={details.difficulty} icon="speedometer" colors={colors} />
          <StatBox label="Terreno" value={details.terrain_type} icon="trail-sign" colors={colors} />
        </View>

        {/* Price */}
        <View style={[styles.infoRow, { borderColor: colors.border }]}>
          <Ionicons name="pricetag" size={18} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {details.is_free ? "Gratis" : `$${details.price} MXN`}
          </Text>
        </View>

        {/* Municipality */}
        {details.municipality ? (
          <View style={[styles.infoRow, { borderColor: colors.border }]}>
            <Ionicons name="location" size={18} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {details.municipality}
            </Text>
          </View>
        ) : null}

        {/* Tags */}
        {details.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {details.tags.map((tag) => (
              <View key={tag} style={[styles.tagBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Waypoints */}
        {waypoints.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Puntos de interés ({waypoints.length})
            </Text>
            {waypoints.map((wp, i) => (
              <Text key={wp.id} style={[styles.itemText, { color: colors.textSecondary }]}>
                {i + 1}. {wp.name} ({wp.waypoint_type})
              </Text>
            ))}
          </View>
        )}

        {/* Businesses */}
        {selectedBusinesses.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Comercios afiliados ({selectedBusinesses.length})
            </Text>
            {selectedBusinesses.map((b, i) => (
              <Text key={b.business_id} style={[styles.itemText, { color: colors.textSecondary }]}>
                {i + 1}. {b.name} — {b.business_type}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.background, paddingBottom: insets.bottom + 8 },
        ]}
      >
        {isPending ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            <Pressable
              style={[styles.draftButton, { borderColor: colors.primary }]}
              onPress={() => handleSave("borrador")}
            >
              <Ionicons name="document-outline" size={18} color={colors.primary} />
              <Text style={[styles.draftButtonText, { color: colors.primary }]}>
                Guardar borrador
              </Text>
            </Pressable>
            <Pressable
              style={[styles.publishButton, { backgroundColor: colors.primary }]}
              onPress={() => handleSave("publicado")}
            >
              <Ionicons name="rocket-outline" size={18} color="#FFF" />
              <Text style={styles.publishButtonText}>Publicar</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

function StatBox({
  label,
  value,
  icon,
  colors,
}: {
  label: string;
  value: string;
  icon: string;
  colors: any;
}) {
  return (
    <View style={[statStyles.box, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
      <Ionicons name={icon as any} size={20} color={colors.primary} />
      <Text style={[statStyles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[statStyles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 2,
  },
  value: { fontSize: 14, fontWeight: "700" },
  label: { fontSize: 11 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  miniMapWrapper: { height: 180, borderRadius: 12, overflow: "hidden" },
  miniMap: { flex: 1 },
  coverPreview: { height: 140, borderRadius: 12 },
  routeName: { fontSize: 22, fontWeight: "700" },
  description: { fontSize: 14, lineHeight: 20 },
  statsGrid: { flexDirection: "row", gap: 8 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoText: { fontSize: 14 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tagBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  tagText: { fontSize: 12, fontWeight: "600" },
  section: { gap: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  itemText: { fontSize: 13, paddingLeft: 4 },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  draftButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  draftButtonText: { fontSize: 14, fontWeight: "600" },
  publishButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  publishButtonText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
});
