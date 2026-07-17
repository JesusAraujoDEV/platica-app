import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/ThemeContext";

export function RemoteState({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry: () => void }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  if (loading) {
    return <ActivityIndicator style={styles.state} size="large" color={theme.colors.primary} />;
  }
  if (!error) return null;
  return (
    <View style={styles.state}>
      <Text style={[styles.error, { color: theme.colors.destructive }]}>{error}</Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={onRetry}>
        <Text style={{ color: theme.colors.primaryForeground, fontWeight: "700" }}>{t("common.retry")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  state: { paddingVertical: 32, alignItems: "center" },
  error: { textAlign: "center", lineHeight: 20 },
  button: { marginTop: 16, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
});
