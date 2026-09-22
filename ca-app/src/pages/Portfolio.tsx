import { useMemo, useState } from "react";
import { DEMO } from "../data/demo";
import { useApp } from "../context/AppContext";

type SortKey = "score" | "critical" | "verified" | "name";

export function PortfolioPage() {
  const p = DEMO.portfolio;
  const { toast } = useApp();
  const [tier, setTier] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("score");
  const [selected, setSelected] = useState(p.list[0].name);
  const [tab, setTab] = useState<"companies" | "matrix" | "dd">("companies");

  const attention = useMemo(
    () =>
      p.list
        .filter((c) => (c.grade === "F" || c.grade === "D") && (c.tier === "Tier 1" || c.tier === "Tier 2"))
        .concat(p.list.filter((c) => c.delta < -10)),
    [p.list]
  );

  const uniqueAttention = [...new Map(attention.map((c) => [c.name, c])).values()].slice(0, 3);

  const rows = useMemo(() => {
    let list = [...p.list];
    if (tier !== "all") list = list.filter((c) => c.tier === tier);
    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "critical") return b.critical - a.critical;
      if (sort === "verified") return b.verified - a.verified;
      return b.score - a.score;
    });
    return list;
  }, [p.list, tier, sort]);

  const selectedCo = p.list.find((c) => c.name === selected) || p.list[0];

  const cellCls = (n: number, rowIdx: number) => {
    if (!n) return "mx-0";
    if (rowIdx <= 0) return "mx-crit";
    if (rowIdx === 1) return "mx-bad";
    if (rowIdx === 2) return "mx-warn";
    return "mx-ok";
  };

  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <h1>Portfolio</h1>
          <p>{p.fund}</p>
        </div>
        <div className="page-head-actions">
          <button
            className="btn btn-sm"
            onClick={() => toast("Q3 LP report exported (demo).")}
          >
            LP report
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => toast("IC brief generated (demo).")}
          >
            IC brief
          </button>
        </div>
      </div>

      <div className="metric-row pe-metrics">
        <div>
          <span className="label">Companies</span>
          <strong>{p.companies}</strong>
        </div>
        <div>
          <span className="label">Average score</span>
          <strong>
            {p.avgScore}{" "}
            <span className="grade grade-b" style={{ marginLeft: 4, fontSize: 14 }}>
              B
            </span>
          </strong>
        </div>
        <div>
          <span className="label">Open critical</span>
          <strong style={{ color: "var(--red)" }}>{p.criticalOpen}</strong>
        </div>
        <div>
          <span className="label">Human validated</span>
          <strong style={{ color: "var(--green)" }}>{p.verifiedPct}%</strong>
        </div>
      </div>

      {uniqueAttention.length > 0 && (
        <div className="pe-focus">
          <div className="pe-focus-label">IC focus</div>
          <div className="pe-focus-list">
            {uniqueAttention.map((c) => (
              <button
                key={c.name}
                type="button"
                className={`pe-focus-item${selected === c.name ? " active" : ""}`}
                onClick={() => {
                  setSelected(c.name);
                  setTab("companies");
                }}
              >
                <span className="pe-focus-name">{c.name}</span>
                <span className={`grade grade-${c.grade.toLowerCase()}`}>{c.grade}</span>
                <span className="t-dim">{c.tier}</span>
                {c.critical > 0 && (
                  <span className="badge b-critical">{c.critical} crit</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pe-tabs" role="tablist">
        {(
          [
            ["companies", "Companies"],
            ["matrix", "Risk matrix"],
            ["dd", "Due diligence"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`pe-tab${tab === id ? " active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "companies" && (
        <div className="pe-split">
          <div className="panel pe-table-panel">
            <div className="toolbar">
              <div className="toolbar-filters">
                <label className="field">
                  <span className="field-label">Tier</span>
                  <select
                    className="field-control"
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                  >
                    <option value="all">All tiers</option>
                    <option value="Tier 1">Tier 1</option>
                    <option value="Tier 2">Tier 2</option>
                    <option value="Tier 3">Tier 3</option>
                  </select>
                </label>
                <label className="field">
                  <span className="field-label">Sort</span>
                  <select
                    className="field-control"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                  >
                    <option value="score">Score</option>
                    <option value="critical">Critical</option>
                    <option value="verified">Validated %</option>
                    <option value="name">Name</option>
                  </select>
                </label>
              </div>
              <span className="toolbar-count">{rows.length} companies</span>
            </div>
            <div className="card-body tight table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Tier</th>
                    <th>Score</th>
                    <th>Critical</th>
                    <th>Validated</th>
                    <th>30d</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr
                      key={c.name}
                      className={`clickable${selected === c.name ? " is-selected" : ""}`}
                      onClick={() => setSelected(c.name)}
                    >
                      <td>
                        <div className="stack-2">
                          <span className="t-strong">{c.name}</span>
                          <span className="t-dim" style={{ fontSize: 11.5 }}>
                            {c.sector}
                          </span>
                        </div>
                      </td>
                      <td className="t-dim nowrap">{c.tier}</td>
                      <td className="nowrap">
                        <span className={`grade grade-${c.grade.toLowerCase()}`}>{c.grade}</span>{" "}
                        <strong>{c.score}</strong>
                      </td>
                      <td>
                        {c.critical ? (
                          <span className="badge b-critical">{c.critical}</span>
                        ) : (
                          <span className="t-dim">0</span>
                        )}
                      </td>
                      <td>{c.verified}%</td>
                      <td className={c.delta >= 0 ? "up" : "down"}>
                        {c.delta >= 0 ? "+" : ""}
                        {c.delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="panel pe-detail-panel">
            <div className="panel-head">
              <h3>{selectedCo.name}</h3>
              <span className={`grade grade-${selectedCo.grade.toLowerCase()} grade-xl`}>
                {selectedCo.grade}
              </span>
            </div>
            <div className="card-body">
              <div className="t-dim" style={{ fontSize: 12.5, marginBottom: 14 }}>
                {selectedCo.sector} · {selectedCo.tier}
              </div>
              <div className="pe-detail-grid">
                <div>
                  <span className="label">Score</span>
                  <strong>{selectedCo.score}</strong>
                </div>
                <div>
                  <span className="label">30 days</span>
                  <strong className={selectedCo.delta >= 0 ? "up" : "down"}>
                    {selectedCo.delta >= 0 ? "+" : ""}
                    {selectedCo.delta}
                  </strong>
                </div>
                <div>
                  <span className="label">Critical</span>
                  <strong style={{ color: selectedCo.critical ? "var(--red)" : "var(--green)" }}>
                    {selectedCo.critical}
                  </strong>
                </div>
                <div>
                  <span className="label">Validated</span>
                  <strong>{selectedCo.verified}%</strong>
                </div>
              </div>
              <div className="meter good" style={{ margin: "14px 0 8px" }}>
                <span style={{ width: `${selectedCo.verified}%` }} />
              </div>
              <div className="t-dim" style={{ fontSize: 12 }}>
                Next pentest: {selectedCo.pentest}
              </div>
              <div className="row-flex" style={{ marginTop: 16, gap: 8 }}>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => toast(`Opening ${selectedCo.name} assurance summary (demo).`)}
                >
                  Open assurance
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => toast(`IC brief for ${selectedCo.name} copied.`)}
                >
                  Copy brief
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {tab === "matrix" && (
        <div className="panel">
          <div className="panel-head">
            <h3>Risk matrix</h3>
            <span className="sub">Grade × impact tier — click a cell to focus IC discussion</span>
          </div>
          <div className="card-body">
            <div className="matrix pe-matrix">
              <div className="mx-head" />
              {p.matrix.cols.map((c) => (
                <div className="mx-head" key={c}>
                  {c}
                </div>
              ))}
              {p.matrix.rows.map((row, ri) => [
                <div className="mx-row-label" key={`l-${row.label}`}>
                  <span className={`grade ${row.cls}`}>{row.label}</span>
                </div>,
                ...row.cells.map((n, ci) => (
                  <button
                    type="button"
                    className={`mx-cell ${cellCls(n, ri)}`}
                    key={`${row.label}-${ci}`}
                    onClick={() =>
                      n
                        ? toast(`${n} companies · grade ${row.label} · ${p.matrix.cols[ci]}`)
                        : toast("Empty cell — no companies.", "info")
                    }
                    title={`${n} companies · grade ${row.label} · ${p.matrix.cols[ci]}`}
                  >
                    {n || "·"}
                  </button>
                )),
              ])}
            </div>
            <div className="axis-note">
              <span>Lower impact</span>
              <span>Higher impact</span>
            </div>
            <p className="t-dim" style={{ fontSize: 12.5, marginTop: 12, marginBottom: 0 }}>
              Top-right cells = high value with weak posture — primary IC agenda.
            </p>
          </div>
        </div>
      )}

      {tab === "dd" && (
        <div className="panel">
          <div className="panel-head">
            <h3>Due diligence pipeline</h3>
            <span className="sub">Pre-acquisition assessment uses the same engine</span>
          </div>
          <div className="pe-dd-table table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Stage</th>
                  <th>Grade</th>
                  <th>Score</th>
                  <th>Key finding</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {DEMO.dueDiligence.map((d) => (
                  <tr key={d.name}>
                    <td className="t-strong">{d.name}</td>
                    <td>
                      <span className="badge b-neutral">{d.stage}</span>
                    </td>
                    <td>
                      <span className={`grade grade-${d.grade.toLowerCase()}`}>{d.grade}</span>
                    </td>
                    <td>{d.score}</td>
                    <td className="t-dim">{d.finding}</td>
                    <td>{d.rec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
