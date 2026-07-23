import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { FormSheet } from "@/components/ui/FormSheet";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import type { RecurringTransaction } from "@/services/recurring";
import type { MoneyCurrency } from "@/services/transactions";
import type { Category } from "@/services/categories";
import type { Account } from "@/services/finance";
import { useRecurringForm } from "./useRecurringForm";

interface RecurringFormProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories: Category[];
  accounts: Account[];
  editing?: RecurringTransaction | null;
}

const CURRENCIES: MoneyCurrency[] = ["USD", "EUR", "VES"];
const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

export function RecurringForm({ visible, onClose, onSaved, categories, accounts, editing }: RecurringFormProps) {
  const { t } = useTranslation();
  const { draft, set, errors, saving, submit, confirmDelete } = useRecurringForm(editing, categories, onSaved, onClose);

  return (
    <FormSheet visible={visible} onClose={onClose} title={editing ? t("recurring.editTitle") : t("recurring.newTitle")}>
      <TextField
        label={t("recurring.description")}
        value={draft.description}
        onChangeText={(v) => set("description", v)}
        error={errors.description}
        placeholder={t("recurring.descriptionPlaceholder")}
      />
      <TextField
        label={t("recurring.amount")}
        value={draft.amount}
        onChangeText={(v) => set("amount", v)}
        error={errors.amount}
        keyboardType="decimal-pad"
        placeholder="0.00"
      />
      <Select
        label={t("recurring.currency")}
        value={draft.currency}
        onChange={(v) => set("currency", v)}
        options={CURRENCIES.map((c) => ({ label: c, value: c }))}
      />
      <Select
        label={t("recurring.account")}
        value={draft.accountId}
        onChange={(v) => set("accountId", v)}
        placeholder={t("recurring.noAccount")}
        options={accounts.map((a) => ({ label: a.name, value: a.id }))}
      />
      <Select
        label={t("recurring.category")}
        value={draft.categoryId}
        onChange={(v) => set("categoryId", v)}
        error={errors.category}
        options={categories.map((c) => ({ label: c.name, value: c.id }))}
      />
      <Select
        label={t("recurring.frequency")}
        value={draft.frequency}
        onChange={(v) => set("frequency", v)}
        options={FREQUENCIES.map((f) => ({ label: t(`recurring.frequency_${f}`), value: f }))}
      />
      <TextField
        label={t("recurring.nextDate")}
        value={draft.nextDate}
        onChangeText={(v) => set("nextDate", v)}
        error={errors.nextDate}
        placeholder="YYYY-MM-DD"
        autoCapitalize="none"
      />
      <Select
        label={t("recurring.executionMode")}
        value={draft.mode}
        onChange={(v) => set("mode", v)}
        options={[
          { label: t("recurring.modeAuto"), value: "auto" },
          { label: t("recurring.modeManual"), value: "manual" },
        ]}
      />
      <SegmentedToggle
        options={[
          { label: t("recurring.active"), value: "active" },
          { label: t("recurring.paused"), value: "paused" },
        ]}
        value={draft.active ? "active" : "paused"}
        onChange={(v) => set("active", v === "active")}
      />

      <View style={styles.actions}>
        <Button title={t("common.save")} onPress={submit} loading={saving} />
        {editing ? <Button title={t("common.delete")} variant="destructive" onPress={confirmDelete} /> : null}
      </View>
    </FormSheet>
  );
}

const styles = StyleSheet.create({ actions: { gap: 10, marginTop: 4 } });
