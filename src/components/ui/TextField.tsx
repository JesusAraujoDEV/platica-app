import { View, Text, TextInput, StyleSheet, type TextInputProps } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
}

export function TextField({ label, error, style, ...props }: TextFieldProps) {
  const { theme } = useTheme();
  const borderColor = error ? theme.colors.destructive : theme.colors.surfaceBorder;

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, { color: theme.colors.text, borderColor, backgroundColor: theme.colors.surface }, style]}
        {...props}
      />
      {error ? <Text style={[styles.error, { color: theme.colors.destructive }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    minHeight: 48,
  },
  error: { fontSize: 12 },
});
