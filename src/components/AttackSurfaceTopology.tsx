import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type PointerEvent as REPointerEvent,
  type WheelEvent as REWheelEvent,
} from "react";
import { Link } from "react-router-dom";
import type { Asset, Finding } from "../types";
import { useApp } from "../context/AppContext";
import { buildTopology, type TopoNode } from "../data/topology";
import { SevBadge } from "./Badges";

type Props = {
  assets: Asset[];
};

const NODE_W = 168;
const NODE_H = 40;

type PosMap = Record<string, { x: number; y: number }>;

function statusClass(status: TopoNode["status"]) {
  if (status === "verified") return "topo-node is-verified";
  if (status === "auto") return "topo-node is-auto";
  if (status === "unscanned") return "topo-node is-unscanned";
  return "topo-node is-root";
}

function positionsFromNodes(nodes: TopoNode[]): PosMap {
  const map: PosMap = {};
  for (const n of nodes) map[n.id] = { x: n.x, y: n.y };
  return map;
}

function findingsForNode(node: TopoNode, findings: Finding[]): Finding[] {
  if (node.kind === "root") {
    if (node.id === "aws-cloud") {
      return findings.filter(
        (f) => f.asset.includes("amazonaws.com") || f.asset.includes("s3.")
      );
    }
    return findings.filter(
      (f) => f.asset === node.id || f.asset.endsWith(`.${node.id}`)
    );
  }
  return findings.filter((f) => f.asset === node.id);
}

function changeLabel(change?: Finding["change"]) {
  if (change === "new") return "New";
  if (change === "severity_up") return "Severity ↑";
  if (change === "reopened") return "Reopened";
  return "Existing";
}

