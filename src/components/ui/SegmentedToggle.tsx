import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

export interface SegmentedOption<T extends string | number> {
  label: string;
  value: T;
}

interface SegmentedToggleProps<T extends string | number> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedToggle<T extends string | number>({ options, value, onChange }: SegmentedToggleProps<T>) {
  const { theme } = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <TouchableOpacity
            key={String(option.value)}
            style={[styles.pill, active && { backgroundColor: theme.colors.primary }]}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, { color: active ? theme.colors.primaryForeground : theme.colors.textMuted }]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", borderRadius: 10, borderWidth: 1, padding: 3, gap: 3 },
  pill: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 14, fontWeight: "600" },
});
