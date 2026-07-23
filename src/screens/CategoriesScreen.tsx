import { useCallback, useMemo, useState } from "react";
import { SectionList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RemoteState } from "@/components/RemoteState";
import { Fab } from "@/components/ui/Fab";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { useRemoteData } from "@/hooks/useRemoteData";
import { fetchCategories, type Category } from "@/services/categories";
import { useTheme } from "@/theme/ThemeContext";

export function CategoriesScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const loader = useCallback(fetchCategories, []);
  const { data, loading, error, reload } = useRemoteData(loader);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const sections = useMemo(() => {
    const list = data ?? [];
    return [
      { key: "income", title: t("categories.income"), data: list.filter((c) => c.type === "income") },
      { key: "expense", title: t("categories.expense"), data: list.filter((c) => c.type === "expense") },
    ].filter((s) => s.data.length > 0);
  }, [data, t]);

  function openNew() {
    setEditing(null);
    setFormVisible(true);
  }
  function openEdit(category: Category) {
    setEditing(category);
    setFormVisible(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SectionList
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 96 }]}
        sections={sections}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}
        ListHeaderComponent={<Text style={[styles.title, { color: theme.colors.text }]}>{t("categories.title")}</Text>}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.section, { color: theme.colors.textMuted }]}>{section.title}</Text>
        )}
        ListEmptyComponent={
          loading || error ? (
            <RemoteState loading={loading} error={error} onRetry={() => void reload()} />
          ) : (
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{t("categories.empty")}</Text>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.row, { borderBottomColor: theme.colors.surfaceBorder }]} onPress={() => openEdit(item)}>
            <View style={[styles.dot, { backgroundColor: item.color || theme.colors.surfaceBorder }]} />
            <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
            {item.icon ? <Text style={{ color: theme.colors.textMuted }}>{item.icon}</Text> : null}
          </TouchableOpacity>
        )}
      />
      <Fab onPress={openNew} />
      <CategoryForm visible={formVisible} onClose={() => setFormVisible(false)} onSaved={reload} editing={editing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
  section: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", marginTop: 20, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 16, borderBottomWidth: 1 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  name: { flex: 1, fontSize: 16, fontWeight: "600" },
  empty: { textAlign: "center", paddingVertical: 48, fontSize: 16 },
});
