import { useApp } from "../context/AppContext";
import { DEMO } from "../data/demo";
import { SevBadge } from "./Badges";

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
  } = useApp();

  if (!modal) return null;

  const targetFinding =
    findings.find((f) => f.id === modalArg) ||
    findings.find((f) => f.validation !== "verified") ||
    findings[0];

  const cert =
    closed.find((c) => c.id === modalArg) ||
    closed[0];

  const kevQueue = findings.filter((f) => f.kev || f.validation === "pending");

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && closeModal()}>
      <div className="modal" role="dialog">
        {modal === "cert" && cert && (
          <>
            <div className="modal-head">
              <h3>Verification certificate</h3>
              <button className="x-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="cert">
                <div className="cert-seal">✓</div>
                <h4>Remediation verified</h4>
                <div className="cert-sub">{cert.title}</div>
                <dl className="kv" style={{ gridTemplateColumns: "140px 1fr" }}>
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
                  <dt>Result</dt>
                  <dd>
                    <span className="badge b-verified">✓ No longer exploitable</span>
                  </dd>
                  <dt>Certificate no.</dt>
                  <dd className="mono">{cert.certId}</dd>
                </dl>
                <div className="cert-hash">
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
                  closeModal();
                }}
              >
                Download PDF (demo)
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
                Rapid7 Vector Command pattern: fast track for KEV / emergent threats, separate from
                routine triage.
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
