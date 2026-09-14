import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  CreditCard,
  LayoutDashboard,
  ListTree,
  LogOut,
  Menu,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import "./Layout.css";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/logs", label: "Stock Logs", icon: ListTree },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/credits", label: "Credits", icon: CreditCard },
  { to: "/users", label: "Users", icon: Users },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="admin-layout">
      <aside className={"sidebar" + (drawerOpen ? " open" : "")}>
        <div className="sidebar-brand">
          <img src="/pvc-house-logo.png" alt="PVC House" className="sidebar-logo" />
          <button className="sidebar-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
              onClick={() => setDrawerOpen(false)}
            >
              <item.icon size={18} strokeWidth={2.1} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{user?.display_name?.[0]?.toUpperCase()}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.display_name}</div>
              <div className="sidebar-user-role">Administrator</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-block" onClick={logout}>
            <LogOut size={15} strokeWidth={2.2} />
            Log out
          </button>
        </div>
      </aside>

      {drawerOpen && <div className="sidebar-backdrop" onClick={() => setDrawerOpen(false)} />}

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="btn btn-ghost btn-icon" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <img src="/pvc-house-logo.png" alt="PVC House" className="admin-topbar-logo" />
          <div style={{ width: 38 }} />
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
