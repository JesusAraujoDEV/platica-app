import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";

export function DashboardScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      <View style={styles.header}>
        <Text style={[styles.brand, { color: theme.colors.primary }]}>Platica</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t("dashboard.title")}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          {t("dashboard.subtitle")}
        </Text>
      </View>

      <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder }]}>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          {t("dashboard.emptyTitle")}
        </Text>
        <Text style={[styles.emptyDesc, { color: theme.colors.textMuted }]}>
          {t("dashboard.emptyDescription")}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  brand: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
