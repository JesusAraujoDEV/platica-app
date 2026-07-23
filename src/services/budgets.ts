import { apiClient } from "./api";

export type BudgetPeriod = "monthly" | "yearly" | "one_time";
// Which exchange rate a budget's target is measured against.
export type RateSource = "bcv" | "binance" | "eur" | "usd";

export interface BudgetCategorySummary {
  id: string;
  name: string;
  icon: string | null;
  color?: string;
  colorName?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  budgeted: number;
  period: BudgetPeriod;
  specific_month: string | null;
  rate_source: RateSource | null;
}

export interface BudgetStatus {
  id: string;
  category: BudgetCategorySummary;
  budgeted: number;
  budgeted_original: number | null;
  period: BudgetPeriod;
  specific_month: string | null;
  rate_source: RateSource | null;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export interface BudgetUpsertPayload {
  amount: number;
  period: BudgetPeriod;
  specific_month?: string | null;
  categoryId?: number | null;
  rate_source?: RateSource | null;
}

export interface BudgetDeleteResponse {
  ok?: boolean;
  success?: boolean;
  message?: string;
}

const asPeriod = (p: unknown): BudgetPeriod => (p === "yearly" || p === "one_time" ? p : "monthly");

function unwrap<T>(res: T | { success?: boolean; data?: T }): T {
  return res && typeof res === "object" && "data" in res ? (res as { data: T }).data : (res as T);
}

function mapBudget(b: Record<string, unknown>): Budget {
  return {
    id: String(b.id ?? ""),
    categoryId: String(b.categoryId ?? b.category_id ?? ""),
    budgeted: Number(b.amount ?? b.budgeted ?? 0),
    period: asPeriod(b.period),
    specific_month: (b.specific_month as string | null) ?? null,
    rate_source: (b.rate_source as RateSource | null) ?? null,
  };
}

function mapStatus(s: Record<string, unknown>): BudgetStatus {
  const c = s.category;
  const category: BudgetCategorySummary =
    typeof c === "string"
      ? { id: "", name: c, icon: null }
      : {
          id: String((c as Record<string, unknown>)?.id ?? ""),
          name: String((c as Record<string, unknown>)?.name ?? ""),
          icon: ((c as Record<string, unknown>)?.icon as string | null) ?? null,
          color: (c as Record<string, unknown>)?.color as string | undefined,
          colorName: (c as Record<string, unknown>)?.colorName as string | undefined,
        };
  return {
    id: String(s.id ?? ""),
    category,
    budgeted: Number(s.budgeted ?? 0),
    budgeted_original: (s.budgeted_original as number | null) ?? null,
    period: asPeriod(s.period),
    specific_month: (s.specific_month as string | null) ?? null,
    rate_source: (s.rate_source as RateSource | null) ?? null,
    spent: Number(s.spent ?? 0),
    remaining: Number(s.remaining ?? 0),
    percentageUsed: Number(s.percentageUsed ?? 0),
  };
}

async function fetchList(path: string): Promise<Record<string, unknown>[]> {
  const res = await apiClient<Record<string, unknown>[] | { data?: Record<string, unknown>[] }>(path);
  return Array.isArray(res) ? res : res?.data ?? [];
}

/** GET /budgets → { success, data:[] } or bare array. */
export async function fetchBudgets(): Promise<Budget[]> {
  return (await fetchList("budgets")).map(mapBudget);
}

/** GET /budgets/status → { success, data:[] } or bare array. */
export async function fetchBudgetsStatus(): Promise<BudgetStatus[]> {
  return (await fetchList("budgets/status")).map(mapStatus);
}

export async function createBudget(payload: BudgetUpsertPayload): Promise<Budget> {
  return mapBudget(unwrap(await apiClient("budgets", { method: "POST", body: payload })));
}

export async function updateBudget(id: string, payload: BudgetUpsertPayload): Promise<Budget> {
  return mapBudget(unwrap(await apiClient(`budgets/${encodeURIComponent(id)}`, { method: "PATCH", body: payload })));
}

export async function deleteBudget(id: string): Promise<BudgetDeleteResponse> {
  return apiClient(`budgets/${encodeURIComponent(id)}`, { method: "DELETE" });
}
