import { useState } from "react";
import { AlertTriangle, Delete, KeyRound, Loader2, LogIn, User } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { extractErrorMessage } from "../api/client";
import "./LoginPage.css";

const KEYPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

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
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <img src="/pvc-house-logo.png" alt="PVC House" className="login-logo" />
        </div>

        {error && (
          <div className="form-error login-error">
            <AlertTriangle size={15} />
            {error}
          </div>
        )}

        {mode === "pin" ? (
          <>
            <div className="login-title">Enter your PIN</div>
            <div className="pin-dots">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className={"pin-dot" + (i < pin.length ? " filled" : "")} />
              ))}
            </div>

            <div className="keypad">
              {submitting ? (
                <div className="keypad-loading">
                  <Loader2 size={28} className="icon-spin" />
                </div>
              ) : (
                KEYPAD_KEYS.map((key, i) =>
                  key === "" ? (
                    <div key={i} />
                  ) : (
                    <button
                      key={i}
                      type="button"
                      className="keypad-btn"
                      onClick={() => handleKey(key)}
                      aria-label={key === "back" ? "Backspace" : key}
                    >
                      {key === "back" ? <Delete size={20} strokeWidth={2.2} /> : key}
                    </button>
                  )
                )
              )}
            </div>

            <button className="btn btn-ghost btn-block login-switch" onClick={() => { setMode("password"); setError(null); }}>
              <KeyRound size={14} strokeWidth={2.3} />
              Use username &amp; password instead
            </button>
          </>
        ) : (
          <>
            <div className="login-title">Sign in</div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="field">
                <label>Username</label>
                <div className="input-wrap">
                  <User size={16} className="input-icon" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    autoComplete="username"
                    placeholder="e.g. admin"
                  />
                </div>
              </div>
              <div className="field">
                <label>Password</label>
                <div className="input-wrap">
                  <KeyRound size={16} className="input-icon" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? <Loader2 size={16} className="icon-spin" /> : <LogIn size={16} strokeWidth={2.3} />}
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <button
              className="btn btn-ghost btn-block login-switch"
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
