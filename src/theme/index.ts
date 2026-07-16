import { colors } from "./colors";

export type ThemeMode = "light" | "dark";

export interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    primaryForeground: string;
    background: string;
    surface: string;
    surfaceBorder: string;
    text: string;
    textMuted: string;
    destructive: string;
    icon: string;
    tabBar: string;
    tabBarBorder: string;
    tabBarActive: string;
    tabBarInactive: string;
  };
}

export const lightTheme: Theme = {
  mode: "light",
  colors: {
    primary: colors.brand[600],
    primaryForeground: "#ffffff",
    background: "#ffffff",
    surface: "#ffffff",
    surfaceBorder: colors.neutral[200],
    text: colors.neutral[900],
    textMuted: colors.neutral[500],
    destructive: colors.destructive[600],
    icon: colors.neutral[600],
    tabBar: "#ffffff",
    tabBarBorder: colors.neutral[200],
    tabBarActive: colors.brand[600],
    tabBarInactive: colors.neutral[400],
  },
};

export const darkTheme: Theme = {
  mode: "dark",
  colors: {
    primary: colors.brand[400],
    primaryForeground: colors.neutral[900],
    background: colors.neutral[950],
    surface: colors.neutral[900],
    surfaceBorder: colors.neutral[800],
    text: colors.neutral[50],
    textMuted: colors.neutral[400],
    destructive: colors.destructive[500],
    icon: colors.neutral[400],
    tabBar: colors.neutral[900],
    tabBarBorder: colors.neutral[800],
    tabBarActive: colors.brand[400],
    tabBarInactive: colors.neutral[500],
  },
};

export { colors };
