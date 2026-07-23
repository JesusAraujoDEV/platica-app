import { Text, TouchableOpacity, StyleSheet, type TouchableOpacityProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";

interface FabProps extends TouchableOpacityProps {
  /** Ionicons name. Default "add". */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Optional label — renders an extended pill FAB when set. */
  label?: string;
}

export function Fab({ icon = "add", label, style, ...props }: FabProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      style={[styles.fab, label ? styles.extended : styles.round, { backgroundColor: theme.colors.primary }, style]}
      {...props}
    >
      <Ionicons name={icon} size={24} color={theme.colors.primaryForeground} />
      {label ? <Text style={[styles.label, { color: theme.colors.primaryForeground }]}>{label}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  round: { width: 56, height: 56, borderRadius: 28 },
  extended: { height: 52, borderRadius: 26, paddingHorizontal: 20, gap: 8 },
  label: { fontSize: 16, fontWeight: "700" },
});
