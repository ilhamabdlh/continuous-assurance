import { Link } from "react-router-dom";
import { DEMO } from "../data/demo";
import { useApp } from "../context/AppContext";
import { CycleStrip } from "../components/CycleStrip";
import { TrendChart } from "../components/Charts";
import { SevBadge, ValidationBadge, SlaPill } from "../components/Badges";
import type { Finding } from "../types";

function severityRank(f: Finding) {
  const sev = { critical: 0, high: 1, medium: 2, low: 3 }[f.severity];
  const kev = f.kev ? 0 : 1;
  const sla = f.slaState === "late" ? 0 : f.slaState === "soon" ? 1 : 2;
  const val = f.validation === "pending" ? 0 : f.validation === "auto" ? 1 : 2;
  return kev * 1000 + sev * 100 + sla * 10 + val;
}

export function DashboardPage() {
  const { findings, feed, openModal, company } = useApp();
  const critHigh = DEMO.findingTrend.critical.map(
    (c, i) => c + DEMO.findingTrend.high[i]
  );
  const s = DEMO.assetSplit;
  const auto = s.scanned - s.humanValidated;
  const parts = [
    { label: `Human validated · ${s.humanValidated}`, n: s.humanValidated, color: "var(--green)" },
    { label: `Automated · ${auto}`, n: auto, color: "var(--text)" },
    { label: `Unscanned · ${s.unscanned}`, n: s.unscanned, color: "var(--orange)" },
  ];

  const bySev = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
  };
  const kevCount = findings.filter((f) => f.kev).length;
  const verifiedPct = company.verified;
  const score = company.score;
  const scoreMax = DEMO.kpi.scoreMax;
  const scorePct = Math.round((score / scoreMax) * 100);
  const grade = company.grade;
  const scoreDelta = company.delta;

  const topIssues = [...findings].sort((a, b) => severityRank(a) - severityRank(b)).slice(0, 8);

  return (
    <section className="screen active">
      <header className="masthead masthead-compact masthead-company">
        <div>
          <h1 className="masthead-brand masthead-company-brand">
            {company.logo ? (
              <img
                className="masthead-company-logo"
                src={company.logo}
                alt={company.name}
              />
            ) : (
              <span className="masthead-brand-text">
                {company.name}
                <span>{company.sector}</span>
              </span>
            )}
          </h1>
          <p className="masthead-lede">
            {company.domain} · {company.tier} · last sweep {company.lastSweep}
          </p>
        </div>
        <div className="page-head-actions" style={{ marginLeft: 0 }}>
          <button className="btn btn-sm" onClick={() => openModal("kev")}>
            Validate emergent threats
          </button>
          <Link className="btn btn-sm btn-primary" to="/reports">
            Generate report
          </Link>
        </div>
      </header>

      {/* Overall risk score — primary signal Matthew asked for */}
      <section className="risk-score" aria-labelledby="risk-score-title">
        <div className="risk-score-main">
          <div className="risk-score-label" id="risk-score-title">
            Overall risk score
          </div>
          <div className="risk-score-row">
            <div className="risk-score-num">
              {score}
              <span>/{scoreMax}</span>
            </div>
            <span className={`grade grade-${grade.toLowerCase()} grade-xl`}>{grade}</span>
          </div>
          <div className="risk-score-bar" aria-hidden>
            <span style={{ width: `${scorePct}%` }} />
          </div>
          <div className="risk-score-delta">
            {scoreDelta >= 0 ? "+" : ""}
            {scoreDelta} pts in 30 days · {company.sector} · {company.tier} · {verifiedPct}% human
            validated
          </div>
        </div>

        <div className="risk-sev">
          <div className="risk-sev-title">Open findings by severity</div>
          {(
            [
              ["Critical", bySev.critical, "var(--red)", "critical"],
              ["High", bySev.high, "var(--orange)", "high"],
              ["Medium", bySev.medium, "var(--yellow)", "medium"],
              ["Low", bySev.low, "var(--text-mute)", "low"],
            ] as const
          ).map(([label, n, color]) => (
            <div key={label} className="risk-sev-row">
              <span className="risk-sev-label">{label}</span>
              <span className="risk-sev-track">
                <span
                  style={{
                    width: `${Math.max(4, (n / Math.max(1, findings.length)) * 100)}%`,
                    background: color,
                  }}
                />
              </span>
              <span className="risk-sev-n" style={{ color }}>
                {n}
              </span>
            </div>
          ))}
          <div className="risk-sev-foot">
            <span>
              <strong>{kevCount}</strong> KEV / emergent
            </span>
            <span>
              <strong>{DEMO.kpi.assetsMonitored}</strong> assets monitored
            </span>
          </div>
        </div>

        <div className="risk-coverage">
          <div className="risk-sev-title">Assurance coverage</div>
          <div className="stacked" style={{ height: 14, marginBottom: 10 }}>
            {parts.map((p) => (
              <span
                key={p.label}
                style={{
                  width: `${((p.n / s.discovered) * 100).toFixed(1)}%`,
                  background: p.color,
                }}
              />
            ))}
          </div>
          <div className="split-legend" style={{ marginTop: 0 }}>
            {parts.map((p) => (
              <span key={p.label}>
                <i style={{ background: p.color }} />
                {p.label}
              </span>
            ))}
          </div>
          <p className="risk-coverage-note">
            Scanned is not the same as secured — unscanned assets stay visible on purpose.
          </p>
        </div>
      </section>

      <CycleStrip />

      {/* Top issues to remediate — primary action list */}
      <section className="panel top-issues" aria-labelledby="top-issues-title">
        <div className="panel-head">
          <h3 id="top-issues-title">Top issues to remediate</h3>
          <span className="sub">
            Ranked by KEV, severity, SLA, then validation state · {topIssues.length} of{" "}
            {findings.length} open
          </span>
          <div className="right">
            <Link className="btn btn-sm" to="/remediation">
              Open remediation board
            </Link>
            <Link className="btn btn-sm" to="/findings">
              All findings
            </Link>
          </div>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Issue</th>
                <th>Severity</th>
                <th>Validation</th>
                <th>SLA</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {topIssues.map((f, i) => (
                <tr key={f.id}>
                  <td className="mono t-dim">{i + 1}</td>
                  <td>
                    <Link to={`/findings/${f.id}`} style={{ color: "inherit" }}>
                      <div className="stack-2">
                        <span className="t-strong">{f.title}</span>
                        <span className="t-dim mono" style={{ fontSize: 11.5 }}>
                          {f.id} · {f.asset}
                          {f.owner ? ` · ${f.owner}` : ""}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="nowrap">
                    <SevBadge severity={f.severity} />
                    {f.kev && <span className="badge b-kev">KEV</span>}
                  </td>
                  <td className="nowrap">
                    <ValidationBadge validation={f.validation} />
                  </td>
                  <td className="nowrap">
                    <SlaPill sla={f.sla} state={f.slaState} />
                  </td>
                  <td className="nowrap">
                    <div className="issue-actions">
                      <Link className="btn btn-sm btn-primary" to="/remediation">
                        Remediate
                      </Link>
                      <Link className="btn btn-sm" to={`/findings/${f.id}`}>
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {topIssues.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">
                    No open issues — verification queue is clear.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="dash-main">
        <div className="panel">
          <div className="panel-head">
            <h3>Score &amp; findings trend</h3>
            <span className="sub">Last 12 weeks</span>
          </div>
          <TrendChart score={DEMO.scoreTrend} findings={critHigh} />
          <div className="chart-legend">
            <span>
              <i
                style={{
                  display: "inline-block",
                  width: 18,
                  height: 2,
                  background: "var(--text)",
                  verticalAlign: "middle",
                  marginRight: 6,
                }}
              />
              Risk score
            </span>
            <span>
              <i
                style={{
                  display: "inline-block",
                  width: 18,
                  height: 2,
                  background: "var(--orange)",
                  verticalAlign: "middle",
                  marginRight: 6,
                }}
              />
              Critical + high
            </span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Validation activity</h3>
          </div>
          <div className="card-body">
            <ul className="timeline">
              {feed.slice(0, 6).map((v, i) => (
                <li key={i} className={v.kind}>
                  <div className="tl-title">{v.title}</div>
                  <div className="tl-meta">{v.meta}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
