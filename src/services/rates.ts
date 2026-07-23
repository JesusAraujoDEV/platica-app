import React, { createContext, useContext } from "react";
import { apiClient } from "./api";
import { useRemoteData } from "@/hooks/useRemoteData";

export interface ExchangeRate {
  date: string; // YYYY-MM-DD
  usdRate: number; // VES per 1 USD
  eurRate: number; // VES per 1 EUR
  usdtRate: number | null;
  source?: "live" | "fallback";
}

/** VES-per-unit snapshot consumed by convertUsdToDisplay. */
export interface RateSnapshot {
  vesPerUsd: number;
  vesPerEur: number;
  vesPerUsdt: number | null;
}

export function toRateSnapshot(rate: ExchangeRate): RateSnapshot {
  return {
    vesPerUsd: Number(rate.usdRate) || 0,
    vesPerEur: Number(rate.eurRate) || 0,
    vesPerUsdt: rate.usdtRate != null ? Number(rate.usdtRate) : null,
  };
}

export async function fetchCurrentRate(): Promise<ExchangeRate> {
  const res = await apiClient<{ ok: boolean; rate: ExchangeRate }>("exchange-rates/current");
  return res.rate;
}

export async function fetchRateByDate(date: string): Promise<ExchangeRate> {
  const res = await apiClient<{ ok: boolean; rate: ExchangeRate }>(
    `exchange-rates/by-date?date=${encodeURIComponent(date)}`,
  );
  return res.rate;
}

export async function fetchRateHistory(params?: { from?: string; to?: string }): Promise<ExchangeRate[]> {
  const sp = new URLSearchParams();
  if (params?.from) sp.set("from", params.from);
  if (params?.to) sp.set("to", params.to);
  const qs = sp.toString();
  const res = await apiClient<{ ok: boolean; rates: ExchangeRate[] }>(
    `exchange-rates/history${qs ? `?${qs}` : ""}`,
  );
  return res.rates ?? [];
}

// ── Shared current-rate context ─────────────────────────────────────────────
// One fetch app-wide so every <Money> row reads the same snapshot instead of
// firing its own GET.
interface CurrentRateValue {
  rate: RateSnapshot | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const CurrentRateContext = createContext<CurrentRateValue | null>(null);

export function RateProvider({ children }: { children: React.ReactNode }) {
  const { data, loading, error, reload } = useRemoteData(fetchCurrentRate);
  const value: CurrentRateValue = {
    rate: data ? toRateSnapshot(data) : null,
    loading,
    error,
    reload,
  };
  return React.createElement(CurrentRateContext.Provider, { value }, children);
}

/** Current VES rate snapshot. Falls back to null (USD passthrough) outside a provider. */
export function useCurrentRate(): CurrentRateValue {
  return useContext(CurrentRateContext) ?? { rate: null, loading: false, error: null, reload: () => {} };
}
