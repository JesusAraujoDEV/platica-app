import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import type { Debt } from "@/services/debts";
import type { MoneyCurrency } from "@/services/transactions";
import { useTheme } from "@/theme/ThemeContext";

// ponytail: <Money> converts a USD amount to the display currency. A debt in
// EUR/VES isn't USD, so only route USD debts through it; others render in their
// own currency to avoid a bogus cross-rate. Upgrade path: a currency-aware Money.
function DebtAmount({ amount, currency, style }: { amount: number; currency: MoneyCurrency; style?: object }) {
  if (currency === "USD") return <Money amountUsd={amount} style={style} />;
  return <Text style={style}>{`${currency} ${amount.toFixed(2)}`}</Text>;
}

interface DebtRowProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onPay: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
}

export function DebtRow({ debt, onEdit, onPay, onDelete }: DebtRowProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => onEdit(debt)}>
      <Card style={styles.card}>
        <View style={styles.head}>
          <Text style={[styles.contact, { color: theme.colors.text }]}>{debt.contactName}</Text>
          <DebtAmount amount={debt.remaining} currency={debt.currency} style={[styles.amount, { color: theme.colors.text }]} />
        </View>
        {debt.description ? <Text style={{ color: theme.colors.textMuted }}>{debt.description}</Text> : null}
        <View style={styles.meta}>
          <Text style={{ color: theme.colors.textMuted }}>
            {debt.dueDate ?? "—"} · {t(`debts.status.${debt.status}`)}
          </Text>
          <View style={styles.actions}>
            {debt.status !== "paid" ? (
              <TouchableOpacity onPress={() => onPay(debt)} hitSlop={10} accessibilityLabel={t("debts.pay")}>
                <Ionicons name="cash-outline" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={() => onDelete(debt)} hitSlop={10} accessibilityLabel={t("common.delete")}>
              <Ionicons name="trash-outline" size={18} color={theme.colors.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  contact: { fontSize: 16, fontWeight: "700", flex: 1 },
  amount: { fontSize: 16, fontWeight: "700" },
  meta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  actions: { flexDirection: "row", alignItems: "center", gap: 16 },
});
