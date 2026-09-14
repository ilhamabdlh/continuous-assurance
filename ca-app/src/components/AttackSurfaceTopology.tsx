import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type PointerEvent as REPointerEvent,
  type WheelEvent as REWheelEvent,
} from "react";
import type { Asset } from "../types";
import { buildTopology, type TopoNode } from "../data/topology";

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

export function AttackSurfaceTopology({ assets }: Props) {
  const { nodes: layoutNodes, edges } = useMemo(() => buildTopology(assets), [assets]);
  const [positions, setPositions] = useState<PosMap>(() => positionsFromNodes(layoutNodes));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 20, y: 10 });
  const [zoom, setZoom] = useState(1);
  const layoutKey = useMemo(() => layoutNodes.map((n) => n.id).join("|"), [layoutNodes]);

  const [draggingId, setDraggingId] = useState<string | null>(null);
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

  return (
    <div className="topo-layout">
      <div className="topo-canvas-wrap">
        <div className="topo-toolbar">
          <span className="topo-hint">Drag cards to rearrange · empty canvas to pan · scroll to zoom</span>
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
      </div>

      <aside className="topo-side">
        <div className="topo-side-title">Selected asset</div>
        {!selected && (
          <p className="t-dim" style={{ margin: 0, fontSize: 13 }}>
            Drag cards to rearrange. Click a node to inspect details and DNS links.
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
                <dt>Source</dt>
                <dd>{selected.src}</dd>
              </div>
              <div>
                <dt>Findings</dt>
                <dd>{selected.findings}</dd>
              </div>
            </dl>
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
