import { apiClient } from "./api";

export type TransactionType = "income" | "expense";
export type TransactionStatus = "pending" | "completed";
export type MoneyCurrency = "USD" | "EUR" | "VES";

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  categoryId: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  status?: TransactionStatus;
  currency?: MoneyCurrency;
  amountUsd: number | null;
  exchangeRateUsed: number | null;
}

export interface TransactionCreatePayload {
  description: string;
  amount: number;
  currency: MoneyCurrency;
  date: string;
  categoryId: number;
  accountId: number;
  /** Only honored on create; charged as a separate expense leg by the backend. */
  commission?: number;
}

export type TransactionUpdatePayload = Omit<TransactionCreatePayload, "commission">;

export interface TransferCreatePayload {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  destinationAmount: number;
  date: string;
  commission?: number;
  concept?: string;
}

export interface ConfirmTransactionPayload {
  date: string;
  accountId: number;
  amount: number;
  currency: MoneyCurrency;
}

/** grouped=1 paginated envelope. */
export interface TransactionPage {
  items: Transaction[];
  hasMore: boolean;
  nextCursorDate: string | null;
}

/** Filters accepted by the list; comma-separated ids allowed for category/account. */
export interface TransactionListParams {
  q?: string;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  debtId?: string | "null";
  date?: string; // YYYY-MM-DD
  dateFrom?: string;
  dateTo?: string;
  month?: string; // YYYY-MM
  pageSize?: number;
  cursorDate?: string | null;
}

const lower = (value: unknown) => String(value ?? "").toLowerCase();

export function mapTransaction(t: Record<string, unknown>): Transaction {
  const type: TransactionType = lower(t.type) === "ingreso" || lower(t.type) === "income" ? "income" : "expense";
  const s = lower(t.status);
  const status: TransactionStatus | undefined = s === "pending" ? "pending" : s === "completed" ? "completed" : undefined;
  return {
    id: String(t.id ?? ""),
    date: String(t.date ?? ""),
    description: String(t.description ?? ""),
    categoryId: String(t.categoryId ?? t.category_id ?? ""),
    accountId: String(t.accountId ?? t.account_id ?? ""),
    amount: Number(t.amount ?? 0),
    type,
    status,
    currency: (t.currency as MoneyCurrency) || undefined,
    amountUsd: t.amount_usd != null ? Number(t.amount_usd) : t.amountUsd != null ? Number(t.amountUsd) : null,
    exchangeRateUsed:
      t.exchange_rate_used != null ? Number(t.exchange_rate_used) : t.exchangeRateUsed != null ? Number(t.exchangeRateUsed) : null,
  };
}

function buildListQuery(p: TransactionListParams, grouped: 0 | 1): string {
  const sp = new URLSearchParams();
  sp.set("grouped", String(grouped));
  if (grouped === 1) sp.set("pageSize", String(p.pageSize ?? 20));
  if (p.q?.trim()) sp.set("q", p.q.trim());
  if (p.type) sp.set("type", p.type);
  if (p.categoryId) sp.set("categoryId", p.categoryId);
  if (p.accountId) sp.set("accountId", p.accountId);
  if (p.debtId != null) sp.set("debtId", p.debtId);
  if (p.date) sp.set("date", p.date);
  if (p.dateFrom) sp.set("dateFrom", p.dateFrom);
  if (p.dateTo) sp.set("dateTo", p.dateTo);
  if (p.month) sp.set("month", p.month);
  if (p.cursorDate) sp.set("cursorDate", p.cursorDate);
  return sp.toString();
}

const unwrapTx = (res: Record<string, unknown> | { tx: Record<string, unknown> }) =>
  mapTransaction("tx" in res ? (res.tx as Record<string, unknown>) : res);

/** grouped=0 → bare array. */
export async function fetchTransactions(params: TransactionListParams = {}): Promise<Transaction[]> {
  const res = await apiClient<Record<string, unknown>[] | { items?: Record<string, unknown>[] }>(`transactions?${buildListQuery(params, 0)}`);
  return (Array.isArray(res) ? res : res.items ?? []).map(mapTransaction);
}

/** grouped=1 → { items, hasMore, nextCursorDate }. */
export async function fetchTransactionsPage(params: TransactionListParams = {}): Promise<TransactionPage> {
  const res = await apiClient<{ items?: Record<string, unknown>[]; hasMore?: boolean; nextCursorDate?: string | null }>(`transactions?${buildListQuery(params, 1)}`);
  return { items: (res.items ?? []).map(mapTransaction), hasMore: Boolean(res.hasMore), nextCursorDate: res.nextCursorDate ?? null };
}

export async function createTransaction(payload: TransactionCreatePayload): Promise<Transaction> {
  return unwrapTx(await apiClient("transactions", { method: "POST", body: payload }));
}

export async function updateTransaction(id: string, payload: TransactionUpdatePayload): Promise<Transaction> {
  return unwrapTx(await apiClient(`transactions?id=${encodeURIComponent(id)}`, { method: "PATCH", body: payload }));
}

export async function removeTransaction(id: string): Promise<void> {
  await apiClient(`transactions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function createTransfer(payload: TransferCreatePayload): Promise<{ ok: boolean; transfer: Record<string, unknown> }> {
  return apiClient("transactions/transfer", { method: "POST", body: payload });
}

export async function confirmTransaction(id: string, payload: ConfirmTransactionPayload): Promise<Transaction> {
  const res = await apiClient<{ tx: Record<string, unknown> }>(`transactions/${encodeURIComponent(id)}/confirm`, { method: "PATCH", body: payload });
  return mapTransaction(res.tx);
}
