import { difficulty as difficultyColors } from "@/constants/Colors";
import { useToggleSave } from "@/features/favorites/hooks/useToggleSave";
import { DownloadRouteButton } from "@/features/offline/components/DownloadRouteButton";
import {
  useRoutePurchase,
  useRoutePurchaseCheck,
} from "@/features/payments/hooks/usePayment";
import { ReviewCard } from "@/features/reviews/components/ReviewCard";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";
import { StarRating } from "@/features/reviews/components/StarRating";
import { useRouteReviews } from "@/features/reviews/hooks/useRouteReviews";
import { useTheme } from "@/shared/hooks/useTheme";
import { useAuthStore } from "@/shared/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  PremiumGate,
  limitWaypointsForPreview,
} from "../components/PremiumGate";
import { WaypointItem } from "../components/WaypointItem";
import { useRouteDetail } from "../hooks/useRouteDetail";
import type { RouteBusinessItem, RouteWaypoint } from "../types";

const SCREEN_WIDTH = Dimensions.get("window").width;

const DIFF_LABELS: Record<string, string> = {
  facil: "Fácil",
  moderada: "Moderada",
  dificil: "Difícil",
  experto: "Experto",
};

const DIFF_COLORS: Record<string, string> = {
  facil: difficultyColors.easy,
  moderada: difficultyColors.moderate,
  dificil: difficultyColors.hard,
  experto: difficultyColors.expert,
};