export function AttackSurfaceTopology({ assets }: Props) {
  const { findings } = useApp();
  const { nodes: layoutNodes, edges } = useMemo(() => buildTopology(assets), [assets]);
  const [positions, setPositions] = useState<PosMap>(() => positionsFromNodes(layoutNodes));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 20, y: 10 });
  const [zoom, setZoom] = useState(1);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const layoutKey = useMemo(() => layoutNodes.map((n) => n.id).join("|"), [layoutNodes]);

  const panDrag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const nodeDrag = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    setPositions(positionsFromNodes(layoutNodes));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when asset set changes
  }, [layoutKey]);

  const nodes = useMemo(
    () =>
      layoutNodes.map((n) => {
        const p = positions[n.id];
        return p ? { ...n, x: p.x, y: p.y } : n;
      }),
    [layoutNodes, positions]
  );

  const selected = nodes.find((n) => n.id === selectedId) || null;
  const hoverNode = nodes.find((n) => n.id === hoverId) || null;
  const selectedFindings = useMemo(
    () => (selected ? findingsForNode(selected, findings) : []),
    [selected, findings]
  );
  const hoverFindings = useMemo(
    () => (hoverNode ? findingsForNode(hoverNode, findings) : []),
    [hoverNode, findings]
  );

  const connected = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const s = new Set<string>([selectedId]);
    for (const e of edges) {
      if (e.from === selectedId) s.add(e.to);
      if (e.to === selectedId) s.add(e.from);
    }
    return s;
  }, [selectedId, edges]);

  const width = Math.max(780, ...nodes.map((n) => n.x + NODE_W + 80));
  const height = Math.max(720, ...nodes.map((n) => n.y + NODE_H + 220));

  const clientToSvgDelta = useCallback(
    (dx: number, dy: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: dx / zoom, y: dy / zoom };
      const rect = svg.getBoundingClientRect();
      const sx = width / Math.max(1, rect.width);
      const sy = height / Math.max(1, rect.height);
      return { x: (dx * sx) / zoom, y: (dy * sy) / zoom };
    },
    [width, height, zoom]
  );

  const onCanvasPointerDown = (e: REPointerEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest(".topo-node")) return;
    panDrag.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const onNodePointerDown = (e: REPointerEvent<SVGGElement>, id: string) => {
    e.stopPropagation();
    const pos = positions[id] ?? { x: 0, y: 0 };
    nodeDrag.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
    };
    setDraggingId(id);
    setSelectedId(id);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: REPointerEvent<SVGSVGElement>) => {
    if (nodeDrag.current) {
      const d = nodeDrag.current;
      const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
      if (dist > 3) d.moved = true;
      const delta = clientToSvgDelta(e.clientX - d.startX, e.clientY - d.startY);
      setPositions((prev) => ({
        ...prev,
        [d.id]: {
          x: Math.max(0, d.origX + delta.x),
          y: Math.max(0, d.origY + delta.y),
        },
      }));
      return;
    }
    if (!panDrag.current) return;
    setPan({
      x: panDrag.current.panX + (e.clientX - panDrag.current.x),
      y: panDrag.current.panY + (e.clientY - panDrag.current.y),
    });
  };

  const onPointerUp = () => {
    nodeDrag.current = null;
    panDrag.current = null;
    setDraggingId(null);
  };

  const onWheel = useCallback((e: REWheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(1.6, Math.max(0.55, z - e.deltaY * 0.001)));
  }, []);

  const resetLayout = () => {
    setZoom(1);
    setPan({ x: 20, y: 10 });
    setPositions(positionsFromNodes(layoutNodes));
    setSelectedId(null);
  };

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const sevCounts = (list: Finding[]) => ({
    critical: list.filter((f) => f.severity === "critical").length,
    high: list.filter((f) => f.severity === "high").length,
    medium: list.filter((f) => f.severity === "medium").length,
    low: list.filter((f) => f.severity === "low").length,
    newCount: list.filter((f) => f.change === "new").length,
    upCount: list.filter((f) => f.change === "severity_up").length,
  });

  const selectedSev = sevCounts(selectedFindings);
  const tipSev = sevCounts(hoverFindings);

  return (
    <div className="topo-layout">
      <div className="topo-canvas-wrap">
        <div className="topo-toolbar">
          <span className="topo-hint">
            Drag cards · hover for severity · click for finding breakdown
          </span>
          <div className="topo-legend">
            <span>
              <i className="topo-dot is-root" /> Root
            </span>
            <span>
              <i className="topo-dot is-verified" /> Verified
            </span>
            <span>
              <i className="topo-dot is-auto" /> Automated
            </span>
            <span>
              <i className="topo-dot is-unscanned" /> Unscanned
            </span>
          </div>
          <div className="topo-zoom-btns">
            <button type="button" className="btn btn-sm" onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}>
              +
            </button>
            <button type="button" className="btn btn-sm" onClick={() => setZoom((z) => Math.max(0.55, z - 0.1))}>
              −
            </button>
            <button type="button" className="btn btn-sm" onClick={resetLayout}>
              Reset
            </button>
          </div>
        </div>

        <div className="topo-svg-shell">
          <svg
            ref={svgRef}
            className={`topo-svg${draggingId ? " is-dragging-node" : ""}`}
            viewBox={`0 0 ${width} ${height}`}
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
          >
            <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
              {edges.map((e) => {
                const a = nodeById.get(e.from);
                const b = nodeById.get(e.to);
                if (!a || !b) return null;
                const involvesSelection =
                  !selectedId || connected.has(e.from) || connected.has(e.to);
                if (!involvesSelection) return null;
                if (
                  selectedId &&
                  (e.kind === "dns" || e.kind === "related") &&
                  !connected.has(e.from) &&
                  !connected.has(e.to)
                ) {
                  return null;
                }
                if (!selectedId && (e.kind === "dns" || e.kind === "related")) {
                  return null;
                }

                const sameBand = Math.abs(a.y - b.y) < 8;
                let x1: number;
                let y1: number;
                let x2: number;
                let y2: number;
                let d: string;
                if (sameBand) {
                  const leftToRight = a.x <= b.x;
                  x1 = leftToRight ? a.x + NODE_W : a.x;
                  y1 = a.y + NODE_H / 2;
                  x2 = leftToRight ? b.x : b.x + NODE_W;
                  y2 = b.y + NODE_H / 2;
                  const mid = (x1 + x2) / 2;
                  d = `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
                } else {
                  const aAbove = a.y < b.y;
                  x1 = a.x + NODE_W / 2;
                  y1 = aAbove ? a.y + NODE_H : a.y;
                  x2 = b.x + NODE_W / 2;
                  y2 = aAbove ? b.y : b.y + NODE_H;
                  const midY = (y1 + y2) / 2;
                  d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
                }
                const active = !selectedId || connected.has(e.from) || connected.has(e.to);
                return (
                  <path
                    key={`${e.from}-${e.to}-${e.kind}`}
                    d={d}
                    className={`topo-edge topo-edge-${e.kind}${active ? "" : " is-dim"}`}
                    fill="none"
                  />
                );
              })}

              {nodes.map((n) => {
                const dim = Boolean(selectedId && !connected.has(n.id));
                return (
                  <g
                    key={n.id}
                    className={`${statusClass(n.status)}${selectedId === n.id ? " is-selected" : ""}${dim ? " is-dim" : ""} is-draggable`}
                    transform={`translate(${n.x} ${n.y})`}
                    onPointerDown={(ev) => onNodePointerDown(ev, n.id)}
                    onPointerEnter={() => setHoverId(n.id)}
                    onPointerLeave={() => setHoverId((cur) => (cur === n.id ? null : cur))}
                  >
                    <rect width={NODE_W} height={NODE_H} />
                    <text x={10} y={17} className="topo-label">
                      {n.label}
                    </text>
                    <text x={10} y={31} className="topo-sub">
                      {n.kind === "root"
                        ? "org root"
                        : `${n.type}${n.findings ? ` · ${n.findings} finding(s)` : ""}`}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {hoverNode && hoverId !== selectedId && hoverFindings.length > 0 && (
            <div
              className="topo-hover-tip"
              style={{
                left: Math.min(
                  92,
                  ((hoverNode.x + NODE_W / 2) * zoom + pan.x) / Math.max(width, 1) * 100
                ) + "%",
                top: Math.max(
                  8,
                  ((hoverNode.y + NODE_H + 8) * zoom + pan.y) / Math.max(height, 1) * 100
                ) + "%",
              }}
            >
              <div className="mono t-strong" style={{ fontSize: 11 }}>
                {hoverNode.label}
              </div>
              <div className="topo-sev-row">
                {tipSev.critical > 0 && <span className="topo-sev c">C {tipSev.critical}</span>}
                {tipSev.high > 0 && <span className="topo-sev h">H {tipSev.high}</span>}
                {tipSev.medium > 0 && <span className="topo-sev m">M {tipSev.medium}</span>}
                {tipSev.low > 0 && <span className="topo-sev l">L {tipSev.low}</span>}
              </div>
              <div className="topo-tip-meta">
                {tipSev.newCount} new · {tipSev.upCount} severity ↑ since last sweep
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="topo-side">
        <div className="topo-side-title">Selected asset</div>
        {!selected && (
          <p className="t-dim" style={{ margin: 0, fontSize: 13 }}>
            Hover a node for severity counts. Click to open findings breakdown and DNS links.
          </p>
        )}
        {selected && (
          <div className="topo-side-body">
            <div className="mono t-strong" style={{ fontSize: 13, wordBreak: "break-all" }}>
              {selected.id}
            </div>
            <dl className="topo-kv">
              <div>
                <dt>Type</dt>
                <dd>{selected.type}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  {selected.status === "verified"
                    ? "Human validated"
                    : selected.status === "auto"
                      ? "Automated scan"
                      : selected.status === "unscanned"
                        ? "Unscanned"
                        : "Root domain"}
                </dd>
              </div>
              <div>
                <dt>Grade</dt>
                <dd>{selected.risk}</dd>
              </div>
              <div>
                <dt>Technology</dt>
                <dd>{selected.tech}</dd>
              </div>
              <div>
                <dt>Ports</dt>
                <dd className="mono">{selected.ports}</dd>
              </div>
              <div>
                <dt>Findings</dt>
                <dd>{selectedFindings.length}</dd>
              </div>
            </dl>

            {selectedFindings.length > 0 && (
              <>
                <div className="topo-side-label">Since last sweep</div>
                <div className="topo-sev-row" style={{ marginBottom: 10 }}>
                  <span className="topo-sev c">C {selectedSev.critical}</span>
                  <span className="topo-sev h">H {selectedSev.high}</span>
                  <span className="topo-sev m">M {selectedSev.medium}</span>
                  <span className="topo-sev l">L {selectedSev.low}</span>
                </div>
                <div className="topo-change-meta">
                  {selectedSev.newCount} new · {selectedSev.upCount} severity raised ·{" "}
                  {selectedFindings.length - selectedSev.newCount - selectedSev.upCount} existing
                </div>
                <div className="topo-side-label">Open findings</div>
                <ul className="topo-finding-list">
                  {selectedFindings.slice(0, 6).map((f) => (
                    <li key={f.id}>
                      <Link to={`/findings/${f.id}`} className="topo-finding-link">
                        <span className="topo-finding-top">
                          <SevBadge severity={f.severity} />
                          <span className="topo-change-pill">{changeLabel(f.change)}</span>
                        </span>
                        <span className="topo-finding-title">{f.title}</span>
                        <span className="mono topo-finding-id">{f.id}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {selectedFindings.length > 6 && (
                  <p className="t-dim" style={{ fontSize: 12, margin: "8px 0 0" }}>
                    +{selectedFindings.length - 6} more on Findings
                  </p>
                )}
              </>
            )}

            {selected.status === "unscanned" && (
              <div className="callout orange" style={{ marginTop: 12 }}>
                <div className="co-title">Coverage gap</div>
                This asset is discovered but not yet assured.
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
