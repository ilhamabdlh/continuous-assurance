import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { AttackSurfaceTopology } from "../components/AttackSurfaceTopology";
import type { Asset, AssetStatus } from "../types";

const TYPE_OPTIONS = ["all", "Subdomain", "IP", "Cloud", "Related domain"] as const;
const STATUS_OPTIONS = ["all", "verified", "auto", "unscanned"] as const;

type ViewMode = "table" | "topology";

const emptyForm = {
  host: "",
  type: "Subdomain",
  src: "Manual",
  tech: "",
  ports: "443",
  status: "unscanned" as AssetStatus,
};

export function AssetsPage() {
  const { assets, createAsset, updateAsset, deleteAsset } = useApp();
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_OPTIONS)[number]>("all");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<ViewMode>("table");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const rows = useMemo(() => {
    return assets.filter((a) => {
      const okType = typeFilter === "all" || a.type === typeFilter;
      const okStatus = statusFilter === "all" || a.status === statusFilter;
      const okSearch =
        !q || `${a.host} ${a.tech} ${a.ports}`.toLowerCase().includes(q.toLowerCase());
      return okType && okStatus && okSearch;
    });
  }, [assets, typeFilter, statusFilter, q]);

  const statusCell = (s: string) =>
    s === "verified" ? (
      <span className="badge b-verified">✓ Human validated</span>
    ) : s === "auto" ? (
      <span className="badge b-auto">Automated scan</span>
    ) : (
      <span className="badge b-high">Unscanned</span>
    );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (a: Asset) => {
    setEditing(a.host);
    setForm({
      host: a.host,
      type: a.type,
      src: a.src,
      tech: a.tech,
      ports: a.ports,
      status: a.status,
    });
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const submitForm = () => {
    if (!form.host.trim()) return;
    if (editing) {
      updateAsset(editing, {
        host: form.host.trim(),
        type: form.type,
        src: form.src,
        tech: form.tech || "—",
        ports: form.ports,
        status: form.status,
      });
    } else {
      createAsset({
        host: form.host.trim(),
        type: form.type,
        src: form.src,
        tech: form.tech || "—",
        ports: form.ports,
        status: form.status,
      });
    }
    setShowForm(false);
  };

  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <h1>Attack surface</h1>
          <p>Internet-facing asset inventory for continuous assurance.</p>
        </div>
        <div className="page-head-actions">
          <div className="view-switch" role="group" aria-label="Attack surface view">
            <button
              type="button"
              className={`view-switch-btn${view === "table" ? " active" : ""}`}
              onClick={() => setView("table")}
            >
              Table
            </button>
            <button
              type="button"
              className={`view-switch-btn${view === "topology" ? " active" : ""}`}
              onClick={() => setView("topology")}
            >
              Topology map
            </button>
          </div>
          <button className="btn btn-sm btn-primary" onClick={openCreate}>
            Add asset
          </button>
          <button
            className="btn btn-sm"
            onClick={() => {
              const blob = new Blob(
                [
                  "host,type,src,tech,ports,status\n" +
                    rows
                      .map((a) => [a.host, a.type, a.src, a.tech, a.ports, a.status].join(","))
                      .join("\n"),
                ],
                { type: "text/csv" }
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "attack-surface.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="metric-row" style={{ marginBottom: 14 }}>
        <div>
          <span className="label">Discovered</span>
          <strong>{assets.length}</strong>
        </div>
        <div>
          <span className="label">Automated</span>
          <strong>{assets.filter((a) => a.status !== "unscanned").length}</strong>
        </div>
        <div>
          <span className="label">Human validated</span>
          <strong style={{ color: "var(--green)" }}>
            {assets.filter((a) => a.status === "verified").length}
          </strong>
        </div>
        <div>
          <span className="label">Unscanned</span>
          <strong style={{ color: "var(--orange)" }}>
            {assets.filter((a) => a.status === "unscanned").length}
          </strong>
        </div>
      </div>

      {showForm && (
        <div
          className="overlay open"
          onClick={(e) => e.target === e.currentTarget && closeForm()}
        >
          <div className="modal modal-form" role="dialog" aria-labelledby="asset-form-title">
            <div className="modal-head">
              <h3 id="asset-form-title">{editing ? "Edit asset" : "Add asset"}</h3>
              <button type="button" className="x-btn" onClick={closeForm}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="crud-form-grid">
                <label>
                  Host
                  <input
                    autoFocus
                    value={form.host}
                    onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
                    placeholder="api.example.com"
                  />
                </label>
                <label>
                  Type
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    <option>Subdomain</option>
                    <option>IP</option>
                    <option>Cloud</option>
                    <option>Related domain</option>
                    <option>Network</option>
                  </select>
                </label>
                <label>
                  Source
                  <input
                    value={form.src}
                    onChange={(e) => setForm((f) => ({ ...f, src: e.target.value }))}
                  />
                </label>
                <label>
                  Technology
                  <input
                    value={form.tech}
                    onChange={(e) => setForm((f) => ({ ...f, tech: e.target.value }))}
                  />
                </label>
                <label>
                  Ports
                  <input
                    value={form.ports}
                    onChange={(e) => setForm((f) => ({ ...f, ports: e.target.value }))}
                  />
                </label>
                <label>
                  Status
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value as AssetStatus }))
                    }
                  >
                    <option value="unscanned">unscanned</option>
                    <option value="auto">auto</option>
                    <option value="verified">verified</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn" onClick={closeForm}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={submitForm}>
                Save asset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="toolbar">
          <div className="toolbar-filters">
            <label className="field">
              <span className="field-label">Type</span>
              <select
                className="field-control"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as (typeof TYPE_OPTIONS)[number])}
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t === "all" ? "All types" : t}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Status</span>
              <select
                className="field-control"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as (typeof STATUS_OPTIONS)[number])
                }
              >
                <option value="all">All statuses</option>
                <option value="verified">Human validated</option>
                <option value="auto">Automated</option>
                <option value="unscanned">Unscanned</option>
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
              placeholder="Search host, technology, port…"
            />
          </div>
          <span className="toolbar-count">{rows.length} assets</span>
        </div>

        {view === "table" ? (
          <div className="card-body tight table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Technology</th>
                  <th>Port</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Findings</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.host}>
                    <td className="mono t-strong">{a.host}</td>
                    <td className="t-dim nowrap">{a.type}</td>
                    <td className="t-dim nowrap">{a.src}</td>
                    <td className="t-dim">{a.tech}</td>
                    <td className="mono t-dim nowrap">{a.ports}</td>
                    <td className="nowrap">{statusCell(a.status)}</td>
                    <td>
                      {a.risk === "—" ? (
                        <span className="t-dim">—</span>
                      ) : (
                        <span className={`grade grade-${a.risk.toLowerCase()}`}>{a.risk}</span>
                      )}
                    </td>
                    <td>{a.findings || <span className="t-dim">0</span>}</td>
                    <td className="nowrap">
                      <button className="btn btn-sm" onClick={() => openEdit(a)}>
                        Edit
                      </button>{" "}
                      <button
                        className="btn btn-sm"
                        onClick={() => {
                          if (confirm(`Delete asset ${a.host}?`)) deleteAsset(a.host);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty">No matching assets.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card-body tight">
            {!rows.length ? (
              <div className="empty">No matching assets for topology.</div>
            ) : (
              <AttackSurfaceTopology assets={rows} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
