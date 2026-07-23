import { apiClient } from "./api";

// Paths + payload shapes mirrored from wallets-frontend/src/lib/auth.ts (read-only reference).

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/** POST auth/change-password */
export function changePassword(payload: ChangePasswordPayload) {
  return apiClient<{ success: boolean; message: string }>("auth/change-password", {
    method: "POST",
    body: payload,
  });
}

/** PATCH auth/me — name-only edit; email/username changes are deferred. */
export function updateProfileName(name: string) {
  return apiClient<{ ok?: boolean; user?: unknown; data?: unknown }>("auth/me", {
    method: "PATCH",
    body: { name },
  });
}
