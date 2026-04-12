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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  PremiumGate,
  limitWaypointsForPreview,
} from "../components/PremiumGate";
import { RouteDetailMap } from "../components/RouteDetailMap";
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
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const mapSectionRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);
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

  const allPhotos = [
    route.cover_image_url,
    ...(route.photos ?? []),
  ].filter(Boolean) as string[];

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
      <ScrollView ref={scrollViewRef} bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero Carousel */}
        <View style={styles.hero}>
          <FlatList
            data={allPhotos.length > 0 ? allPhotos : [null]}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `photo-${i}`}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActivePhotoIndex(index);
            }}
            renderItem={({ item }) =>
              item ? (
                <Image
                  source={{ uri: item }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[styles.heroImage, { backgroundColor: colors.surfaceSecondary }]}
                />
              )
            }
          />
          {/* Gradient overlay */}
          <View style={styles.heroGradient} pointerEvents="none" />

          {/* Nav bar */}
          <View style={[styles.navBar, { top: insets.top }]}>
            <Pressable
              style={styles.navButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </Pressable>
            <View style={styles.navBarRight}>
              {hasFullAccess && data && (
                <DownloadRouteButton
                  routeId={id!}
                  routeName={route.name}
                  routeData={data}
                  compact
                />
              )}
              <Pressable
                style={styles.navButton}
                onPress={() => toggleSave()}
                disabled={isToggling}
              >
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={22}
                  color={isSaved ? "#FF4D6A" : "#FFFFFF"}
                />
              </Pressable>
            </View>
          </View>

          {/* Bottom indicators */}
          <View style={styles.heroBottomRow}>
            {/* Photo count */}
            {allPhotos.length > 1 && (
              <View style={styles.photoCountBadge}>
                <Ionicons name="images-outline" size={14} color="#FFFFFF" />
                <Text style={styles.photoCountText}>{allPhotos.length}</Text>
              </View>
            )}

            {/* Pagination dots */}
            {allPhotos.length > 1 && (
              <View style={styles.paginationDots}>
                {allPhotos.map((_, i) => (
                  <View
                    key={`dot-${i}`}
                    style={[
                      styles.dot,
                      i === activePhotoIndex ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Mini map thumbnail */}
            {route.route_geojson && (
              <Pressable
                style={styles.miniMapThumb}
                onPress={() => {
                  mapSectionRef.current?.measureLayout(
                    scrollViewRef.current?.getInnerViewNode() as any,
                    (_, y) => scrollViewRef.current?.scrollTo({ y, animated: true }),
                    () => {},
                  );
                }}
              >
                <Ionicons name="map" size={20} color={colors.primary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Content Card */}
        <View style={[styles.contentCard, { backgroundColor: colors.background }]}>
          {/* Row: difficulty + rating + purchases */}
          <View style={styles.metaRow}>
            <View style={[styles.diffBadge, { backgroundColor: diffColor }]}>
              <Text style={styles.diffBadgeText}>{diffLabel}</Text>
            </View>
            {route.total_reviews > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="star" size={14} color="#F5A623" />
                <Text style={[styles.metaText, { color: colors.text }]}>
                  {route.average_rating.toFixed(1)}
                </Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {route.purchase_count ?? 0}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.routeTitle, { color: colors.text }]}>
            {route.name}
          </Text>

          {/* Info chips */}
          <View style={styles.infoChipsRow}>
            <View style={[styles.infoChip, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name="trail-sign-outline" size={14} color={colors.primary} />
              <Text style={[styles.infoChipText, { color: colors.text }]}>{terrainLabel}</Text>
            </View>
            <View style={[styles.infoChip, { backgroundColor: colors.surfaceSecondary }]}>
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

          {/* Stats grid 2x2 */}
          <View style={styles.statsGrid}>
            <View style={[styles.statsGridItem, { borderColor: colors.border }]}>
              <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Duración</Text>
              <Text style={[styles.statsGridValue, { color: colors.text }]}>
                {route.estimated_duration_min
                  ? route.estimated_duration_min >= 60
                    ? `${Math.floor(route.estimated_duration_min / 60)}h ${route.estimated_duration_min % 60}m`
                    : `${route.estimated_duration_min} min`
                  : "—"}
              </Text>
            </View>
            <View style={[styles.statsGridItem, { borderColor: colors.border }]}>
              <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Distancia</Text>
              <Text style={[styles.statsGridValue, { color: colors.text }]}>
                {route.distance_km.toFixed(2)} km
              </Text>
            </View>
            <View style={[styles.statsGridItem, { borderColor: colors.border }]}>
              <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Desnivel</Text>
              <Text style={[styles.statsGridValue, { color: colors.text }]}>
                {route.elevation_gain_m ? `${route.elevation_gain_m} m` : "—"}
              </Text>
            </View>
            <View style={[styles.statsGridItem, { borderColor: colors.border }]}>
              <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Pérdida Elevación</Text>
              <Text style={[styles.statsGridValue, { color: colors.text }]}>
                {route.elevation_loss_m ? `${route.elevation_loss_m} m` : "—"}
              </Text>
            </View>
          </View>
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

        {/* Route Map */}
        {route.route_geojson && (
          <View ref={mapSectionRef} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Mapa de la ruta
            </Text>
            <RouteDetailMap
              routeGeojson={route.route_geojson}
              waypoints={waypoints as RouteWaypoint[]}
              hasAccess={hasFullAccess}
              startCoordinate={[route.start_lng, route.start_lat]}
            />
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
        {!route.is_free && !hasFullAccess ? (
          <Pressable
            style={[styles.footerBtnPrimary, { backgroundColor: colors.premiumBadge, flex: 1 }]}
            onPress={handlePurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                <Text style={styles.footerBtnText}>Comprar por ${route.price} MXN</Text>
              </>
            )}
          </Pressable>
        ) : (
          <>
            <Pressable
              style={[styles.footerBtnPrimary, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={() => toggleSave()}
              disabled={isToggling}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.footerBtnText}>Guardar</Text>
            </Pressable>
            <Pressable
              style={[styles.footerBtnSecondary, { backgroundColor: colors.surfaceSecondary }]}
              onPress={handleStartRoute}
            >
              <Ionicons name="navigate" size={20} color={colors.text} />
            </Pressable>
            <Pressable
              style={[styles.footerBtnSecondary, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => {
                Share.share({
                  message: `Mira esta ruta en Kaelo: ${route.name}`,
                });
              }}
            >
              <Ionicons name="share-outline" size={20} color={colors.text} />
            </Pressable>
          </>
        )}
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
  // Hero carousel
  hero: {
    height: 420,
    position: "relative",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 420,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    top: "50%",
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 200 },
    shadowOpacity: 0.6,
    shadowRadius: 100,
  },
  navBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  navBarRight: {
    flexDirection: "row",
    gap: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBottomRow: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  photoCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  photoCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  paginationDots: {
    flexDirection: "row",
    gap: 6,
    position: "absolute",
    left: 0,
    right: 0,
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  miniMapThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  // Content card
  contentCard: {
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    fontWeight: "600",
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
  routeTitle: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    marginBottom: 12,
  },
  infoChipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statsGridItem: {
    width: "50%",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statsGridLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statsGridValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  // Sections
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
  // Footer
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
  },
  footerBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
  },
  footerBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  footerBtnSecondary: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
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
