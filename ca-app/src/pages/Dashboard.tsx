import { Link } from "react-router-dom";
import { DEMO } from "../data/demo";
import { useApp } from "../context/AppContext";
import { CycleStrip } from "../components/CycleStrip";
import { ScoreMark, TrendChart } from "../components/Charts";
import { SevBadge, ValidationBadge, SlaPill } from "../components/Badges";

export function DashboardPage() {
  const { findings, feed, openModal } = useApp();
  const critHigh = DEMO.findingTrend.critical.map(
    (c, i) => c + DEMO.findingTrend.high[i]
  );
  const top = findings
    .filter((f) => f.severity === "critical" || f.severity === "high")
    .slice(0, 6);
  const s = DEMO.assetSplit;
  const auto = s.scanned - s.humanValidated;
  const parts = [
    { label: `Human validated · ${s.humanValidated}`, n: s.humanValidated, color: "#1a6b45" },
    { label: `Automated scan · ${auto}`, n: auto, color: "#1c2430" },
    { label: `Unscanned · ${s.unscanned}`, n: s.unscanned, color: "#e8491d" },
  ];
  const critical = findings.filter((f) => f.severity === "critical").length;
  const verifiedPct = Math.round(
    (findings.filter((f) => f.validation === "verified").length / Math.max(1, findings.length)) *
      100
  );

  return (
    <section className="screen active">
      <header className="masthead">
        <div>
          <h1 className="masthead-brand">
            <img
              className="masthead-logo"
              src="/brand/atumcell-mark.png"
              alt=""
              width={48}
              height={48}
            />
            <span className="masthead-brand-text">
              Atumcell
              <span>Continuous Assurance</span>
            </span>
          </h1>
          <p className="masthead-lede">
            {DEMO.tenant.name} — external exposure with human-validated findings and dated closure
            proof.
          </p>
          <div className="page-head-actions" style={{ marginLeft: 0, marginTop: 14 }}>
            <button className="btn btn-sm" onClick={() => openModal("kev")}>
              Validate emergent threats
            </button>
            <Link className="btn btn-sm btn-primary" to="/reports">
              Generate report
            </Link>
          </div>
        </div>
        <ScoreMark
          score={DEMO.kpi.score}
          max={DEMO.kpi.scoreMax}
          grade={DEMO.kpi.grade}
          delta={DEMO.kpi.scoreDelta}
          sector="Logistics · 68th pct"
          sweep={DEMO.tenant.lastSweep}
        />
      </header>

      <div className="metric-row">
        <div className="metric">
          <div className="label">Human validated</div>
          <div className="value" style={{ color: "var(--green)" }}>
            {verifiedPct}%
          </div>
          <div className="hint">Of open findings</div>
        </div>
        <div className="metric">
          <div className="label">Active critical</div>
          <div className="value" style={{ color: "var(--red)" }}>
            {critical}
          </div>
          <div className="hint">Needs action</div>
        </div>
        <div className="metric">
          <div className="label">Open findings</div>
          <div className="value">{findings.length}</div>
          <div className="hint">Live app state</div>
        </div>
        <div className="metric">
          <div className="label">Monitored assets</div>
          <div className="value">{DEMO.kpi.assetsMonitored}</div>
          <div className="hint">+{DEMO.kpi.assetsNew7d} in 7 days</div>
        </div>
      </div>

      <CycleStrip />

      <div className="dash-main">
        <div className="panel">
          <div className="panel-head">
            <h3>Priority findings</h3>
            <span className="sub">Critical and high</span>
            <div className="right">
              <Link className="btn btn-sm" to="/findings">
                View all
              </Link>
            </div>
          </div>
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Finding</th>
                  <th>Severity</th>
                  <th>Validation</th>
                  <th>SLA</th>
                </tr>
              </thead>
              <tbody>
                {top.map((f) => (
                  <tr key={f.id} className="clickable">
                    <td>
                      <Link to={`/findings/${f.id}`} style={{ color: "inherit" }}>
                        <div className="stack-2">
                          <span className="t-strong">{f.title}</span>
                          <span className="t-dim mono" style={{ fontSize: 11.5 }}>
                            {f.id} · {f.asset}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="panel">
            <div className="panel-head">
              <h3>Trend</h3>
              <span className="sub">12 weeks</span>
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
                Score
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
                Crit + high
              </span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Coverage</h3>
            </div>
            <div className="card-body">
              <div className="stacked">
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
              <div className="split-legend">
                {parts.map((p) => (
                  <span key={p.label}>
                    <i style={{ background: p.color }} />
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Activity</h3>
            </div>
            <div className="card-body">
              <ul className="timeline">
                {feed.slice(0, 5).map((v, i) => (
                  <li key={i} className={v.kind}>
                    <div className="tl-title">{v.title}</div>
                    <div className="tl-meta">{v.meta}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
