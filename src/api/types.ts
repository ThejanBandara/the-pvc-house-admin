export interface Category {
  id: number;
  name: string;
}

export interface Item {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category_id: number | null;
  category_name: string | null;
  unit: string;
  price: number;
  quantity: number;
  reorder_threshold: number;
  created_at: string;
  updated_at: string;
}

export type MovementType = "restock" | "sale" | "adjustment";

export interface StockMovement {
  id: number;
  item_id: number;
  type: MovementType;
  quantity_change: number;
  reason: string | null;
  created_at: string;
}

export interface PaginatedItems {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ItemFormInput {
  name: string;
  description: string | null;
  category_id: number | null;
  unit: string;
  price: number;
  quantity: number;
  reorder_threshold: number;
}
