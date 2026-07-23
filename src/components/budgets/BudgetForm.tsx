import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Select, type SelectOption } from "@/components/ui/Select";
import type { BudgetPeriod, BudgetStatus, BudgetUpsertPayload, RateSource } from "@/services/budgets";

interface BudgetFormProps {
  categoryOptions: SelectOption<string>[];
  initial?: BudgetStatus | null;
  submitting?: boolean;
  onSubmit: (payload: BudgetUpsertPayload) => void;
}

export function BudgetForm({ categoryOptions, initial, submitting, onSubmit }: BudgetFormProps) {
  const { t } = useTranslation();
  const [categoryId, setCategoryId] = useState<string | null>(initial?.category.id ?? null);
  const [amount, setAmount] = useState(initial ? String(initial.budgeted) : "");
  const [period, setPeriod] = useState<BudgetPeriod>(initial?.period ?? "monthly");
  const [rateSource, setRateSource] = useState<RateSource>(initial?.rate_source ?? "bcv");
  const [errors, setErrors] = useState<{ category?: string; amount?: string }>({});

  const periodOptions: SelectOption<BudgetPeriod>[] = [
    { label: t("budgets.periodMonthly"), value: "monthly" },
    { label: t("budgets.periodYearly"), value: "yearly" },
    { label: t("budgets.periodOneTime"), value: "one_time" },
  ];
  const rateOptions: SelectOption<RateSource>[] = [
    { label: t("budgets.rateBcv"), value: "bcv" },
    { label: t("budgets.rateBinance"), value: "binance" },
    { label: t("budgets.rateUsd"), value: "usd" },
    { label: t("budgets.rateEur"), value: "eur" },
  ];

  function submit() {
    const value = Number(amount);
    const next: { category?: string; amount?: string } = {};
    if (!categoryId) next.category = t("form.required");
    if (!amount || Number.isNaN(value) || value <= 0) next.amount = t("form.invalidNumber");
    setErrors(next);
    if (next.category || next.amount) return;
    onSubmit({ amount: value, period, categoryId: Number(categoryId), rate_source: rateSource });
  }

  return (
    <View style={styles.form}>
      <Select
        label={t("form.category")}
        options={categoryOptions}
        value={categoryId}
        onChange={setCategoryId}
        placeholder={t("form.selectOption")}
        error={errors.category}
      />
      <TextField
        label={t("form.amount")}
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        error={errors.amount}
      />
      <Select label={t("budgets.period")} options={periodOptions} value={period} onChange={setPeriod} />
      <Select label={t("budgets.rateSource")} options={rateOptions} value={rateSource} onChange={setRateSource} />
      <Button title={t("common.save")} onPress={submit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: 16 } });
