import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { fetchMe, loginWithPassword, loginWithPin } from "../api/auth";
import type { AuthUser } from "../api/auth";
import { TOKEN_STORAGE_KEY } from "../api/client";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  loginPin: (pin: string) => Promise<void>;
  loginPassword: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const loginPin = useCallback(async (pin: string) => {
    const res = await loginWithPin(pin);
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    setUser(res.user);
  }, []);

  const loginPassword = useCallback(async (username: string, password: string) => {
    const res = await loginWithPassword(username, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    setUser(res.user);
  }, []);

  const value = useMemo(
    () => ({ user, loading, loginPin, loginPassword, logout }),
    [user, loading, loginPin, loginPassword, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
