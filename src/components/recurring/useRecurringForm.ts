import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { deleteRecurringTransaction, type RecurringTransaction } from "@/services/recurring";
import type { Category } from "@/services/categories";
import {
  initialDraft,
  validateDraft,
  saveDraft,
  type RecurringDraft,
  type RecurringErrors,
} from "./recurringDraft";

/** Owns recurring create/edit state so the form stays presentational; logic lives in recurringDraft.ts. */
export function useRecurringForm(
  editing: RecurringTransaction | null | undefined,
  categories: Category[],
  onSaved: () => void,
  onClose: () => void,
) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<RecurringDraft>(() => initialDraft(editing));
  const [errors, setErrors] = useState<RecurringErrors>({});
  const [saving, setSaving] = useState(false);

  function set<K extends keyof RecurringDraft>(key: K, value: RecurringDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (key in prev ? { ...prev, [key]: undefined } : prev));
  }

  function fail(e: unknown) {
    Alert.alert(t("common.error"), e instanceof Error ? e.message : String(e));
  }

  async function submit() {
    const found = validateDraft(draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSaving(true);
    try {
      await saveDraft(draft, categories, editing);
      onSaved();
      onClose();
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!editing) return;
    Alert.alert(t("recurring.deleteTitle"), t("recurring.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => deleteRecurringTransaction(editing.id).then(onSaved).then(onClose).catch(fail),
      },
    ]);
  }

  // errors carry i18n keys; translate at read time
  const messages: RecurringErrors = {
    description: errors.description && t(errors.description),
    amount: errors.amount && t(errors.amount),
    category: errors.category && t(errors.category),
    nextDate: errors.nextDate && t(errors.nextDate),
  };

  return { draft, set, errors: messages, saving, submit, confirmDelete };
}
