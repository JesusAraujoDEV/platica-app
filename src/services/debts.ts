import { apiClient } from "./api";
import type { MoneyCurrency } from "./transactions";

export type DebtType = "payable" | "receivable";
export type DebtStatus = "pending" | "partial" | "paid";

export interface Debt {
  id: string;
  type: DebtType;
  contactName: string;
  description: string;
  totalAmount: number;
  currency: MoneyCurrency;
  dueDate: string | null;
  status: DebtStatus;
  paidAmount: number;
  remaining: number;
  categoryId: string | null;
}

export interface CreateDebtPayload {
  type: DebtType;
  contactName: string;
  description: string;
  totalAmount: number;
  currency: MoneyCurrency;
  dueDate: string | null;
  categoryId?: number | null;
}

// type + currency are immutable post-creation; the deployed updateDebtSchema
// (.unknown(false)) hard-rejects them with a 400. Never send them on update.
export interface UpdateDebtPayload {
  contactName?: string;
  description?: string;
  totalAmount?: number;
  dueDate?: string | null;
  categoryId?: number | null;
}

export interface PayDebtPayload {
  amount: number;
  currency: string;
  accountId: number;
  date: string;
  categoryId?: number;
  exchangeRate?: number;
}

export interface DebtMutationResponse {
  ok?: boolean;
  success?: boolean;
  message?: string;
}

function unwrap<T>(res: T | { data?: T }): T {
  return res && typeof res === "object" && "data" in res ? (res as { data: T }).data : (res as T);
}

function mapDebt(d: Record<string, unknown>): Debt {
  const currency: MoneyCurrency = d.currency === "EUR" ? "EUR" : d.currency === "VES" ? "VES" : "USD";
  const type: DebtType = String(d.type ?? "payable").toLowerCase() === "receivable" ? "receivable" : "payable";
  const st = String(d.status ?? "pending").toLowerCase();
  const status: DebtStatus = st === "paid" ? "paid" : st === "partial" ? "partial" : "pending";
  const total = Number(d.totalAmount ?? d.total_amount ?? 0);
  const paid = Number(d.paidAmount ?? d.paid_amount ?? 0);
  const catId = d.categoryId ?? d.category_id;
  return {
    id: String(d.id ?? ""),
    type,
    contactName: String(d.contactName ?? d.contact_name ?? ""),
    description: String(d.description ?? ""),
    totalAmount: total,
    currency,
    dueDate: (d.dueDate ?? d.due_date ?? null) as string | null,
    status,
    paidAmount: paid,
    remaining: Number(d.remaining ?? total - paid),
    categoryId: catId != null ? String(catId) : null,
  };
}

/** GET /debts → { success, data } or bare array. */
export async function fetchDebts(): Promise<Debt[]> {
  const res = await apiClient<Record<string, unknown>[] | { data?: Record<string, unknown>[] }>("debts");
  return (Array.isArray(res) ? res : res?.data ?? []).map(mapDebt);
}

export async function createDebt(payload: CreateDebtPayload): Promise<Debt> {
  return mapDebt(unwrap(await apiClient("debts", { method: "POST", body: payload })));
}

export async function updateDebt(id: string, payload: UpdateDebtPayload): Promise<Debt> {
  return mapDebt(unwrap(await apiClient(`debts/${encodeURIComponent(id)}`, { method: "PATCH", body: payload })));
}

export async function payDebt(id: string, payload: PayDebtPayload): Promise<DebtMutationResponse> {
  return apiClient(`debts/${encodeURIComponent(id)}/pay`, { method: "POST", body: payload });
}

export async function deleteDebt(id: string): Promise<DebtMutationResponse> {
  return apiClient(`debts/${encodeURIComponent(id)}`, { method: "DELETE" });
}
