import { useTheme } from "@/shared/hooks/useTheme";
import { useAuthStore } from "@/shared/store/authStore";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import SettingsCardOption from "../components/SettingsCardOption";

export default function AppSettingsScreen() {
  const { colors } = useTheme();
  const logout = useAuthStore((state) => state.signOut);

  const handleLogout = async () => {
    // Validación básica

    const { error } = await logout();
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.backgroundSecondary },
      ]}
      contentContainerStyle={styles.content}
    >
      {/* PREFERENCIAS DE CICLISMO */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        PREFERENCIAS DE CICLISMO
      </Text>
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <SettingsCardOption
          icon="notifications"
          label="Notificaciones Push"
          variant="toggle"
          value={true}
          onToggle={() => {}}
        />
        <SettingsCardOption
          icon="cart"
          label="Actualizaciones de Pedidos"
          variant="toggle"
          value={true}
          onToggle={() => {}}
        />
        <SettingsCardOption
          icon="trophy"
          label="Nuevos Logros"
          variant="toggle"
          value={true}
          onToggle={() => {}}
        />
        <SettingsCardOption
          icon="pricetag"
          label="Ofertas y Cupones"
          variant="toggle"
          value={false}
          onToggle={() => {}}
        />
        <SettingsCardOption
          icon="mail"
          label="Emails Promocionales"
          variant="toggle"
          value={false}
          onToggle={() => {}}
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
          displayValue="Siempre"
          onPress={() => {}}
        />
        <SettingsCardOption
          icon="person-circle"
          label="Perfil Público"
          variant="toggle"
          value={true}
          onToggle={() => {}}
        />
        <SettingsCardOption
          icon="podium"
          label="Aparecer en Rankings"
          variant="toggle"
          value={true}
          onToggle={() => {}}
        />
        <SettingsCardOption
          icon="download"
          label="Descargar Mis Datos"
          subtitle="Exportar en formato JSON"
          onPress={() => {}}
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
          onPress={() => {}}
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
