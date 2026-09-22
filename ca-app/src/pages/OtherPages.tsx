import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DEMO } from "../data/demo";
import { useApp } from "../context/AppContext";

function cisStatusBadge(status: string) {
  if (status === "Proven") return "b-verified";
  if (status === "Partial") return "b-high";
  return "b-neutral";
}

function downloadEvidencePack() {
  const rows = DEMO.evidenceReadiness
    .map((r) => `${r.label}\t${r.pct}%\t${r.note}`)
    .join("\n");
  const cis = DEMO.cisControls
    .map((c) => `${c.control}\t${c.evidence}\t${c.status}`)
    .join("\n");
  const text = `Atumcell Continuous Assurance — Evidence pack
Generated: ${new Date().toISOString().slice(0, 10)}

FRAMEWORK READINESS
${rows}

CIS CONTROLS v8.1 · IG1
${cis}
`;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "evidence-readiness-pack.txt";
  a.click();
  URL.revokeObjectURL(url);
}

export function EvidencePage() {
  const { toast } = useApp();
  const avg = Math.round(
    DEMO.evidenceReadiness.reduce((s, r) => s + r.pct, 0) / DEMO.evidenceReadiness.length
  );
  const proven = DEMO.cisControls.filter((c) => c.status === "Proven").length;

  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <h1>Evidence readiness</h1>
          <p>Technical control evidence mapped to external frameworks.</p>
        </div>
        <div className="page-head-actions">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              downloadEvidencePack();
              toast("Evidence pack downloaded.");
            }}
          >
            Download evidence pack
          </button>
        </div>
      </div>

      <div className="metric-row evid-metrics">
        <div>
          <span className="label">Avg readiness</span>
          <strong>{avg}%</strong>
        </div>
        <div>
          <span className="label">CIS proven</span>
          <strong>
            {proven}/{DEMO.cisControls.length}
          </strong>
        </div>
        <div>
          <span className="label">Frameworks tracked</span>
          <strong>{DEMO.evidenceReadiness.length}</strong>
        </div>
        <div>
          <span className="label">Regulatory drivers</span>
          <strong>{DEMO.regulations.length}</strong>
        </div>
      </div>

      <div className="evid-layout">
        <div className="panel evid-frameworks">
          <div className="panel-head">
            <h3>Framework progress</h3>
            <span className="sub">Outside-in technical evidence only</span>
          </div>
          <div className="evid-fw-list">
            {DEMO.evidenceReadiness.map((r) => (
              <div key={r.label} className="evid-fw-item">
                <div className="evid-fw-top">
                  <div>
                    <div className="evid-fw-name">{r.label}</div>
                    <div className="t-dim" style={{ fontSize: 12, marginTop: 2 }}>
                      {r.note}
                    </div>
                  </div>
                  <div className="evid-fw-pct">{r.pct}%</div>
                </div>
                <div className={`meter ${r.pct >= 80 ? "good" : r.pct < 60 ? "warn" : ""}`}>
                  <span style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>CIS Controls v8.1 · IG1</h3>
            <span className="sub">Provable from the outside</span>
          </div>
          <div className="card-body tight table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Control</th>
                  <th>Evidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {DEMO.cisControls.map((row) => (
                  <tr key={row.control}>
                    <td className="t-strong">{row.control}</td>
                    <td className="t-dim">{row.evidence}</td>
                    <td>
                      <span className={`badge ${cisStatusBadge(row.status)}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-head">
          <h3>Regulatory drivers</h3>
          <span className="sub">Why continuous evidence is requested</span>
          <div className="right">
            <Link className="btn btn-sm" to="/reports">
              Open reports
            </Link>
          </div>
        </div>
        <div className="evid-reg-grid">
          {DEMO.regulations.map((row) => (
            <div key={row.framework} className="evid-reg-item">
              <h4>{row.framework}</h4>
              <p>
                <span className="evid-reg-label">Requires</span>
                {row.requires}
              </p>
              <p>
                <span className="evid-reg-label">Contribution</span>
                {row.contribution}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type ReportDef = (typeof DEMO.reports)[number] & {
  audience: string;
  format: string;
  period: string;
};

const REPORT_META: Record<string, { audience: string; format: string; period: string }> = {
  "Executive summary": {
    audience: "CEO · Board · PE sponsor",
    format: "PDF · 1 page",
    period: "Last 30 days",
  },
  "Technical report": {
    audience: "IT · Engineering · Security",
    format: "PDF + CSV",
    period: "Current sprint",
  },
  "Insurance underwriter binder": {
    audience: "Broker · Underwriter",
    format: "PDF binder",
    period: "Trailing 12 months",
  },
  "Auditor evidence pack": {
    audience: "External auditor · GRC",
    format: "PDF + annex",
    period: "YTD / audit window",
  },
};

function downloadReport(title: string, items: string[], period: string) {
  const body = `Atumcell Continuous Assurance
Report: ${title}
Period: ${period}
Generated: ${new Date().toISOString().slice(0, 10)}

Contents
${items.map((i, n) => `${n + 1}. ${i}`).join("\n")}

— End of demo report —
`;
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const { toast, company } = useApp();
  const catalog: ReportDef[] = useMemo(
    () =>
      DEMO.reports.map((r) => ({
        ...r,
        ...(REPORT_META[r.title] || {
          audience: "Stakeholders",
          format: "PDF",
          period: "Current period",
        }),
      })),
    []
  );

  const featured = catalog.find((r) => r.feature) || catalog[0];
  const [selectedTitle, setSelectedTitle] = useState(featured.title);
  const selected = catalog.find((r) => r.title === selectedTitle) || catalog[0];
  const [period, setPeriod] = useState(selected.period);

  const relatedHistory = DEMO.reportHistory.filter((h) =>
    h.name.toLowerCase().includes(selected.title.split(" ")[0].toLowerCase())
  );

  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <h1>Reports</h1>
          <p>
            Pick an audience pack, preview contents, then download — same stream as{" "}
            {company.name} assurance.
          </p>
        </div>
      </div>

      <div className="rpt-shell">
        <aside className="rpt-catalog" aria-label="Report types">
          <div className="rpt-catalog-head">
            <span>Report catalog</span>
            <em>{catalog.length}</em>
          </div>
          <ul className="rpt-catalog-list">
            {catalog.map((r) => (
              <li key={r.title}>
                <button
                  type="button"
                  className={`rpt-catalog-item${selectedTitle === r.title ? " is-active" : ""}${
                    r.feature ? " is-feature" : ""
                  }`}
                  onClick={() => {
                    setSelectedTitle(r.title);
                    setPeriod(r.period);
                  }}
                >
                  <span className="rpt-catalog-ico" aria-hidden>
                    {r.icon}
                  </span>
                  <span className="rpt-catalog-copy">
                    <span className="rpt-catalog-title">
                      {r.title}
                      {r.feature && <span className="rpt-dot" title="Differentiator" />}
                    </span>
                    <span className="rpt-catalog-aud">{r.audience}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="rpt-detail panel">
          <div className="rpt-detail-top">
            <div>
              <div className="rpt-eyebrow">
                {selected.feature ? "Differentiator" : "Standard export"}
                <span>· {selected.format}</span>
              </div>
              <h2>{selected.title}</h2>
              <p className="rpt-detail-desc">{selected.desc}</p>
            </div>
            <div className="rpt-detail-actions">
              <label className="field rpt-period">
                <span className="field-label">Period</span>
                <select
                  className="field-control"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value={selected.period}>{selected.period}</option>
                  <option value="Last 7 days">Last 7 days</option>
                  <option value="Last 30 days">Last 30 days</option>
                  <option value="Last quarter">Last quarter</option>
                  <option value="Trailing 12 months">Trailing 12 months</option>
                </select>
              </label>
              <button
                className="btn btn-primary"
                onClick={() => {
                  downloadReport(selected.title, selected.items, period);
                  toast(`“${selected.title}” downloaded.`);
                }}
              >
                Download {selected.format.split("·")[0].trim()}
              </button>
            </div>
          </div>

          <div className="rpt-meta-row">
            <div>
              <span className="label">Audience</span>
              <strong>{selected.audience}</strong>
            </div>
            <div>
              <span className="label">Freshness</span>
              <strong>{selected.when}</strong>
            </div>
            <div>
              <span className="label">Source</span>
              <strong>Live assurance stream</strong>
            </div>
          </div>

          <div className="rpt-contents">
            <h3>Included in this pack</h3>
            <ul>
              {selected.items.map((item) => (
                <li key={item}>
                  <span className="rpt-check" aria-hidden>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {selected.feature && (
            <div className="rpt-callout">
              <strong>Why this matters</strong>
              <p>
                Underwriters ask for continuous proof — not an annual pentest PDF. This binder
                packages verified closures and external control evidence for renewal.
              </p>
            </div>
          )}

          {relatedHistory.length > 0 && (
            <div className="rpt-related">
              <div className="rpt-related-head">Recent for this type</div>
              <ul>
                {relatedHistory.slice(0, 3).map((h) => (
                  <li key={h.name}>
                    <span className="t-strong">{h.name}</span>
                    <span className="t-dim">{h.created}</span>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => {
                        downloadReport(h.name, [`Period: ${h.period}`], h.period);
                        toast(`Downloaded “${h.name}”.`);
                      }}
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-head">
          <h3>Report history</h3>
          <span className="sub">Immutable exports already shared with stakeholders</span>
        </div>
        <div className="card-body tight table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Report</th>
                <th>Period</th>
                <th>Recipients</th>
                <th>Format</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {DEMO.reportHistory.map((row) => (
                <tr key={row.name}>
                  <td className="t-strong">{row.name}</td>
                  <td className="t-dim">{row.period}</td>
                  <td className="t-dim">{row.recipients}</td>
                  <td>
                    <span className="badge b-neutral">{row.format}</span>
                  </td>
                  <td className="nowrap t-dim">{row.created}</td>
                  <td className="nowrap">
                    <button
                      className="btn btn-sm"
                      onClick={() => {
                        downloadReport(row.name, [`Period: ${row.period}`], row.period);
                        toast(`Downloaded “${row.name}”.`);
                      }}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
