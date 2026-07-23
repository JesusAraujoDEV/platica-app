import {
  createRecurringTransaction,
  updateRecurringTransaction,
  type RecurringTransaction,
  type RecurringExecutionMode,
} from "@/services/recurring";
import type { MoneyCurrency } from "@/services/transactions";
import type { Category } from "@/services/categories";

export interface RecurringDraft {
  description: string;
  amount: string;
  currency: MoneyCurrency;
  accountId: string | null;
  categoryId: string | null;
  frequency: string;
  nextDate: string;
  mode: RecurringExecutionMode;
  active: boolean;
}

export type RecurringField = "description" | "amount" | "category" | "nextDate";
export type RecurringErrors = Partial<Record<RecurringField, string>>;

export function initialDraft(editing?: RecurringTransaction | null): RecurringDraft {
  return {
    description: editing?.description ?? "",
    amount: editing ? String(editing.amount) : "",
    currency: editing?.currency ?? "USD",
    accountId: editing?.accountId || null,
    categoryId: editing?.categoryId || null,
    frequency: editing?.frequency ?? "monthly",
    nextDate: editing?.next_date ?? "",
    mode: editing?.execution_mode ?? "manual",
    active: editing?.is_active ?? true,
  };
}

/** Returns i18n keys per invalid field; empty object means valid. */
export function validateDraft(draft: RecurringDraft): RecurringErrors {
  const errors: RecurringErrors = {};
  const parsed = Number(draft.amount);
  if (!draft.description.trim()) errors.description = "recurring.descriptionRequired";
  if (!draft.amount.trim() || Number.isNaN(parsed) || parsed <= 0) errors.amount = "recurring.amountInvalid";
  if (!draft.categoryId) errors.category = "recurring.categoryRequired";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.nextDate.trim())) errors.nextDate = "recurring.dateInvalid";
  return errors;
}

export async function saveDraft(
  draft: RecurringDraft,
  categories: Category[],
  editing?: RecurringTransaction | null,
): Promise<void> {
  const category = categories.find((c) => c.id === draft.categoryId);
  const type: "gasto" | "ingreso" = category?.type === "income" ? "ingreso" : "gasto";
  const amount = Number(draft.amount);
  const date = draft.nextDate.trim();
  const categoryId = Number(draft.categoryId);
  const accountId = draft.accountId ? Number(draft.accountId) : undefined;

  if (editing) {
    await updateRecurringTransaction(editing.id, {
      description: draft.description.trim(),
      amount,
      frequency: draft.frequency,
      nextDate: date,
      startDate: date,
      type,
      executionMode: draft.mode,
      isActive: draft.active,
      categoryId,
      accountId: accountId ?? null,
      currency: draft.currency,
    });
    return;
  }
  await createRecurringTransaction({
    description: draft.description.trim(),
    amount,
    frequency: draft.frequency,
    next_date: date,
    start_date: date,
    type,
    execution_mode: draft.mode,
    is_active: draft.active,
    categoryId,
    accountId,
    currency: draft.currency,
  });
}
