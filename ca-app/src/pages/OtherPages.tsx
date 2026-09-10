import { Link } from "react-router-dom";
import { DEMO } from "../data/demo";
import { useApp } from "../context/AppContext";

function cisStatusBadge(status: string) {
  if (status === "Proven") return "b-verified";
  if (status === "Partial") return "b-high";
  return "b-neutral";
}

export function EvidencePage() {
  const { toast } = useApp();
  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <h1>Evidence readiness</h1>
          <p>
            Narrow mapping to external technical frameworks — not a full compliance platform like
            Vanta.
          </p>
        </div>
        <div className="page-head-actions">
          <Link className="btn btn-sm" to="/reports">
            Export evidence pack
          </Link>
        </div>
      </div>

      <div className="annot">
        <span>◆</span>
        <div>
          <b>Intentional boundary.</b> This module offers human-verified technical control evidence
          — the weakest part of compliance automation.
        </div>
      </div>

      <div className="grid g-2e" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-head">
            <h3>Progress by framework</h3>
          </div>
          <div className="card-body">
            {DEMO.evidenceReadiness.map((r) => (
              <div key={r.label} style={{ marginBottom: 18 }}>
                <div
                  className="row-flex"
                  style={{ justifyContent: "space-between", marginBottom: 6 }}
                >
                  <span style={{ fontSize: 13 }}>{r.label}</span>
                  <span className="t-strong" style={{ fontSize: 13 }}>
                    {r.pct}%
                  </span>
                </div>
                <div className={`meter ${r.pct >= 80 ? "good" : r.pct < 60 ? "warn" : ""}`}>
                  <span style={{ width: `${r.pct}%` }} />
                </div>
                <div className="t-dim" style={{ fontSize: 12, marginTop: 6 }}>
                  {r.note}
                </div>
              </div>
            ))}
            <button
              className="btn btn-sm"
              onClick={() => toast("Interim evidence pack exported (demo PDF).")}
            >
              Download interim pack
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>CIS Controls v8.1 · IG1</h3>
            <span className="sub">Controls provable from the outside</span>
          </div>
          <div className="card-body tight table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Control</th>
                  <th>Evidence from platform</th>
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

      <div className="card">
        <div className="card-head">
          <h3>Relevant regulatory drivers</h3>
          <span className="sub">Why continuous evidence is requested — not an annual snapshot</span>
        </div>
        <div className="card-body tight table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Regulation / framework</th>
                <th>What is required</th>
                <th>This module&apos;s contribution</th>
              </tr>
            </thead>
            <tbody>
              {DEMO.regulations.map((row) => (
                <tr key={row.framework}>
                  <td className="t-strong">{row.framework}</td>
                  <td className="t-dim">{row.requires}</td>
                  <td className="t-dim">{row.contribution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function ReportsPage() {
  const { toast } = useApp();
  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <h1>Reports</h1>
          <p>Four audiences, four formats — Generate button shows a demo notification.</p>
        </div>
      </div>
      <div className="grid g-2e" style={{ marginBottom: 14 }}>
        {DEMO.reports.map((r) => (
          <div key={r.title} className={`report-card${r.feature ? " feature" : ""}`}>
            <div className="row-flex">
              <div className="report-ico">{r.icon}</div>
              <div>
                <h4>
                  {r.title}
                  {r.feature && (
                    <span className="badge b-kev" style={{ marginLeft: 6 }}>
                      Differentiator
                    </span>
                  )}
                </h4>
                <p>{r.desc}</p>
              </div>
            </div>
            <ul>
              {r.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <div className="report-foot">
              <span className="when">{r.when}</span>
              <button
                className={`btn btn-sm${r.feature ? " btn-primary" : ""}`}
                onClick={() => toast(`Report “${r.title}” generated (demo).`)}
              >
                Generate
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Report history</h3>
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
                      onClick={() => toast(`Downloaded “${row.name}” (demo).`)}
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
