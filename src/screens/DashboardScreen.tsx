import { useCallback } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CurrencySwitch } from "@/components/CurrencySwitch";
import { RemoteState } from "@/components/RemoteState";
import { Money } from "@/components/ui/Money";
import { useRemoteData } from "@/hooks/useRemoteData";
import { fetchBudgetsStatus, type BudgetStatus } from "@/services/budgets";
import { fetchTransactions, type Transaction } from "@/services/finance";
import { fetchGlobalBalance, type GlobalBalance } from "@/services/summary";
import { useTheme } from "@/theme/ThemeContext";

interface DashboardData { balance: GlobalBalance; budgets: BudgetStatus[]; recent: Transaction[] }

async function loadDashboard(): Promise<DashboardData> {
  const [balance, budgets, transactions] = await Promise.all([fetchGlobalBalance(), fetchBudgetsStatus(), fetchTransactions()]);
  return { balance, budgets, recent: transactions.slice(0, 5) };
}

export function DashboardScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = useRemoteData(useCallback(loadDashboard, []));

  const metrics: [string, number][] = data
    ? [
        [t("dashboard.accountsTotal"), data.balance.accounts_total_usd],
        [t("dashboard.incomeTotal"), data.balance.income_total_usd],
        [t("dashboard.expenseTotal"), data.balance.expense_total_usd],
        [t("dashboard.netTotal"), data.balance.net_total_usd],
      ]
    : [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.brand, { color: theme.colors.primary }]}>Platica</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t("dashboard.title")}</Text>
        </View>
        <View style={styles.switch}><CurrencySwitch /></View>
      </View>
      {loading || error ? <RemoteState loading={loading} error={error} onRetry={() => void reload()} /> : null}
      {data ? (
        <>
          <View style={styles.grid}>
            {metrics.map(([label, value]) => (
              <View key={label} style={[styles.metric, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder }]}>
                <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>{label}</Text>
                <Money amountUsd={value} style={[styles.metricValue, { color: theme.colors.text }]} />
              </View>
            ))}
          </View>
          {data.budgets.length ? (
            <>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("dashboard.budgetVsActual")}</Text>
              {data.budgets.slice(0, 4).map((b) => {
                const over = b.percentageUsed > 100;
                const barColor = over ? theme.colors.destructive : theme.colors.primary;
                return (
                  <View key={b.id} style={styles.budgetRow}>
                    <View style={styles.rowBetween}>
                      <Text style={[styles.budgetName, { color: theme.colors.text }]} numberOfLines={1}>{b.category.name || t("budgets.untitled")}</Text>
                      <Text style={[styles.budgetPct, { color: over ? theme.colors.destructive : theme.colors.textMuted }]}>{Math.round(b.percentageUsed)}%</Text>
                    </View>
                    <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceBorder }]}>
                      <View style={[styles.barFill, { width: `${Math.max(0, Math.min(b.percentageUsed, 100))}%`, backgroundColor: barColor }]} />
                    </View>
                    <View style={[styles.rowBetween, { marginTop: 6 }]}>
                      <Text style={[styles.budgetMeta, { color: theme.colors.textMuted }]}><Money amountUsd={b.spent} /> / <Money amountUsd={b.budgeted} /></Text>
                      <Text style={[styles.budgetMeta, { color: theme.colors.textMuted }]}>{t("dashboard.remaining")} <Money amountUsd={b.remaining} /></Text>
                    </View>
                  </View>
                );
              })}
            </>
          ) : null}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("dashboard.recent")}</Text>
          {data.recent.length ? (
            data.recent.map((tx) => (
              <View key={tx.id} style={[styles.transaction, { borderBottomColor: theme.colors.surfaceBorder }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.transactionTitle, { color: theme.colors.text }]}>{tx.description || t("transactions.untitled")}</Text>
                  <Text style={{ color: theme.colors.textMuted }}>{tx.date}</Text>
                </View>
                <Money amountUsd={(tx.type === "income" ? 1 : -1) * Math.abs(tx.amountUsd ?? tx.amount)} sign style={{ color: tx.type === "income" ? theme.colors.primary : theme.colors.destructive, fontWeight: "700" }} />
              </View>
            ))
          ) : (
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{t("transactions.empty")}</Text>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "flex-start", marginBottom: 24 },
  switch: { width: 168, marginTop: 4 },
  brand: { fontSize: 14, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metric: { width: "48%", borderWidth: 1, borderRadius: 12, padding: 16 },
  metricLabel: { fontSize: 12, marginBottom: 8 },
  metricValue: { fontSize: 20, fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 28, marginBottom: 12 },
  budgetRow: { marginBottom: 16 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  budgetName: { fontSize: 14, fontWeight: "600", flex: 1, marginRight: 8 },
  budgetPct: { fontSize: 13, fontWeight: "700" },
  barTrack: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 0 },
  barFill: { height: 8, borderRadius: 4 },
  budgetMeta: { fontSize: 12 },
  transaction: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1 },
  transactionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 3 },
  empty: { paddingVertical: 24, textAlign: "center" },
});
