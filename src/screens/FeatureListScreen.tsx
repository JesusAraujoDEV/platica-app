import { useCallback } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RemoteState } from "@/components/RemoteState";
import { useRemoteData } from "@/hooks/useRemoteData";
import { FEATURE_DEFINITIONS, fetchFeatureData, type FeatureSlug } from "@/services/finance";
import { useTheme } from "@/theme/ThemeContext";

function displayValue(value: unknown) {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(2);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function FeatureListScreen() {
  const { slug } = useLocalSearchParams<{ slug: FeatureSlug }>();
  const definition = FEATURE_DEFINITIONS.find((feature) => feature.slug === slug);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const validSlug = definition?.slug;
  const loader = useCallback(
    () => (validSlug ? fetchFeatureData(validSlug) : Promise.resolve([])),
    [validSlug],
  );
  const { data, loading, error, reload } = useRemoteData(loader);

  if (!definition) {
    return <View style={[styles.center, { backgroundColor: theme.colors.background }]}><Text style={{ color: theme.colors.text }}>{t("common.notFound")}</Text></View>;
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      data={data ?? []}
      keyExtractor={(item, index) => String(item.id ?? `${slug}-${index}`)}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}
      ListHeaderComponent={(
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t(definition.titleKey)}</Text>
        </View>
      )}
      ListEmptyComponent={loading || error
        ? <RemoteState loading={loading} error={error} onRetry={() => void reload()} />
        : <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{t("common.noData")}</Text>}
      renderItem={({ item }) => {
        const entries = Object.entries(item)
          .filter(([key, value]) => key !== "id" && value != null)
          .slice(0, 6);
        const heading = String(item.name ?? item.description ?? item.contactName ?? item.section ?? item.date ?? t(definition.titleKey));
        return (
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{heading}</Text>
            {entries.map(([key, value]) => (
              <View key={key} style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: theme.colors.textMuted }]}>{key.replaceAll("_", " ")}</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]} numberOfLines={2}>{displayValue(value)}</Text>
              </View>
            ))}
          </View>
        );
      }}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  back: { padding: 8, marginLeft: -8, marginRight: 8 },
  title: { fontSize: 26, fontWeight: "700", flex: 1 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },
  detailRow: { flexDirection: "row", gap: 12, paddingVertical: 3 },
  detailKey: { flex: 1, fontSize: 12, textTransform: "capitalize" },
  detailValue: { flex: 1.5, fontSize: 13, textAlign: "right" },
  empty: { textAlign: "center", paddingVertical: 48, fontSize: 16 },
});
