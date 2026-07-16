/**
 * Authentication service — handles token storage and session management.
 */

import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "./api";

const TOKEN_KEY = "platica_auth_token";

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  setAuthToken(token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  setAuthToken(null);
}

export async function initAuth(): Promise<boolean> {
  const token = await getStoredToken();
  if (token) {
    setAuthToken(token);
    return true;
  }
  return false;
}
