import { useState, type DragEvent } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import type { BoardColumn, Finding } from "../types";
import { SevBadge } from "../components/Badges";

const COLUMNS: BoardColumn[] = [
  "New",
  "Assigned",
  "In progress",
  "Awaiting verification",
  "Closed verified",
];

export function RemediationPage() {
  const {
    findings,
    board,
    closed,
    moveFinding,
    verifyAndClose,
    openModal,
    toast,
    assignFinding,
  } = useApp();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<BoardColumn | null>(null);

  const byId: Record<string, Finding | (typeof closed)[0]> = {};
  findings.forEach((f) => {
    byId[f.id] = f;
  });
  closed.forEach((c) => {
    byId[c.id] = c;
  });

  const onDragStart = (e: DragEvent, id: string, fromDone: boolean) => {
    if (fromDone) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setOverCol(null);
  };

  const onDragOver = (e: DragEvent, col: BoardColumn) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverCol(col);
  };

  const onDrop = (e: DragEvent, to: BoardColumn) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    setDraggingId(null);
    setOverCol(null);
    if (!id) return;

    if (to === "Closed verified") {
      const f = findings.find((x) => x.id === id);
      if (!f) {
        toast("This card is already closed.", "info");
        return;
      }
      if (f.status !== "Awaiting verification") {
        moveFinding(id, "Awaiting verification");
        toast(`${id} moved to Awaiting verification. Click Verify close or drop again to Closed.`, "warn");
        return;
      }
      verifyAndClose(id);
      return;
    }

    moveFinding(id, to);
    if (to === "Assigned") assignFinding(id, "Platform team");
    else if (to === "In progress") {
      toast(`${id} → ${to}`);
    } else {
      toast(`${id} moved to “${to}”.`);
    }
  };

  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <h1>Remediation &amp; verification</h1>
          <p>
            Drag cards between columns. Closing to the last column only happens through
            re-verification — which generates a certificate.
          </p>
        </div>
        <div className="page-head-actions">
          <button className="btn btn-sm" onClick={() => openModal("cert")}>
            View sample certificate
          </button>
        </div>
      </div>

      <div className="annot" style={{ marginBottom: 14 }}>
        <span>◆</span>
        <div>
          <b>How to use.</b> Hold and drag a card to another column. Dropping on{" "}
          <b>Closed verified</b> runs verification (if not yet in the retest queue, the card is
          moved to Awaiting verification first).
        </div>
      </div>

      <div className="kanban" style={{ marginBottom: 14 }}>
        {board.map((col) => {
          const isDone = col.key === "Closed verified";
          const isOver = overCol === col.key;
          return (
            <div
              className={`kcol${isOver ? " kcol-over" : ""}`}
              key={col.key}
              onDragOver={(e) => onDragOver(e, col.key)}
              onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
              onDrop={(e) => onDrop(e, col.key)}
            >
              <div className="kcol-head">
                {isDone && <span style={{ color: "var(--green)" }}>✓</span>}
                {col.key}
                <span className="n">{col.ids.length}</span>
              </div>
              <div className="kcol-body">
                {col.ids.map((id) => {
                  const f = byId[id];
                  if (!f) return null;
                  const finding = f as Finding;
                  return (
                    <div
                      className={`kcard${draggingId === id ? " kcard-dragging" : ""}${
                        isDone ? " kcard-locked" : ""
                      }`}
                      key={id}
                      draggable={!isDone}
                      onDragStart={(e) => onDragStart(e, id, isDone)}
                      onDragEnd={onDragEnd}
                    >
                      {!isDone && <div className="kcard-grip" title="Drag">⠿</div>}
                      <div className="kid">{id}</div>
                      <div className="ktitle">{"title" in f ? f.title : id}</div>
                      {"severity" in f && (
                        <div
                          className="row-flex"
                          style={{ gap: 6, flexWrap: "wrap", marginBottom: 7 }}
                        >
                          <SevBadge severity={f.severity} />
                          {"kev" in finding && finding.kev && (
                            <span className="badge b-kev">KEV</span>
                          )}
                        </div>
                      )}
                      <div className="kmeta" style={{ flexWrap: "wrap", gap: 6 }}>
                        {isDone ? (
                          <button className="btn btn-sm" onClick={() => openModal("cert", id)}>
                            Certificate
                          </button>
                        ) : (
                          <>
                            <Link className="btn btn-sm" to={`/findings/${id}`}>
                              Detail
                            </Link>
                            {col.key === "Awaiting verification" && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => verifyAndClose(id)}
                              >
                                Verify close
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      {!isDone && (
                        <div className="kcard-move">
                          {COLUMNS.filter((c) => c !== col.key && c !== "Closed verified").map(
                            (c) => (
                              <button
                                key={c}
                                className="chip"
                                type="button"
                                onClick={() => {
                                  moveFinding(id, c);
                                  toast(`${id} → ${c}`);
                                }}
                              >
                                → {c}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {isOver && (
                  <div className="kcol-drop-hint">Drop here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Verified closure history</h3>
        </div>
        <div className="card-body tight table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Finding</th>
                <th>Severity</th>
                <th>Open</th>
                <th>Validator</th>
                <th>Closed</th>
                <th>Certificate</th>
              </tr>
            </thead>
            <tbody>
              {closed.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="stack-2">
                      <span className="t-strong">{c.title}</span>
                      <span className="t-dim mono" style={{ fontSize: 11.5 }}>
                        {c.id} · {c.asset}
                      </span>
                    </div>
                  </td>
                  <td>
                    <SevBadge severity={c.severity} />
                  </td>
                  <td className="t-dim">{c.openDays} days</td>
                  <td className="t-dim">{c.validator}</td>
                  <td className="t-dim">{c.closedAt}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => openModal("cert", c.id)}>
                      {c.certId}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
