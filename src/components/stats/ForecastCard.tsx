import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Money } from "@/components/ui/Money";
import { StatBar } from "@/components/stats/StatBar";
import { Section, Stat } from "@/components/stats/statsShared";
import type { MonthlyForecastResponse } from "@/services/stats";
import { useTheme } from "@/theme/ThemeContext";

/** MTD vs projected vs budget, with an over/under gauge. */
export function ForecastCard({ forecast }: { forecast: MonthlyForecastResponse }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const budget = forecast.budget_total;
  const projected = forecast.projected_total_spending;
  // ponytail: derive over/under from the two totals — avoids projected_over_under sign ambiguity.
  const over = budget > 0 && projected > budget;
  const barMax = Math.max(budget, projected, 1);

  return (
    <Section title={t("stats.forecast")}>
      <Stat label={t("stats.mtdSpending")} amount={forecast.current_spending_mtd} />
      <Stat label={t("stats.projected")} amount={projected} />
      <Stat label={t("stats.budget")} amount={budget} />
      <View style={{ marginTop: 8 }}>
        <StatBar value={projected} max={barMax} color={over ? theme.colors.destructive : theme.colors.primary} height={10} />
      </View>
      {budget > 0 ? (
        <Text style={[styles.note, { color: over ? theme.colors.destructive : theme.colors.primary }]}>
          {over ? t("stats.overBudget") : t("stats.underBudget")}{" "}
          <Money amountUsd={Math.abs(projected - budget)} />
        </Text>
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  note: { marginTop: 10, fontSize: 14, fontWeight: "600" },
});
