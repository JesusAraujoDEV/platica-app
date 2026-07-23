import { apiClient } from "./api";

export type CategoryGroupType = "ingreso" | "gasto" | "neutral";
export type AnalyticsBehavior = "include" | "exclude";

export interface CategoryGroup {
  id: number;
  name: string;
  type: CategoryGroupType;
  analyticsBehavior: AnalyticsBehavior;
}

export interface CategoryGroupUpsertPayload {
  name: string;
  type: CategoryGroupType;
  analyticsBehavior: AnalyticsBehavior;
}

export interface CategoryGroupDeleteResponse {
  ok?: boolean;
  rowCount?: number;
}

export interface AssignCategoriesResponse {
  ok?: boolean;
  success?: boolean;
  message?: string;
}

function mapGroup(g: Record<string, unknown>): CategoryGroup {
  const type = g.type;
  const behavior = g.analyticsBehavior ?? g.analytics_behavior;
  return {
    id: Number(g.id),
    name: String(g.name ?? ""),
    type: type === "ingreso" || type === "gasto" || type === "neutral" ? type : "neutral",
    analyticsBehavior: behavior === "exclude" ? "exclude" : "include",
  };
}

/** GET /category-groups → bare array. */
export async function fetchCategoryGroups(): Promise<CategoryGroup[]> {
  const res = await apiClient<Record<string, unknown>[]>("category-groups");
  return (res ?? []).map(mapGroup);
}

export async function createCategoryGroup(payload: CategoryGroupUpsertPayload): Promise<CategoryGroup> {
  return mapGroup(await apiClient("category-groups", { method: "POST", body: payload }));
}

export async function updateCategoryGroup(id: number, payload: CategoryGroupUpsertPayload): Promise<CategoryGroup> {
  return mapGroup(await apiClient(`category-groups/${encodeURIComponent(String(id))}`, { method: "PATCH", body: payload }));
}

export async function assignCategoriesToGroup(id: number, categoryIds: number[]): Promise<AssignCategoriesResponse> {
  return apiClient(`category-groups/${encodeURIComponent(String(id))}/assign-categories`, {
    method: "PATCH",
    body: { categoryIds },
  });
}

export async function deleteCategoryGroup(id: number): Promise<CategoryGroupDeleteResponse> {
  return apiClient(`category-groups/${encodeURIComponent(String(id))}`, { method: "DELETE" });
}
