import type { ReactNode } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "./AuthContext";
import LoginPage from "../pages/LoginPage";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="spinner-wrap" style={{ minHeight: "100vh" }}>
        <Loader2 size={22} className="icon-spin" />
        Loading...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.role !== "admin") {
    return (
      <div className="spinner-wrap" style={{ minHeight: "100vh", gap: 14 }}>
        <ShieldAlert size={32} />
        <div>
          <strong style={{ color: "var(--text)" }}>Admin access only</strong>
          <div style={{ marginTop: 4 }}>This panel is restricted to administrator accounts.</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={logout}>
          Log out
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
