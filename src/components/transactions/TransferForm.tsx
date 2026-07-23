import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { FormSheet } from "@/components/ui/FormSheet";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import type { Account } from "@/services/finance";
import { createTransfer } from "@/services/transactions";

const today = () => new Date().toISOString().slice(0, 10);
const parseAmount = (s: string) => Number(s.replace(",", "."));

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  accounts: Account[];
}

export function TransferForm({ visible, onClose, onSaved, accounts }: Props) {
  const { t } = useTranslation();
  const [fromId, setFromId] = useState<string | null>(null);
  const [toId, setToId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [destinationAmount, setDestinationAmount] = useState("");
  const [date, setDate] = useState(today());
  const [concept, setConcept] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setError(null);
    setFromId(null);
    setToId(null);
    setAmount("");
    setDestinationAmount("");
    setDate(today());
    setConcept("");
  }, [visible]);

  const from = accounts.find((a) => a.id === fromId);
  const to = accounts.find((a) => a.id === toId);
  // Cross-currency legs need the amount actually received in the destination account.
  const crossCurrency = Boolean(from && to && from.currency !== to.currency);
  const options = accounts.map((a) => ({ label: `${a.name} · ${a.currency}`, value: a.id }));

  async function submit() {
    const value = parseAmount(amount);
    if (!from || !to) return setError(t("transactions.errAccounts"));
    if (from.id === to.id) return setError(t("transactions.errSameAccount"));
    if (!isFinite(value) || value <= 0) return setError(t("transactions.errAmount"));
    const dest = crossCurrency ? parseAmount(destinationAmount) : value;
    if (crossCurrency && (!isFinite(dest) || dest <= 0)) return setError(t("transactions.errDestinationAmount"));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError(t("transactions.errDate"));

    setBusy(true);
    setError(null);
    try {
      await createTransfer({
        fromAccountId: Number(from.id),
        toAccountId: Number(to.id),
        amount: value,
        destinationAmount: dest,
        date,
        concept: concept.trim() || undefined,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormSheet visible={visible} onClose={onClose} title={t("transactions.transferTitle")}>
      <Select label={t("transactions.from")} placeholder={t("transactions.selectAccount")} value={fromId} onChange={setFromId} options={options} />
      <Select label={t("transactions.to")} placeholder={t("transactions.selectAccount")} value={toId} onChange={setToId} options={options} />
      <TextField label={t("transactions.amount")} keyboardType="decimal-pad" placeholder="0.00" value={amount} onChangeText={setAmount} />
      {crossCurrency ? (
        <TextField
          label={t("transactions.destinationAmount")}
          keyboardType="decimal-pad"
          placeholder="0.00"
          value={destinationAmount}
          onChangeText={setDestinationAmount}
        />
      ) : null}
      <TextField label={t("transactions.date")} placeholder="YYYY-MM-DD" autoCapitalize="none" value={date} onChangeText={setDate} />
      <TextField
        label={t("transactions.concept")}
        placeholder={t("transactions.descriptionHint")}
        value={concept}
        onChangeText={setConcept}
        error={error}
      />
      <Button title={t("transactions.transferAction")} onPress={submit} loading={busy} />
    </FormSheet>
  );
}
