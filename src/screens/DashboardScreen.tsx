import { useCallback } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RemoteState } from "@/components/RemoteState";
import { useRemoteData } from "@/hooks/useRemoteData";
import { fetchDashboard } from "@/services/finance";
import { useTheme } from "@/theme/ThemeContext";

const money = (value: number) => `$${value.toFixed(2)}`;

export function DashboardScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const loader = useCallback(fetchDashboard, []);
  const { data, loading, error, reload } = useRemoteData(loader);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}
    >
      <Text style={[styles.brand, { color: theme.colors.primary }]}>Platica</Text>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t("dashboard.title")}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{t("dashboard.subtitle")}</Text>

      {loading || error ? <RemoteState loading={loading} error={error} onRetry={() => void reload()} /> : null}
      {data ? (
        <>
          <View style={styles.grid}>
            {[
              [t("dashboard.accountsTotal"), data.accountsTotal],
              [t("dashboard.incomeTotal"), data.incomeTotal],
              [t("dashboard.expenseTotal"), data.expenseTotal],
              [t("dashboard.netTotal"), data.netTotal],
            ].map(([label, value]) => (
              <View key={String(label)} style={[styles.metric, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder }]}>
                <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>{label}</Text>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>{money(Number(value))}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("dashboard.recent")}</Text>
          {data.recentTransactions.length ? data.recentTransactions.map((transaction) => (
            <View key={transaction.id} style={[styles.transaction, { borderBottomColor: theme.colors.surfaceBorder }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.transactionTitle, { color: theme.colors.text }]}>{transaction.description || t("transactions.untitled")}</Text>
                <Text style={{ color: theme.colors.textMuted }}>{transaction.date}</Text>
              </View>
              <Text style={{ color: transaction.type === "income" ? theme.colors.primary : theme.colors.destructive, fontWeight: "700" }}>
                {transaction.type === "income" ? "+" : "-"}{money(transaction.amount)}
              </Text>
            </View>
          )) : <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{t("transactions.empty")}</Text>}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  brand: { fontSize: 14, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 15, marginTop: 4, marginBottom: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metric: { width: "48%", borderWidth: 1, borderRadius: 12, padding: 16 },
  metricLabel: { fontSize: 12, marginBottom: 8 },
  metricValue: { fontSize: 20, fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 28, marginBottom: 8 },
  transaction: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1 },
  transactionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 3 },
  empty: { paddingVertical: 24, textAlign: "center" },
});
