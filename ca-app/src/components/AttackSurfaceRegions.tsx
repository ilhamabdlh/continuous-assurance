import { useMemo, useState } from "react";
import type { Asset } from "../types";
import {
  buildAsnStats,
  buildRegionStats,
  regionHeatLevel,
  type RegionStats,
} from "../data/regions";

type Props = {
  assets: Asset[];
};

function WorldSilhouette() {
  return (
    <svg className="region-map-bg" viewBox="0 0 1000 520" preserveAspectRatio="xMidYMid meet" aria-hidden>
      {/* Simplified landmass outlines — atmospheric only */}
      <path
        className="region-land"
        d="M80 170 C120 120 180 110 240 140 C290 110 340 130 360 170 C400 150 430 180 410 220 C380 250 320 240 280 260 C220 280 160 250 120 230 C90 210 60 200 80 170Z"
      />
      <path
        className="region-land"
        d="M250 280 C300 270 340 300 360 340 C340 390 290 410 250 390 C210 370 220 310 250 280Z"
      />
      <path
        className="region-land"
        d="M430 140 C480 100 540 95 590 130 C640 110 680 140 670 180 C650 220 600 230 560 210 C520 240 470 220 450 190 C430 170 420 155 430 140Z"
      />
      <path
        className="region-land"
        d="M520 230 C560 220 590 250 580 290 C560 330 520 340 500 310 C480 280 490 245 520 230Z"
      />
      <path
        className="region-land"
        d="M700 200 C760 170 820 180 860 220 C900 200 940 230 920 270 C880 300 820 290 780 310 C740 330 700 300 690 260 C680 230 680 210 700 200Z"
      />
      <path
        className="region-land"
        d="M720 340 C780 320 840 350 850 400 C820 440 760 430 720 410 C690 390 690 360 720 340Z"
      />
      <path
        className="region-land"
        d="M340 400 C380 390 410 420 400 450 C370 470 330 460 320 430 C315 415 325 405 340 400Z"
      />
      <circle className="region-land-dot" cx="180" cy="120" r="8" />
      <circle className="region-land-dot" cx="880" cy="430" r="10" />
    </svg>
  );
}

export function AttackSurfaceRegions({ assets }: Props) {
  const regions = useMemo(() => buildRegionStats(assets), [assets]);
  const asns = useMemo(() => buildAsnStats(assets), [assets]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const maxFindings = useMemo(
    () => Math.max(1, ...regions.map((r) => r.findings)),
    [regions]
  );

  const selected: RegionStats | null =
    regions.find((r) => r.region.id === selectedId) ?? null;

  const activeRegions = regions.filter((r) => r.assets > 0);
  const totalFindings = activeRegions.reduce((n, r) => n + r.findings, 0);

  return (
    <div className="region-layout">
      <div className="region-main">
        <div className="region-toolbar">
          <div>
            <div className="region-toolbar-title">Cloud regions (AWS)</div>
            <div className="region-toolbar-sub">
              {activeRegions.length} active regions · {assets.length} assets · {totalFindings}{" "}
              open findings
            </div>
          </div>
          <div className="region-legend">
            <span>
              <i className="region-swatch is-low" /> Low risk
            </span>
            <span>
              <i className="region-swatch is-mid" /> Elevated
            </span>
            <span>
              <i className="region-swatch is-high" /> Higher risk
            </span>
          </div>
        </div>

        <div className="region-map">
          <WorldSilhouette />
          {regions.map((stats) => {
            if (stats.assets === 0) return null;
            const heat = regionHeatLevel(stats, maxFindings);
            const isSel = selectedId === stats.region.id;
            return (
              <button
                key={stats.region.id}
                type="button"
                className={`region-card is-${heat}${isSel ? " is-selected" : ""}`}
                style={{ left: `${stats.region.x}%`, top: `${stats.region.y}%` }}
                onClick={() =>
                  setSelectedId((id) => (id === stats.region.id ? null : stats.region.id))
                }
              >
                <div className="region-card-code">{stats.region.code}</div>
                <div className="region-card-metrics">
                  <span>
                    <em>Assets</em> {stats.assets}
                  </span>
                  <span className={stats.findings > 0 ? "is-findings" : ""}>
                    <em>Findings</em> {stats.findings}
                  </span>
                </div>
                <div className="region-card-name">{stats.region.name}</div>
              </button>
            );
          })}
        </div>

        <div className="region-footnote">
          Heatmap based on active findings per cloud region. Empty regions are hidden.
          Click a region for asset breakdown.
        </div>
      </div>

      <aside className="region-side">
        {selected ? (
          <>
            <div className="region-side-title">{selected.region.code}</div>
            <p className="region-side-desc">{selected.region.name}</p>
            <dl className="region-side-dl">
              <div>
                <dt>Assets</dt>
                <dd>{selected.assets}</dd>
              </div>
              <div>
                <dt>Findings</dt>
                <dd style={{ color: selected.findings > 0 ? "var(--orange)" : undefined }}>
                  {selected.findings}
                </dd>
              </div>
              <div>
                <dt>Unscanned</dt>
                <dd>{selected.unscanned}</dd>
              </div>
            </dl>
            <div className="region-side-label">Assets in region</div>
            <ul className="region-host-list">
              {selected.hosts.map((h) => (
                <li key={h} className="mono">
                  {h}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="region-side-title">Top ASNs</div>
            <p className="region-side-desc">By attack surface · filtered assets</p>
            <ul className="region-asn-list">
              {asns.map((a) => (
                <li key={a.asn}>
                  <div className="region-asn-head">
                    <span className="mono t-strong">{a.asn}</span>
                    <span className="region-asn-provider">{a.provider}</span>
                  </div>
                  <div className="region-asn-name">{a.name}</div>
                  <div className="region-asn-metrics">
                    <span>
                      Assets <strong>{a.assets}</strong>
                    </span>
                    <span className={a.findings > 0 ? "is-findings" : ""}>
                      Findings <strong>{a.findings}</strong>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </div>
  );
}
