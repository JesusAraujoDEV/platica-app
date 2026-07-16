/**
 * Platica color palette — matches the web app's Tailwind theme.
 * Emerald-based brand with neutral surfaces.
 */

export const colors = {
  brand: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669", // primary brand
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },
  destructive: {
    500: "#ef4444",
    600: "#dc2626",
  },
  warning: {
    500: "#f59e0b",
    600: "#d97706",
  },
  info: {
    500: "#3b82f6",
    600: "#2563eb",
  },
} as const;
