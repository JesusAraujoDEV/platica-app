import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fab } from "@/components/ui/Fab";
import { Money } from "@/components/ui/Money";
import { RemoteState } from "@/components/RemoteState";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransferForm } from "@/components/transactions/TransferForm";
import { useRemoteData } from "@/hooks/useRemoteData";
import { fetchAccounts } from "@/services/finance";
import { fetchCategories } from "@/services/categories";
import { confirmTransaction, fetchTransactionsPage, type MoneyCurrency, type Transaction } from "@/services/transactions";
import { useTheme } from "@/theme/ThemeContext";

const PAGE = 20;
const msg = (e: unknown, fb: string) => (e instanceof Error ? e.message : fb);

export function TransactionsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<Transaction[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const loadRefs = useCallback(() => Promise.all([fetchAccounts(), fetchCategories()]).then(([accounts, categories]) => ({ accounts, categories })), []);
  const refs = useRemoteData(loadRefs);

  const reload = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const page = await fetchTransactionsPage({ pageSize: PAGE });
      setItems(page.items);
      setCursor(page.nextCursorDate);
      setHasMore(page.hasMore);
    } catch (e) {
      setError(msg(e, t("common.error")));
    } finally {
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => void reload(), [reload]);

  const loadMore = useCallback(async () => {
    if (loadingMore || refreshing || !hasMore || !cursor) return;
    setLoadingMore(true);
    try {
      const page = await fetchTransactionsPage({ pageSize: PAGE, cursorDate: cursor });
      // Cursor is date-based; dedup by id guards same-date overlap at page seams.
      setItems((prev) => [...prev, ...page.items.filter((n) => !prev.some((p) => p.id === n.id))]);
      setCursor(page.nextCursorDate);
      setHasMore(page.hasMore);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, refreshing, hasMore, cursor]);

  const onSaved = useCallback(() => {
    setFormOpen(false);
    setTransferOpen(false);
    setEditing(null);
    void reload();
  }, [reload]);

  const confirm = useCallback(async (tx: Transaction) => {
    try {
      await confirmTransaction(tx.id, { accountId: Number(tx.accountId), date: tx.date, amount: tx.amount, currency: (tx.currency ?? "USD") as MoneyCurrency });
      void reload();
    } catch (e) {
      Alert.alert(t("common.error"), msg(e, t("common.error")));
    }
  }, [reload, t]);

  const categoryName = (id: string) => refs.data?.categories.find((c) => c.id === id)?.name ?? "";
  const openAdd = () => { setEditing(null); setFormOpen(true); };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 96 }]}
        data={items}
        keyExtractor={(tx) => tx.id}
        onEndReachedThreshold={0.4}
        onEndReached={() => void loadMore()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}
        ListHeaderComponent={<Text style={[styles.title, { color: theme.colors.text }]}>{t("transactions.title")}</Text>}
        ListEmptyComponent={
          refreshing || error
            ? <RemoteState loading={refreshing} error={error} onRetry={() => void reload()} />
            : <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{t("transactions.empty")}</Text>
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footer} color={theme.colors.primary} /> : null}
        renderItem={({ item, index }) => (
          <View>
            {index === 0 || items[index - 1].date !== item.date ? (
              <Text style={[styles.dateHeader, { color: theme.colors.textMuted }]}>{item.date}</Text>
            ) : null}
            <TouchableOpacity style={[styles.row, { borderBottomColor: theme.colors.surfaceBorder }]} onPress={() => { setEditing(item); setFormOpen(true); }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.description, { color: theme.colors.text }]}>{item.description || t("transactions.untitled")}</Text>
                <Text style={{ color: theme.colors.textMuted }}>{categoryName(item.categoryId) || item.currency}</Text>
              </View>
              {item.status === "pending" ? (
                <TouchableOpacity onPress={() => void confirm(item)} style={[styles.confirm, { borderColor: theme.colors.primary }]} hitSlop={8}>
                  <Text style={{ color: theme.colors.primary, fontWeight: "700" }}>{t("transactions.confirm")}</Text>
                </TouchableOpacity>
              ) : null}
              <Money amountUsd={item.amountUsd ?? 0} sign style={[styles.amount, { color: item.type === "income" ? theme.colors.primary : theme.colors.destructive }]} />
            </TouchableOpacity>
          </View>
        )}
      />

      <Fab icon="swap-horizontal" style={styles.transferFab} onPress={() => setTransferOpen(true)} accessibilityLabel={t("transactions.transferTitle")} />
      <Fab onPress={openAdd} accessibilityLabel={t("transactions.addTitle")} />

      <TransactionForm visible={formOpen} onClose={() => setFormOpen(false)} onSaved={onSaved} accounts={refs.data?.accounts ?? []} categories={refs.data?.categories ?? []} editing={editing} />
      <TransferForm visible={transferOpen} onClose={() => setTransferOpen(false)} onSaved={onSaved} accounts={refs.data?.accounts ?? []} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
  dateHeader: { fontSize: 13, fontWeight: "700", marginTop: 16, marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, gap: 12 },
  description: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  amount: { fontSize: 16, fontWeight: "700" },
  confirm: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  empty: { textAlign: "center", paddingVertical: 48, fontSize: 16 },
  footer: { paddingVertical: 20 },
  transferFab: { bottom: 92 },
});
