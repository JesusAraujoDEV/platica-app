import { apiClient } from "./api";

export interface GlobalBalance {
  accounts_total_usd: number;
  income_total_usd: number;
  expense_total_usd: number;
  net_total_usd: number;
}

// Optional filters shared by the three summary endpoints. Only the ones a caller
// sets are sent. accountId/categoryId accept comma-separated id lists.
export interface SummaryParams {
  month?: string; // YYYY-MM
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  accountIds?: string[];
  categoryIds?: string[];
  q?: string;
  groupId?: number;
}

function buildQuery(p: SummaryParams, monthAsRange: boolean): string {
  const sp = new URLSearchParams();
  if (p.month && monthAsRange) {
    sp.set("from_month", p.month);
    sp.set("to_month", p.month);
  } else if (p.month) {
    sp.set("month", p.month);
  }
  if (p.date) sp.set("date", p.date);
  if (p.dateFrom) sp.set("dateFrom", p.dateFrom);
  if (p.dateTo) sp.set("dateTo", p.dateTo);
  if (p.accountIds?.length) sp.set("accountId", p.accountIds.join(","));
  if (p.categoryIds?.length) sp.set("categoryId", p.categoryIds.join(","));
  if (p.q?.trim()) sp.set("q", p.q.trim());
  if (typeof p.groupId === "number") sp.set("groupId", String(p.groupId));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

/** GET /summary/balance → { ok, balance:{ accounts_total_usd, income_total_usd, expense_total_usd, net_total_usd } }. */
export async function fetchGlobalBalance(params: SummaryParams = {}): Promise<GlobalBalance> {
  const res = await apiClient<{ balance?: Record<string, unknown> }>(`summary/balance${buildQuery(params, false)}`);
  const b = res?.balance ?? {};
  return {
    accounts_total_usd: Number(b.accounts_total_usd ?? 0),
    income_total_usd: Number(b.income_total_usd ?? 0),
    expense_total_usd: Number(b.expense_total_usd ?? 0),
    net_total_usd: Number(b.net_total_usd ?? 0),
  };
}

async function fetchScalar(endpoint: "income" | "expense", key: string, params: SummaryParams): Promise<number> {
  const res = await apiClient<number | Record<string, unknown>>(`summary/${endpoint}${buildQuery(params, true)}`);
  if (typeof res === "number") return res;
  if (typeof res?.[key] === "number") return res[key] as number;
  if (typeof res?.total === "number") return res.total as number;
  if (typeof res?.amount === "number") return res.amount as number;
  return 0;
}

/** GET /summary/income → total income (USD). */
export const fetchIncomeSummary = (params: SummaryParams = {}) => fetchScalar("income", "income_total", params);

/** GET /summary/expense → total expense (USD). */
export const fetchExpenseSummary = (params: SummaryParams = {}) => fetchScalar("expense", "expense_total", params);
