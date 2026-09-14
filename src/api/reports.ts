import { apiClient } from "./client";
import type { Item, MovementType } from "./types";

export interface Overview {
  totalItems: number;
  totalCategories: number;
  inventoryValue: number;
  lowStockCount: number;
  movementsToday: number;
}

export async function fetchOverview(): Promise<Overview> {
  const { data } = await apiClient.get<Overview>("/reports/overview");
  return data;
}

export type GroupBy = "day" | "week" | "month";

export interface MovementsSummaryRow {
  period: string;
  restocked: number;
  sold: number;
  adjusted: number;
  movementCount: number;
}

export async function fetchMovementsSummary(
  groupBy: GroupBy,
  from?: string,
  to?: string
): Promise<MovementsSummaryRow[]> {
  const { data } = await apiClient.get<MovementsSummaryRow[]>("/reports/movements-summary", {
    params: { groupBy, from, to },
  });
  return data;
}

export interface CategoryBreakdownRow {
  category: string;
  itemCount: number;
  value: number;
}

export async function fetchCategoryBreakdown(): Promise<CategoryBreakdownRow[]> {
  const { data } = await apiClient.get<CategoryBreakdownRow[]>("/reports/category-breakdown");
  return data;
}

export async function fetchLowStock(): Promise<Item[]> {
  const { data } = await apiClient.get<Item[]>("/reports/low-stock");
  return data;
}

export interface MovementLogRow {
  id: number;
  item_id: number;
  item_name: string;
  item_sku: string;
  type: MovementType;
  quantity_change: number;
  reason: string | null;
  created_at: string;
}

export interface MovementsQuery {
  type?: MovementType;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface PaginatedMovements {
  movements: MovementLogRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function fetchMovements(query: MovementsQuery): Promise<PaginatedMovements> {
  const { data } = await apiClient.get<PaginatedMovements>("/reports/movements", {
    params: query,
  });
  return data;
}
