import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { ASSIGNEES, mentionAtCursor, renderMentionNodes } from "../data/assignees";
import { SevBadge, ValidationBadge, SlaPill } from "../components/Badges";

function highlight(code: string) {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^(\$ .*)$/gm, '<span class="c-green">$1</span>')
    .replace(/^(#.*)$/gm, '<span class="c-dim">$1</span>')
    .replace(/(&lt;--.*)$/gm, '<span class="c-red">$1</span>');
}

export function FindingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    findings,
    comments,
    requestValidation,
    markFixedRequestRetest,
    assignFinding,
    verifyAndClose,
    requestKevValidation,
    addFindingComment,
    deleteFindingComment,
    deleteFinding,
    updateFinding,
    toast,
  } = useApp();
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const [editTitle, setEditTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUp, setAssignUp] = useState(false);
  const [assignMaxHeight, setAssignMaxHeight] = useState(280);
  const [cursor, setCursor] = useState(0);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionDismissed, setMentionDismissed] = useState<string | null>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const assignBtnRef = useRef<HTMLButtonElement>(null);
  const assignMenuRef = useRef<HTMLDivElement>(null);
  const assignees = useMemo(
    () => ASSIGNEES.filter((person) => person.name !== user?.name),
    [user?.name]
  );

  const f = findings.find((x) => x.id === id);
  const thread = useMemo(
    () => comments.filter((c) => c.findingId === id),
    [comments, id]
  );

  useEffect(() => {
    if (!assignOpen) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (assignBtnRef.current?.contains(target) || assignMenuRef.current?.contains(target)) return;
      setAssignOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAssignOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [assignOpen]);

  if (!f) {
    return (
      <section className="screen active">
        <div className="empty">
          <div className="big">?</div>
          Finding not found or already closed.
          <div style={{ marginTop: 12 }}>
            <Link className="btn btn-sm" to="/findings">
              Back
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const mention = mentionAtCursor(draft, cursor);
  const mentionKey = mention ? `${mention.start}:${mention.query}` : null;
  const suggestions =
    mention && mentionDismissed !== mentionKey
      ? assignees.filter((person) => {
          const query = mention.query.toLowerCase();
          if (!query) return true;
          return person.name
            .toLowerCase()
            .split(/\s+/)
            .some((part) => part.startsWith(query) || person.name.toLowerCase().startsWith(query));
        })
      : [];
  const activeMention = suggestions.length ? Math.min(mentionIndex, suggestions.length - 1) : 0;

  const insertMention = (name: string) => {
    if (!mention) return;
    const insert = `@${name} `;
    const next = draft.slice(0, mention.start) + insert + draft.slice(cursor);
    const nextCursor = mention.start + insert.length;
    setDraft(next);
    setCursor(nextCursor);
    setMentionIndex(0);
    setMentionDismissed(null);
    requestAnimationFrame(() => {
      const el = draftRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const onDraftChange = (value: string, el: HTMLTextAreaElement) => {
    setDraft(value);
    setCursor(el.selectionStart);
    setMentionIndex(0);
    setMentionDismissed(null);
  };

  const onPost = (e: FormEvent) => {
    e.preventDefault();
    addFindingComment(f.id, draft);
    setDraft("");
    setCursor(0);
  };

  return (
    <section className="screen active">
      <div className="row-flex" style={{ marginBottom: 14 }}>
        <button className="btn btn-sm" onClick={() => navigate("/findings")}>
          ← Back to list
        </button>
        <span className="t-dim mono" style={{ fontSize: 12 }}>
          {f.id}
        </span>
      </div>

      <div className="card finding-head" style={{ marginBottom: 14 }}>
        <div className="card-body">
          <div className="row-flex" style={{ gap: 9, marginBottom: 9, flexWrap: "wrap" }}>
            <SevBadge severity={f.severity} />
            {f.kev && (
              <span className="badge b-kev">◆ CISA KEV — exploited in the wild</span>
            )}
            <ValidationBadge validation={f.validation} />
            <span className="badge b-neutral">CVSS {f.cvss}</span>
            <SlaPill sla={`SLA: ${f.sla}`} state={f.slaState} />
            {f.change && f.change !== "existing" && (
              <span className="badge b-high">
                {f.change === "new"
                  ? "New since last sweep"
                  : f.change === "severity_up"
                    ? "Severity raised"
                    : "Reopened"}
              </span>
            )}
          </div>
          <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 640 }}>{f.title}</h2>
          <div className="t-dim" style={{ fontSize: 13 }}>
            <span className="mono">{f.asset}</span> · {f.category} · first seen {f.firstSeen}
          </div>
          <div className="row-flex" style={{ gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-sm" onClick={() => markFixedRequestRetest(f.id)}>
              Mark fixed &amp; request retest
            </button>
            <span className="assign-wrap">
              <button
                ref={assignBtnRef}
                type="button"
                className={`btn btn-sm${assignOpen ? " is-open" : ""}`}
                aria-haspopup="listbox"
                aria-expanded={assignOpen}
                onClick={() => {
                  const rect = assignBtnRef.current?.getBoundingClientRect();
                  if (rect) {
                    const gap = 8;
                    const spaceBelow = window.innerHeight - rect.bottom - gap;
                    const spaceAbove = rect.top - gap;
                    const up = spaceBelow < 180 && spaceAbove > spaceBelow;
                    setAssignUp(up);
                    setAssignMaxHeight(Math.max(140, Math.min(280, up ? spaceAbove : spaceBelow)));
                  }
                  setAssignOpen((open) => !open);
                }}
              >
                Assign
                <span className="assign-caret" aria-hidden>
                  {assignOpen ? "▴" : "▾"}
                </span>
              </button>
              {assignOpen && (
                <div
                  ref={assignMenuRef}
                  className={`assign-menu${assignUp ? " is-up" : ""}`}
                  style={{ maxHeight: assignMaxHeight }}
                  role="listbox"
                  aria-label="Assign finding"
                >
                  <div className="assign-menu-head">Assign to</div>
                  <ul className="assign-menu-list">
                    {assignees.map((person) => {
                      const active = person.name === f.owner;
                      return (
                        <li key={person.name}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            className={`assign-option${active ? " is-active" : ""}`}
                            onClick={() => {
                              setAssignOpen(false);
                              if (active) return;
                              assignFinding(f.id, person.name);
                            }}
                          >
                            <span className="assign-option-name">{person.name}</span>
                            <span className="assign-option-role">{person.role}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </span>
            <button className="btn btn-sm" onClick={() => requestValidation(f.id)}>
              Request validation
            </button>
            {f.kev && (
              <button className="btn btn-sm" onClick={() => requestKevValidation(f.id)}>
                KEV validation &lt; 24 hours
              </button>
            )}
            <button
              className="btn btn-sm"
              onClick={() => {
                if (f.status !== "Awaiting verification") {
                  toast("Move to Awaiting verification first (mark as fixed).", "warn");
                  return;
                }
                verifyAndClose(f.id);
              }}
            >
              Verify &amp; close
            </button>
            <button
              className="btn btn-sm"
              onClick={() => toast("Risk accepted — recorded in audit trail (demo).", "info")}
            >
              Accept risk
            </button>
            <button
              className="btn btn-sm"
              onClick={() => {
                setTitleDraft(f.title);
                setEditTitle(true);
              }}
            >
              Edit title
            </button>
            <button
              className="btn btn-sm"
              onClick={() => {
                if (!confirm(`Delete ${f.id}? This cannot be undone in the JSON store.`)) return;
                deleteFinding(f.id);
                navigate("/findings");
              }}
            >
              Delete finding
            </button>
          </div>
          {editTitle && (
            <div className="row-flex" style={{ gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <input
                style={{ flex: 1, minWidth: 220 }}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
              />
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  updateFinding(f.id, { title: titleDraft.trim() || f.title });
                  setEditTitle(false);
                }}
              >
                Save title
              </button>
              <button className="btn btn-sm" onClick={() => setEditTitle(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {f.validation === "verified" ? (
            <div className="callout">
              <div className="co-title">✓ Human verified</div>
              Proven by <b>{f.validator}</b> on {f.validatedAt} using method{" "}
              <b>{f.method}</b>.
            </div>
          ) : (
            <div className="callout orange">
              <div className="co-title">◷ Not yet human verified</div>
              {f.method}
            </div>
          )}

          <div className="card">
            <div className="card-head">
              <h3>Evidence</h3>
            </div>
            <div className="card-body">
              <pre className="code" dangerouslySetInnerHTML={{ __html: highlight(f.evidence) }} />
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Reproduction steps</h3>
            </div>
            <div className="card-body">
              <ol className="steps">
                {f.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Business impact</h3>
            </div>
            <div className="card-body" style={{ fontSize: 13, color: "var(--text-dim)" }}>
              {f.impact}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Remediation recommendations</h3>
            </div>
            <div className="card-body">
              <ol className="steps">
                {f.remediation.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Discussion</h3>
              <span className="sub">Client ↔ testing team · audit trail</span>
            </div>
            <div className="card-body">
              {thread.length === 0 ? (
                <p className="t-dim" style={{ margin: "0 0 12px", fontSize: 13 }}>
                  No comments yet. Ask a question or share remediation context.
                </p>
              ) : (
                <ul className="discuss-list">
                  {thread.map((c) => (
                    <li key={c.id} className={`discuss-item role-${c.role}`}>
                      <div className="discuss-meta">
                        <strong>{c.author}</strong>
                        <span className="discuss-role">{c.role}</span>
                        <span className="t-dim">{c.at}</span>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ marginLeft: "auto" }}
                          onClick={() => deleteFindingComment(c.id)}
                        >
                          Delete
                        </button>
                      </div>
                      <p className="discuss-body">
                        {renderMentionNodes(c.body).map((part, index) =>
                          part.mention ? (
                            <span key={index} className="mention">
                              {part.text}
                            </span>
                          ) : (
                            <span key={index}>{part.text}</span>
                          )
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <form className="discuss-form" onSubmit={onPost}>
                <textarea
                  ref={draftRef}
                  value={draft}
                  onChange={(e) => onDraftChange(e.target.value, e.target)}
                  onSelect={(e) => setCursor(e.currentTarget.selectionStart)}
                  onKeyDown={(e) => {
                    if (!suggestions.length) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setMentionIndex((index) => (index + 1) % suggestions.length);
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setMentionIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
                    } else if (e.key === "Enter" || e.key === "Tab") {
                      e.preventDefault();
                      insertMention(suggestions[activeMention].name);
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      setMentionDismissed(mentionKey);
                    }
                  }}
                  placeholder="Ask the testing team, or type @ to mention someone…"
                  rows={3}
                />
                {suggestions.length > 0 && (
                  <ul className="mention-menu" role="listbox" aria-label="Mention a user">
                    {suggestions.map((person, index) => (
                      <li key={person.name}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={index === activeMention}
                          className={`mention-option${index === activeMention ? " is-active" : ""}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            insertMention(person.name);
                          }}
                        >
                          <span className="mention-option-name">@{person.name}</span>
                          <span className="mention-option-role">{person.role}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button type="submit" className="btn btn-sm btn-primary" disabled={!draft.trim()}>
                  Post comment
                </button>
              </form>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-head">
              <h3>Summary</h3>
            </div>
            <div className="card-body">
              <dl className="kv" style={{ gridTemplateColumns: "120px 1fr" }}>
                <dt>Status</dt>
                <dd>{f.status}</dd>
                <dt>Owner</dt>
                <dd>{f.owner}</dd>
                <dt>Category</dt>
                <dd>{f.category}</dd>
                <dt>CVSS</dt>
                <dd>{f.cvss}</dd>
                <dt>In KEV</dt>
                <dd>{f.kev ? <span className="badge b-kev">Yes</span> : "No"}</dd>
                <dt>Validator</dt>
                <dd>{f.validator || "—"}</dd>
                <dt>Change</dt>
                <dd>
                  {f.change === "new"
                    ? "New"
                    : f.change === "severity_up"
                      ? "Severity raised"
                      : f.change === "reopened"
                        ? "Reopened"
                        : "Existing"}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
