import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ThemeToggleButton } from "../components/ThemeToggleButton";

export default function ProfileHomeScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Avatar y Info del Usuario */}
      <View style={styles.profileSection}>
        <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=8" }}
            style={styles.avatar}
          />
        </View>

        <Text style={[styles.userName, { color: colors.text }]}>
          Jonathan Pérez
        </Text>

        <Text style={[styles.userBio, { color: colors.textSecondary }]}>
          🚴 Ciclista urbano | Explorador de cenotes
        </Text>
      </View>

      {/* Stats rápidas */}
      <View style={[styles.statsRow, { backgroundColor: colors.surface }]}>
        <StatItem label="Distancia" value="1,245 km" colors={colors} />
        <StatItem label="Rutas" value="47" colors={colors} />
        <StatItem label="Logros" value="15" colors={colors} />
      </View>

      {/* Botón Editar Perfil */}
      <Pressable
        style={[styles.editButton, { borderColor: colors.border }]}
        onPress={() => {}}
      >
        <Text style={[styles.editButtonText, { color: colors.text }]}>
          Editar Perfil
        </Text>
      </Pressable>

      {/* Sección de Estadísticas del Mes */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          📊 Este Mes
        </Text>

        <View style={styles.metricsGrid}>
          <MetricCard
            icon="bicycle-outline"
            value="245.5 km"
            change="+15.2%"
            colors={colors}
          />
          <MetricCard
            icon="flame-outline"
            value="9,560 cal"
            change="+14.9%"
            colors={colors}
          />
          <MetricCard
            icon="speedometer-outline"
            value="23.8 km/h"
            change="+5.8%"
            colors={colors}
          />
          <MetricCard
            icon="trophy-outline"
            value="4 logros"
            change="Nuevo!"
            colors={colors}
          />
        </View>
      </View>

      {/* Menú de opciones */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <MenuItem
          icon="wallet-outline"
          label="Mi Wallet"
          value="$1,250 MXN"
          colors={colors}
        />
        <MenuItem
          icon="pricetag-outline"
          label="Mis Cupones"
          badge={2}
          colors={colors}
        />
        <MenuItem
          icon="heart-outline"
          label="Rutas Guardadas"
          colors={colors}
        />
        <MenuItem
          icon="stats-chart-outline"
          label="Estadísticas"
          colors={colors}
        />
      </View>

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

// Componentes auxiliares
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

function MetricCard({
  icon,
  value,
  change,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  change: string;
  colors: any;
}) {
  return (
    <View
      style={[styles.metricCard, { backgroundColor: colors.surfaceSecondary }]}
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricChange, { color: colors.success }]}>
        {change}
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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  badge?: number;
  colors: any;
}) {
  return (
    <Pressable
      style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
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

  // Profile Section
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
  userName: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 12,
  },
  userBio: {
    fontSize: 14,
    marginTop: 4,
  },

  // Stats Row
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

  // Edit Button
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

  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricCard: {
    width: "48%",
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  metricChange: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Menu Items
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

  // Dev Section
  devSection: {
    marginTop: 32,
    alignItems: "center",
    gap: 8,
  },
  devLabel: {
    fontSize: 12,
  },
});
