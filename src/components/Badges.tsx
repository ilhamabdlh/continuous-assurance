import type { Severity, ValidationStatus } from "../types";

export function SevBadge({ severity }: { severity: Severity }) {
  const label = { critical: "Critical", high: "High", medium: "Medium", low: "Low" }[severity];
  return <span className={`badge b-${severity}`}>{label}</span>;
}

export function ValidationBadge({ validation }: { validation: ValidationStatus }) {
  if (validation === "verified")
    return <span className="badge b-verified">✓ Human validated</span>;
  if (validation === "auto") return <span className="badge b-auto">Automated</span>;
  return <span className="badge b-pending">◷ Awaiting validation</span>;
}

export function Grade({ g }: { g: string }) {
  if (g === "—" || !g) return <span className="t-dim">—</span>;
  return <span className={`grade grade-${g.toLowerCase()}`}>{g}</span>;
}

export function SlaPill({ sla, state }: { sla: string; state?: string }) {
  return <span className={`sla ${state || ""}`}>{sla}</span>;
}
