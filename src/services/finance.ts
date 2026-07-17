import { apiClient } from "./api";

export interface Account {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  currency: string;
  amountUsd: number | null;
  date: string;
  type: "income" | "expense";
  status?: string;
}

export interface DashboardData {
  accountsTotal: number;
  incomeTotal: number;
  expenseTotal: number;
  netTotal: number;
  recentTransactions: Transaction[];
}

export type FeatureSlug =
  | "subscriptions"
  | "categories"
  | "category-groups"
  | "budgets"
  | "debts"
  | "rates"
  | "statistics"
  | "calendar";

export interface FeatureDefinition {
  slug: FeatureSlug;
  titleKey: string;
  icon: string;
}

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  { slug: "subscriptions", titleKey: "features.subscriptions", icon: "repeat-outline" },
  { slug: "categories", titleKey: "features.categories", icon: "pricetags-outline" },
  { slug: "category-groups", titleKey: "features.categoryGroups", icon: "albums-outline" },
  { slug: "budgets", titleKey: "features.budgets", icon: "pie-chart-outline" },
  { slug: "debts", titleKey: "features.debts", icon: "receipt-outline" },
  { slug: "rates", titleKey: "features.rates", icon: "cash-outline" },
  { slug: "statistics", titleKey: "features.statistics", icon: "stats-chart-outline" },
  { slug: "calendar", titleKey: "features.calendar", icon: "calendar-outline" },
];

function mapTransaction(item: Record<string, unknown>): Transaction {
  const rawType = String(item.type ?? "").toLowerCase();
  return {
    id: String(item.id ?? ""),
    description: String(item.description ?? ""),
    amount: Number(item.amount ?? 0),
    currency: String(item.currency ?? "USD"),
    amountUsd: item.amountUsd != null
      ? Number(item.amountUsd)
      : item.amount_usd != null
        ? Number(item.amount_usd)
        : null,
    date: String(item.date ?? ""),
    type: rawType === "income" || rawType === "ingreso" ? "income" : "expense",
    status: item.status == null ? undefined : String(item.status),
  };
}

export async function fetchAccounts(): Promise<Account[]> {
  const response = await apiClient<Record<string, unknown>[]>("accounts");
  return (response || []).map((item) => ({
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    type: String(item.type ?? ""),
    currency: String(item.currency ?? "USD"),
    balance: Number(item.balance ?? 0),
  }));
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const response = await apiClient<Record<string, unknown>[] | { items?: Record<string, unknown>[] }>(
    "transactions?grouped=0",
  );
  const list = Array.isArray(response) ? response : response.items ?? [];
  return list.map(mapTransaction);
}

export async function fetchDashboard(): Promise<DashboardData> {
  const [balanceResponse, transactions] = await Promise.all([
    apiClient<{ balance?: number | Record<string, unknown> }>("summary/balance"),
    fetchTransactions(),
  ]);
  const balance = balanceResponse.balance;
  const summary = typeof balance === "object" && balance !== null ? balance : {};
  return {
    accountsTotal: Number(summary.accounts_total_usd ?? balance ?? 0),
    incomeTotal: Number(summary.income_total_usd ?? 0),
    expenseTotal: Number(summary.expense_total_usd ?? 0),
    netTotal: Number(summary.net_total_usd ?? balance ?? 0),
    recentTransactions: transactions.slice(0, 5),
  };
}

function extractRows(response: unknown): Record<string, unknown>[] {
  if (Array.isArray(response)) return response as Record<string, unknown>[];
  if (!response || typeof response !== "object") return [];
  const object = response as Record<string, unknown>;
  for (const key of ["data", "items", "rates", "events"]) {
    if (Array.isArray(object[key])) return object[key] as Record<string, unknown>[];
  }
  return [object];
}

export async function fetchFeatureData(slug: FeatureSlug): Promise<Record<string, unknown>[]> {
  if (slug === "statistics") {
    const date = new Date().toISOString().slice(0, 10);
    const [expenses, income] = await Promise.all([
      apiClient<Record<string, unknown>>(`stats/comparative-mom?date=${date}`),
      apiClient<Record<string, unknown>>(`stats/comparative-mom-income?date=${date}`),
    ]);
    return [
      { section: "Gastos", ...((expenses.summary as Record<string, unknown>) ?? expenses) },
      { section: "Ingresos", ...((income.summary as Record<string, unknown>) ?? income) },
    ];
  }

  const endpoints: Record<Exclude<FeatureSlug, "statistics">, string> = {
    subscriptions: "recurring-transactions",
    categories: "categories",
    "category-groups": "category-groups",
    budgets: "budgets/status",
    debts: "debts",
    rates: "exchange-rates/history",
    calendar: "agenda/forecast",
  };
  return extractRows(await apiClient<unknown>(endpoints[slug]));
}
