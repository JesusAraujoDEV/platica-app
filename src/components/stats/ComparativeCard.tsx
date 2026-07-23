import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Money } from "@/components/ui/Money";
import { Section, Stat, statsStyles } from "@/components/stats/statsShared";
import type { ComparativeResponse } from "@/services/stats";
import { useTheme } from "@/theme/ThemeContext";

/** Current vs previous total + top category deltas with up/down indicators. */
export function ComparativeCard({ comparative }: { comparative: ComparativeResponse }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const s = comparative.summary;
  // Rising spend = destructive (bad), falling = primary (good).
  const color = (rising: boolean) => (rising ? theme.colors.destructive : theme.colors.primary);
  const up = s.total_delta_usd >= 0;

  return (
    <Section title={t("stats.comparative")}>
      <Stat label={t("stats.currentPeriod")} amount={s.current_total} />
      <Stat label={t("stats.previousPeriod")} amount={s.previous_total} />
      <View style={styles.deltaRow}>
        <Ionicons name={up ? "arrow-up" : "arrow-down"} size={16} color={color(up)} />
        <Text style={[styles.deltaText, { color: color(up) }]}>
          {s.total_delta_percent.toFixed(1)}% {t("stats.vsPrevious")}
        </Text>
      </View>

      {comparative.categories_comparison.length > 0 ? (
        <>
          <Text style={[statsStyles.subTitle, { color: theme.colors.textMuted }]}>{t("stats.topChanges")}</Text>
          {comparative.categories_comparison.map((c) => {
            const rising = c.delta_percent >= 0;
            return (
              <View key={c.category} style={styles.catRow}>
                <Text style={[styles.catName, { color: theme.colors.text }]} numberOfLines={1}>{c.category}</Text>
                <Money amountUsd={c.current} style={[styles.catAmount, { color: theme.colors.text }]} />
                <View style={styles.catDelta}>
                  <Ionicons name={rising ? "arrow-up" : "arrow-down"} size={13} color={color(rising)} />
                  <Text style={{ color: color(rising), fontSize: 12 }}>{Math.abs(c.delta_percent).toFixed(0)}%</Text>
                </View>
              </View>
            );
          })}
        </>
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  deltaRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8 },
  deltaText: { fontSize: 14, fontWeight: "600" },
  catRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  catName: { flex: 1, fontSize: 14 },
  catAmount: { fontSize: 14, fontWeight: "600" },
  catDelta: { flexDirection: "row", alignItems: "center", gap: 3, width: 56, justifyContent: "flex-end" },
});
