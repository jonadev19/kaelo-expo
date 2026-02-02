import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

type OptionVariant = "default" | "toggle" | "value" | "danger";

interface SettingsCardOptionProps {
  icon: IoniconsName;
  label: string;
  subtitle?: string;
  variant?: OptionVariant;
  // Para variant="toggle"
  value?: boolean;
  onToggle?: (value: boolean) => void;
  // Para variant="value"
  displayValue?: string;
  // Para navegación
  onPress?: () => void;
}

export default function SettingsCardOption({
  icon,
  label,
  subtitle,
  variant = "default",
  value,
  onToggle,
  displayValue,
  onPress,
}: SettingsCardOptionProps) {
  const { colors } = useTheme();

  const isDanger = variant === "danger";
  const isToggle = variant === "toggle";
  const hasChevron = variant !== "toggle";

  const iconColor = isDanger ? colors.error : colors.primary;
  const textColor = isDanger ? colors.error : colors.text;

  const content = (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      {/* Icono izquierdo */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDanger
              ? colors.errorBackground
              : colors.primaryLight,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      {/* Contenido central */}
      <View style={styles.content}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Lado derecho */}
      <View style={styles.rightContainer}>
        {isToggle && onToggle && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
            ios_backgroundColor={colors.border}
          />
        )}

        {variant === "value" && displayValue && (
          <Text style={[styles.displayValue, { color: colors.textSecondary }]}>
            {displayValue}
          </Text>
        )}

        {hasChevron && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textTertiary}
            style={styles.chevron}
          />
        )}
      </View>
    </View>
  );

  // Si es toggle, no es touchable (el switch maneja la interacción)
  if (isToggle) {
    return content;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  displayValue: {
    fontSize: 15,
    marginRight: 4,
  },
  chevron: {
    marginLeft: 4,
  },
});
