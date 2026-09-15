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

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/logs", label: "Stock Logs", icon: ListTree },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/credits", label: "Credits", icon: CreditCard },
  { to: "/users", label: "Users", icon: Users },
];

const BTN_BASE =
  "inline-flex items-center justify-center gap-[7px] rounded-[var(--radius-sm)] border border-transparent text-sm font-semibold cursor-pointer whitespace-nowrap select-none transition-[background,border-color,transform,box-shadow] duration-150 ease-[var(--ease)] enabled:active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed";
const BTN_SECONDARY_BLOCK = `${BTN_BASE} px-4 py-[10px] w-full bg-[var(--surface)] text-[var(--text)] border-[var(--border)] enabled:hover:bg-[var(--surface-hover)] enabled:hover:border-[var(--border-strong)]`;
const BTN_GHOST_ICON = `${BTN_BASE} p-[9px] w-[38px] h-[38px] shrink-0 bg-transparent text-[var(--text-muted)] border-transparent enabled:hover:bg-[var(--surface-hover)] enabled:hover:text-[var(--text)]`;

export default function Layout() {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside
        className={
          "fixed top-0 left-0 bottom-0 w-[250px] bg-[var(--bg-elevated)] border-r border-[var(--border)] flex flex-col z-40 transition-transform duration-[220ms] ease-[var(--ease)] lg:sticky lg:translate-x-0 " +
          (drawerOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex items-center justify-between px-[18px] pt-[18px] pb-[14px] border-b border-[var(--border)]">
          <img src="/pvc-house-logo.png" alt="PVC House" className="h-[26px] w-auto object-contain" />
          <button
            className="bg-transparent border-none text-[var(--text-muted)] cursor-pointer p-1 flex lg:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-[14px] flex flex-col gap-[2px]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                "flex items-center gap-[11px] px-3 py-[10px] rounded-[var(--radius-sm)] text-sm font-semibold transition-colors " +
                (isActive
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]")
              }
              onClick={() => setDrawerOpen(false)}
            >
              <item.icon size={18} strokeWidth={2.1} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-[14px] border-t border-[var(--border)] flex flex-col gap-3">
          <div className="flex items-center gap-[10px]">
            <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user?.display_name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                {user?.display_name}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">Administrator</div>
            </div>
          </div>
          <button className={BTN_SECONDARY_BLOCK} onClick={logout}>
            <LogOut size={15} strokeWidth={2.2} />
            Log out
          </button>
        </div>
      </aside>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-[35] bg-[rgba(4,8,16,0.6)] animate-[fadeIn_0.15s_var(--ease)]"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[rgba(15,22,38,0.85)] backdrop-blur-[10px] lg:hidden">
          <button className={BTN_GHOST_ICON} onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <img src="/pvc-house-logo.png" alt="PVC House" className="h-6 w-auto object-contain" />
          <div style={{ width: 38 }} />
        </header>

        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 pt-[18px] pb-[40px] lg:px-8 lg:pt-[28px] lg:pb-[48px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
