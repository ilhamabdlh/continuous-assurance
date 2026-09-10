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
  const [matrixFilter, setMatrixFilter] = useState<{ grade: string; col: number } | null>(null);

  const attention = useMemo(
    () =>
      p.list
        .filter((c) => (c.grade === "F" || c.grade === "D") && (c.tier === "Tier 1" || c.tier === "Tier 2"))
        .concat(p.list.filter((c) => c.delta < -10)),
    [p.list]
  );

  const uniqueAttention = [...new Map(attention.map((c) => [c.name, c])).values()];

  const rows = useMemo(() => {
    let list = [...p.list];
    if (tier !== "all") list = list.filter((c) => c.tier === tier);
    if (matrixFilter) {
      list = list.filter((c) => {
        if (c.grade !== matrixFilter.grade) return false;
        const tiers = ["Tier 3", "Tier 2", "Tier 1"];
        if (matrixFilter.col === 3) return !tiers.includes(c.tier);
        return c.tier === tiers[matrixFilter.col];
      });
    }
    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "critical") return b.critical - a.critical;
      if (sort === "verified") return b.verified - a.verified;
      return b.score - a.score;
    });
    return list;
  }, [p.list, tier, sort, matrixFilter]);

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
      <div className="pe-hero">
        <div className="pe-hero-main">
          <div className="pe-fund-mark">MC</div>
          <div>
            <div className="pe-eyebrow">Private Equity · Sponsor view</div>
            <h1>Portfolio</h1>
            <p>{p.fund}</p>
          </div>
        </div>
        <div className="pe-hero-actions">
          <button
            className="btn btn-sm"
            onClick={() => toast("Q3 LP report exported (demo PDF).")}
          >
            LP report
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => toast("IC brief generated from risk matrix (demo).")}
          >
            IC brief
          </button>
        </div>
      </div>

      <div className="pe-kpis">
        <div className="pe-kpi">
          <div className="pe-kpi-ico">▣</div>
          <div>
            <div className="label">Companies monitored</div>
            <div className="value">{p.companies}</div>
            <div className="delta flat">3 added via Q3 DD</div>
          </div>
        </div>
        <div className="pe-kpi">
          <div className="pe-kpi-ico teal">◎</div>
          <div>
            <div className="label">Average score</div>
            <div className="value">
              {p.avgScore}{" "}
              <span className="grade grade-b" style={{ marginLeft: 4 }}>
                B
              </span>
            </div>
            <div className="delta up">▲ {p.avgDelta} points since year start</div>
          </div>
        </div>
        <div className="pe-kpi pe-kpi-warn">
          <div className="pe-kpi-ico warn">⚠</div>
          <div>
            <div className="label">Open critical</div>
            <div className="value" style={{ color: "var(--red)" }}>
              {p.criticalOpen}
            </div>
            <div className="delta up">▼ 9 vs last quarter</div>
          </div>
        </div>
        <div className="pe-kpi">
          <div className="pe-kpi-ico green">✓</div>
          <div>
            <div className="label">Human validated</div>
            <div className="value" style={{ color: "var(--green)" }}>
              {p.verifiedPct}
              <small>%</small>
            </div>
            <div className="delta flat">Priority on Tier 1</div>
          </div>
        </div>
      </div>

      {uniqueAttention.length > 0 && (
        <div className="pe-attention">
          <div className="pe-attention-title">
            <span>IC agenda</span>
            High-value companies with weak posture — focus for next meeting
          </div>
          <div className="pe-attention-cards">
            {uniqueAttention.slice(0, 4).map((c) => (
              <button
                key={c.name}
                type="button"
                className={`pe-att-card${selected === c.name ? " active" : ""}`}
                onClick={() => setSelected(c.name)}
              >
                <div className="row-flex" style={{ justifyContent: "space-between", gap: 8 }}>
                  <strong>{c.name}</strong>
                  <span className={`grade grade-${c.grade.toLowerCase()}`}>{c.grade}</span>
                </div>
                <div className="t-dim" style={{ fontSize: 12, marginTop: 4 }}>
                  {c.tier} · {c.sector}
                </div>
                <div className="row-flex" style={{ marginTop: 8, gap: 8, flexWrap: "wrap" }}>
                  {c.critical > 0 && (
                    <span className="badge b-critical">{c.critical} critical</span>
                  )}
                  <span className={c.delta < 0 ? "down" : "up"} style={{ fontSize: 12 }}>
                    {c.delta > 0 ? "▲" : "▼"} {Math.abs(c.delta)} / 30 days
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pe-layout">
        <div className="pe-list-panel">
          <div className="card-head" style={{ borderBottom: "1px solid var(--border-soft)" }}>
            <h3>Portfolio companies</h3>
            <div className="right" style={{ gap: 8, flexWrap: "wrap" }}>
              <div className="chips">
                {["all", "Tier 1", "Tier 2", "Tier 3"].map((t) => (
                  <button
                    key={t}
                    className={`chip${tier === t ? " active" : ""}`}
                    onClick={() => {
                      setTier(t);
                      setMatrixFilter(null);
                    }}
                  >
                    {t === "all" ? "All" : t}
                  </button>
                ))}
              </div>
              <select
                className="pe-select"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="score">Sort by score</option>
                <option value="critical">Sort by critical</option>
                <option value="verified">Sort by validated</option>
                <option value="name">Sort by name</option>
              </select>
            </div>
          </div>

          <div className="pe-company-list">
            {rows.map((c) => (
              <button
                key={c.name}
                type="button"
                className={`pe-company${selected === c.name ? " active" : ""}`}
                onClick={() => setSelected(c.name)}
              >
                <div className="pe-co-top">
                  <div>
                    <div className="pe-co-name">{c.name}</div>
                    <div className="pe-co-meta">
                      {c.sector} · {c.tier}
                    </div>
                  </div>
                  <div className="pe-co-score">
                    <span className={`grade grade-${c.grade.toLowerCase()}`}>{c.grade}</span>
                    <strong>{c.score}</strong>
                    <em className={c.delta >= 0 ? "up" : "down"}>
                      {c.delta >= 0 ? "▲" : "▼"}
                      {Math.abs(c.delta)}
                    </em>
                  </div>
                </div>
                <div className="pe-co-bottom">
                  <div className="pe-co-stat">
                    <span>Critical</span>
                    {c.critical ? (
                      <span className="badge b-critical">{c.critical}</span>
                    ) : (
                      <span className="badge b-verified">0</span>
                    )}
                  </div>
                  <div className="pe-co-stat" style={{ flex: 1 }}>
                    <span>Validated {c.verified}%</span>
                    <div
                      className={`meter ${c.verified >= 80 ? "good" : c.verified < 60 ? "warn" : ""}`}
                    >
                      <span style={{ width: `${c.verified}%` }} />
                    </div>
                  </div>
                  <div className="pe-co-stat">
                    <span>Pentest</span>
                    <strong className="t-dim" style={{ fontSize: 11.5, fontWeight: 550 }}>
                      {c.pentest}
                    </strong>
                  </div>
                </div>
              </button>
            ))}
            {!rows.length && <div className="empty">No companies match this filter.</div>}
          </div>
        </div>

        <div className="pe-side">
          <div className="pe-detail card">
            <div className="card-body">
              <div className="row-flex" style={{ justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div className="pe-eyebrow">Selected</div>
                  <h3 style={{ margin: "2px 0 0", fontSize: 16 }}>{selectedCo.name}</h3>
                  <div className="t-dim" style={{ fontSize: 12.5 }}>
                    {selectedCo.sector} · {selectedCo.tier}
                  </div>
                </div>
                <span className={`grade grade-${selectedCo.grade.toLowerCase()} grade-xl`}>
                  {selectedCo.grade}
                </span>
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
              <div className="meter good" style={{ margin: "12px 0 6px" }}>
                <span style={{ width: `${selectedCo.verified}%` }} />
              </div>
              <div className="t-dim" style={{ fontSize: 12 }}>
                Next pentest: {selectedCo.pentest}
              </div>
              <div className="row-flex" style={{ marginTop: 14, gap: 8 }}>
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
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Risk matrix</h3>
              <span className="sub">Grade × impact tier</span>
              {matrixFilter && (
                <div className="right">
                  <button className="btn btn-sm" onClick={() => setMatrixFilter(null)}>
                    Reset filter
                  </button>
                </div>
              )}
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
                      className={`mx-cell ${cellCls(n, ri)}${
                        matrixFilter?.grade === row.label && matrixFilter.col === ci
                          ? " mx-selected"
                          : ""
                      }`}
                      key={`${row.label}-${ci}`}
                      onClick={() =>
                        n
                          ? setMatrixFilter({ grade: row.label, col: ci })
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
              <div className="callout orange" style={{ marginTop: 14 }}>
                <div className="co-title">◆ What IC looks for</div>
                Top-right cells = work to do: high value, weak posture. Click a cell to filter the
                list.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-head">
          <h3>Due diligence pipeline</h3>
          <span className="sub">Pre-acquisition assessment uses the same engine</span>
        </div>
        <div className="pe-dd-grid">
          {DEMO.dueDiligence.map((d) => (
            <div key={d.name} className="pe-dd-card">
              <div className="row-flex" style={{ justifyContent: "space-between", gap: 8 }}>
                <strong>{d.name}</strong>
                <span className={`grade grade-${d.grade.toLowerCase()}`}>{d.grade}</span>
              </div>
              <div className="row-flex" style={{ marginTop: 8, gap: 8 }}>
                <span className="badge b-neutral">{d.stage}</span>
                <span className="t-dim" style={{ fontSize: 12 }}>
                  Score {d.score}
                </span>
              </div>
              <p className="t-dim" style={{ fontSize: 12.5, margin: "10px 0 6px" }}>
                {d.finding}
              </p>
              <div style={{ fontSize: 12.5, color: "var(--text)" }}>→ {d.rec}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
