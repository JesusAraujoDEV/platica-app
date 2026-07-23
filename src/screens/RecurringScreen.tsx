import { useCallback, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RemoteState } from "@/components/RemoteState";
import { Button } from "@/components/ui/Button";
import { Fab } from "@/components/ui/Fab";
import { RecurringForm } from "@/components/recurring/RecurringForm";
import { useRemoteData } from "@/hooks/useRemoteData";
import { fetchAccounts, type Account } from "@/services/finance";
import { fetchCategories, type Category } from "@/services/categories";
import {
  fetchRecurringTransactions,
  payNowRecurringTransaction,
  triggerRecurringTransactions,
  type RecurringTransaction,
} from "@/services/recurring";
import { useTheme } from "@/theme/ThemeContext";

async function loadRecurring() {
  const [items, accounts, categories] = await Promise.all([
    fetchRecurringTransactions(),
    fetchAccounts(),
    fetchCategories(),
  ]);
  return { items, accounts, categories };
}

export function RecurringScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const loader = useCallback(loadRecurring, []);
  const { data, loading, error, reload } = useRemoteData(loader);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);

  const accounts: Account[] = data?.accounts ?? [];
  const categories: Category[] = data?.categories ?? [];
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name;
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name;

  function openNew() {
    setEditing(null);
    setFormVisible(true);
  }
  function openEdit(item: RecurringTransaction) {
    setEditing(item);
    setFormVisible(true);
  }

  async function payNow(item: RecurringTransaction) {
    if (!item.accountId) {
      Alert.alert(t("recurring.payNow"), t("recurring.payNowNeedsAccount"));
      return;
    }
    try {
      await payNowRecurringTransaction(item.id, { accountId: Number(item.accountId) });
      await reload();
    } catch (e) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : String(e));
    }
  }

  async function trigger() {
    try {
      await triggerRecurringTransactions();
      await reload();
    } catch (e) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 96 }]}
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{t("recurring.title")}</Text>
            {(data?.items?.length ?? 0) > 0 ? (
              <Button title={t("recurring.trigger")} variant="outline" onPress={trigger} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading || error ? (
            <RemoteState loading={loading} error={error} onRetry={() => void reload()} />
          ) : (
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{t("recurring.empty")}</Text>
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: theme.colors.surfaceBorder }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => openEdit(item)}>
              <Text style={[styles.description, { color: theme.colors.text }]}>
                {item.description || t("recurring.untitled")}
              </Text>
              <Text style={{ color: theme.colors.textMuted }}>
                {categoryName(item.categoryId) ?? "—"} · {accountName(item.accountId) ?? t("recurring.noAccount")}
              </Text>
              <Text style={{ color: theme.colors.textMuted }}>
                {t(`recurring.frequency_${item.frequency}`)} · {item.next_date} · {item.is_active ? t("recurring.active") : t("recurring.paused")}
              </Text>
            </TouchableOpacity>
            <View style={styles.right}>
              <Text style={[styles.amount, { color: theme.colors.text }]}>
                {item.amount.toFixed(2)} {item.currency}
              </Text>
              <TouchableOpacity onPress={() => payNow(item)}>
                <Text style={{ color: theme.colors.primary, fontWeight: "700" }}>{t("recurring.payNow")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Fab onPress={openNew} />
      <RecurringForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSaved={reload}
        categories={categories}
        accounts={accounts}
        editing={editing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 16, borderBottomWidth: 1 },
  description: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  right: { alignItems: "flex-end", gap: 6 },
  amount: { fontSize: 16, fontWeight: "700" },
  empty: { textAlign: "center", paddingVertical: 48, fontSize: 16 },
});
