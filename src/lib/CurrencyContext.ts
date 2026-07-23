// Display-currency provider: holds the user's chosen reference currency in React
// context and persists it to expo-secure-store. Changes propagate to every
// consumer through context (no window events — this is React Native).
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { type DisplayCurrency, isDisplayCurrency } from "@/lib/displayCurrency";

const STORAGE_KEY = "platica_display_currency";

type Setter = (currency: DisplayCurrency) => void;

const CurrencyContext = createContext<readonly [DisplayCurrency, Setter] | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<DisplayCurrency>("USD");

  useEffect(() => {
    let active = true;
    void SecureStore.getItemAsync(STORAGE_KEY)
      .then((stored) => {
        if (active && isDisplayCurrency(stored)) setCurrencyState(stored);
      })
      .catch(() => {
        // Absent/unreadable preference just keeps the USD default.
      });
    return () => {
      active = false;
    };
  }, []);

  const setCurrency = useCallback<Setter>((next) => {
    setCurrencyState(next);
    void SecureStore.setItemAsync(STORAGE_KEY, next).catch(() => {
      // A failed write only loses persistence, not the in-session choice.
    });
  }, []);

  return React.createElement(CurrencyContext.Provider, { value: [currency, setCurrency] as const }, children);
}

/** [selectedDisplayCurrency, setDisplayCurrency]. USD outside a provider. */
export function useDisplayCurrency(): readonly [DisplayCurrency, Setter] {
  return useContext(CurrencyContext) ?? (["USD", () => {}] as const);
}
