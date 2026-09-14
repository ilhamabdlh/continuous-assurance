import { useMemo, useState } from "react";
import { DEMO } from "../data/demo";
import { AttackSurfaceTopology } from "../components/AttackSurfaceTopology";
import { AttackSurfaceRegions } from "../components/AttackSurfaceRegions";

const FILTERS = ["all", "Subdomain", "IP", "Cloud", "Related domain", "unscanned"] as const;

type ViewMode = "table" | "topology" | "regions";

export function AssetsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<ViewMode>("table");

  const rows = useMemo(() => {
    return DEMO.assets.filter((a) => {
      const okFilter =
        filter === "all" ||
        (filter === "unscanned" ? a.status === "unscanned" : a.type === filter);
      const okSearch =
        !q || `${a.host} ${a.tech} ${a.ports}`.toLowerCase().includes(q.toLowerCase());
      return okFilter && okSearch;
    });
  }, [filter, q]);

  const statusCell = (s: string) =>
    s === "verified" ? (
      <span className="badge b-verified">✓ Human validated</span>
    ) : s === "auto" ? (
      <span className="badge b-auto">Automated scan</span>
    ) : (
      <span className="badge b-high">Unscanned</span>
    );

  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <h1>Attack surface</h1>
          <p>
            Internet-facing asset inventory. Table for detail, topology for relationships, cloud
            regions when the graph gets dense — unscanned assets stay visible in every view.
          </p>
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
            <button
              type="button"
              className={`view-switch-btn${view === "regions" ? " active" : ""}`}
              onClick={() => setView("regions")}
            >
              Cloud / region
            </button>
          </div>
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

      <div className="grid g-4" style={{ marginBottom: 14 }}>
        <div className="kpi">
          <div className="label">Discovered</div>
          <div className="value">{DEMO.assetSplit.discovered}</div>
        </div>
        <div className="kpi">
          <div className="label">Automated scan</div>
          <div className="value">{DEMO.assetSplit.scanned}</div>
        </div>
        <div className="kpi">
          <div className="label">Human validated</div>
          <div className="value" style={{ color: "var(--green)" }}>
            {DEMO.assetSplit.humanValidated}
          </div>
        </div>
        <div className="kpi">
          <div className="label">Unscanned</div>
          <div className="value" style={{ color: "var(--orange)" }}>
            {DEMO.assetSplit.unscanned}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head" style={{ flexWrap: "wrap", gap: 10 }}>
          <div className="chips">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`chip${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f === "unscanned" ? "Unscanned" : f}
              </button>
            ))}
          </div>
          <div className="right">
            <div className="search">
              <span className="t-dim">⌕</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search host, technology, port…"
              />
            </div>
          </div>
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
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty">No matching assets.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : view === "topology" ? (
          <div className="card-body tight">
            {!rows.length ? (
              <div className="empty">No matching assets for topology.</div>
            ) : (
              <AttackSurfaceTopology assets={rows} />
            )}
          </div>
        ) : (
          <div className="card-body tight">
            {!rows.length ? (
              <div className="empty">No matching assets for regions.</div>
            ) : (
              <AttackSurfaceRegions assets={rows} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
