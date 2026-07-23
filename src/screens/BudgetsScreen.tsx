import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Fab } from "@/components/ui/Fab";
import { FormSheet } from "@/components/ui/FormSheet";
import { Money } from "@/components/ui/Money";
import { RemoteState } from "@/components/RemoteState";
import { BudgetForm } from "@/components/budgets/BudgetForm";
import { useRemoteData } from "@/hooks/useRemoteData";
import { fetchCategories } from "@/services/categories";
import { createBudget, deleteBudget, fetchBudgetsStatus, updateBudget, type BudgetStatus, type BudgetUpsertPayload } from "@/services/budgets";
import { useTheme } from "@/theme/ThemeContext";

export function BudgetsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = useRemoteData(useCallback(fetchBudgetsStatus, []));
  const { data: categories } = useRemoteData(useCallback(fetchCategories, []));

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fail = (e: unknown) => Alert.alert(t("common.error"), e instanceof Error ? e.message : String(e));

  const categoryOptions = useMemo(
    () => (categories ?? []).filter((c) => c.type === "expense").map((c) => ({ label: c.name, value: c.id })),
    [categories],
  );

  const open = (item: BudgetStatus | null) => {
    setEditing(item);
    setFormOpen(true);
  };

  async function submit(payload: BudgetUpsertPayload) {
    setSubmitting(true);
    try {
      if (editing) await updateBudget(editing.id, payload);
      else await createBudget(payload);
      setFormOpen(false);
      await reload();
    } catch (e) {
      fail(e);
    } finally {
      setSubmitting(false);
    }
  }

  const confirmDelete = (item: BudgetStatus) =>
    Alert.alert(t("budgets.deleteTitle"), t("budgets.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: () => deleteBudget(item.id).then(reload).catch(fail) },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 96 }]}
        data={data ?? []}
        keyExtractor={(b) => b.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}
        ListHeaderComponent={<Text style={[styles.title, { color: theme.colors.text }]}>{t("budgets.title")}</Text>}
        ListEmptyComponent={
          loading || error ? (
            <RemoteState loading={loading} error={error} onRetry={() => void reload()} />
          ) : (
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{t("budgets.empty")}</Text>
          )
        }
        renderItem={({ item }) => {
          const over = item.percentageUsed > 100;
          const barColor = over ? theme.colors.destructive : theme.colors.primary;
          return (
            <TouchableOpacity activeOpacity={0.8} onPress={() => open(item)}>
              <Card style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={[styles.category, { color: theme.colors.text }]}>{item.category.name}</Text>
                  <TouchableOpacity onPress={() => confirmDelete(item)} hitSlop={12} accessibilityLabel={t("common.delete")}>
                    <Ionicons name="trash-outline" size={18} color={theme.colors.icon} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.track, { backgroundColor: theme.colors.surfaceBorder }]}>
                  <View style={[styles.fill, { width: `${Math.max(0, Math.min(item.percentageUsed, 100))}%`, backgroundColor: barColor }]} />
                </View>
                <View style={styles.metrics}>
                  <Text style={{ color: theme.colors.textMuted }}>
                    <Money amountUsd={item.spent} /> / <Money amountUsd={item.budgeted} /> · {Math.round(item.percentageUsed)}%
                  </Text>
                  <Text style={{ color: over ? theme.colors.destructive : theme.colors.textMuted }}>
                    {t("budgets.remaining")} <Money amountUsd={item.remaining} />
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
      <Fab onPress={() => open(null)} />
      <FormSheet visible={formOpen} onClose={() => setFormOpen(false)} title={editing ? t("budgets.editTitle") : t("budgets.newTitle")}>
        <BudgetForm key={editing?.id ?? "new"} categoryOptions={categoryOptions} initial={editing} submitting={submitting} onSubmit={submit} />
      </FormSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 12 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  empty: { textAlign: "center", paddingVertical: 48, fontSize: 16 },
  card: { gap: 10 },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  category: { fontSize: 16, fontWeight: "700" },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
  metrics: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 4 },
});
