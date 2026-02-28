import { useTheme } from "@/shared/hooks/useTheme";
import { useAuthStore } from "@/shared/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ThemeToggleButton } from "../components/ThemeToggleButton";
import { useProfile } from "../hooks/useProfile";
import { useProfileStats } from "../hooks/useProfileStats";

export default function ProfileHomeScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: stats, isLoading: statsLoading } = useProfileStats();

  const isLoading = profileLoading || statsLoading;

  // Build display values from real data
  const displayName =
    profile?.full_name || user?.email?.split("@")[0] || "Usuario";
  const displayBio = profile?.bio || "Sin biografía aún";
  const avatarUrl = profile?.avatar_url || null;

  const totalDistance = stats?.total_distance_km ?? 0;
  const routesCompleted = stats?.routes_completed ?? 0;
  const uniqueRoutes = stats?.unique_routes ?? 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Avatar y Info del Usuario */}
      <View style={styles.profileSection}>
        <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Ionicons name="person" size={40} color={colors.primary} />
            </View>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ marginTop: 12 }}
          />
        ) : (
          <>
            <Text style={[styles.userName, { color: colors.text }]}>
              {displayName}
            </Text>
            <Text style={[styles.userBio, { color: colors.textSecondary }]}>
              {displayBio}
            </Text>
            {user?.email && (
              <Text style={[styles.userEmail, { color: colors.textTertiary }]}>
                {user.email}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Stats rápidas */}
      <View style={[styles.statsRow, { backgroundColor: colors.surface }]}>
        <StatItem
          label="Distancia"
          value={
            totalDistance > 0
              ? `${totalDistance.toLocaleString("es-MX", { maximumFractionDigits: 0 })} km`
              : "0 km"
          }
          colors={colors}
        />
        <StatItem
          label="Rutas"
          value={routesCompleted.toString()}
          colors={colors}
        />
        <StatItem
          label="Únicas"
          value={uniqueRoutes.toString()}
          colors={colors}
        />
      </View>

      {/* Botón Editar Perfil */}
      <Pressable
        style={[styles.editButton, { borderColor: colors.border }]}
        onPress={() => router.push("/edit-profile" as any)}
      >
        <Text style={[styles.editButtonText, { color: colors.text }]}>
          Editar Perfil
        </Text>
      </Pressable>

      {/* Menú de opciones */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <MenuItem
          icon="heart-outline"
          label="Rutas Guardadas"
          colors={colors}
          onPress={() => router.push("/saved-routes" as any)}
        />
        <MenuItem
          icon="stats-chart-outline"
          label="Estadísticas"
          colors={colors}
          onPress={() => router.push("/metrics" as any)}
        />
        <MenuItem
          icon="receipt-outline"
          label="Mis Pedidos"
          colors={colors}
          onPress={() => router.push("/my-orders" as any)}
        />
        <MenuItem
          icon="cloud-download-outline"
          label="Descargas Offline"
          colors={colors}
          onPress={() => router.push("/downloaded-routes" as any)}
        />
        <MenuItem
          icon="wallet-outline"
          label="Mi Wallet"
          colors={colors}
          onPress={() => router.push("/wallet" as any)}
        />
        <MenuItem
          icon="notifications-outline"
          label="Notificaciones"
          colors={colors}
          onPress={() => router.push("/notifications" as any)}
        />

      </View>

      {/* Sign Out */}
      <Pressable
        style={[
          styles.signOutButton,
          { backgroundColor: colors.errorBackground },
        ]}
        onPress={signOut}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.error} />
        <Text style={[styles.signOutText, { color: colors.error }]}>
          Cerrar Sesión
        </Text>
      </Pressable>

      {/* Theme Toggle (temporal para desarrollo) */}
      <View style={styles.devSection}>
        <Text style={[styles.devLabel, { color: colors.textTertiary }]}>
          Dev: Cambiar tema
        </Text>
        <ThemeToggleButton />
      </View>
    </ScrollView>
  );
}

// Helper components
function StatItem({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  value,
  badge,
  colors,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  badge?: number;
  colors: any;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={22} color={colors.textSecondary} />
        <Text style={[styles.menuItemLabel, { color: colors.text }]}>
          {label}
        </Text>
      </View>
      <View style={styles.menuItemRight}>
        {value && (
          <Text style={[styles.menuItemValue, { color: colors.textSecondary }]}>
            {value}
          </Text>
        )}
        {badge && (
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.textTertiary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 12,
  },
  userBio: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  userEmail: {
    fontSize: 12,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  editButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuItemLabel: {
    fontSize: 16,
  },
  menuItemValue: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "600",
  },
  devSection: {
    marginTop: 32,
    alignItems: "center",
    gap: 8,
  },
  devLabel: {
    fontSize: 12,
  },
});
