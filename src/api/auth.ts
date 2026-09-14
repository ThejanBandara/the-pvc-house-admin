import { apiClient } from "./client";

export type UserRole = "admin" | "staff";

export interface AuthUser {
  id: number;
  username: string;
  display_name: string;
  role: UserRole;
  can_access_inventory: boolean;
  can_access_pos: boolean;
  active: boolean;
  has_pin: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export async function loginWithPin(pin: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login/pin", { pin });
  return data;
}

export async function loginWithPassword(
  username: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login/password", {
    username,
    password,
  });
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>("/auth/me");
  return data;
}
