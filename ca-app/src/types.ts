export type Severity = "critical" | "high" | "medium" | "low";
export type ValidationStatus = "verified" | "pending" | "auto";
export type SlaState = "" | "soon" | "late";
export type AssetStatus = "verified" | "auto" | "unscanned";
export type BoardColumn =
  | "New"
  | "Assigned"
  | "In progress"
  | "Awaiting verification"
  | "Closed verified";

export interface Finding {
  id: string;
  title: string;
  asset: string;
  severity: Severity;
  kev: boolean;
  status: string;
  validation: ValidationStatus;
  validator: string;
  validatedAt: string;
  method: string;
  firstSeen: string;
  sla: string;
  slaState: SlaState;
  owner: string;
  cvss: string;
  category: string;
  impact: string;
  evidence: string;
  steps: string[];
  remediation: string[];
  note: string;
}

export interface Asset {
  host: string;
  type: string;
  src: string;
  tech: string;
  ports: string;
  status: AssetStatus;
  risk: string;
  seen: string;
  findings: number;
}

export interface ClosedFinding {
  id: string;
  title: string;
  asset: string;
  severity: Severity;
  closedAt: string;
  validator: string;
  openDays: number;
  certId: string;
}

export interface DemoData {
  tenant: {
    name: string;
    domain: string;
    sector: string;
    sponsor: string;
    lastSweep: string;
    nextPentest: string;
  };
  kpi: {
    score: number;
    scoreMax: number;
    grade: string;
    scoreDelta: number;
    findingsOpen: number;
    findingsDelta: number;
    critical: number;
    criticalDelta: number;
    assetsMonitored: number;
    assetsNew7d: number;
    verifiedPct: number;
    verifiedDelta: number;
  };
  scoreTrend: number[];
  findingTrend: { critical: number[]; high: number[]; medium: number[] };
  assetSplit: {
    discovered: number;
    scanned: number;
    humanValidated: number;
    unscanned: number;
  };
  evidenceReadiness: { label: string; pct: number; note: string }[];
  verificationFeed: { kind: string; title: string; meta: string }[];
  newAssets: { host: string; src: string; when: string; risk: string }[];
  assets: Asset[];
  findings: Finding[];
  board: { key: BoardColumn; ids: string[] }[];
  closed: ClosedFinding[];
  reports: {
    icon: string;
    title: string;
    desc: string;
    items: string[];
    when: string;
    feature: boolean;
  }[];
  reportHistory: {
    name: string;
    period: string;
    recipients: string;
    format: string;
    created: string;
  }[];
  testHistory: {
    name: string;
    type: string;
    scope: string;
    findings: string;
    status: string;
    date: string;
  }[];
  proposedScope: {
    target: string;
    reason: string;
    priority: string;
  }[];
  cisControls: {
    control: string;
    evidence: string;
    status: string;
  }[];
  regulations: {
    framework: string;
    requires: string;
    contribution: string;
  }[];
  dueDiligence: {
    name: string;
    stage: string;
    grade: string;
    score: number;
    finding: string;
    rec: string;
  }[];
  portfolio: {
    fund: string;
    companies: number;
    avgScore: number;
    avgDelta: number;
    criticalOpen: number;
    verifiedPct: number;
    matrix: {
      rows: { label: string; cls: string; cells: number[] }[];
      cols: string[];
    };
    list: {
      name: string;
      sector: string;
      tier: string;
      score: number;
      grade: string;
      delta: number;
      critical: number;
      verified: number;
      pentest: string;
    }[];
  };
}

export type ModalKind = "scope" | "request" | "cert" | "kev" | null;

export interface Toast {
  id: string;
  message: string;
  tone?: "ok" | "warn" | "info";
}
