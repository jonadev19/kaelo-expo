import Colors from "@/constants/Colors";
import { ThemeStore } from "@/shared/store/themeStore";
import { useColorScheme as useSystemColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

export function useTheme() {
  const systemTheme = useSystemColorScheme();
  const { mode } = ThemeStore();

  // Determinar qué tema usar
  const getActiveTheme = (): ColorScheme => {
    if (mode === "system") {
      return systemTheme === "dark" ? "dark" : "light";
    }
    return mode as ColorScheme;
  };

  const activeTheme = getActiveTheme();

  return {
    theme: activeTheme,
    mode, // 'light' | 'dark' | 'system'
    colors: Colors[activeTheme],
    isDark: activeTheme === "dark",
  };
}
