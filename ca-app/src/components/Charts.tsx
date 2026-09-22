export function ScoreMark({
  score,
  max,
  grade,
  delta,
  sector,
}: {
  score: number;
  max: number;
  grade?: string;
  delta?: number;
  sector?: string;
}) {
  return (
    <div className="score-block">
      <div className="score-num">
        {score}
        <span style={{ fontSize: "0.35em", letterSpacing: "-1px", color: "var(--text-mute)" }}>
          /{max}
        </span>
      </div>
      <div className="score-meta">
        Grade {grade || "—"}
        {sector ? ` · ${sector}` : ""}
      </div>
      {typeof delta === "number" && (
        <div className="score-delta">
          {delta >= 0 ? "+" : ""}
          {delta} pts · 30 days
        </div>
      )}
    </div>
  );
}

/** @deprecated Prefer ScoreMark — ring charts read as generic cyber UI */
export function ScoreRing({ score, max }: { score: number; max: number; grade?: string }) {
  return <ScoreMark score={score} max={max} />;
}

/** Smooth monotone-ish cubic path through points */
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? i : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function niceTicks(min: number, max: number, count = 4) {
  const span = max - min || 1;
  const step = Math.ceil(span / (count - 1));
  const start = Math.floor(min);
  const ticks: number[] = [];
  for (let i = 0; i < count; i++) ticks.push(start + step * i);
  if (ticks[ticks.length - 1] < max) ticks[ticks.length - 1] = Math.ceil(max);
  return ticks;
}

