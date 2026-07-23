import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Select, type SelectOption } from "@/components/ui/Select";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import type { Debt, DebtType } from "@/services/debts";
import type { MoneyCurrency } from "@/services/transactions";

export interface DebtFormValues {
  type: DebtType;
  contactName: string;
  description: string;
  totalAmount: number;
  currency: MoneyCurrency;
  dueDate: string | null;
  categoryId: number | null;
}

interface DebtFormProps {
  categoryOptions: SelectOption<string>[];
  initial?: Debt | null;
  submitting?: boolean;
  onSubmit: (values: DebtFormValues) => void;
}

const CURRENCIES: SelectOption<MoneyCurrency>[] = [
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
  { label: "VES", value: "VES" },
];

export function DebtForm({ categoryOptions, initial, submitting, onSubmit }: DebtFormProps) {
  const { t } = useTranslation();
  const isEdit = !!initial;
  const [type, setType] = useState<DebtType>(initial?.type ?? "payable");
  const [contactName, setContactName] = useState(initial?.contactName ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [totalAmount, setTotalAmount] = useState(initial ? String(initial.totalAmount) : "");
  const [currency, setCurrency] = useState<MoneyCurrency>(initial?.currency ?? "USD");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(initial?.categoryId ?? null);
  const [errors, setErrors] = useState<{ contact?: string; amount?: string }>({});

  const typeOptions: SelectOption<DebtType>[] = [
    { label: t("debts.payable"), value: "payable" },
    { label: t("debts.receivable"), value: "receivable" },
  ];

  function submit() {
    const value = Number(totalAmount);
    const next: { contact?: string; amount?: string } = {};
    if (!contactName.trim()) next.contact = t("form.required");
    if (!totalAmount || Number.isNaN(value) || value <= 0) next.amount = t("form.invalidNumber");
    setErrors(next);
    if (next.contact || next.amount) return;
    onSubmit({
      type,
      contactName: contactName.trim(),
      description: description.trim(),
      totalAmount: value,
      currency,
      dueDate: dueDate.trim() || null,
      categoryId: categoryId ? Number(categoryId) : null,
    });
  }

  return (
    <View style={styles.form}>
      {/* type + currency are immutable after creation (updateDebt rejects them). */}
      {!isEdit && <SegmentedToggle options={typeOptions} value={type} onChange={setType} />}
      <TextField label={t("debts.contactName")} value={contactName} onChangeText={setContactName} error={errors.contact} />
      <TextField label={t("form.description")} value={description} onChangeText={setDescription} />
      <TextField
        label={t("debts.totalAmount")}
        keyboardType="decimal-pad"
        value={totalAmount}
        onChangeText={setTotalAmount}
        placeholder="0.00"
        error={errors.amount}
      />
      {!isEdit && <Select label={t("form.currency")} options={CURRENCIES} value={currency} onChange={setCurrency} />}
      <TextField label={t("debts.dueDate")} value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" autoCapitalize="none" />
      <Select
        label={t("form.category")}
        options={categoryOptions}
        value={categoryId}
        onChange={setCategoryId}
        placeholder={t("form.selectOption")}
      />
      <Button title={t("common.save")} onPress={submit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: 16 } });
