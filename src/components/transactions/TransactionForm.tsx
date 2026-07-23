import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { FormSheet } from "@/components/ui/FormSheet";
import { Select } from "@/components/ui/Select";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { TextField } from "@/components/ui/TextField";
import type { Account } from "@/services/finance";
import type { Category } from "@/services/categories";
import {
  createTransaction,
  removeTransaction,
  updateTransaction,
  type MoneyCurrency,
  type Transaction,
  type TransactionType,
} from "@/services/transactions";

const today = () => new Date().toISOString().slice(0, 10);
const parseAmount = (s: string) => Number(s.replace(",", "."));

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  accounts: Account[];
  categories: Category[];
  editing: Transaction | null;
}

export function TransactionForm({ visible, onClose, onSaved, accounts, categories, editing }: Props) {
  const { t } = useTranslation();
  const [type, setType] = useState<TransactionType>("expense");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Re-seed fields whenever the sheet opens (add = blank, edit = prefilled).
  useEffect(() => {
    if (!visible) return;
    setError(null);
    setType(editing?.type ?? "expense");
    setAccountId(editing?.accountId ?? null);
    setCategoryId(editing?.categoryId ?? null);
    setAmount(editing ? String(editing.amount) : "");
    setDate(editing?.date || today());
    setDescription(editing?.description ?? "");
  }, [visible, editing]);

  const changeType = (next: TransactionType) => {
    setType(next);
    if (categoryId && !categories.some((c) => c.id === categoryId && c.type === next)) setCategoryId(null);
  };

  async function submit() {
    const value = parseAmount(amount);
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return setError(t("transactions.errAccount"));
    if (!categoryId) return setError(t("transactions.errCategory"));
    if (!isFinite(value) || value <= 0) return setError(t("transactions.errAmount"));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError(t("transactions.errDate"));

    setBusy(true);
    setError(null);
    const payload = {
      description: description.trim(),
      amount: value,
      currency: account.currency as MoneyCurrency,
      date,
      categoryId: Number(categoryId),
      accountId: Number(account.id),
    };
    try {
      await (editing ? updateTransaction(editing.id, payload) : createTransaction(payload));
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  async function runDelete() {
    if (!editing) return;
    setBusy(true);
    try {
      await removeTransaction(editing.id);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
      setBusy(false);
    }
  }

  const confirmDelete = () =>
    Alert.alert(t("transactions.deleteTitle"), t("transactions.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: runDelete },
    ]);

  return (
    <FormSheet visible={visible} onClose={onClose} title={editing ? t("transactions.editTitle") : t("transactions.addTitle")}>
      <SegmentedToggle
        value={type}
        onChange={changeType}
        options={[
          { label: t("transactions.income"), value: "income" },
          { label: t("transactions.expense"), value: "expense" },
        ]}
      />
      <Select
        label={t("transactions.account")}
        placeholder={t("transactions.selectAccount")}
        value={accountId}
        onChange={setAccountId}
        options={accounts.map((a) => ({ label: `${a.name} · ${a.currency}`, value: a.id }))}
      />
      <Select
        label={t("transactions.category")}
        placeholder={t("transactions.selectCategory")}
        value={categoryId}
        onChange={setCategoryId}
        options={categories.filter((c) => c.type === type).map((c) => ({ label: c.name, value: c.id }))}
      />
      <TextField label={t("transactions.amount")} keyboardType="decimal-pad" placeholder="0.00" value={amount} onChangeText={setAmount} />
      <TextField label={t("transactions.date")} placeholder="YYYY-MM-DD" autoCapitalize="none" value={date} onChangeText={setDate} />
      <TextField
        label={t("transactions.description")}
        placeholder={t("transactions.descriptionHint")}
        value={description}
        onChangeText={setDescription}
        error={error}
      />
      <Button title={editing ? t("common.save") : t("common.add")} onPress={submit} loading={busy} />
      {editing ? <Button title={t("common.delete")} variant="destructive" onPress={confirmDelete} disabled={busy} /> : null}
    </FormSheet>
  );
}
