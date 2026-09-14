import type { Asset } from "../types";

export type CloudRegionId =
  | "us-west-1"
  | "us-west-2"
  | "us-east-1"
  | "us-east-2"
  | "eu-west-1"
  | "eu-central-1"
  | "ap-southeast-1"
  | "ap-northeast-1"
  | "sa-east-1";

export interface CloudRegionDef {
  id: CloudRegionId;
  code: string;
  name: string;
  provider: "AWS";
  /** Position on the stylized map (percent) */
  x: number;
  y: number;
}

export interface AsnDef {
  asn: string;
  name: string;
  provider: string;
}

export interface RegionStats {
  region: CloudRegionDef;
  assets: number;
  findings: number;
  unscanned: number;
  hosts: string[];
}

export interface AsnStats {
  asn: string;
  name: string;
  provider: string;
  assets: number;
  findings: number;
}

/** AWS regions shown on the heatmap (demo footprint for Northwind). */
export const CLOUD_REGIONS: CloudRegionDef[] = [
  { id: "us-west-1", code: "us-west-1", name: "US West (N. California)", provider: "AWS", x: 14, y: 36 },
  { id: "us-west-2", code: "us-west-2", name: "US West (Oregon)", provider: "AWS", x: 16, y: 28 },
  { id: "us-east-1", code: "us-east-1", name: "US East (N. Virginia)", provider: "AWS", x: 28, y: 34 },
  { id: "us-east-2", code: "us-east-2", name: "US East (Ohio)", provider: "AWS", x: 30, y: 42 },
  { id: "eu-west-1", code: "eu-west-1", name: "Europe (Ireland)", provider: "AWS", x: 46, y: 26 },
  { id: "eu-central-1", code: "eu-central-1", name: "Europe (Frankfurt)", provider: "AWS", x: 52, y: 30 },
  { id: "ap-southeast-1", code: "ap-southeast-1", name: "Asia Pacific (Singapore)", provider: "AWS", x: 74, y: 54 },
  { id: "ap-northeast-1", code: "ap-northeast-1", name: "Asia Pacific (Tokyo)", provider: "AWS", x: 80, y: 34 },
  { id: "sa-east-1", code: "sa-east-1", name: "South America (São Paulo)", provider: "AWS", x: 36, y: 68 },
];

const ASNS: AsnDef[] = [
  { asn: "AS16509", name: "Amazon.com, Inc.", provider: "AWS" },
  { asn: "AS14618", name: "Amazon.com, Inc.", provider: "AWS" },
  { asn: "AS13335", name: "Cloudflare, Inc.", provider: "CDN" },
  { asn: "AS8075", name: "Microsoft Corporation", provider: "Azure" },
  { asn: "AS15169", name: "Google LLC", provider: "GCP" },
  { asn: "AS396982", name: "Google Cloud", provider: "GCP" },
];

/** Demo host → cloud region (fictional but consistent with AWS IP prefixes in demo). */
const HOST_REGION: Record<string, CloudRegionId> = {
  "www.northwindlog.com": "us-east-1",
  "portal.northwindlog.com": "us-east-1",
  "stg-portal.northwindlog.com": "us-east-2",
  "vpn.northwindlog.com": "us-east-2",
  "13.58.204.77": "us-east-2",
  "mail.northwindlog.com": "eu-west-1",
  "api-v2.northwindlog.com": "us-west-2",
  "nwl-invoices.s3.amazonaws.com": "us-east-1",
  "track.northwindlog.com": "us-west-1",
  "wms-legacy.nwl-intl.com": "eu-central-1",
  "sso.northwindlog.com": "us-east-1",
  "10.44.0.0/22": "us-east-1",
  "dev-wms.northwindlog.com": "us-east-2",
  "18.221.9.40": "us-east-2",
  "cdn.northwindlog.com": "us-east-1",
  "status.northwindlog.com": "us-west-2",
  "git.northwindlog.com": "us-east-1",
  "jenkins.northwindlog.com": "us-east-1",
  "grafana.northwindlog.com": "eu-central-1",
  "help.northwindlog.com": "us-west-2",
  "partners.northwindlog.com": "ap-southeast-1",
  "edi.northwindlog.com": "us-east-1",
  "ftp.nwl-intl.com": "eu-west-1",
  "backup.northwindlog.com": "us-west-2",
  "54.212.88.19": "us-west-2",
  "mobile-api.northwindlog.com": "us-west-2",
  "docs.northwindlog.com": "us-east-1",
  "nwl-logs-archive.s3.amazonaws.com": "us-west-2",
  "remote.northwindlog.com": "us-east-2",
  "staging-api.northwindlog.com": "us-east-2",
  "wiki.northwindlog.com": "ap-northeast-1",
  "3.88.44.201": "us-east-1",
};

