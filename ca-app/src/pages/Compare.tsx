import { Link } from "react-router-dom";

export function ComparePage() {
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
            Where we win vs Rapid7. Vector Command is the closest analog; Exposure Command is the
            enterprise CTEM platform we intentionally do not fully replicate.
          </p>
        </div>
        <div className="page-head-actions" style={{ marginLeft: 0, alignSelf: "start" }}>
          <Link className="btn btn-sm" to="/">
            ← Overview
          </Link>
        </div>
      </header>

      <div className="grid g-3" style={{ marginBottom: 14 }}>
        <div className="panel" style={{ borderColor: "var(--orange)" }}>
          <div className="card-body">
            <span className="badge b-kev">Atumcell</span>
            <h3 style={{ margin: "10px 0 8px", fontFamily: "var(--font-display)", textTransform: "uppercase" }}>
              Continuous Assurance
            </h3>
            <p className="t-dim" style={{ margin: 0, fontSize: 13 }}>
              Agentless external + human-validated label + closure certificate + PE portfolio.
            </p>
          </div>
        </div>
        <div className="panel">
          <div className="card-body">
            <span className="badge b-verified">Closest match</span>
            <h3 style={{ margin: "10px 0 8px", fontFamily: "var(--font-display)", textTransform: "uppercase" }}>
              Vector Command
            </h3>
            <p className="t-dim" style={{ margin: 0, fontSize: 13 }}>
              Continuous red team + external recon + human validation + same-day report.
            </p>
          </div>
        </div>
        <div className="panel">
          <div className="card-body">
            <span className="badge b-teal">Platform</span>
            <h3 style={{ margin: "10px 0 8px", fontFamily: "var(--font-display)", textTransform: "uppercase" }}>
              Exposure Command
            </h3>
            <p className="t-dim" style={{ margin: 0, fontSize: 13 }}>
              Hybrid CTEM: InsightVM + Surface + cloud. Automated assessment &amp; prioritization.
            </p>
          </div>
        </div>
      </div>

      <div className="panel" style={{ overflow: "auto" }}>
        <table className="compare-table">
          <thead>
            <tr>
              <th>Capability</th>
              <th>Exposure Cmd</th>
              <th>Vector Cmd</th>
              <th className="ours">Atumcell CA</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["External attack surface", "●", "●", "●"],
              ["Human exploit validation", "◐", "●", "●"],
              ["Human-validated label in UI", "—", "◐", "● differentiator"],
              ["Closure certificate", "—", "—", "● unique"],
              ["Discover→Remediate cycle", "◐", "●", "●"],
              ["Emergent / KEV queue", "●", "●", "●"],
              ["CNAPP / agent hybrid", "●", "—", "— intentionally not"],
              ["PE portfolio + DD", "—", "—", "●"],
            ].map(([f, a, b, c]) => (
              <tr key={f}>
                <td>{f}</td>
                <td>{a}</td>
                <td>{b}</td>
                <td className="ours yes">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
