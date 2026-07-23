import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RemoteState } from "@/components/RemoteState";
import { Fab } from "@/components/ui/Fab";
import { CategoryGroupForm } from "@/components/categoryGroups/CategoryGroupForm";
import { useRemoteData } from "@/hooks/useRemoteData";
import { fetchCategoryGroups, type CategoryGroup } from "@/services/categoryGroups";
import { useTheme } from "@/theme/ThemeContext";

export function CategoryGroupsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const loader = useCallback(fetchCategoryGroups, []);
  const { data, loading, error, reload } = useRemoteData(loader);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<CategoryGroup | null>(null);

  function openNew() {
    setEditing(null);
    setFormVisible(true);
  }
  function openEdit(group: CategoryGroup) {
    setEditing(group);
    setFormVisible(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 96 }]}
        data={data ?? []}
        keyExtractor={(group) => String(group.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}
        ListHeaderComponent={<Text style={[styles.title, { color: theme.colors.text }]}>{t("categoryGroups.title")}</Text>}
        ListEmptyComponent={
          loading || error ? (
            <RemoteState loading={loading} error={error} onRetry={() => void reload()} />
          ) : (
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{t("categoryGroups.empty")}</Text>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.row, { borderBottomColor: theme.colors.surfaceBorder }]} onPress={() => openEdit(item)}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
              <Text style={{ color: theme.colors.textMuted }}>
                {t(`categoryGroups.type${item.type === "ingreso" ? "Income" : item.type === "gasto" ? "Expense" : "Neutral"}`)}
              </Text>
            </View>
            <Text style={{ color: theme.colors.textMuted }}>
              {t(item.analyticsBehavior === "exclude" ? "categoryGroups.exclude" : "categoryGroups.include")}
            </Text>
          </TouchableOpacity>
        )}
      />
      <Fab onPress={openNew} />
      <CategoryGroupForm visible={formVisible} onClose={() => setFormVisible(false)} onSaved={reload} editing={editing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 16, borderBottomWidth: 1 },
  name: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  empty: { textAlign: "center", paddingVertical: 48, fontSize: 16 },
});