export function TrendChart({
  score,
  findings,
}: {
  score: number[];
  findings: number[];
}) {
  const W = 640;
  const H = 248;
  const padL = 44;
  const padR = 44;
  const padT = 18;
  const padB = 32;
  const n = Math.min(score.length, findings.length);
  const plotH = H - padT - padB;
  const plotW = W - padL - padR;

  const x = (i: number) => padL + (i * plotW) / (n - 1);

  // Pad domains so lines don't hug edges
  const sMinRaw = Math.min(...score);
  const sMaxRaw = Math.max(...score);
  const fMinRaw = Math.min(...findings);
  const fMaxRaw = Math.max(...findings);
  const sPad = Math.max(8, (sMaxRaw - sMinRaw) * 0.12);
  const fPad = Math.max(1.5, (fMaxRaw - fMinRaw) * 0.18);
  const scoreMin = sMinRaw - sPad;
  const scoreMax = sMaxRaw + sPad;
  const findMin = Math.max(0, fMinRaw - fPad);
  const findMax = fMaxRaw + fPad;
  const scoreSpan = scoreMax - scoreMin;
  const findSpan = findMax - findMin;

  const yScore = (v: number) => padT + plotH * (1 - (v - scoreMin) / scoreSpan);
  const yFind = (v: number) => padT + plotH * (1 - (v - findMin) / findSpan);

  const scorePts = score.slice(0, n).map((v, i) => ({ x: x(i), y: yScore(v) }));
  const findPts = findings.slice(0, n).map((v, i) => ({ x: x(i), y: yFind(v) }));
  const scorePath = smoothPath(scorePts);
  const findPath = smoothPath(findPts);
  const areaPath = `${scorePath} L ${scorePts[n - 1].x.toFixed(1)} ${(H - padB).toFixed(1)} L ${scorePts[0].x.toFixed(1)} ${(H - padB).toFixed(1)} Z`;

  const scoreDelta = score[n - 1] - score[0];
  const findDelta = findings[n - 1] - findings[0];

  const scoreTicks = niceTicks(Math.round(sMinRaw), Math.round(sMaxRaw), 4);
  const findTicks = niceTicks(Math.round(fMinRaw), Math.round(fMaxRaw), 4);
  const weekLabels = ["12w", "10w", "8w", "6w", "4w", "2w", "Now"];
  const labelIdx = [0, 2, 4, 6, 8, 10, n - 1].filter((i) => i < n);

  // Offset end labels so they don't collide
  const endScoreY = yScore(score[n - 1]);
  const endFindY = yFind(findings[n - 1]);
  const labelGap = Math.abs(endScoreY - endFindY) < 18;
  const scoreLabelY = labelGap ? endScoreY - 10 : endScoreY + 4;
  const findLabelY = labelGap ? endFindY + 14 : endFindY + 4;

  return (
    <div className="trend-wrap">
      <div className="trend-stats">
        <div className="trend-stat">
          <span className="trend-stat-label">Risk score</span>
          <strong className="trend-stat-value">{score[n - 1]}</strong>
          <span className={`trend-stat-delta ${scoreDelta >= 0 ? "up" : "down"}`}>
            {scoreDelta >= 0 ? "+" : ""}
            {scoreDelta} vs 12w
          </span>
        </div>
        <div className="trend-stat trend-stat-accent">
          <span className="trend-stat-label">Critical + high</span>
          <strong className="trend-stat-value">{findings[n - 1]}</strong>
          <span className={`trend-stat-delta ${findDelta <= 0 ? "up" : "down"}`}>
            {findDelta > 0 ? "+" : ""}
            {findDelta} vs 12w
          </span>
        </div>
      </div>

      <div className="trend-chart-frame">
        <svg
          className="chart chart-trend"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Score and critical-high findings over 12 weeks"
        >
          <defs>
            <linearGradient id="trendScoreFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14181f" stopOpacity={0.14} />
              <stop offset="70%" stopColor="#14181f" stopOpacity={0.03} />
              <stop offset="100%" stopColor="#14181f" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grid */}
          {scoreTicks.map((t) => {
            const y = yScore(t);
            return (
              <line
                key={`g-${t}`}
                x1={padL}
                y1={y}
                x2={W - padR}
                y2={y}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
            );
          })}

          {/* Left axis — score */}
          {scoreTicks.map((t) => (
            <text
              key={`sl-${t}`}
              x={padL - 8}
              y={yScore(t) + 3}
              textAnchor="end"
              fill="var(--text-mute)"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {t}
            </text>
          ))}

          {/* Right axis — findings */}
          {findTicks.map((t) => (
            <text
              key={`fl-${t}`}
              x={W - padR + 8}
              y={yFind(t) + 3}
              textAnchor="start"
              fill="#c73a12"
              fillOpacity={0.75}
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {t}
            </text>
          ))}

          <path d={areaPath} fill="url(#trendScoreFill)" />

          <path
            d={scorePath}
            fill="none"
            stroke="#14181f"
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={findPath}
            fill="none"
            stroke="#e8491d"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {scorePts.map((p, i) => (
            <circle
              key={`s-${i}`}
              cx={p.x}
              cy={p.y}
              r={i === n - 1 ? 4.5 : 3}
              fill={i === n - 1 ? "#14181f" : "#fff"}
              stroke="#14181f"
              strokeWidth={1.6}
            />
          ))}

          {findPts.map((p, i) => (
            <circle
              key={`f-${i}`}
              cx={p.x}
              cy={p.y}
              r={i === n - 1 ? 4.5 : 3}
              fill={i === n - 1 ? "#e8491d" : "#fff"}
              stroke="#e8491d"
              strokeWidth={1.6}
            />
          ))}

          <text
            x={scorePts[n - 1].x - 6}
            y={scoreLabelY}
            textAnchor="end"
            fill="#14181f"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            {score[n - 1]}
          </text>
          <text
            x={findPts[n - 1].x - 6}
            y={findLabelY}
            textAnchor="end"
            fill="#e8491d"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            {findings[n - 1]}
          </text>

          {labelIdx.map((i, li) => (
            <text
              key={weekLabels[li] || i}
              x={x(i)}
              y={H - 8}
              textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
              fill="var(--text-mute)"
              fontSize="11"
              fontFamily="var(--font-mono)"
            >
              {weekLabels[li]}
            </text>
          ))}
        </svg>

        <div className="trend-legend">
          <span>
            <i className="trend-legend-score" /> Risk score
          </span>
          <span>
            <i className="trend-legend-find" /> Critical + high
          </span>
        </div>
      </div>
    </div>
  );
}
