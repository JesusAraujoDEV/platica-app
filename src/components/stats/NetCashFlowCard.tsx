import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Money } from "@/components/ui/Money";
import { StatBar } from "@/components/stats/StatBar";
import { Legend, Section, statsStyles } from "@/components/stats/statsShared";
import type { NetCashFlowResponse } from "@/services/stats";
import { useTheme } from "@/theme/ThemeContext";

/** Per-month paired income/expense bars + net value. */
export function NetCashFlowCard({ flow }: { flow: NetCashFlowResponse }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const points = flow.time_series;
  const max = Math.max(1, ...points.map((p) => Math.max(p.income, p.expense)));

  return (
    <Section title={t("stats.netCashFlow")}>
      {points.length === 0 ? (
        <Text style={[statsStyles.empty, { color: theme.colors.textMuted }]}>{t("common.noData")}</Text>
      ) : (
        points.map((p) => (
          <View key={p.period} style={styles.row}>
            <Text style={[styles.period, { color: theme.colors.textMuted }]}>{p.period}</Text>
            <View style={styles.bars}>
              <StatBar value={p.income} max={max} color={theme.colors.primary} />
              <View style={{ height: 4 }} />
              <StatBar value={p.expense} max={max} color={theme.colors.destructive} />
            </View>
            <Money amountUsd={p.net_flow} sign style={[styles.net, { color: p.net_flow < 0 ? theme.colors.destructive : theme.colors.primary }]} />
          </View>
        ))
      )}
      <View style={styles.legend}>
        <Legend color={theme.colors.primary} label={t("stats.income")} />
        <Legend color={theme.colors.destructive} label={t("stats.expense")} />
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 },
  period: { width: 52, fontSize: 12 },
  bars: { flex: 1 },
  net: { width: 88, textAlign: "right", fontSize: 13, fontWeight: "600" },
  legend: { flexDirection: "row", gap: 16, marginTop: 4 },
});
