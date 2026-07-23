// User preference for which BCV-quoted currency to show as the reference
// conversion (account balances, rate cards). Purely a display choice — the
// app's accounting stays in USD internally (amountUsd, totals) regardless.
//
// RN port of the web's src/lib/displayCurrency.ts: no window/localStorage — the
// choice lives in a React context (see CurrencyProvider) and persists to
// expo-secure-store. Pure helpers stay here; the provider lives in
// CurrencyContext.ts.
import type { RateSnapshot } from "@/services/rates";

export type DisplayCurrency = "USD" | "EUR" | "USDT";

export const DISPLAY_CURRENCIES: { value: DisplayCurrency; label: string; symbol: string }[] = [
  { value: "USD", label: "Dólar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "USDT", label: "USDT", symbol: "₮" },
];

export function currencySymbol(currency: DisplayCurrency): string {
  return DISPLAY_CURRENCIES.find((c) => c.value === currency)?.symbol ?? "$";
}

export function isDisplayCurrency(value: unknown): value is DisplayCurrency {
  return value === "USD" || value === "EUR" || value === "USDT";
}

// Converts a USD-denominated amount (the app's internal accounting unit) into the
// selected display currency via the VES cross-rate. Falls back to the USD amount
// when the target currency's rate isn't available (e.g. no USDT rate for the date).
export function convertUsdToDisplay(
  amountUsd: number,
  currency: DisplayCurrency,
  snap: RateSnapshot | null,
): number {
  if (currency === "USD" || !snap) return amountUsd;
  const targetVesPerUnit = currency === "EUR" ? snap.vesPerEur : snap.vesPerUsdt;
  if (!snap.vesPerUsd || !targetVesPerUnit) return amountUsd;
  return amountUsd * (snap.vesPerUsd / targetVesPerUnit);
}
