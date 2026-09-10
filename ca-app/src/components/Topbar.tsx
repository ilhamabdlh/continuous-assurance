import { DEMO } from "../data/demo";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";

export function Topbar() {
  const { openModal, findings } = useApp();
  const { theme, toggleTheme } = useTheme();
  const pending = findings.filter((f) => f.validation === "pending" || f.kev).length;

  return (
    <header className="topbar">
      <div className="tenant">
        <span className="dot" />
        <span>{DEMO.tenant.name}</span>
        <span className="t-dim">▾</span>
      </div>
      <div className="freshness">
        <span className="live" />
        Last sweep{" "}
        <span className="t-strong" style={{ color: "var(--text-dim)" }}>
          {DEMO.tenant.lastSweep}
        </span>
        {pending > 0 && (
          <button className="btn btn-sm" style={{ marginLeft: 8 }} onClick={() => openModal("kev")}>
            {pending} validation / KEV queue
          </button>
        )}
      </div>
      <div className="topbar-right">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          title={theme === "light" ? "Dark" : "Light"}
        >
          <span className={`theme-toggle-track${theme === "dark" ? " is-dark" : ""}`}>
            <span className="theme-toggle-thumb" />
          </span>
          <span className="theme-toggle-label">{theme === "light" ? "Light" : "Dark"}</span>
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => openModal("scope")}>
          Scope &amp; test rules
        </button>
        <button className="btn btn-primary" onClick={() => openModal("request")}>
          Request human validation
        </button>
        <div className="avatar">IA</div>
      </div>
    </header>
  );
}
