import { apiClient } from "./api";
import type { MoneyCurrency } from "./transactions";

export type RecurringExecutionMode = "auto" | "manual";

export interface RecurringTransaction {
  id: string;
  amount: number;
  description: string;
  frequency: string;
  next_date: string;
  execution_mode: RecurringExecutionMode;
  is_active: boolean;
  categoryId: string;
  accountId: string;
  currency: MoneyCurrency;
  debtId: string | null;
}

export interface RecurringCreatePayload {
  amount: number;
  description: string;
  frequency: string;
  next_date: string;
  start_date: string;
  type: "gasto" | "ingreso";
  execution_mode: RecurringExecutionMode;
  is_active: boolean;
  categoryId: number;
  accountId?: number;
  currency: MoneyCurrency;
  debtId?: number | null;
}

export interface RecurringUpdatePayload {
  description?: string;
  amount?: number;
  frequency?: string;
  startDate?: string;
  nextDate?: string;
  type?: "gasto" | "ingreso";
  executionMode?: RecurringExecutionMode;
  isActive?: boolean;
  categoryId?: number;
  accountId?: number | null;
  currency?: MoneyCurrency;
  debtId?: number | null;
}

// pay-now: the backend requires an account (.or('accountId','account_id'));
// callers must supply one or the request 400s.
export interface PayNowPayload {
  date?: string;
  accountId: number;
  amount?: number;
  currency?: MoneyCurrency;
}

export interface TriggerResponse {
  ok?: boolean;
  success?: boolean;
  message?: string;
  processed?: number;
}

export interface PayNowResponse {
  success?: boolean;
  message?: string;
  subscription?: RecurringTransaction;
}

function unwrap<T>(res: T | { data?: T }): T {
  return res && typeof res === "object" && "data" in res ? (res as { data: T }).data : (res as T);
}

function mapRecurring(r: Record<string, unknown>): RecurringTransaction {
  const currency: MoneyCurrency = r.currency === "EUR" ? "EUR" : r.currency === "VES" ? "VES" : "USD";
  const debtId = r.debtId ?? r.debt_id;
  return {
    id: String(r.id ?? ""),
    amount: Number(r.amount ?? 0),
    description: String(r.description ?? ""),
    frequency: String(r.frequency ?? "monthly"),
    next_date: String(r.next_date ?? r.nextDate ?? ""),
    execution_mode: (r.execution_mode ?? r.executionMode) === "auto" ? "auto" : "manual",
    is_active: Boolean(r.is_active ?? r.isActive),
    categoryId: String(r.categoryId ?? r.category_id ?? ""),
    accountId: String(r.accountId ?? r.account_id ?? ""),
    currency,
    debtId: debtId != null ? String(debtId) : null,
  };
}

/** GET /recurring-transactions → bare array. */
export async function fetchRecurringTransactions(): Promise<RecurringTransaction[]> {
  const res = await apiClient<Record<string, unknown>[] | { data?: Record<string, unknown>[] }>("recurring-transactions");
  return (Array.isArray(res) ? res : res?.data ?? []).map(mapRecurring);
}

export async function createRecurringTransaction(payload: RecurringCreatePayload): Promise<RecurringTransaction> {
  return mapRecurring(unwrap(await apiClient("recurring-transactions", { method: "POST", body: payload })));
}

export async function updateRecurringTransaction(id: string, payload: RecurringUpdatePayload): Promise<RecurringTransaction> {
  return mapRecurring(unwrap(await apiClient(`recurring-transactions/${encodeURIComponent(id)}`, { method: "PATCH", body: payload })));
}

export async function deleteRecurringTransaction(id: string): Promise<TriggerResponse> {
  return apiClient(`recurring-transactions/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function triggerRecurringTransactions(): Promise<TriggerResponse> {
  return apiClient("recurring-transactions/trigger", { method: "POST" });
}

export async function payNowRecurringTransaction(id: string, payload: PayNowPayload): Promise<PayNowResponse> {
  return apiClient(`recurring-transactions/${encodeURIComponent(id)}/pay-now`, { method: "POST", body: payload });
}
