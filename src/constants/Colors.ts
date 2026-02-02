// constants/Colors.ts - Kaelo Design System (Compatible con Themed.tsx)

const brand = {
  primary: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },
  secondary: {
    50: "#F0F9FF",
    100: "#E0F2FE",
    200: "#BAE6FD",
    300: "#7DD3FC",
    400: "#38BDF8",
    500: "#0EA5E9",
    600: "#0284C7",
    700: "#0369A1",
    800: "#075985",
    900: "#0C4A6E",
  },
  accent: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316",
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
  },
};

const neutrals = {
  white: "#FFFFFF",
  black: "#000000",
  gray: {
    50: "#FAFAF9",
    100: "#F5F5F4",
    200: "#E7E5E4",
    300: "#D6D3D1",
    400: "#A8A29E",
    500: "#78716C",
    600: "#57534E",
    700: "#44403C",
    800: "#292524",
    900: "#1C1917",
  },
};

// Colores de dificultad y categorías (exportados por separado)
export const difficulty = {
  easy: "#22C55E",
  moderate: "#EAB308",
  hard: "#F97316",
  expert: "#EF4444",
};

export const categories = {
  food: "#F97316",
  water: "#0EA5E9",
  repair: "#8B5CF6",
  rest: "#10B981",
  attraction: "#EC4899",
};

// Theme colors - MISMO SHAPE para light y dark
const Colors = {
  light: {
    // Core text
    text: neutrals.gray[900],
    textSecondary: neutrals.gray[500],
    textTertiary: neutrals.gray[400],
    textInverse: neutrals.white,

    // Backgrounds
    background: neutrals.white,
    backgroundSecondary: neutrals.gray[50],
    surface: neutrals.white,
    surfaceSecondary: neutrals.gray[100],

    // Borders
    border: neutrals.gray[200],
    borderLight: neutrals.gray[100],

    // Brand colors
    primary: brand.primary[500],
    primaryLight: brand.primary[100],
    primaryDark: brand.primary[700],
    secondary: brand.secondary[500],
    secondaryLight: brand.secondary[100],
    accent: brand.accent[500],
    accentLight: brand.accent[100],

    // Navigation (compatibilidad con tu código existente)
    tint: brand.primary[500],
    tabIconDefault: neutrals.gray[400],
    tabIconSelected: brand.primary[500],

    // Interactive elements
    buttonPrimary: brand.primary[500],
    buttonPrimaryPressed: brand.primary[600],
    buttonSecondary: neutrals.white,
    buttonDisabled: neutrals.gray[300],
    link: brand.primary[600],

    // Semantic
    success: "#22C55E",
    successBackground: "#DCFCE7",
    warning: "#EAB308",
    warningBackground: "#FEF9C3",
    error: "#EF4444",
    errorBackground: "#FEE2E2",
    info: "#3B82F6",
    infoBackground: "#DBEAFE",

    // Feature-specific
    mapRoute: brand.secondary[500],
    mapRouteCompleted: brand.primary[500],
    mapPOI: brand.accent[500],
    priceTag: brand.accent[500],
    premiumBadge: brand.accent[500],
    freeBadge: brand.primary[500],
    rating: "#FBBF24",

    // Cards
    card: neutrals.white,
    cardBorder: neutrals.gray[200],
    shadow: neutrals.black,

    // Input
    inputBackground: neutrals.white,
    inputBorder: neutrals.gray[300],
    inputPlaceholder: neutrals.gray[400],

    // Overlay
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  dark: {
    // Core text
    text: neutrals.gray[50],
    textSecondary: neutrals.gray[400],
    textTertiary: neutrals.gray[500],
    textInverse: neutrals.white,

    // Backgrounds
    background: neutrals.gray[900],
    backgroundSecondary: neutrals.gray[800],
    surface: neutrals.gray[800],
    surfaceSecondary: neutrals.gray[700],

    // Borders
    border: neutrals.gray[700],
    borderLight: neutrals.gray[800],

    // Brand colors
    primary: brand.primary[400],
    primaryLight: brand.primary[900],
    primaryDark: brand.primary[300],
    secondary: brand.secondary[400],
    secondaryLight: brand.secondary[900],
    accent: brand.accent[400],
    accentLight: brand.accent[900],

    // Navigation
    tint: brand.primary[400],
    tabIconDefault: neutrals.gray[500],
    tabIconSelected: brand.primary[400],

    // Interactive elements
    buttonPrimary: brand.primary[500],
    buttonPrimaryPressed: brand.primary[400],
    buttonSecondary: neutrals.gray[800],
    buttonDisabled: neutrals.gray[700],
    link: brand.primary[400],

    // Semantic
    success: "#4ADE80",
    successBackground: "#052E16",
    warning: "#FACC15",
    warningBackground: "#422006",
    error: "#F87171",
    errorBackground: "#450A0A",
    info: "#60A5FA",
    infoBackground: "#172554",

    // Feature-specific
    mapRoute: brand.secondary[400],
    mapRouteCompleted: brand.primary[400],
    mapPOI: brand.accent[400],
    priceTag: brand.accent[400],
    premiumBadge: brand.accent[400],
    freeBadge: brand.primary[400],
    rating: "#FBBF24",

    // Cards
    card: neutrals.gray[800],
    cardBorder: neutrals.gray[700],
    shadow: neutrals.black,

    // Input
    inputBackground: neutrals.gray[800],
    inputBorder: neutrals.gray[600],
    inputPlaceholder: neutrals.gray[500],

    // Overlay
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

// Exportar escalas completas para uso directo cuando se necesiten
export { brand, neutrals };

// Type para autocompletado
export type ThemeColors = typeof Colors.light;
export type ColorName = keyof ThemeColors;

export default Colors;
