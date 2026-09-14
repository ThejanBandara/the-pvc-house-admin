import { apiClient } from "./client";
import type { Item, ItemFormInput, PaginatedItems, MovementType, StockMovement } from "./types";

export interface ItemsQuery {
  search?: string;
  category_id?: number;
  lowStock?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export async function fetchItems(query: ItemsQuery): Promise<PaginatedItems> {
  const { data } = await apiClient.get<PaginatedItems>("/items", {
    params: query,
  });
  return data;
}

export async function fetchItem(id: number): Promise<Item> {
  const { data } = await apiClient.get<Item>(`/items/${id}`);
  return data;
}

export async function createItem(payload: ItemFormInput): Promise<Item> {
  const { data } = await apiClient.post<Item>("/items", payload);
  return data;
}

export async function updateItem(
  id: number,
  payload: Omit<ItemFormInput, "quantity">
): Promise<Item> {
  const { data } = await apiClient.put<Item>(`/items/${id}`, payload);
  return data;
}

export async function deleteItem(id: number): Promise<void> {
  await apiClient.delete(`/items/${id}`);
}

export async function fetchStockMovements(itemId: number): Promise<StockMovement[]> {
  const { data } = await apiClient.get<StockMovement[]>(`/items/${itemId}/stock`);
  return data;
}

export async function postStockMovement(
  itemId: number,
  payload: { type: MovementType; quantity: number; reason?: string }
): Promise<{ movement: StockMovement; item: Item }> {
  const { data } = await apiClient.post(`/items/${itemId}/stock`, payload);
  return data;
}
