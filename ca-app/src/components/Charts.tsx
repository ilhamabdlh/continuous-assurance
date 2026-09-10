export function ScoreMark({
  score,
  max,
  grade,
  delta,
  sector,
  sweep,
}: {
  score: number;
  max: number;
  grade?: string;
  delta?: number;
  sector?: string;
  sweep?: string;
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
      {sweep && <div className="score-meta" style={{ marginTop: 6 }}>Last sweep {sweep}</div>}
    </div>
  );
}

/** @deprecated Prefer ScoreMark — ring charts read as generic cyber UI */
export function ScoreRing({ score, max }: { score: number; max: number; grade?: string }) {
  return <ScoreMark score={score} max={max} />;
}

export function TrendChart({
  score,
  findings,
}: {
  score: number[];
  findings: number[];
}) {
  const W = 720;
  const H = 168;
  const padL = 8;
  const padR = 8;
  const padT = 14;
  const padB = 22;
  const n = score.length;
  const x = (i: number) => padL + (i * (W - padL - padR)) / (n - 1);

  const series = [
    { values: score, color: "var(--text)", fill: true },
    { values: findings, color: "var(--orange)", fill: false },
  ];

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        {series.map((s, si) =>
          s.fill ? (
            <linearGradient key={si} id={`grad${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.14} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ) : null
        )}
      </defs>
      {[0, 1, 2, 3].map((g) => {
        const y = padT + (g * (H - padT - padB)) / 3;
        return (
          <line
            key={g}
            x1={padL}
            y1={y}
            x2={W - padR}
            y2={y}
            stroke="var(--border)"
            strokeWidth="1"
          />
        );
      })}
      {series.map((s, si) => {
        const min = Math.min(...s.values);
        const max = Math.max(...s.values);
        const span = max - min || 1;
        const y = (v: number) =>
          padT + (H - padT - padB) * (1 - (v - min) / span) * 0.86 + 6;
        const pts = s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
        return (
          <g key={si}>
            {s.fill && (
              <polygon
                fill={`url(#grad${si})`}
                points={`${padL},${H - padB} ${pts.join(" ")} ${W - padR},${H - padB}`}
              />
            )}
            <polyline
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={pts.join(" ")}
            />
            <circle cx={x(n - 1)} cy={y(s.values[n - 1])} r="3" fill={s.color} />
            <text
              x={x(n - 1) - 6}
              y={y(s.values[n - 1]) - 10}
              textAnchor="end"
              fill={s.color}
              fontSize="11"
              fontWeight="600"
            >
              {s.values[n - 1]}
            </text>
          </g>
        );
      })}
      {["12w ago", "9w", "6w", "3w", "This week"].map((lbl, i) => {
        const px = padL + (i * (W - padL - padR)) / 4;
        const anchor = i === 0 ? "start" : i === 4 ? "end" : "middle";
        return (
          <text key={lbl} x={px} y={H - 5} textAnchor={anchor} fill="var(--text-mute)" fontSize="10.5">
            {lbl}
          </text>
        );
      })}
    </svg>
  );
}
