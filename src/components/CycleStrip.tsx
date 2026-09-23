import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { DEMO } from "../data/demo";

const STEPS = [
  {
    key: "discover",
    label: "Discover",
    desc: "Attack surface",
    to: "/assets",
    value: () => `${DEMO.assetSplit.discovered} assets`,
  },
  {
    key: "exploit",
    label: "Validate",
    desc: "Human validation",
    to: "/findings",
    value: (n: number) => `${n} pending`,
  },
  {
    key: "prioritize",
    label: "Prioritize",
    desc: "Critical + KEV",
    to: "/findings?filter=critical",
    value: (n: number) => `${n} priority`,
  },
  {
    key: "remediate",
    label: "Remediate",
    desc: "Retest & certificate",
    to: "/remediation",
    value: () => "Kanban",
  },
] as const;

export function CycleStrip() {
  const { findings } = useApp();
  const pending = findings.filter((f) => f.validation === "pending").length;
  const priority = findings.filter((f) => f.severity === "critical" || f.kev).length;

  return (
    <div className="cycle-strip">
      <div className="cycle-label">
        Cycle
        <span>Discover → Validate → Prioritize → Remediate</span>
      </div>
      <div className="cycle-steps">
        {STEPS.map((s, i) => (
          <Link key={s.key} to={s.to} className="cycle-step">
            <span className="cycle-n">{i + 1}</span>
            <span>
              <strong>{s.label}</strong>
              <em>
                {s.key === "exploit"
                  ? s.value(pending)
                  : s.key === "prioritize"
                    ? s.value(priority)
                    : (s.value as () => string)()}
              </em>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
