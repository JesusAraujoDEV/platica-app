import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type TouchableOpacityProps } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "outline" | "ghost" | "destructive";
  loading?: boolean;
}

export function Button({ title, variant = "primary", loading, style, disabled, ...props }: ButtonProps) {
  const { theme } = useTheme();

  const backgroundColor = {
    primary: theme.colors.primary,
    outline: "transparent",
    ghost: "transparent",
    destructive: theme.colors.destructive,
  }[variant];

  const textColor = {
    primary: theme.colors.primaryForeground,
    outline: theme.colors.text,
    ghost: theme.colors.text,
    destructive: "#ffffff",
  }[variant];

  const borderColor = {
    primary: theme.colors.primary,
    outline: theme.colors.surfaceBorder,
    ghost: "transparent",
    destructive: theme.colors.destructive,
  }[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, borderColor },
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});
