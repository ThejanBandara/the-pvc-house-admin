import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Search,
} from "lucide-react";
import { fetchMovements, type MovementLogRow } from "../api/reports";
import type { MovementType } from "../api/types";
import { extractErrorMessage } from "../api/client";
import { exportReportPdf } from "../utils/pdf";

const PAGE_SIZE = 30;

export default function LogsPage() {
  const [rows, setRows] = useState<MovementLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<MovementType | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchMovements({
        search: search || undefined,
        type: type || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
        .then((res) => {
          setRows(res.movements);
          setTotal(res.total);
          setTotalPages(res.totalPages || 1);
        })
        .catch((err) => setError(extractErrorMessage(err)))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [search, type, from, to, page]);

  useEffect(() => setPage(1), [search, type, from, to]);

  const rangeLabel = useMemo(() => {
    if (total === 0) return "0 entries";
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, total);
    return `${start}-${end} of ${total}`;
  }, [page, total]);

  async function handleExport() {
    setExporting(true);
    try {
      const full = await fetchMovements({
        search: search || undefined,
        type: type || undefined,
        from: from || undefined,
        to: to || undefined,
        page: 1,
        pageSize: 1000,
      });
      exportReportPdf({
        title: "Stock Movement Logs",
        subtitle: `${full.total} entries${from || to ? ` · ${from || "..."} to ${to || "..."}` : ""}${type ? ` · ${type}` : ""}`,
        columns: ["Date", "SKU", "Item", "Type", "Qty Change", "Reason"],
        rows: full.movements.map((m) => [
          new Date(m.created_at + "Z").toLocaleString(),
          m.item_sku,
          m.item_name,
          m.type,
          m.quantity_change,
          m.reason ?? "",
        ]),
        fileName: `stock-logs-${new Date().toISOString().slice(0, 10)}.pdf`,
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Stock Movement Logs</h1>
          <div className="page-subtitle">Full history across all items</div>
        </div>
        <button className="btn btn-secondary" onClick={handleExport} disabled={rows.length === 0 || exporting}>
          {exporting ? <Loader2 size={15} className="icon-spin" /> : <Download size={15} strokeWidth={2.3} />}
          Export PDF
        </button>
      </div>

      <div className="toolbar">
        <div className="input-wrap search-input">
          <Search size={16} className="input-icon" />
          <input placeholder="Search by item or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select-compact" value={type} onChange={(e) => setType(e.target.value as MovementType | "")}>
          <option value="">All types</option>
          <option value="restock">Restock</option>
          <option value="sale">Sale</option>
          <option value="adjustment">Adjustment</option>
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: "auto" }} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: "auto" }} />
      </div>

      {error && (
        <div className="form-error">
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="spinner-wrap">
          <Loader2 size={22} className="icon-spin" />
          Loading...
        </div>
      ) : rows.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-title">No movements found</div>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>SKU</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th className="num">Qty Change</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.created_at + "Z").toLocaleString()}</td>
                    <td>{m.item_sku}</td>
                    <td>{m.item_name}</td>
                    <td>
                      <span
                        className={
                          "badge " +
                          (m.type === "restock" ? "badge-success" : m.type === "sale" ? "badge-danger" : "badge-muted")
                        }
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className={"num " + (m.quantity_change > 0 ? "" : "")}>
                      {m.quantity_change > 0 ? "+" : ""}
                      {m.quantity_change}
                    </td>
                    <td>{m.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary btn-icon"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                {rangeLabel} · Page {page}/{totalPages}
              </span>
              <button
                className="btn btn-secondary btn-icon"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
