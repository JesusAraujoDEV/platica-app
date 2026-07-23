import { apiClient } from "./api";

export type CategoryType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string;
  colorName: string;
  groupId: number | null;
}

export interface CategoryUpsertPayload {
  name: string;
  type: "ingreso" | "gasto";
  icon?: string | null;
  color: string;
  colorName: string;
  groupId?: number | null;
}

function mapCategory(c: Record<string, unknown>): Category {
  const type: CategoryType = c.type === "ingreso" || c.type === "income" ? "income" : "expense";
  const groupId = c.groupId ?? c.group_id;
  return {
    id: String(c.id ?? ""),
    name: String(c.name ?? ""),
    type,
    icon: (c.icon as string | null) ?? null,
    color: String(c.color ?? ""),
    colorName: String(c.colorName ?? ""),
    groupId: groupId != null ? Number(groupId) : null,
  };
}

/** GET /categories → bare array. */
export async function fetchCategories(): Promise<Category[]> {
  const res = await apiClient<Record<string, unknown>[]>("categories");
  return (res ?? []).map(mapCategory);
}

export async function createCategory(payload: CategoryUpsertPayload): Promise<Category> {
  return mapCategory(await apiClient("categories", { method: "POST", body: payload }));
}

export async function updateCategory(id: string, payload: CategoryUpsertPayload): Promise<Category> {
  return mapCategory(await apiClient(`categories?id=${encodeURIComponent(id)}`, { method: "PATCH", body: payload }));
}

export async function removeCategory(id: string): Promise<void> {
  await apiClient(`categories?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}
