import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { SevBadge, ValidationBadge, SlaPill } from "../components/Badges";

const FILTERS = [
  "all",
  "critical",
  "high",
  "medium",
  "low",
  "kev",
  "verified",
  "pending",
] as const;

export function FindingsPage() {
  const { findings, openModal } = useApp();
  const [params] = useSearchParams();
  const initial = (params.get("filter") as (typeof FILTERS)[number]) || "all";
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>(
    FILTERS.includes(initial) ? initial : "all"
  );
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return findings.filter((f) => {
      let ok = true;
      if (["critical", "high", "medium", "low"].includes(filter)) ok = f.severity === filter;
      else if (filter === "kev") ok = f.kev;
      else if (filter === "verified") ok = f.validation === "verified";
      else if (filter === "pending") ok = f.validation === "pending";
      return (
        ok &&
        (!q ||
          `${f.id} ${f.title} ${f.asset} ${f.category}`.toLowerCase().includes(q.toLowerCase()))
      );
    });
  }, [findings, filter, q]);

  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <h1>Findings</h1>
          <p>
            Every finding carries a validation label. Click a row to open detail and run actions
            (assign, request validation, retest, close).
          </p>
        </div>
        <div className="page-head-actions">
          <button className="btn btn-sm" onClick={() => openModal("kev")}>
            KEV queue
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => openModal("request")}>
            Request validation
          </button>
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
                {f === "all"
                  ? `All (${findings.length})`
                  : f === "kev"
                    ? "In KEV catalog"
                    : f === "verified"
                      ? "Human validated"
                      : f === "pending"
                        ? "Awaiting validation"
                        : f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="right">
            <div className="search">
              <span className="t-dim">⌕</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search finding or asset…"
              />
            </div>
          </div>
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
