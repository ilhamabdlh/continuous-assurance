import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function initials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts[0]?.length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase() || "CA";
}

export function Topbar() {
  const {
    openModal,
    findings,
    company,
    companies,
    setCompany,
    alerts,
    markAlertRead,
    markAllAlertsRead,
  } = useApp();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const pending = findings.filter((f) => f.validation === "pending" || f.kev).length;
  const unread = alerts.filter((a) => !a.read).length;
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open && !userOpen && !alertsOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (open && !wrapRef.current?.contains(e.target as Node)) setOpen(false);
      if (userOpen && !userRef.current?.contains(e.target as Node)) setUserOpen(false);
      if (alertsOpen && !alertsRef.current?.contains(e.target as Node)) setAlertsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setUserOpen(false);
        setAlertsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, userOpen, alertsOpen]);

  return (
    <header className="topbar">
      <div className="tenant-wrap" ref={wrapRef}>
        <button
          type="button"
          className={`tenant${open ? " is-open" : ""}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="dot" />
          <span className="tenant-name">{company.name}</span>
          <span className="t-dim tenant-caret">{open ? "▴" : "▾"}</span>
        </button>
        {open && (
          <div className="tenant-menu" role="listbox" aria-label="Portfolio companies">
            <div className="tenant-menu-head">PE portfolio companies</div>
            <ul className="tenant-menu-list">
              {companies.map((c) => (
                <li key={c.name}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.name === company.name}
                    className={`tenant-option${c.name === company.name ? " is-active" : ""}`}
                    onClick={() => {
                      setCompany(c.name);
                      setOpen(false);
                    }}
                  >
                    <span className="tenant-option-main">
                      <span className="tenant-option-name">{c.name}</span>
                      <span className="tenant-option-meta">
                        {c.sector} · {c.tier}
                      </span>
                    </span>
                    <span className={`grade grade-${c.grade.toLowerCase()}`}>{c.grade}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="freshness">
        <span className="live" />
        Last sweep{" "}
        <span className="t-strong" style={{ color: "var(--text-dim)" }}>
          {company.lastSweep}
        </span>
        {pending > 0 && (
          <button className="btn btn-sm" style={{ marginLeft: 8 }} onClick={() => openModal("kev")}>
            {pending} validation / KEV queue
          </button>
        )}
      </div>
      <div className="topbar-right">
        <div className="alerts-wrap" ref={alertsRef}>
          <button
            type="button"
            className={`alerts-bell${alertsOpen ? " is-open" : ""}`}
            aria-haspopup="menu"
            aria-expanded={alertsOpen}
            aria-label="Critical finding alerts"
            onClick={() => setAlertsOpen((v) => !v)}
          >
            <span className="alerts-bell-icon" aria-hidden>
              ✶
            </span>
            {unread > 0 && <span className="alerts-badge">{unread}</span>}
          </button>
          {alertsOpen && (
            <div className="alerts-menu" role="menu">
              <div className="alerts-menu-head">
                <span>Finding alerts</span>
                {unread > 0 && (
                  <button type="button" className="alerts-mark-all" onClick={() => markAllAlertsRead()}>
                    Mark all read
                  </button>
                )}
              </div>
              <ul className="alerts-list">
                {alerts.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      className={`alerts-item${a.read ? "" : " is-unread"} kind-${a.kind}`}
                      onClick={() => {
                        markAlertRead(a.id);
                        if (a.findingId) {
                          navigate(`/findings/${a.findingId}`);
                          setAlertsOpen(false);
                        }
                      }}
                    >
                      <span className="alerts-item-title">{a.title}</span>
                      <span className="alerts-item-meta">{a.meta}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="alerts-menu-foot">
                Demo: Critical / High / KEV also email security@northwindlog.com
              </div>
            </div>
          )}
        </div>
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
        <div className="user-menu" ref={userRef}>
          <button
            type="button"
            className="avatar avatar-btn"
            aria-haspopup="menu"
            aria-expanded={userOpen}
            onClick={() => setUserOpen((v) => !v)}
            title={user?.email}
          >
            {user ? initials(user.name, user.email) : "CA"}
          </button>
          {userOpen && (
            <div className="user-menu-pop" role="menu">
              <div className="user-menu-meta">
                <div className="t-strong" style={{ textTransform: "capitalize" }}>
                  {user?.name}
                </div>
                <div className="t-dim" style={{ fontSize: 12 }}>
                  {user?.email}
                </div>
              </div>
              <button
                type="button"
                role="menuitem"
                className="user-menu-item"
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