const TERRAIN_LABELS: Record<string, string> = {
  asfalto: "Asfalto",
  terraceria: "Terracería",
  mixto: "Mixto",
};

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, error } = useRouteDetail(id ?? "");
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSaved, toggle: toggleSave, isToggling } = useToggleSave(id ?? "");
  const { data: reviews = [] } = useRouteReviews(id ?? "");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { purchaseRoute, isPurchasing } = useRoutePurchase();
  const { data: purchaseCheck } = useRoutePurchaseCheck(id ?? "");

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !data?.route) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          No se pudo cargar la ruta
        </Text>
        <Pressable
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const { route, waypoints, businesses } = data;
  const diffColor = DIFF_COLORS[route.difficulty] ?? colors.textSecondary;
  const diffLabel = DIFF_LABELS[route.difficulty] ?? route.difficulty;
  const terrainLabel = TERRAIN_LABELS[route.terrain_type] ?? route.terrain_type;

  // Premium access logic
  const isCreator = user?.id === route.creator_id;
  const hasPurchased = purchaseCheck?.purchased ?? false;
  const hasFullAccess = route.is_free || isCreator || hasPurchased;

  // Limit waypoints for premium preview
  const {
    visible: visibleWaypoints,
    totalHidden,
    isLimited,
  } = limitWaypointsForPreview<RouteWaypoint>(
    waypoints as RouteWaypoint[],
    route.is_free,
    hasPurchased,
    isCreator,
  );

  const handlePurchase = () => {
    if (!user) {
      Alert.alert("Inicia sesión", "Debes iniciar sesión para comprar rutas.");
      return;
    }
    purchaseRoute({ routeId: route.id, price: route.price });
  };

  const handleStartRoute = () => {
    if (!hasFullAccess) {
      handlePurchase();
      return;
    }
    router.push({
      pathname: "/navigation" as any,
      params: { id: route.id },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.hero}>
          {route.cover_image_url ? (
            <Image
              source={{ uri: route.cover_image_url }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.heroImage,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            />
          )}
          {/* Gradient overlay */}
          <View style={styles.heroOverlay} />

          {/* Navigation bar */}
          <View style={[styles.navBar, { top: insets.top }]}>
            <Pressable
              style={[
                styles.navButton,
                { backgroundColor: "rgba(0,0,0,0.35)" },
              ]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={[
                styles.navButton,
                { backgroundColor: "rgba(0,0,0,0.35)" },
              ]}
              onPress={() => toggleSave()}
              disabled={isToggling}
            >
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={22}
                color={isSaved ? "#FF4D6A" : "#FFFFFF"}
              />
            </Pressable>
            {hasFullAccess && data && (
              <DownloadRouteButton
                routeId={id!}
                routeName={route.name}
                routeData={data}
                compact
              />
            )}
          </View>

          {/* Hero title */}
          <View style={[styles.heroContent, { bottom: 20 }]}>
            <View style={[styles.diffBadge, { backgroundColor: diffColor }]}>
              <Text style={styles.diffBadgeText}>{diffLabel}</Text>
            </View>
            <Text style={styles.heroTitle}>{route.name}</Text>
            {route.municipality && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#FFFFFFCC" />
                <Text style={styles.locationText}>{route.municipality}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Bar */}
        <View
          style={[
            styles.statsBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <StatItem
            icon="navigate-outline"
            value={`${route.distance_km} km`}
            label="Distancia"
            colors={colors}
          />
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <StatItem
            icon="trending-up-outline"
            value={route.elevation_gain_m ? `${route.elevation_gain_m} m` : "—"}
            label="Elevación"
            colors={colors}
          />
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <StatItem
            icon="time-outline"
            value={
              route.estimated_duration_min
                ? `${route.estimated_duration_min} min`
                : "—"
            }
            label="Duración"
            colors={colors}
          />
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <StatItem
            icon="star"
            value={
              route.total_reviews > 0 ? route.average_rating.toFixed(1) : "—"
            }
            label={
              route.total_reviews > 0
                ? `${route.total_reviews} reseñas`
                : "Sin reseñas"
            }
            colors={colors}
          />
        </View>

        {/* Description */}
        {route.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Descripción
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {route.description}
            </Text>
          </View>
        )}

        {/* Info chips */}
        <View style={styles.infoChipsRow}>
          <View
            style={[
              styles.infoChip,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Ionicons
              name="trail-sign-outline"
              size={14}
              color={colors.primary}
            />
            <Text style={[styles.infoChipText, { color: colors.text }]}>
              {terrainLabel}
            </Text>
          </View>
          <View
            style={[
              styles.infoChip,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Ionicons
              name={route.is_free ? "pricetag-outline" : "card-outline"}
              size={14}
              color={route.is_free ? colors.freeBadge : colors.premiumBadge}
            />
            <Text style={[styles.infoChipText, { color: colors.text }]}>
              {route.is_free ? "Gratis" : `$${route.price} MXN`}
            </Text>
          </View>
        </View>

        {/* Route Map */}
        {(route.route_geojson || route.start_lat) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Mapa de la ruta
            </Text>
            <View style={[styles.mapContainer, { borderColor: colors.border }]}>
              <Mapbox.MapView
                style={styles.mapView}
                styleURL={
                  isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Outdoors
                }
                scrollEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                logoEnabled={false}
                attributionEnabled={false}
                scaleBarEnabled={false}
              >
                <Mapbox.Camera
                  defaultSettings={{
                    centerCoordinate: [route.start_lng, route.start_lat],
                    zoomLevel: 12,
                  }}
                />
                {/* Route path — only show full path if user has access */}
                {route.route_geojson && hasFullAccess && (
                  <Mapbox.ShapeSource
                    id="route-path"
                    shape={{
                      type: "Feature",
                      properties: {},
                      geometry: route.route_geojson,
                    }}
                  >
                    <Mapbox.LineLayer
                      id="route-line"
                      style={{
                        lineColor: colors.mapRoute,
                        lineWidth: 4,
                        lineCap: "round",
                        lineJoin: "round",
                      }}
                    />
                  </Mapbox.ShapeSource>
                )}
                {/* Premium: show only first 20% of route as preview */}
                {route.route_geojson && !hasFullAccess && (
                  <Mapbox.ShapeSource
                    id="route-path-preview"
                    shape={{
                      type: "Feature",
                      properties: {},
                      geometry: {
                        type: "LineString",
                        coordinates: route.route_geojson.coordinates.slice(
                          0,
                          Math.max(
                            2,
                            Math.floor(
                              route.route_geojson.coordinates.length * 0.2,
                            ),
                          ),
                        ),
                      },
                    }}
                  >
                    <Mapbox.LineLayer
                      id="route-line-preview"
                      style={{
                        lineColor: colors.mapRoute,
                        lineWidth: 4,
                        lineCap: "round",
                        lineJoin: "round",
                        lineOpacity: 0.5,
                        lineDasharray: [4, 3],
                      }}
                    />
                  </Mapbox.ShapeSource>
                )}
                {/* Waypoint markers — only visible ones */}
                {visibleWaypoints.map((wp: RouteWaypoint) => (
                  <Mapbox.PointAnnotation
                    key={wp.id}
                    id={`wp-${wp.id}`}
                    coordinate={[wp.lng, wp.lat]}
                  >
                    <View
                      style={[
                        styles.waypointDot,
                        {
                          backgroundColor: "#FFFFFF",
                          borderColor: colors.mapPOI,
                        },
                      ]}
                    />
                  </Mapbox.PointAnnotation>
                ))}
              </Mapbox.MapView>
              {/* Premium overlay on map */}
              {!hasFullAccess && (
                <View style={styles.mapPremiumOverlay}>
                  <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
                  <Text style={styles.mapPremiumText}>
                    Track completo disponible con la compra
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Waypoints */}
        {waypoints.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Puntos de interés ({waypoints.length})
            </Text>
            {visibleWaypoints.map((wp: RouteWaypoint, index: number) => (
              <WaypointItem
                key={wp.id}
                name={wp.name}
                description={wp.description}
                waypointType={wp.waypoint_type}
                orderIndex={wp.order_index}
                isLast={!isLimited && index === visibleWaypoints.length - 1}
              />
            ))}
            {isLimited && (
              <View
                style={[
                  styles.lockedWaypoints,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.premiumBadge}
                />
                <Text
                  style={[styles.lockedText, { color: colors.textSecondary }]}
                >
                  +{totalHidden} puntos de interés más disponibles con la compra
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Nearby Businesses — only for users with access */}
        {businesses.length > 0 && hasFullAccess && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Comercios cercanos ({businesses.length})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.businessCarousel}
            >
              {(businesses as RouteBusinessItem[]).map((biz) => (
                <Pressable
                  key={biz.id}
                  style={[
                    styles.bizCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/business-detail" as any,
                      params: { id: biz.id },
                    })
                  }
                >
                  {biz.cover_image_url ? (
                    <Image
                      source={{ uri: biz.cover_image_url }}
                      style={styles.bizImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.bizImage,
                        { backgroundColor: colors.surfaceSecondary },
                      ]}
                    />
                  )}
                  <View style={styles.bizContent}>
                    <Text
                      style={[styles.bizName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {biz.name}
                    </Text>
                    <Text
                      style={[styles.bizType, { color: colors.textSecondary }]}
                    >
                      {biz.business_type}
                    </Text>
                    {biz.distance_from_route_m != null && (
                      <Text
                        style={[
                          styles.bizDistance,
                          { color: colors.textTertiary },
                        ]}
                      >
                        A {(biz.distance_from_route_m / 1000).toFixed(1)} km
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Premium Gate CTA */}
        {!route.is_free && !hasFullAccess && (
          <PremiumGate
            routeId={route.id}
            creatorId={route.creator_id}
            currentUserId={user?.id}
            price={route.price}
            isFree={route.is_free}
            isPurchasing={isPurchasing}
            onPurchase={handlePurchase}
          >
            <></>
          </PremiumGate>
        )}

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Reseñas
            </Text>
            {route.total_reviews > 0 && (
              <View style={styles.ratingBadge}>
                <StarRating rating={route.average_rating} size={14} />
                <Text
                  style={[styles.ratingText, { color: colors.textSecondary }]}
                >
                  {route.average_rating?.toFixed(1)} ({route.total_reviews})
                </Text>
              </View>
            )}
          </View>

          {reviews.length > 0 ? (
            <View style={{ gap: 10 }}>
              {reviews.slice(0, 3).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Aún no hay reseñas. ¡Sé el primero!
            </Text>
          )}

          <Pressable
            style={[styles.reviewButton, { borderColor: colors.primary }]}
            onPress={() => setShowReviewForm(true)}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
            <Text style={[styles.reviewButtonText, { color: colors.primary }]}>
              Escribir Reseña
            </Text>
          </Pressable>
        </View>

        {/* Tags */}
        {route.tags && route.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Etiquetas
            </Text>
            <View style={styles.tagsRow}>
              {route.tags.map((tag: string) => (
                <View
                  key={tag}
                  style={[
                    styles.tag,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <Text
                    style={[styles.tagText, { color: colors.textSecondary }]}
                  >
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom spacer for sticky button */}
        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>

      {/* Sticky footer */}
      <View
        style={[
          styles.stickyFooter,
          {
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + 12,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Pressable
          style={[
            styles.startButton,
            {
              backgroundColor: hasFullAccess
                ? colors.primary
                : colors.premiumBadge,
            },
          ]}
          onPress={handleStartRoute}
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : hasFullAccess ? (
            <>
              <Ionicons name="navigate" size={20} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Iniciar Ruta</Text>
            </>
          ) : (
            <>
              <Ionicons name="card-outline" size={20} color="#FFFFFF" />
              <Text style={styles.startButtonText}>
                Comprar por ${route.price} MXN
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Review Form Modal */}
      <ReviewForm
        routeId={id ?? ""}
        visible={showReviewForm}
        onClose={() => setShowReviewForm(false)}
      />
    </View>
  );
}

// Helper component for stats bar
function StatItem({
  icon,
  value,
  label,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  colors: any;
}) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 15,
  },
  backButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  hero: {
    height: 280,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  navBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    position: "absolute",
    left: 20,
    right: 20,
    gap: 6,
  },
  diffBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  diffBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    color: "#FFFFFFCC",
    fontSize: 13,
  },
  statsBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: -24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: "80%",
    alignSelf: "center",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  infoChipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  infoChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  mapView: {
    flex: 1,
  },
  mapPremiumOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  mapPremiumText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  waypointDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4,
  },
  businessCarousel: {
    gap: 12,
  },
  bizCard: {
    width: 160,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  bizImage: {
    width: "100%",
    height: 90,
  },
  bizContent: {
    padding: 10,
    gap: 2,
  },
  bizName: {
    fontSize: 13,
    fontWeight: "600",
  },
  bizType: {
    fontSize: 11,
    textTransform: "capitalize",
  },
  bizDistance: {
    fontSize: 11,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 12,
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 14,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingText: {
    fontSize: 13,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 16,
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  lockedWaypoints: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  lockedText: {
    flex: 1,
    fontSize: 13,
  },
});
