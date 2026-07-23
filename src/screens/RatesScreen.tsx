import { useCallback } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CurrencySwitch } from "@/components/CurrencySwitch";
import { RemoteState } from "@/components/RemoteState";
import { useDisplayCurrency } from "@/lib/CurrencyContext";
import type { DisplayCurrency } from "@/lib/displayCurrency";
import { useRemoteData } from "@/hooks/useRemoteData";
import { fetchCurrentRate, fetchRateHistory, type ExchangeRate } from "@/services/rates";
import { useTheme } from "@/theme/ThemeContext";

interface RatesData { current: ExchangeRate; history: ExchangeRate[] }

// ponytail: manual grouping mirrors <Money>; these are VES-per-unit quotes, not
// USD accounting amounts, so they must NOT pass through <Money>'s conversion.
function bs(value: number | null): string {
  if (value == null) return "—";
  const [whole, dec] = value.toFixed(2).split(".");
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${dec} Bs`;
}

async function loadRates(): Promise<RatesData> {
  const [current, history] = await Promise.all([fetchCurrentRate(), fetchRateHistory()]);
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
  return { current, history: sorted };
}

const COLS: { key: DisplayCurrency; rate: (r: ExchangeRate) => number | null }[] = [
  { key: "USD", rate: (r) => r.usdRate },
  { key: "EUR", rate: (r) => r.eurRate },
  { key: "USDT", rate: (r) => r.usdtRate },
];

export function RatesScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selected] = useDisplayCurrency();
  const { data, loading, error, reload } = useRemoteData(useCallback(loadRates, []));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t("rates.title")}</Text>
      </View>
      <View style={styles.switch}><CurrencySwitch /></View>
      {loading || error ? <RemoteState loading={loading} error={error} onRetry={() => void reload()} /> : null}
      {data ? (
        <>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>{t("rates.current")} · {data.current.date}</Text>
            {COLS.map(({ key, rate }) => {
              const active = key === selected;
              return (
                <View key={key} style={styles.currentRow}>
                  <Text style={[styles.curKey, { color: active ? theme.colors.primary : theme.colors.text }]}>{key}</Text>
                  <Text style={[styles.curVal, { color: active ? theme.colors.primary : theme.colors.text, fontWeight: active ? "800" : "600" }]}>{bs(rate(data.current))}</Text>
                </View>
              );
            })}
          </View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("rates.history")}</Text>
          <View style={styles.histHead}>
            <Text style={[styles.hDate, { color: theme.colors.textMuted }]}>{t("common.date")}</Text>
            {COLS.map(({ key }) => <Text key={key} style={[styles.hCell, { color: theme.colors.textMuted }]}>{key}</Text>)}
          </View>
          {data.history.map((r) => (
            <View key={r.date} style={[styles.histRow, { borderBottomColor: theme.colors.surfaceBorder }]}>
              <Text style={[styles.hDate, { color: theme.colors.text }]}>{r.date}</Text>
              {COLS.map(({ key, rate }) => <Text key={key} style={[styles.hCell, { color: theme.colors.text }]}>{bs(rate(r))}</Text>)}
            </View>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  back: { padding: 8, marginLeft: -8, marginRight: 8 },
  title: { fontSize: 26, fontWeight: "700", flex: 1 },
  switch: { width: 168, marginBottom: 20 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16 },
  cardLabel: { fontSize: 12, marginBottom: 12 },
  currentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  curKey: { fontSize: 15, fontWeight: "700" },
  curVal: { fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 28, marginBottom: 12 },
  histHead: { flexDirection: "row", paddingBottom: 8 },
  histRow: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1 },
  hDate: { flex: 1.4, fontSize: 13 },
  hCell: { flex: 1, fontSize: 13, textAlign: "right" },
});
