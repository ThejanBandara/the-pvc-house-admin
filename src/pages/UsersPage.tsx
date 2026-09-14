import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  UserPlus,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { createUser, deleteUser, fetchUsers, updateUser } from "../api/users";
import type { AuthUser } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { extractErrorMessage } from "../api/client";
import Modal from "../components/Modal";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AuthUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AuthUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    fetchUsers()
      .then(setUsers)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <div className="page-subtitle">{users.length} account{users.length === 1 ? "" : "s"}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
          <UserPlus size={16} strokeWidth={2.4} />
          Add User
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
      ) : users.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <UsersIcon size={24} />
          </div>
          <div className="empty-state-title">No users yet</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Access</th>
                <th>Status</th>
                <th>PIN</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.display_name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>@{u.username}</div>
                  </td>
                  <td>
                    <span className={"badge " + (u.role === "admin" ? "badge-admin" : "badge-muted")}>
                      {u.role === "admin" && <ShieldCheck size={10} strokeWidth={2.6} />}
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {(u.role === "admin" || u.can_access_inventory) && (
                        <span className="badge badge-muted">
                          <Boxes size={10} strokeWidth={2.6} />
                          Inventory
                        </span>
                      )}
                      {(u.role === "admin" || u.can_access_pos) && (
                        <span className="badge badge-muted">
                          <ShoppingCart size={10} strokeWidth={2.6} />
                          POS
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {u.active ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Disabled</span>
                    )}
                  </td>
                  <td>
                    {u.has_pin ? (
                      <span className="badge badge-muted">
                        <KeyRound size={10} strokeWidth={2.6} />
                        Set
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-faint)" }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button className="btn btn-secondary btn-icon" onClick={() => setEditTarget(u)} aria-label="Edit user">
                        <Pencil size={14} strokeWidth={2.2} />
                      </button>
                      <button
                        className="btn btn-danger btn-icon"
                        onClick={() => setDeleteTarget(u)}
                        disabled={u.id === currentUser?.id}
                        aria-label="Delete user"
                      >
                        <Trash2 size={14} strokeWidth={2.2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <UserFormModal
          onClose={() => setFormOpen(false)}
          onSubmit={async (data) => {
            await createUser(data);
            setFormOpen(false);
            load();
          }}
        />
      )}

      {editTarget && (
        <UserFormModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={async (data) => {
            await updateUser(editTarget.id, data);
            setEditTarget(null);
            load();
          }}
        />
      )}

      {deleteTarget && (
        <Modal title="Delete user?" onClose={() => setDeleteTarget(null)}>
          <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.5 }}>
            Delete <strong style={{ color: "var(--text)" }}>{deleteTarget.display_name}</strong> (@{deleteTarget.username})?
            This cannot be undone.
          </p>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button
              className="btn btn-danger-solid"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  await deleteUser(deleteTarget.id);
                  setDeleteTarget(null);
                  load();
                } catch (err) {
                  setError(extractErrorMessage(err));
                  setDeleteTarget(null);
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? <Loader2 size={15} className="icon-spin" /> : <Trash2 size={15} strokeWidth={2.3} />}
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface UserFormData {
  username: string;
  password?: string;
  pin?: string | null;
  display_name: string;
  role: "admin" | "staff";
  can_access_inventory: boolean;
  can_access_pos: boolean;
  active: boolean;
}

function UserFormModal({
  user,
  onClose,
  onSubmit,
}: {
  user?: AuthUser;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}) {
  const isEdit = Boolean(user);
  const [username, setUsername] = useState(user?.username ?? "");
  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState<"admin" | "staff">(user?.role ?? "staff");
  const [canInventory, setCanInventory] = useState(user?.can_access_inventory ?? true);
  const [canPos, setCanPos] = useState(user?.can_access_pos ?? false);
  const [active, setActive] = useState(user?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }
    if (!isEdit && !username.trim()) {
      setError("Username is required");
      return;
    }
    if (!isEdit && (!password || password.length < 6)) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (pin && !/^\d{6}$/.test(pin)) {
      setError("PIN must be exactly 6 digits");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        const payload: UserFormData = {
          username,
          display_name: displayName.trim(),
          role,
          can_access_inventory: canInventory,
          can_access_pos: canPos,
          active,
        };
        if (password) payload.password = password;
        if (pin) payload.pin = pin;
        await onSubmit(payload);
      } else {
        await onSubmit({
          username: username.trim(),
          password,
          pin: pin || undefined,
          display_name: displayName.trim(),
          role,
          can_access_inventory: canInventory,
          can_access_pos: canPos,
        });
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? "Edit User" : "Add User"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="form-error">
            <AlertTriangle size={15} />
            {error}
          </div>
        )}

        <div className="field-row">
          <div className="field">
            <label>Username *</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} disabled={isEdit} placeholder="e.g. jsmith" />
          </div>
          <div className="field">
            <label>Display name *</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. John Smith" />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>{isEdit ? "New password" : "Password *"}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? "Leave blank to keep current" : "At least 6 characters"}
            />
          </div>
          <div className="field">
            <label>{isEdit ? "New PIN" : "PIN (optional)"}</label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder={isEdit ? "Leave blank to keep current" : "6 digits"}
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="field">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as "admin" | "staff")}>
            <option value="staff">Staff</option>
            <option value="admin">Admin (full access to everything)</option>
          </select>
        </div>

        {role === "staff" && (
          <div className="field">
            <label>Access</label>
            <div style={{ display: "flex", gap: 16, paddingTop: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, textTransform: "none", color: "var(--text)" }}>
                <input
                  type="checkbox"
                  style={{ width: "auto" }}
                  checked={canInventory}
                  onChange={(e) => setCanInventory(e.target.checked)}
                />
                Inventory
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, textTransform: "none", color: "var(--text)" }}>
                <input
                  type="checkbox"
                  style={{ width: "auto" }}
                  checked={canPos}
                  onChange={(e) => setCanPos(e.target.checked)}
                />
                POS
              </label>
            </div>
          </div>
        )}

        {isEdit && (
          <div className="field">
            <label style={{ display: "flex", alignItems: "center", gap: 8, textTransform: "none", fontSize: 13 }}>
              <input type="checkbox" style={{ width: "auto" }} checked={active} onChange={(e) => setActive(e.target.checked)} />
              Account active
            </label>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            <X size={15} strokeWidth={2.4} />
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Loader2 size={15} className="icon-spin" /> : isEdit ? <Save size={15} strokeWidth={2.3} /> : <Plus size={15} strokeWidth={2.4} />}
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
