import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

interface Props {
  icon: IoniconsName;
  onPress?: () => void;
  style?: ViewStyle;
}

export const MapButton = ({ icon, style, onPress }: Props) => {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.floatingButton,
        {
          backgroundColor: colors.buttonPrimary,
          // iOS shadows
          shadowColor: isDark ? "#000" : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.5 : 0.3,
          shadowRadius: 8,
        },
        style,
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons name={icon} size={24} color={colors.textInverse} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    // Android shadow
    elevation: 8,
  },
});
