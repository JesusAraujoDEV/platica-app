import { useState, useEffect, useCallback } from "react";
import { router } from "expo-router";
import { initAuth, storeToken, clearToken } from "@/services/auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth().then((hasToken) => {
      setIsAuthenticated(hasToken);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (token: string) => {
    await storeToken(token);
    setIsAuthenticated(true);
    router.replace("/(tabs)");
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setIsAuthenticated(false);
    router.replace("/(auth)/login");
  }, []);

  return { isAuthenticated, isLoading, login, logout };
}
