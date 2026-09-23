import { Link, NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { DEMO } from "../data/demo";
import { AtumcellBrand } from "./AtumcellLogo";

const Icon = {
  dash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-17v5h6V3h-6z" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 9v4m0 4h.01M10.3 4.3L2.8 18a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.3a2 2 0 00-3.4 0z" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12l2 2 4-4" />
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  ),
  report: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
};

export function Sidebar() {
  const { findings } = useApp();
  const openCount = findings.length;

  return (
    <aside className="sidebar">
      <Link to="/" className="brand" aria-label="Atumcell Assurance — Overview">
        <AtumcellBrand />
      </Link>

      <nav className="nav">
        <div className="nav-label">Monitoring</div>
        <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          <span className="ico">{Icon.dash}</span> Overview
        </NavLink>
        <NavLink to="/assets" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          <span className="ico">{Icon.globe}</span> Attack Surface
          <span className="count">{DEMO.assetSplit.discovered}</span>
        </NavLink>
        <NavLink to="/findings" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          <span className="ico">{Icon.alert}</span> Findings
          <span className="count">{openCount}</span>
        </NavLink>

        <div className="nav-label">Actions</div>
        <NavLink to="/remediation" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          <span className="ico">{Icon.check}</span> Remediation &amp; Verification
        </NavLink>
        <NavLink to="/pentest" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          <span className="ico">{Icon.target}</span> Testing Cycle
        </NavLink>

        <div className="nav-label">Outputs</div>
        <NavLink to="/evidence" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          <span className="ico">{Icon.file}</span> Evidence Readiness
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          <span className="ico">{Icon.report}</span> Reports
        </NavLink>

        <div className="nav-label">Sponsor</div>
        <NavLink to="/portfolio" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          <span className="ico">{Icon.grid}</span> PE Portfolio
        </NavLink>
      </nav>

      <div className="nav-foot">
        <span className="pill-demo">REACT v1 · FICTIONAL DATA</span>
        <Link className="link-compare" to="/compare">
          Compare vs competitors →
        </Link>
      </div>
    </aside>
  );
}
