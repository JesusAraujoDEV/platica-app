import { useCallback, useMemo, useState } from "react";
import { Alert, RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fab } from "@/components/ui/Fab";
import { FormSheet } from "@/components/ui/FormSheet";
import { RemoteState } from "@/components/RemoteState";
import { DebtRow } from "@/components/debts/DebtRow";
import { DebtForm, type DebtFormValues } from "@/components/debts/DebtForm";
import { PayDebtForm, type PayDebtValues } from "@/components/debts/PayDebtForm";
import { useRemoteData } from "@/hooks/useRemoteData";
import { fetchCategories } from "@/services/categories";
import { createDebt, deleteDebt, fetchDebts, payDebt, updateDebt, type Debt } from "@/services/debts";
import { useTheme } from "@/theme/ThemeContext";

export function DebtsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = useRemoteData(useCallback(fetchDebts, []));
  const { data: categories } = useRemoteData(useCallback(fetchCategories, []));

  const [editing, setEditing] = useState<Debt | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<Debt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fail = (e: unknown) => Alert.alert(t("common.error"), e instanceof Error ? e.message : String(e));

  const categoryOptions = useMemo(() => (categories ?? []).map((c) => ({ label: c.name, value: c.id })), [categories]);

  const sections = useMemo(() => {
    const all = data ?? [];
    return [
      { title: t("debts.payable"), data: all.filter((d) => d.type === "payable") },
      { title: t("debts.receivable"), data: all.filter((d) => d.type === "receivable") },
    ].filter((s) => s.data.length > 0);
  }, [data, t]);

  const open = (debt: Debt | null) => {
    setEditing(debt);
    setFormOpen(true);
  };

  async function submitForm(v: DebtFormValues) {
    setSubmitting(true);
    try {
      if (editing) await updateDebt(editing.id, { contactName: v.contactName, description: v.description, totalAmount: v.totalAmount, dueDate: v.dueDate, categoryId: v.categoryId });
      else await createDebt(v);
      setFormOpen(false);
      await reload();
    } catch (e) {
      fail(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitPay(v: PayDebtValues) {
    if (!payTarget) return;
    setSubmitting(true);
    try {
      await payDebt(payTarget.id, { amount: v.amount, currency: payTarget.currency, accountId: v.accountId, date: v.date });
      setPayTarget(null);
      await reload();
    } catch (e) {
      fail(e);
    } finally {
      setSubmitting(false);
    }
  }

  const confirmDelete = (debt: Debt) =>
    Alert.alert(t("debts.deleteTitle"), t("debts.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: () => deleteDebt(debt.id).then(reload).catch(fail) },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SectionList
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 96 }]}
        sections={sections}
        keyExtractor={(d) => d.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}
        ListHeaderComponent={<Text style={[styles.title, { color: theme.colors.text }]}>{t("debts.title")}</Text>}
        ListEmptyComponent={
          loading || error ? (
            <RemoteState loading={loading} error={error} onRetry={() => void reload()} />
          ) : (
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{t("debts.empty")}</Text>
          )
        }
        renderSectionHeader={({ section }) => (
          <Text style={[styles.section, { color: theme.colors.textMuted }]}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <DebtRow debt={item} onEdit={open} onPay={setPayTarget} onDelete={confirmDelete} />
        )}
      />
      <Fab onPress={() => open(null)} />
      <FormSheet visible={formOpen} onClose={() => setFormOpen(false)} title={editing ? t("debts.editTitle") : t("debts.newTitle")}>
        <DebtForm key={editing?.id ?? "new"} categoryOptions={categoryOptions} initial={editing} submitting={submitting} onSubmit={submitForm} />
      </FormSheet>
      <FormSheet visible={!!payTarget} onClose={() => setPayTarget(null)} title={t("debts.pay")}>
        <PayDebtForm key={payTarget?.id ?? "pay"} submitting={submitting} onSubmit={submitPay} />
      </FormSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 12 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  section: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", marginTop: 8, marginBottom: 4 },
  empty: { textAlign: "center", paddingVertical: 48, fontSize: 16 },
});
