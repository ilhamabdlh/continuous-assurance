import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { SevBadge, ValidationBadge, SlaPill } from "../components/Badges";
import type { Severity } from "../types";

const SEV_OPTIONS = ["all", "critical", "high", "medium", "low"] as const;
const VAL_OPTIONS = ["all", "verified", "pending", "auto", "kev"] as const;

export function FindingsPage() {
  const { findings, assets, openModal, createFinding } = useApp();
  const [params] = useSearchParams();
  const initialFilter = params.get("filter") || "all";
  const [sev, setSev] = useState<(typeof SEV_OPTIONS)[number]>(
    SEV_OPTIONS.includes(initialFilter as (typeof SEV_OPTIONS)[number])
      ? (initialFilter as (typeof SEV_OPTIONS)[number])
      : "all"
  );
  const [val, setVal] = useState<(typeof VAL_OPTIONS)[number]>(
    VAL_OPTIONS.includes(initialFilter as (typeof VAL_OPTIONS)[number])
      ? (initialFilter as (typeof VAL_OPTIONS)[number])
      : "all"
  );
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [asset, setAsset] = useState(assets[0]?.host || "");
  const [severity, setSeverity] = useState<Severity>("high");
  const [category, setCategory] = useState("");

  const rows = useMemo(() => {
    return findings.filter((f) => {
      const okSev = sev === "all" || f.severity === sev;
      let okVal = true;
      if (val === "kev") okVal = f.kev;
      else if (val === "verified") okVal = f.validation === "verified";
      else if (val === "pending") okVal = f.validation === "pending";
      else if (val === "auto") okVal = f.validation === "auto";
      return (
        okSev &&
        okVal &&
        (!q ||
          `${f.id} ${f.title} ${f.asset} ${f.category}`.toLowerCase().includes(q.toLowerCase()))
      );
    });
  }, [findings, sev, val, q]);

  const closeForm = () => setShowForm(false);

  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <h1>Findings</h1>
          <p>Human-validated and automated findings across the attack surface.</p>
        </div>
        <div className="page-head-actions">
          <button className="btn btn-sm" onClick={() => openModal("kev")}>
            KEV queue
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setAsset(assets[0]?.host || "");
              setShowForm(true);
            }}
          >
            Add finding
          </button>
          <button className="btn btn-sm" onClick={() => openModal("request")}>
            Request validation
          </button>
        </div>
      </div>

      {showForm && (
        <div
          className="overlay open"
          onClick={(e) => e.target === e.currentTarget && closeForm()}
        >
          <div className="modal modal-form" role="dialog" aria-labelledby="finding-form-title">
            <div className="modal-head">
              <h3 id="finding-form-title">Add finding</h3>
              <button type="button" className="x-btn" onClick={closeForm}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="crud-form-grid">
                <label className="span-2">
                  Title
                  <input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Describe the finding"
                  />
                </label>
                <label>
                  Asset
                  <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                    {assets.map((a) => (
                      <option key={a.host} value={a.host}>
                        {a.host}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Severity
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as Severity)}
                  >
                    <option value="critical">critical</option>
                    <option value="high">high</option>
                    <option value="medium">medium</option>
                    <option value="low">low</option>
                  </select>
                </label>
                <label className="span-2">
                  Category
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Exposure, Auth, Misconfig"
                  />
                </label>
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn" onClick={closeForm}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (!title.trim() || !asset) return;
                  createFinding({ title, asset, severity, category });
                  setTitle("");
                  setCategory("");
                  setShowForm(false);
                }}
              >
                Save finding
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="toolbar">
          <div className="toolbar-filters">
            <label className="field">
              <span className="field-label">Severity</span>
              <select
                className="field-control"
                value={sev}
                onChange={(e) => setSev(e.target.value as (typeof SEV_OPTIONS)[number])}
              >
                <option value="all">All severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">Validation</span>
              <select
                className="field-control"
                value={val}
                onChange={(e) => setVal(e.target.value as (typeof VAL_OPTIONS)[number])}
              >
                <option value="all">All labels</option>
                <option value="verified">Human validated</option>
                <option value="pending">Awaiting validation</option>
                <option value="auto">Automated</option>
                <option value="kev">In KEV catalog</option>
              </select>
            </label>
          </div>
          <div className="search toolbar-search">
            <span className="t-dim" aria-hidden>
              ⌕
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search finding or asset…"
            />
          </div>
          <span className="toolbar-count">
            {rows.length} of {findings.length}
          </span>
        </div>
        <div className="card-body tight table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th>
                <th>Finding</th>
                <th>Asset</th>
                <th>Severity</th>
                <th>Validation</th>
                <th>Status</th>
                <th>Owner</th>
                <th>SLA</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.id} className="clickable">
                  <td className="mono t-dim nowrap">
                    <Link to={`/findings/${f.id}`}>{f.id}</Link>
                  </td>
                  <td>
                    <Link to={`/findings/${f.id}`} style={{ color: "inherit" }}>
                      <div className="stack-2">
                        <span className="t-strong">{f.title}</span>
                        <span className="t-dim" style={{ fontSize: 11.5 }}>
                          {f.category} · CVSS {f.cvss}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="mono t-dim">{f.asset}</td>
                  <td className="nowrap">
                    <SevBadge severity={f.severity} />
                    {f.kev && <span className="badge b-kev">KEV</span>}
                  </td>
                  <td className="nowrap">
                    <ValidationBadge validation={f.validation} />
                  </td>
                  <td className="t-dim nowrap">{f.status}</td>
                  <td className="t-dim nowrap">{f.owner}</td>
                  <td className="nowrap">
                    <SlaPill sla={f.sla} state={f.slaState} />
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty">No findings match this filter.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
