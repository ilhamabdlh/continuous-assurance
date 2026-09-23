import { useApp } from "../context/AppContext";
import { DEMO } from "../data/demo";
import { SevBadge } from "./Badges";
import type { ClosedFinding } from "../types";

function downloadCertificate(cert: ClosedFinding, companyName: string) {
  const hash =
    "9c1f4ab7e30d5f6b8a2c74e1d09b3f5628ac7d41e9b0f236a8d5c7194be03fa2";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Verification Certificate — ${cert.certId}</title>
<style>
  @page { size: A4; margin: 24mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif;
    color: #14181f;
    background: #fff;
  }
  .sheet {
    max-width: 720px;
    margin: 0 auto;
    border: 2px solid #14181f;
    padding: 40px 44px;
    position: relative;
  }
  .sheet::before {
    content: "";
    position: absolute;
    inset: 8px;
    border: 1px solid #e8491d;
    pointer-events: none;
  }
  .brand {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 2px solid #14181f;
    padding-bottom: 14px;
    margin-bottom: 28px;
  }
  .brand strong {
    font-family: Archivo, "IBM Plex Sans", sans-serif;
    font-size: 22px;
    letter-spacing: -0.4px;
  }
  .brand span {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #5a6472;
  }
  h1 {
    margin: 0 0 6px;
    font-family: Archivo, "IBM Plex Sans", sans-serif;
    font-size: 28px;
    letter-spacing: -0.5px;
  }
  .lede { color: #5a6472; font-size: 14px; margin: 0 0 28px; }
  .result {
    display: inline-block;
    border: 1px solid #1f7a4d;
    color: #1f7a4d;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 650;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  dl {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 10px 16px;
    margin: 0;
    font-size: 13.5px;
  }
  dt { color: #5a6472; margin: 0; }
  dd { margin: 0; font-weight: 550; }
  .mono { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 12.5px; }
  .hash {
    margin-top: 28px;
    padding-top: 16px;
    border-top: 1px dashed #c5ccd6;
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 10.5px;
    color: #5a6472;
    word-break: break-all;
  }
  .foot {
    margin-top: 32px;
    display: flex;
    justify-content: space-between;
    font-size: 11.5px;
    color: #5a6472;
  }
  @media print {
    body { background: #fff; }
    .sheet { border-width: 2px; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <div class="brand">
      <strong>Atumcell</strong>
      <span>Continuous Assurance</span>
    </div>
    <h1>Remediation verified</h1>
    <p class="lede">${cert.title}</p>
    <div class="result">No longer exploitable</div>
    <dl>
      <dt>Certificate no.</dt><dd class="mono">${cert.certId}</dd>
      <dt>Finding ID</dt><dd class="mono">${cert.id}</dd>
      <dt>Asset</dt><dd class="mono">${cert.asset}</dd>
      <dt>Initial severity</dt><dd>${cert.severity}</dd>
      <dt>Days open</dt><dd>${cert.openDays} days</dd>
      <dt>Verified by</dt><dd>${cert.validator} · OSCP</dd>
      <dt>Date</dt><dd>${cert.closedAt}</dd>
      <dt>Organization</dt><dd>${companyName}</dd>
    </dl>
    <div class="hash">sha256:${hash}</div>
    <div class="foot">
      <span>Issued by Atumcell Continuous Assurance</span>
      <span>Print or archive this file as evidence</span>
    </div>
  </div>
  <script>window.onload = function () { setTimeout(function () { window.print(); }, 250); };</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cert.certId || "verification-certificate"}.html`;
  a.click();
  // Print-ready preview (separate blob URL)
  const preview = URL.createObjectURL(blob);
  window.open(preview, "_blank", "noopener,noreferrer");
  setTimeout(() => {
    URL.revokeObjectURL(url);
    URL.revokeObjectURL(preview);
  }, 60_000);
}

export function ModalHost() {
  const {
    modal,
    modalArg,
    closeModal,
    findings,
    closed,
    requestValidation,
    requestKevValidation,
    quotaHoursLeft,
    company,
    toast,
  } = useApp();

  if (!modal) return null;

  const targetFinding =
    findings.find((f) => f.id === modalArg) ||
    findings.find((f) => f.validation !== "verified") ||
    findings[0];

  const cert = closed.find((c) => c.id === modalArg) || closed[0];

  const kevQueue = findings.filter((f) => f.kev || f.validation === "pending");

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && closeModal()}>
      <div className={`modal${modal === "cert" ? " modal-cert" : ""}`} role="dialog">
        {modal === "cert" && cert && (
          <>
            <div className="modal-head">
              <h3>Verification certificate</h3>
              <button className="x-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="cert-doc">
                <div className="cert-doc-brand">
                  <strong>Atumcell</strong>
                  <span>Continuous Assurance</span>
                </div>
                <div className="cert-doc-seal" aria-hidden>
                  ✓
                </div>
                <h4>Remediation verified</h4>
                <p className="cert-doc-title">{cert.title}</p>
                <div className="cert-doc-result">No longer exploitable</div>
                <dl className="cert-doc-kv">
                  <dt>Certificate no.</dt>
                  <dd className="mono">{cert.certId}</dd>
                  <dt>Finding ID</dt>
                  <dd className="mono">{cert.id}</dd>
                  <dt>Asset</dt>
                  <dd className="mono">{cert.asset}</dd>
                  <dt>Initial severity</dt>
                  <dd>
                    <SevBadge severity={cert.severity} />
                  </dd>
                  <dt>Days open</dt>
                  <dd>{cert.openDays} days</dd>
                  <dt>Verified by</dt>
                  <dd>{cert.validator} · OSCP</dd>
                  <dt>Date</dt>
                  <dd>{cert.closedAt}</dd>
                  <dt>Organization</dt>
                  <dd>{company.name}</dd>
                </dl>
                <div className="cert-doc-hash">
                  sha256:9c1f4ab7e30d5f6b8a2c74e1d09b3f5628ac7d41e9b0f236a8d5c7194be03fa2
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={closeModal}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  downloadCertificate(cert, company.name);
                  toast("Certificate downloaded — open the file to print as PDF.");
                }}
              >
                Download certificate
              </button>
            </div>
          </>
        )}

        {modal === "request" && targetFinding && (
          <>
            <div className="modal-head">
              <h3>Request human validation</h3>
              <button className="x-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="t-dim" style={{ fontSize: 13, marginTop: 0 }}>
                Request enters the Atumcell testing team queue. Retests after remediation do not
                consume quota.
              </p>
              <dl className="kv" style={{ gridTemplateColumns: "150px 1fr" }}>
                <dt>Target</dt>
                <dd className="mono">
                  {targetFinding.id} · {targetFinding.asset}
                </dd>
                <dt>Type</dt>
                <dd>Exploitability validation</dd>
                <dt>Estimate</dt>
                <dd>4 tester hours</dd>
                <dt>Quota remaining</dt>
                <dd>{quotaHoursLeft} hours of 200 contract hours</dd>
                <dt>Additional cost</dt>
                <dd>
                  <span className="badge b-verified">None</span>
                </dd>
              </dl>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => requestValidation(targetFinding.id)}
              >
                Submit request
              </button>
            </div>
          </>
        )}

        {modal === "scope" && (
          <>
            <div className="modal-head">
              <h3>Scope &amp; testing rules</h3>
              <button className="x-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <dl className="kv" style={{ gridTemplateColumns: "170px 1fr" }}>
                <dt>Seed domains</dt>
                <dd className="mono">northwindlog.com, nwl-intl.com, nwlfreight.io</dd>
                <dt>Cloud connectors</dt>
                <dd>AWS (2 accounts) · read-only</dd>
                <dt>Out of scope</dt>
                <dd>Warehouse OT network, partner SCADA systems</dd>
                <dt>Active testing</dt>
                <dd>Non-production allowed; production read-only</dd>
                <dt>Destructive testing</dt>
                <dd>
                  <span className="badge b-neutral">Not permitted</span>
                </dd>
                <dt>Sponsor</dt>
                <dd>{DEMO.tenant.sponsor}</dd>
              </dl>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </>
        )}

        {modal === "kev" && (
          <>
            <div className="modal-head">
              <h3>Validation &amp; emergent threat queue</h3>
              <button className="x-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="t-dim" style={{ fontSize: 13, marginTop: 0 }}>
                Fast track for KEV / emergent threats, separate from routine triage.
              </p>
              {kevQueue.length === 0 ? (
                <div className="empty">No items in queue.</div>
              ) : (
                <div className="table-wrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Finding</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {kevQueue.map((f) => (
                        <tr key={f.id}>
                          <td>
                            <div className="stack-2">
                              <span className="t-strong">{f.title}</span>
                              <span className="t-dim mono" style={{ fontSize: 11.5 }}>
                                {f.id} · {f.asset}
                                {f.kev ? " · KEV" : ""}
                              </span>
                            </div>
                          </td>
                          <td>
                            <SevBadge severity={f.severity} />
                          </td>
                          <td className="t-dim">{f.method}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                f.kev
                                  ? requestKevValidation(f.id)
                                  : requestValidation(f.id)
                              }
                            >
                              Prioritize
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
