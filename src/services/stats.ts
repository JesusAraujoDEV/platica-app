import { apiClient } from "./api";

// Camel-case inputs; the builder maps each to the EXACT deployed query name.
export interface StatsParams {
  accountId?: string;
  groupId?: number;
  fromDate?: string; // → from_date
  toDate?: string; // → to_date
  timeUnit?: string; // → time_unit
  topN?: number; // → top_n_categories
  date?: string;
  budgetTotal?: number; // → budget_total
  currentFrom?: string; // → current_from
  currentTo?: string; // → current_to
  previousFrom?: string; // → previous_from
  previousTo?: string; // → previous_to
}

function buildQuery(p: StatsParams): string {
  const sp = new URLSearchParams();
  if (p.accountId) sp.set("accountId", p.accountId);
  if (typeof p.groupId === "number") sp.set("groupId", String(p.groupId));
  if (p.fromDate) sp.set("from_date", p.fromDate);
  if (p.toDate) sp.set("to_date", p.toDate);
  if (p.timeUnit) sp.set("time_unit", p.timeUnit);
  if (typeof p.topN === "number") sp.set("top_n_categories", String(p.topN));
  if (p.date) sp.set("date", p.date);
  if (typeof p.budgetTotal === "number") sp.set("budget_total", String(p.budgetTotal));
  if (p.currentFrom) sp.set("current_from", p.currentFrom);
  if (p.currentTo) sp.set("current_to", p.currentTo);
  if (p.previousFrom) sp.set("previous_from", p.previousFrom);
  if (p.previousTo) sp.set("previous_to", p.previousTo);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

const get = <T>(endpoint: string, p: StatsParams) => apiClient<T>(`stats/${endpoint}${buildQuery(p)}`);

// 1) Net cash flow — deployed API emits total_income/total_expenses/avg_savings_rate
// and time_series[].expenses (plural). Normalized here to a single shape.
export interface NetCashFlowPoint { period: string; income: number; expense: number; net_flow: number; savings_rate: number }
export interface NetCashFlowResponse {
  summary: { net_cash_flow?: number; income_total?: number; expense_total?: number; savings_rate_avg?: number };
  time_series: NetCashFlowPoint[];
}
export async function fetchNetCashFlow(params: StatsParams = {}): Promise<NetCashFlowResponse> {
  const res = await get<Record<string, any>>("net-cash-flow", params);
  const s = res?.summary ?? {};
  return {
    summary: {
      net_cash_flow: s.net_cash_flow,
      income_total: s.income_total ?? s.total_income,
      expense_total: s.expense_total ?? s.total_expenses,
      savings_rate_avg: s.savings_rate_avg ?? s.avg_savings_rate,
    },
    time_series: (res?.time_series ?? []).map((p: Record<string, any>) => ({
      period: p.period,
      income: Number(p.income || 0),
      expense: Number(p.expense ?? p.expenses ?? 0),
      net_flow: Number(p.net_flow || 0),
      savings_rate: Number(p.savings_rate || 0),
    })),
  };
}

// 2/A) Heatmaps (spending + income share the shape)
export interface HeatmapResponse {
  categories: string[];
  weekdays: string[];
  data_points: Array<{ category_idx: number; day_idx: number; amount: number }>;
  summary?: { peak_category?: string; peak_day?: string };
}
export const fetchSpendingHeatmap = (p: StatsParams = {}) => get<HeatmapResponse>("spending-heatmap", p);
export const fetchIncomeHeatmap = (p: StatsParams = {}) => get<HeatmapResponse>("income-heatmap", p);

// 3/B) Volatility (box plot — expense + income share the shape)
export interface VolatilityCategory { category: string; min: number; q1: number; median: number; q3: number; max: number; outliers?: number[]; count?: number }
export interface VolatilityResponse { categories_data: VolatilityCategory[] }
export const fetchExpenseVolatility = (p: StatsParams = {}) => get<VolatilityResponse>("expense-volatility", p);
export const fetchIncomeVolatility = (p: StatsParams = {}) => get<VolatilityResponse>("income-volatility", p);

// 4/C) Comparative month-over-month (expense + income share the shape)
export interface ComparativeResponse {
  summary: {
    current_total: number; previous_total: number;
    total_delta_percent: number; total_delta_usd: number;
    current_period_start?: string; current_period_end?: string;
    previous_period_start?: string; previous_period_end?: string;
  };
  categories_comparison: Array<{ category: string; current: number; previous: number; delta_percent: number }>;
}
export const fetchComparativeMoM = (p: StatsParams = {}) => get<ComparativeResponse>("comparative-mom", p);
export const fetchComparativeMoMIncome = (p: StatsParams = {}) => get<ComparativeResponse>("comparative-mom-income", p);

// 5) Monthly forecast
export interface MonthlyForecastResponse {
  budget_total: number;
  current_spending_mtd: number;
  projected_total_spending: number;
  projected_over_under: number;
}
export const fetchMonthlyForecast = (p: StatsParams = {}) => get<MonthlyForecastResponse>("monthly-forecast", p);
