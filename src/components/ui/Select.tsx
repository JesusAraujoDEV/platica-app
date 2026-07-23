import { useState } from "react";
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";

export interface SelectOption<T extends string | number> {
  label: string;
  value: T;
}

interface SelectProps<T extends string | number> {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  error?: string | null;
}

// RN has no native <select>; this opens a Modal option list. Generic over the
// option value type so callers keep their id typing (string or number).
export function Select<T extends string | number>({ options, value, onChange, label, placeholder = "Selecciona una opción", error }: SelectProps<T>) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const borderColor = error ? theme.colors.destructive : theme.colors.surfaceBorder;

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.field, { borderColor, backgroundColor: theme.colors.surface }]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
      >
        <Text style={{ color: selected ? theme.colors.text : theme.colors.textMuted, fontSize: 16 }}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.colors.icon} />
      </TouchableOpacity>
      {error ? <Text style={[styles.error, { color: theme.colors.destructive }]}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.panel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, { borderBottomColor: theme.colors.surfaceBorder }]}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: active ? "700" : "400" }}>{item.label}</Text>
                    {active ? <Ionicons name="checkmark" size={18} color={theme.colors.primary} /> : null}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  error: { fontSize: 12 },
  backdrop: { flex: 1, justifyContent: "center", padding: 32, backgroundColor: "rgba(0,0,0,0.5)" },
  panel: { borderRadius: 12, borderWidth: 1, maxHeight: "70%", overflow: "hidden" },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
