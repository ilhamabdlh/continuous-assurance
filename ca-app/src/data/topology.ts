import type { Asset, AssetStatus } from "../types";

export type TopoKind = "root" | "host" | "ip" | "cloud" | "network";

export interface TopoNode {
  id: string;
  label: string;
  kind: TopoKind;
  status: AssetStatus | "root";
  risk: string;
  findings: number;
  type: string;
  tech: string;
  ports: string;
  src: string;
  x: number;
  y: number;
  asset?: Asset;
}

export interface TopoEdge {
  from: string;
  to: string;
  kind: "dns" | "resolve" | "related" | "cloud";
}

/** Demo DNS → IP edges for the topology view */
export const ASSET_RESOLVES: Record<string, string> = {
  "vpn.northwindlog.com": "13.58.204.77",
  "remote.northwindlog.com": "13.58.204.77",
  "api-v2.northwindlog.com": "54.212.88.19",
  "mobile-api.northwindlog.com": "54.212.88.19",
  "staging-api.northwindlog.com": "18.221.9.40",
  "dev-wms.northwindlog.com": "18.221.9.40",
  "git.northwindlog.com": "3.88.44.201",
  "jenkins.northwindlog.com": "3.88.44.201",
};

function apexOf(host: string): string | null {
  if (/^\d/.test(host) || host.includes("/")) return null;
  if (host.includes("amazonaws.com") || host.includes("s3.")) return "aws-cloud";
  const parts = host.split(".");
  if (parts.length < 2) return null;
  return parts.slice(-2).join(".");
}

function shortLabel(host: string) {
  if (host.length <= 22) return host;
  if (host.includes("amazonaws.com")) {
    const leaf = host.split(".")[0];
    return leaf.length > 18 ? leaf.slice(0, 16) + "…" : leaf;
  }
  const parts = host.split(".");
  if (parts.length > 2) return parts[0];
  return host.slice(0, 20) + "…";
}

export function buildTopology(assets: Asset[]): { nodes: TopoNode[]; edges: TopoEdge[] } {
  const byHost = new Map(assets.map((a) => [a.host, a]));
  const nodes = new Map<string, TopoNode>();
  const edges: TopoEdge[] = [];
  const edgeKey = new Set<string>();

  const pushEdge = (e: TopoEdge) => {
    const k = `${e.from}->${e.to}:${e.kind}`;
    if (edgeKey.has(k)) return;
    edgeKey.add(k);
    edges.push(e);
  };

  const ensureRoot = (id: string, label: string) => {
    if (nodes.has(id)) return;
    nodes.set(id, {
      id,
      label,
      kind: "root",
      status: "root",
      risk: "—",
      findings: 0,
      type: "Domain",
      tech: "Apex / org root",
      ports: "—",
      src: "Derived",
      x: 0,
      y: 0,
    });
  };

  ensureRoot("northwindlog.com", "northwindlog.com");
  ensureRoot("nwl-intl.com", "nwl-intl.com");
  ensureRoot("aws-cloud", "AWS cloud");

  for (const a of assets) {
    const kind: TopoKind =
      a.type === "IP"
        ? "ip"
        : a.type === "Cloud"
          ? "cloud"
          : a.type === "Network"
            ? "network"
            : "host";

    nodes.set(a.host, {
      id: a.host,
      label: shortLabel(a.host),
      kind,
      status: a.status,
      risk: a.risk,
      findings: a.findings,
      type: a.type,
      tech: a.tech,
      ports: a.ports,
      src: a.src,
      x: 0,
      y: 0,
      asset: a,
    });

    if (kind === "host" || a.type === "Related domain" || a.type === "Subdomain") {
      const apex = apexOf(a.host);
      if (apex === "nwl-intl.com" || apex === "northwindlog.com") {
        pushEdge({
          from: apex,
          to: a.host,
          kind: apex === "nwl-intl.com" ? "related" : "dns",
        });
      }
    }

    if (kind === "cloud") {
      pushEdge({ from: "aws-cloud", to: a.host, kind: "cloud" });
    }

    if (kind === "network") {
      pushEdge({ from: "northwindlog.com", to: a.host, kind: "dns" });
    }
  }

  pushEdge({ from: "northwindlog.com", to: "aws-cloud", kind: "cloud" });

  for (const [host, ip] of Object.entries(ASSET_RESOLVES)) {
    if (!byHost.has(host) || !byHost.has(ip)) continue;
    pushEdge({ from: host, to: ip, kind: "resolve" });
  }

  const hasIncoming = new Set(edges.map((e) => e.to));
  for (const a of assets) {
    if (a.type !== "IP") continue;
    if (!hasIncoming.has(a.host)) {
      pushEdge({ from: "aws-cloud", to: a.host, kind: "resolve" });
    }
  }

  layoutNodes(nodes);
  return { nodes: [...nodes.values()], edges };
}

function layoutNodes(nodes: Map<string, TopoNode>) {
  const cols = 4;
  const cellW = 188;
  const cellH = 56;
  const startX = 28;
  const startY = 28;
  const bandGap = 36;

  const placeGrid = (list: TopoNode[], originY: number) => {
    list.forEach((n, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      n.x = startX + col * cellW;
      n.y = originY + row * cellH;
    });
    const rows = Math.max(1, Math.ceil(list.length / cols));
    return originY + rows * cellH + bandGap;
  };

  const roots = ["northwindlog.com", "nwl-intl.com", "aws-cloud"]
    .map((id) => nodes.get(id))
    .filter((n): n is TopoNode => Boolean(n));

  let y = placeGrid(roots, startY);

  const hosts = [...nodes.values()].filter(
    (n) => n.kind === "host" || n.kind === "cloud" || n.kind === "network"
  );
  y = placeGrid(hosts, y);

  const ips = [...nodes.values()].filter((n) => n.kind === "ip");
  placeGrid(ips, y);
}
