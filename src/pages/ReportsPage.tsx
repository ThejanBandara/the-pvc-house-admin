import { useEffect, useState } from "react";
import { AlertTriangle, Download, Loader2, Repeat, TrendingDown, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchMovementsSummary, type GroupBy, type MovementsSummaryRow } from "../api/reports";
import { extractErrorMessage } from "../api/client";
import { exportReportPdf } from "../utils/pdf";

const PERIODS: { value: GroupBy; label: string }[] = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

export default function ReportsPage() {
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const [rows, setRows] = useState<MovementsSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchMovementsSummary(groupBy)
      .then((res) => setRows(groupBy === "day" ? res.slice(-30) : res.slice(-24)))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [groupBy]);

  const totals = rows.reduce(
    (acc, r) => ({
      restocked: acc.restocked + r.restocked,
      sold: acc.sold + r.sold,
      adjusted: acc.adjusted + r.adjusted,
      movementCount: acc.movementCount + r.movementCount,
    }),
    { restocked: 0, sold: 0, adjusted: 0, movementCount: 0 }
  );

  function handleExport() {
    exportReportPdf({
      title: `${PERIODS.find((p) => p.value === groupBy)?.label} Stock Movement Summary`,
      subtitle: `${rows.length} periods`,
      summary: [
        { label: "Total restocked", value: String(totals.restocked) },
        { label: "Total sold", value: String(totals.sold) },
        { label: "Net adjustments", value: String(totals.adjusted) },
        { label: "Total movements", value: String(totals.movementCount) },
      ],
      columns: ["Period", "Restocked", "Sold", "Adjusted", "Movements"],
      rows: rows.map((r) => [r.period, r.restocked, r.sold, r.adjusted, r.movementCount]),
      fileName: `stock-summary-${groupBy}-${new Date().toISOString().slice(0, 10)}.pdf`,
    });
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <div className="page-subtitle">Stock movement summaries over time</div>
        </div>
        <button className="btn btn-secondary" onClick={handleExport} disabled={rows.length === 0}>
          <Download size={15} strokeWidth={2.3} />
          Export PDF
        </button>
      </div>

      <div className="period-tabs" style={{ marginBottom: 18 }}>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            className={"period-tab" + (groupBy === p.value ? " active" : "")}
            onClick={() => setGroupBy(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="form-error">
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      <div className="overview-grid">
        <SummaryStat icon={TrendingUp} label="Restocked" value={totals.restocked} tone="success" />
        <SummaryStat icon={TrendingDown} label="Sold" value={totals.sold} tone="danger" />
        <SummaryStat icon={Repeat} label="Net Adjusted" value={totals.adjusted} />
        <SummaryStat icon={Repeat} label="Total Movements" value={totals.movementCount} />
      </div>

      <div className="chart-card card">
        <div className="chart-card-header">
          <div>
            <div className="chart-card-title">Movement Trend</div>
            <div className="chart-card-subtitle">
              {PERIODS.find((p) => p.value === groupBy)?.label} restocked vs. sold quantities
            </div>
          </div>
        </div>
        {loading ? (
          <div className="spinner-wrap" style={{ padding: "50px 0" }}>
            <Loader2 size={20} className="icon-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            No movement data for this period yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={rows}>
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
              <Line type="monotone" dataKey="restocked" name="Restocked" stroke="#2ed3a3" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sold" name="Sold" stroke="#f2596a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {!loading && rows.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th className="num">Restocked</th>
                <th className="num">Sold</th>
                <th className="num">Adjusted</th>
                <th className="num">Movements</th>
              </tr>
            </thead>
            <tbody>
              {[...rows].reverse().map((r) => (
                <tr key={r.period}>
                  <td>{r.period}</td>
                  <td className="num">{r.restocked}</td>
                  <td className="num">{r.sold}</td>
                  <td className="num">{r.adjusted}</td>
                  <td className="num">{r.movementCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: number;
  tone?: "success" | "danger";
}) {
  return (
    <div className="card overview-card">
      <div className={"overview-icon" + (tone ? ` ${tone}` : "")}>
        <Icon size={19} strokeWidth={2.1} />
      </div>
      <div>
        <div className="overview-value">{value.toLocaleString()}</div>
        <div className="overview-label">{label}</div>
      </div>
    </div>
  );
}
