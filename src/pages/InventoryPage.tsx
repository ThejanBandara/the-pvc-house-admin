import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Search,
} from "lucide-react";
import { fetchItems } from "../api/items";
import { fetchCategories } from "../api/categories";
import type { Category, Item } from "../api/types";
import { extractErrorMessage } from "../api/client";
import { exportReportPdf } from "../utils/pdf";

const PAGE_SIZE = 25;

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchItems({
        search: search || undefined,
        category_id: categoryId ? Number(categoryId) : undefined,
        lowStock: lowStockOnly || undefined,
        page,
        pageSize: PAGE_SIZE,
        sortBy: "name",
        sortDir: "asc",
      })
        .then((res) => {
          setItems(res.items);
          setTotal(res.total);
          setTotalPages(res.totalPages || 1);
        })
        .catch((err) => setError(extractErrorMessage(err)))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [search, categoryId, lowStockOnly, page]);

  useEffect(() => setPage(1), [search, categoryId, lowStockOnly]);

  const rangeLabel = useMemo(() => {
    if (total === 0) return "0 items";
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, total);
    return `${start}-${end} of ${total}`;
  }, [page, total]);

  async function handleExport() {
    setExporting(true);
    try {
      const full = await fetchItems({
        search: search || undefined,
        category_id: categoryId ? Number(categoryId) : undefined,
        lowStock: lowStockOnly || undefined,
        page: 1,
        pageSize: 1000,
        sortBy: "name",
        sortDir: "asc",
      });
      exportReportPdf({
        title: "Inventory Listing",
        subtitle: `${full.total} items${categoryId ? " · filtered by category" : ""}${lowStockOnly ? " · low stock only" : ""}`,
        columns: ["SKU", "Name", "Category", "Unit", "Price", "Qty", "Reorder"],
        rows: full.items.map((i) => [
          i.sku,
          i.name,
          i.category_name ?? "Uncategorized",
          i.unit,
          i.price.toFixed(2),
          i.quantity,
          i.reorder_threshold,
        ]),
        fileName: `inventory-listing-${new Date().toISOString().slice(0, 10)}.pdf`,
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
          <h1>Inventory</h1>
          <div className="page-subtitle">{total} item{total === 1 ? "" : "s"} total</div>
        </div>
        <button className="btn btn-secondary" onClick={handleExport} disabled={items.length === 0 || exporting}>
          {exporting ? <Loader2 size={15} className="icon-spin" /> : <Download size={15} strokeWidth={2.3} />}
          Export PDF
        </button>
      </div>

      <div className="toolbar">
        <div className="input-wrap search-input">
          <Search size={16} className="input-icon" />
          <input placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select-compact" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          className={"btn btn-sm filter-chip " + (lowStockOnly ? "btn-primary" : "btn-secondary")}
          onClick={() => setLowStockOnly((v) => !v)}
        >
          <AlertTriangle size={14} strokeWidth={2.4} />
          Low stock
        </button>
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
      ) : items.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-title">No items found</div>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th className="num">Price</th>
                  <th className="num">Qty</th>
                  <th className="num">Reorder</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isLow = item.quantity <= item.reorder_threshold;
                  return (
                    <tr key={item.id}>
                      <td>{item.sku}</td>
                      <td>{item.name}</td>
                      <td>{item.category_name ?? "—"}</td>
                      <td>{item.unit}</td>
                      <td className="num">Rs. {item.price.toFixed(2)}</td>
                      <td className="num">{item.quantity}</td>
                      <td className="num">{item.reorder_threshold}</td>
                      <td>
                        {isLow ? (
                          <span className="badge badge-warning">Low</span>
                        ) : (
                          <span className="badge badge-success">OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
