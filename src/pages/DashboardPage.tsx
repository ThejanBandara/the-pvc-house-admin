import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Loader2,
  Package,
  Tags,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchCategoryBreakdown,
  fetchLowStock,
  fetchMovementsSummary,
  fetchOverview,
  type CategoryBreakdownRow,
  type MovementsSummaryRow,
  type Overview,
} from "../api/reports";
import type { Item } from "../api/types";
import { extractErrorMessage } from "../api/client";

const PIE_COLORS = ["#4c7dfb", "#2ed3a3", "#f5a623", "#f2596a", "#9b6bf2", "#38bdf8"];

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryBreakdownRow[]>([]);
  const [movementData, setMovementData] = useState<MovementsSummaryRow[]>([]);
  const [lowStock, setLowStock] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchOverview(),
      fetchCategoryBreakdown(),
      fetchMovementsSummary("day"),
      fetchLowStock(),
    ])
      .then(([ov, cats, movements, low]) => {
        setOverview(ov);
        setCategoryData(cats);
        setMovementData(movements.slice(-14));
        setLowStock(low.slice(0, 6));
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="spinner-wrap">
        <Loader2 size={22} className="icon-spin" />
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-error">
        <AlertTriangle size={15} />
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="page-subtitle">Live overview of your inventory</div>
        </div>
      </div>

      <div className="overview-grid">
        <OverviewCard icon={Package} label="Total Items" value={String(overview?.totalItems ?? 0)} />
        <OverviewCard icon={Tags} label="Categories" value={String(overview?.totalCategories ?? 0)} />
        <OverviewCard
          icon={Wallet}
          label="Inventory Value"
          value={`Rs. ${(overview?.inventoryValue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          tone="success"
        />
        <OverviewCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={String(overview?.lowStockCount ?? 0)}
          tone="warning"
        />
      </div>

      <div className="chart-card card">
        <div className="chart-card-header">
          <div>
            <div className="chart-card-title">Stock Movements (last 14 days)</div>
            <div className="chart-card-subtitle">Restocked vs. sold quantities per day</div>
          </div>
        </div>
        {movementData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={movementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="period" stroke="var(--text-faint)" fontSize={11} />
              <YAxis stroke="var(--text-faint)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="restocked" name="Restocked" fill="#2ed3a3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sold" name="Sold" fill="#f2596a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-card card">
        <div className="chart-card-header">
          <div>
            <div className="chart-card-title">Inventory Value by Category</div>
            <div className="chart-card-subtitle">Stock value distribution</div>
          </div>
        </div>
        {categoryData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label={((entry: { category?: string }) => entry.category ?? "") as never}
                labelLine={false}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={((value: number) => `Rs. ${Number(value).toLocaleString()}`) as never}
                contentStyle={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="section-title">
        <AlertTriangle size={13} strokeWidth={2.6} />
        Low Stock Items
      </div>
      {lowStock.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-title">All stocked up</div>
          <div className="empty-state-desc">No items are below their reorder threshold.</div>
        </div>
      ) : (
        <div className="item-list">
          {lowStock.map((item) => (
            <div key={item.id} className="card item-card" style={{ cursor: "default" }}>
              <div className="item-card-icon low">
                <Boxes size={19} strokeWidth={2} />
              </div>
              <div className="item-card-main">
                <div className="item-card-name">{item.name}</div>
                <div className="item-card-meta">
                  <span>{item.sku}</span>
                  {item.category_name && (
                    <>
                      <span className="dot" />
                      <span>{item.category_name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="item-card-side">
                <div className="item-card-qty">
                  {item.quantity} {item.unit}
                </div>
                <div className="item-card-price">Threshold {item.reorder_threshold}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OverviewCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  tone?: "warning" | "success" | "danger";
}) {
  return (
    <div className="card overview-card">
      <div className={"overview-icon" + (tone ? ` ${tone}` : "")}>
        <Icon size={19} strokeWidth={2.1} />
      </div>
      <div>
        <div className="overview-value">{value}</div>
        <div className="overview-label">{label}</div>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
      Not enough data yet
    </div>
  );
}
