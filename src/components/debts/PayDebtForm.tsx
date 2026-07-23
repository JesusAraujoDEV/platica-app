import { useCallback, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { RemoteState } from "@/components/RemoteState";
import { useRemoteData } from "@/hooks/useRemoteData";
import { fetchAccounts } from "@/services/finance";

export interface PayDebtValues {
  amount: number;
  accountId: number;
  date: string;
}

interface PayDebtFormProps {
  submitting?: boolean;
  onSubmit: (values: PayDebtValues) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function PayDebtForm({ submitting, onSubmit }: PayDebtFormProps) {
  const { t } = useTranslation();
  const { data: accounts, loading, error, reload } = useRemoteData(useCallback(fetchAccounts, []));
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [accountId, setAccountId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ amount?: string; account?: string }>({});

  if (loading || error) return <RemoteState loading={loading} error={error} onRetry={() => void reload()} />;

  const accountOptions = (accounts ?? []).map((a) => ({ label: `${a.name} · ${a.currency}`, value: a.id }));

  function submit() {
    const value = Number(amount);
    const next: { amount?: string; account?: string } = {};
    if (!amount || Number.isNaN(value) || value <= 0) next.amount = t("form.invalidNumber");
    if (!accountId) next.account = t("form.required");
    setErrors(next);
    if (next.amount || next.account) return;
    onSubmit({ amount: value, accountId: Number(accountId), date: date.trim() });
  }

  return (
    <View style={styles.form}>
      <TextField
        label={t("form.amount")}
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        error={errors.amount}
      />
      <TextField label={t("form.date")} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" autoCapitalize="none" />
      <Select
        label={t("form.account")}
        options={accountOptions}
        value={accountId}
        onChange={setAccountId}
        placeholder={t("form.selectOption")}
        error={errors.account}
      />
      <Button title={t("debts.pay")} onPress={submit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: 16 } });
