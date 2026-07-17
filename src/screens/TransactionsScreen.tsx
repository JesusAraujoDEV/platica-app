import { useCallback } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RemoteState } from "@/components/RemoteState";
import { useRemoteData } from "@/hooks/useRemoteData";
import { fetchTransactions } from "@/services/finance";
import { useTheme } from "@/theme/ThemeContext";

export function TransactionsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const loader = useCallback(fetchTransactions, []);
  const { data, loading, error, reload } = useRemoteData(loader);

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
      data={data ?? []}
      keyExtractor={(transaction) => transaction.id}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}
      ListHeaderComponent={<Text style={[styles.title, { color: theme.colors.text }]}>{t("transactions.title")}</Text>}
      ListEmptyComponent={loading || error
        ? <RemoteState loading={loading} error={error} onRetry={() => void reload()} />
        : <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{t("transactions.empty")}</Text>}
      renderItem={({ item }) => (
        <View style={[styles.row, { borderBottomColor: theme.colors.surfaceBorder }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.description, { color: theme.colors.text }]}>{item.description || t("transactions.untitled")}</Text>
            <Text style={{ color: theme.colors.textMuted }}>{item.date} · {item.currency}</Text>
          </View>
          <Text style={[styles.amount, { color: item.type === "income" ? theme.colors.primary : theme.colors.destructive }]}>
            {item.type === "income" ? "+" : "-"}{item.amount.toFixed(2)}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1 },
  description: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  amount: { fontSize: 16, fontWeight: "700" },
  empty: { textAlign: "center", paddingVertical: 48, fontSize: 16 },
});
