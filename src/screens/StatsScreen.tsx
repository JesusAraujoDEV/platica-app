import { useCallback } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RemoteState } from "@/components/RemoteState";
import { ComparativeCard } from "@/components/stats/ComparativeCard";
import { ForecastCard } from "@/components/stats/ForecastCard";
import { NetCashFlowCard } from "@/components/stats/NetCashFlowCard";
import { useRemoteData } from "@/hooks/useRemoteData";
import { fetchBudgetsStatus } from "@/services/budgets";
import {
  fetchComparativeMoM,
  fetchMonthlyForecast,
  fetchNetCashFlow,
  type ComparativeResponse,
  type MonthlyForecastResponse,
  type NetCashFlowResponse,
} from "@/services/stats";
import { useTheme } from "@/theme/ThemeContext";

// ponytail: now-relative ISO helpers; the stats API normalizes ranges itself.
const iso = (d: Date) => d.toISOString().slice(0, 10);
const monthStart = (back: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - back, 1);
  return iso(d);
};
const monthEnd = (back: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - back + 1, 0);
  return iso(d);
};

interface StatsData {
  flow: NetCashFlowResponse;
  forecast: MonthlyForecastResponse;
  comparative: ComparativeResponse;
}

async function loadStats(): Promise<StatsData> {
  const [flow, comparative, budgets] = await Promise.all([
    fetchNetCashFlow({ fromDate: monthStart(5), toDate: monthEnd(0), timeUnit: "month" }),
    fetchComparativeMoM({ currentFrom: monthStart(0), currentTo: monthEnd(0), previousFrom: monthStart(1), previousTo: monthEnd(1), topN: 5 }),
    fetchBudgetsStatus(),
  ]);
  const budgetTotal = budgets.filter((b) => b.period === "monthly").reduce((sum, b) => sum + b.budgeted, 0);
  const forecast = await fetchMonthlyForecast({ budgetTotal, date: iso(new Date()) });
  return { flow, forecast, comparative };
}

export function StatsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const loader = useCallback(loadStats, []);
  const { data, loading, error, reload } = useRemoteData(loader);

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t("stats.title")}</Text>
      </View>

      {!data ? (
        <RemoteState loading={loading} error={error} onRetry={() => void reload()} />
      ) : (
        <>
          <NetCashFlowCard flow={data.flow} />
          <ForecastCard forecast={data.forecast} />
          <ComparativeCard comparative={data.comparative} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  back: { padding: 8, marginLeft: -8, marginRight: 8 },
  title: { fontSize: 26, fontWeight: "700", flex: 1 },
});
