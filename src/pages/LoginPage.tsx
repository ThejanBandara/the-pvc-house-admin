import { useState } from "react";
import { AlertTriangle, Delete, KeyRound, Loader2, LogIn, User } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { extractErrorMessage } from "../api/client";

const KEYPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

const BTN_BASE =
  "inline-flex items-center justify-center gap-[7px] px-4 py-[10px] rounded-[var(--radius-sm)] border border-transparent text-sm font-semibold cursor-pointer whitespace-nowrap select-none transition-[background,border-color,transform,box-shadow] duration-150 ease-[var(--ease)] enabled:active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed w-full";
const BTN_GHOST_BLOCK = `${BTN_BASE} bg-transparent text-[var(--text-muted)] border-transparent enabled:hover:bg-[var(--surface-hover)] enabled:hover:text-[var(--text)]`;
const BTN_PRIMARY_BLOCK = `${BTN_BASE} bg-[var(--primary)] text-[var(--primary-text)] shadow-[0_2px_10px_-2px_rgba(76,125,251,0.55)] enabled:hover:bg-[var(--primary-hover)] enabled:active:bg-[var(--primary-active)]`;

export default function LoginPage() {
  const { loginPin, loginPassword } = useAuth();
  const [mode, setMode] = useState<"pin" | "password">("pin");
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitPin(value: string) {
    setSubmitting(true);
    setError(null);
    try {
      await loginPin(value);
    } catch (err) {
      setError(extractErrorMessage(err));
      setPin("");
    } finally {
      setSubmitting(false);
    }
  }

  function handleKey(key: string) {
    if (submitting) return;
    if (key === "") return;
    if (key === "back") {
      setPin((p) => p.slice(0, -1));
      setError(null);
      return;
    }
    setPin((p) => {
      if (p.length >= 6) return p;
      const next = p + key;
      if (next.length === 6) {
        submitPin(next);
      }
      return next;
    });
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError("Enter your username and password");
      return;
    }
    setSubmitting(true);
    try {
      await loginPassword(username.trim(), password);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-[360px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] px-[26px] pt-8 pb-[26px] animate-[fadeInUp_0.3s_var(--ease)] max-[360px]:px-[18px] max-[360px]:pt-[26px] max-[360px]:pb-5">
        <div className="flex justify-center mb-[22px]">
          <img
            src="/pvc-house-logo.png"
            alt="PVC House"
            className="h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(76,125,251,0.25)]"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-[var(--danger-soft)] text-[var(--danger)] border border-[rgba(242,89,106,0.35)] rounded-[var(--radius-sm)] px-3 py-[11px] text-[13px] font-medium mb-4">
            <AlertTriangle size={15} />
            {error}
          </div>
        )}

        {mode === "pin" ? (
          <>
            <div className="text-center text-[15px] font-bold text-[var(--text-muted)] mb-[18px]">
              Enter your PIN
            </div>
            <div className="flex justify-center gap-[14px] mb-[26px]">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className={
                    "w-[14px] h-[14px] rounded-full border-2 border-[var(--border-strong)] transition-[background,border-color,transform] duration-150 ease-[var(--ease)] " +
                    (i < pin.length ? "bg-[var(--primary)] border-[var(--primary)] scale-110" : "")
                  }
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5 min-h-[248px] max-[360px]:gap-2">
              {submitting ? (
                <div className="col-[1/-1] flex items-center justify-center text-[var(--primary)] min-h-[248px]">
                  <Loader2 size={28} className="animate-[spin_0.7s_linear_infinite]" />
                </div>
              ) : (
                KEYPAD_KEYS.map((key, i) =>
                  key === "" ? (
                    <div key={i} />
                  ) : (
                    <button
                      key={i}
                      type="button"
                      className="aspect-square rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text)] text-xl font-semibold flex items-center justify-center cursor-pointer transition-[background_0.12s_var(--ease),transform_0.08s_var(--ease),border-color_0.12s_var(--ease)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] active:scale-[0.92] active:bg-[var(--primary-soft)]"
                      onClick={() => handleKey(key)}
                      aria-label={key === "back" ? "Backspace" : key}
                    >
                      {key === "back" ? <Delete size={20} strokeWidth={2.2} /> : key}
                    </button>
                  )
                )
              )}
            </div>

            <button
              className={BTN_GHOST_BLOCK}
              onClick={() => {
                setMode("password");
                setError(null);
              }}
            >
              <KeyRound size={14} strokeWidth={2.3} />
              Use username &amp; password instead
            </button>
          </>
        ) : (
          <>
            <div className="text-center text-[15px] font-bold text-[var(--text-muted)] mb-[18px]">
              Sign in
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="flex flex-col gap-[6px] mb-4">
                <label className="text-[12.5px] font-bold text-[var(--text-muted)] uppercase tracking-[0.4px]">
                  Username
                </label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3 text-[var(--text-faint)] pointer-events-none" />
                  <input
                    className="pl-[38px]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    autoComplete="username"
                    placeholder="e.g. admin"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-[6px] mb-4">
                <label className="text-[12.5px] font-bold text-[var(--text-muted)] uppercase tracking-[0.4px]">
                  Password
                </label>
                <div className="relative flex items-center">
                  <KeyRound size={16} className="absolute left-3 text-[var(--text-faint)] pointer-events-none" />
                  <input
                    className="pl-[38px]"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button type="submit" className={BTN_PRIMARY_BLOCK} disabled={submitting}>
                {submitting ? (
                  <Loader2 size={16} className="animate-[spin_0.7s_linear_infinite]" />
                ) : (
                  <LogIn size={16} strokeWidth={2.3} />
                )}
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <button
              className={BTN_GHOST_BLOCK}
              onClick={() => {
                setMode("pin");
                setError(null);
                setPin("");
              }}
            >
              Use PIN instead
            </button>
          </>
        )}
      </div>
    </div>
  );
}