/** Demo host → ASN */
const HOST_ASN: Record<string, string> = {
  "www.northwindlog.com": "AS13335",
  "portal.northwindlog.com": "AS16509",
  "stg-portal.northwindlog.com": "AS16509",
  "vpn.northwindlog.com": "AS16509",
  "13.58.204.77": "AS16509",
  "mail.northwindlog.com": "AS8075",
  "api-v2.northwindlog.com": "AS16509",
  "nwl-invoices.s3.amazonaws.com": "AS16509",
  "track.northwindlog.com": "AS13335",
  "wms-legacy.nwl-intl.com": "AS16509",
  "sso.northwindlog.com": "AS13335",
  "10.44.0.0/22": "AS16509",
  "dev-wms.northwindlog.com": "AS16509",
  "18.221.9.40": "AS14618",
  "cdn.northwindlog.com": "AS16509",
  "status.northwindlog.com": "AS13335",
  "git.northwindlog.com": "AS16509",
  "jenkins.northwindlog.com": "AS16509",
  "grafana.northwindlog.com": "AS16509",
  "help.northwindlog.com": "AS13335",
  "partners.northwindlog.com": "AS16509",
  "edi.northwindlog.com": "AS16509",
  "ftp.nwl-intl.com": "AS16509",
  "backup.northwindlog.com": "AS16509",
  "54.212.88.19": "AS16509",
  "mobile-api.northwindlog.com": "AS16509",
  "docs.northwindlog.com": "AS13335",
  "nwl-logs-archive.s3.amazonaws.com": "AS16509",
  "remote.northwindlog.com": "AS16509",
  "staging-api.northwindlog.com": "AS14618",
  "wiki.northwindlog.com": "AS16509",
  "3.88.44.201": "AS14618",
};

export function buildRegionStats(assets: Asset[]): RegionStats[] {
  const byId = new Map<CloudRegionId, RegionStats>();
  for (const r of CLOUD_REGIONS) {
    byId.set(r.id, { region: r, assets: 0, findings: 0, unscanned: 0, hosts: [] });
  }

  for (const a of assets) {
    const rid = HOST_REGION[a.host] ?? "us-east-1";
    const row = byId.get(rid);
    if (!row) continue;
    row.assets += 1;
    row.findings += a.findings;
    if (a.status === "unscanned") row.unscanned += 1;
    row.hosts.push(a.host);
  }

  return CLOUD_REGIONS.map((r) => byId.get(r.id)!);
}

export function buildAsnStats(assets: Asset[]): AsnStats[] {
  const map = new Map<string, AsnStats>();
  for (const def of ASNS) {
    map.set(def.asn, {
      asn: def.asn,
      name: def.name,
      provider: def.provider,
      assets: 0,
      findings: 0,
    });
  }

  for (const a of assets) {
    const asn = HOST_ASN[a.host] ?? "AS16509";
    let row = map.get(asn);
    if (!row) {
      row = { asn, name: "Unknown", provider: "—", assets: 0, findings: 0 };
      map.set(asn, row);
    }
    row.assets += 1;
    row.findings += a.findings;
  }

  return [...map.values()]
    .filter((r) => r.assets > 0)
    .sort((a, b) => b.findings - a.findings || b.assets - a.assets);
}

export function regionHeatLevel(stats: RegionStats, maxFindings: number): "none" | "low" | "mid" | "high" {
  if (stats.assets === 0) return "none";
  if (stats.findings === 0 && stats.unscanned === 0) return "low";
  const ratio = maxFindings > 0 ? stats.findings / maxFindings : 0;
  if (ratio >= 0.55 || stats.findings >= 6) return "high";
  if (ratio >= 0.25 || stats.findings >= 2 || stats.unscanned > 0) return "mid";
  return "low";
}
