import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Unable to sign in.");
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="auth-page">
      <aside className="auth-hero" aria-hidden={false}>
        <div className="auth-hero-grain" />
        <div className="auth-hero-wash" />
        <Link to="/login" className="auth-hero-brand">
          <img src="/brand/atumcell-mark.png" alt="" width={28} height={28} />
          <span>
            Atumcell
            <em>Continuous Assurance</em>
          </span>
        </Link>
        <blockquote className="auth-quote">
          <img
            className="auth-quote-logo"
            src="/brand/northwind-logo-clear.png"
            alt="NorthWind"
          />
          <p>
            “…validated findings and closure certificates finally gave our PE board an
            assurance binder they trust.”
          </p>
          <footer>Northwind Logistics · Meridian Capital portfolio</footer>
        </blockquote>
      </aside>

      <main className="auth-panel">
        <div className="auth-panel-top">
          <button
            type="button"
            className="auth-mode-link"
            onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          >
            {mode === "signin" ? "Create account" : "Login"}
          </button>
        </div>

        <div className="auth-form-wrap">
          <header className="auth-form-head">
            <h1>{mode === "signin" ? "Sign in" : "Create an account"}</h1>
            <p>
              {mode === "signin"
                ? "Enter your work email to access Continuous Assurance."
                : "Enter your email below to create your account."}
            </p>
          </header>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            <label className="auth-field">
              <span className="auth-label">Email</span>
              <input
                type="email"
                name="email"
                autoComplete="username"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="auth-field">
              <span className="auth-label">Password</span>
              <input
                type="password"
                name="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in with email"
                  : "Create account"}
            </button>
          </form>

          <div className="auth-divider">
            <span>Or continue with</span>
          </div>

          <button
            type="button"
            className="auth-oauth"
            onClick={() => {
              setEmail("demo@northwindlog.com");
              setPassword("demo");
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
            GitHub
          </button>

          <p className="auth-legal">
            By clicking continue, you agree to our{" "}
            <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
          </p>
          <p className="auth-demo-hint">Demo: any valid email + password (≥4 chars).</p>
        </div>
      </main>
    </div>
  );
}
