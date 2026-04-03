import { updateSettings } from "@/features/profile/api";
import { useTheme } from "@/shared/hooks/useTheme";
import { useAuthStore } from "@/shared/store/authStore";
import { useLocationStore } from "@/shared/store/useLocationStore";
import { useSettingsStore } from "@/shared/store/useSettingsStore";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SettingsCardOption from "../components/SettingsCardOption";

function getLocationLabel(permission: boolean | null): string {
  if (permission === true) return "Permitido";
  if (permission === false) return "Denegado";
  return "No definido";
}

export default function AppSettingsScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.signOut);
  const locationPermission = useLocationStore((s) => s.permission);
  const checkPermission = useLocationStore((s) => s.checkPermission);

  const {
    push_enabled,
    order_updates,
    new_achievements,
    offers_coupons,
    promotional_emails,
    show_profile,
    show_in_rankings,
    isLoading,
    loadSettings,
    toggleSetting,
  } = useSettingsStore();

  useEffect(() => {
    if (user?.id) {
      loadSettings(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    checkPermission();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar Cuenta",
      "Esta acción no se puede deshacer. Tu cuenta será desactivada y no podrás acceder a ella.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            if (!user?.id) return;
            try {
              await updateSettings(user.id, {
                deactivated: true,
                deactivated_at: new Date().toISOString(),
              });
              await logout();
            } catch {
              Alert.alert("Error", "No se pudo eliminar la cuenta. Intenta de nuevo.");
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      contentContainerStyle={styles.content}
    >
      {/* NOTIFICACIONES */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        NOTIFICACIONES
      </Text>
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <SettingsCardOption
          icon="notifications"
          label="Notificaciones Push"
          variant="toggle"
          value={push_enabled}
          onToggle={(v) => toggleSetting("push_enabled", v)}
        />
        <SettingsCardOption
          icon="cart"
          label="Actualizaciones de Pedidos"
          variant="toggle"
          value={order_updates}
          onToggle={(v) => toggleSetting("order_updates", v)}
        />
        <SettingsCardOption
          icon="trophy"
          label="Nuevos Logros"
          variant="toggle"
          value={new_achievements}
          onToggle={(v) => toggleSetting("new_achievements", v)}
        />
        <SettingsCardOption
          icon="pricetag"
          label="Ofertas y Cupones"
          variant="toggle"
          value={offers_coupons}
          onToggle={(v) => toggleSetting("offers_coupons", v)}
        />
        <SettingsCardOption
          icon="mail"
          label="Emails Promocionales"
          variant="toggle"
          value={promotional_emails}
          onToggle={(v) => toggleSetting("promotional_emails", v)}
        />
      </View>

      {/* PRIVACIDAD Y DATOS */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        PRIVACIDAD Y DATOS
      </Text>
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <SettingsCardOption
          icon="location"
          label="Permisos de Ubicación"
          variant="value"
          displayValue={getLocationLabel(locationPermission)}
          onPress={() => Linking.openSettings()}
        />
        <SettingsCardOption
          icon="person-circle"
          label="Perfil Público"
          variant="toggle"
          value={show_profile}
          onToggle={(v) => toggleSetting("show_profile", v)}
        />
        <SettingsCardOption
          icon="podium"
          label="Aparecer en Rankings"
          variant="toggle"
          value={show_in_rankings}
          onToggle={(v) => toggleSetting("show_in_rankings", v)}
        />
        <SettingsCardOption
          icon="download"
          label="Descargar Mis Datos"
          subtitle="Exportar en formato JSON"
          onPress={() => Alert.alert("Próximamente", "Esta función estará disponible pronto.")}
        />
      </View>

      {/* ZONA DE PELIGRO */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        ZONA DE PELIGRO
      </Text>
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <SettingsCardOption
          icon="log-out"
          label="Cerrar Sesión"
          variant="danger"
          onPress={handleLogout}
        />
        <SettingsCardOption
          icon="trash"
          label="Eliminar Cuenta"
          subtitle="Esta acción es irreversible"
          variant="danger"
          onPress={handleDeleteAccount}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
});
