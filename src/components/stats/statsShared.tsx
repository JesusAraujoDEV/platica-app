import { StyleSheet, Text, View } from "react-native";
import { Money } from "@/components/ui/Money";
import { useTheme } from "@/theme/ThemeContext";

/** Card container for a stats section. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

/** Label + money value row. */
export function Stat({ label, amount }: { label: string; amount: number }) {
  const { theme } = useTheme();
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Money amountUsd={amount} style={[styles.statValue, { color: theme.colors.text }]} />
    </View>
  );
}

/** Colored dot + label for a bar legend. */
export function Legend({ color, label }: { color: string; label: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

export const statsStyles = StyleSheet.create({
  empty: { paddingVertical: 12, textAlign: "center" },
  subTitle: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginTop: 12, marginBottom: 8 },
});

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 14 },
  statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 15, fontWeight: "600" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
});
