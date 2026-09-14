import { apiClient } from "./client";
import type { AuthUser } from "./auth";

export interface CreateUserInput {
  username: string;
  password: string;
  pin?: string;
  display_name: string;
  role: "admin" | "staff";
  can_access_inventory: boolean;
  can_access_pos: boolean;
}

export interface UpdateUserInput {
  display_name: string;
  role: "admin" | "staff";
  can_access_inventory: boolean;
  can_access_pos: boolean;
  active: boolean;
  password?: string;
  pin?: string | null;
}

export async function fetchUsers(): Promise<AuthUser[]> {
  const { data } = await apiClient.get<AuthUser[]>("/users");
  return data;
}

export async function createUser(payload: CreateUserInput): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthUser>("/users", payload);
  return data;
}

export async function updateUser(id: number, payload: UpdateUserInput): Promise<AuthUser> {
  const { data } = await apiClient.put<AuthUser>(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
