import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError, apiClient, setAuthToken, setUnauthorizedHandler } from "@/services/api";
import { clearToken, getStoredToken, storeToken } from "@/services/auth";

export interface AuthUser {
  id: string | number;
  username: string;
  email: string;
  name?: string | null;
}

type AuthStatus = "loading" | "authenticated" | "anonymous" | "error";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  retry: () => Promise<void>;
}

interface AuthSessionResponse {
  ok: boolean;
  token: string;
  user: AuthUser;
}

interface AuthProfileResponse {
  ok: boolean;
  user: AuthUser;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearLocalSession = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    setError(null);
    setStatus("anonymous");
    try {
      await clearToken();
    } catch {
      // In-memory logout must succeed even if secure storage is unavailable.
    }
  }, []);

  const restoreSession = useCallback(async () => {
    setStatus("loading");
    setError(null);
    const token = await getStoredToken();
    if (!token) {
      setAuthToken(null);
      setUser(null);
      setStatus("anonymous");
      return;
    }

    setAuthToken(token);
    try {
      const response = await apiClient<AuthProfileResponse>("auth/me", {
        skipUnauthorizedHandler: true,
      });
      setUser(response.user);
      setStatus("authenticated");
    } catch (sessionError) {
      if (sessionError instanceof ApiError && sessionError.status === 401) {
        await clearLocalSession();
        return;
      }
      setError(
        sessionError instanceof Error
          ? sessionError.message
          : "No se pudo validar la sesión. Revisa tu conexión.",
      );
      setStatus("error");
    }
  }, [clearLocalSession]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    setUnauthorizedHandler(clearLocalSession);
    return () => setUnauthorizedHandler(null);
  }, [clearLocalSession]);

  const login = useCallback(async (identifier: string, password: string) => {
    setError(null);
    const response = await apiClient<AuthSessionResponse>("auth/login", {
      method: "POST",
      body: { username: identifier.trim(), password },
      skipUnauthorizedHandler: true,
    });
    await storeToken(response.token);
    setUser(response.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient("auth/logout", { method: "POST", skipUnauthorizedHandler: true });
    } catch {
      // Logout is local-first: a network failure must never keep a session open.
    } finally {
      await clearLocalSession();
    }
  }, [clearLocalSession]);

  const value = useMemo(
    () => ({ status, user, error, login, logout, retry: restoreSession }),
    [status, user, error, login, logout, restoreSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
