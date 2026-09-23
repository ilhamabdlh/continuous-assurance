import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PORTFOLIO_COMPANIES, type ActiveCompany } from "../data/companies";
import { buildInitialStore, type JsonStore } from "../data/initialStore";
import { fetchStore, resetStoreFile, saveStore } from "../lib/jsonApi";
import type {
  AlertItem,
  Asset,
  BoardColumn,
  ClosedFinding,
  Finding,
  FindingComment,
  ModalKind,
  Severity,
  Toast,
} from "../types";

interface AppState {
  ready: boolean;
  persistError: string | null;
  findings: Finding[];
  assets: Asset[];
  board: { key: BoardColumn; ids: string[] }[];
  closed: ClosedFinding[];
  feed: { kind: string; title: string; meta: string }[];
  alerts: AlertItem[];
  comments: FindingComment[];
  quotaHoursLeft: number;
  modal: ModalKind;
  modalArg?: string;
  toasts: Toast[];
  company: ActiveCompany;
  companies: ActiveCompany[];
  setCompany: (name: string) => void;
  openModal: (kind: ModalKind, arg?: string) => void;
  closeModal: () => void;
  toast: (message: string, tone?: Toast["tone"]) => void;
  requestValidation: (findingId: string) => void;
  markFixedRequestRetest: (findingId: string) => void;
  moveFinding: (findingId: string, to: BoardColumn) => void;
  verifyAndClose: (findingId: string) => void;
  requestKevValidation: (findingId: string) => void;
  assignFinding: (findingId: string, owner: string) => void;
  markAlertRead: (alertId: string) => void;
  markAllAlertsRead: () => void;
  addFindingComment: (findingId: string, body: string) => void;
  deleteFindingComment: (commentId: string) => void;
  createFinding: (input: {
    title: string;
    asset: string;
    severity: Severity;
    category?: string;
  }) => void;
  updateFinding: (findingId: string, patch: Partial<Finding>) => void;
  deleteFinding: (findingId: string) => void;
  createAsset: (input: Partial<Asset> & { host: string }) => void;
  updateAsset: (host: string, patch: Partial<Asset>) => void;
  deleteAsset: (host: string) => void;
  resetToSeed: () => Promise<void>;
}

const AppCtx = createContext<AppState | null>(null);

function nowLabel() {
  return new Date().toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function nextFindingId(findings: Finding[], closed: ClosedFinding[]) {
  const nums = [...findings, ...closed]
    .map((f) => Number((f.id.match(/ATC-2026-(\d+)/) || [])[1]))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `ATC-2026-${String(next).padStart(4, "0")}`;
}

function applyStore(store: JsonStore) {
  const company =
    PORTFOLIO_COMPANIES.find((c) => c.name === store.companyName) || PORTFOLIO_COMPANIES[0];
  return { store, company };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);
  const [company, setCompanyState] = useState<ActiveCompany>(PORTFOLIO_COMPANIES[0]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [board, setBoard] = useState<{ key: BoardColumn; ids: string[] }[]>([]);
  const [closed, setClosed] = useState<ClosedFinding[]>([]);
  const [feed, setFeed] = useState<{ kind: string; title: string; meta: string }[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [comments, setComments] = useState<FindingComment[]>([]);
  const [quotaHoursLeft, setQuota] = useState(84);
  const [modal, setModal] = useState<ModalKind>(null);
  const [modalArg, setModalArg] = useState<string | undefined>();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const skipPersist = useRef(true);
  const hydrate = useCallback((store: JsonStore) => {
    const { company: co } = applyStore(store);
    setCompanyState(co);
    setFindings(store.findings.map((f) => ({ ...f })));
    setAssets(store.assets.map((a) => ({ ...a })));
    setBoard(store.board.map((c) => ({ ...c, ids: [...c.ids] })));
    setClosed(store.closed.map((c) => ({ ...c })));
    setFeed([...store.feed]);
    setAlerts(store.alerts.map((a) => ({ ...a })));
    setComments(store.comments.map((c) => ({ ...c })));
    setQuota(store.quotaHoursLeft);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let store = await fetchStore();
        if (!store) {
          store = buildInitialStore();
          store = await saveStore(store);
        }
        if (cancelled) return;
        hydrate(store);
        setReady(true);
        // allow one tick before enabling persist
        window.setTimeout(() => {
          skipPersist.current = false;
        }, 0);
      } catch (e) {
        console.error(e);
        if (cancelled) return;
        // Fallback in-memory if JSON API is down
        hydrate(buildInitialStore());
        setPersistError(null);
        setReady(true);
        skipPersist.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  useEffect(() => {
    if (!ready || skipPersist.current) return;
    const store: JsonStore = {
      version: 1,
      updatedAt: new Date().toISOString(),
      companyName: company.name,
      quotaHoursLeft,
      findings,
      board,
      closed,
      feed,
      alerts,
      comments,
      assets,
    };
    const t = window.setTimeout(() => {
      saveStore(store)
        .then(() => setPersistError(null))
        .catch((e) => setPersistError(String(e?.message || e)));
    }, 250);
    return () => window.clearTimeout(t);
  }, [
    ready,
    company.name,
    quotaHoursLeft,
    findings,
    board,
    closed,
    feed,
    alerts,
    comments,
    assets,
  ]);

  const toast = useCallback((message: string, tone: Toast["tone"] = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const setCompany = useCallback(
    (name: string) => {
      const next = PORTFOLIO_COMPANIES.find((c) => c.name === name);
      if (!next || next.name === company.name) return;
      setCompanyState(next);
      toast(`Switched to ${next.name} (demo portfolio company).`, "info");
    },
    [company.name, toast]
  );

  const openModal = useCallback((kind: ModalKind, arg?: string) => {
    setModal(kind);
    setModalArg(arg);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setModalArg(undefined);
  }, []);

  const moveFinding = useCallback((findingId: string, to: BoardColumn) => {
    setBoard((prev) =>
      prev.map((col) => ({
        ...col,
        ids:
          col.key === to
            ? col.ids.includes(findingId)
              ? col.ids
              : [...col.ids, findingId]
            : col.ids.filter((id) => id !== findingId),
      }))
    );
    if (to !== "Closed verified") {
      setFindings((prev) =>
        prev.map((x) => (x.id === findingId ? { ...x, status: to === "New" ? "New" : to } : x))
      );
    }
  }, []);

  const requestValidation = useCallback(
    (findingId: string) => {
      const f = findings.find((x) => x.id === findingId);
      if (!f) return;
      if (f.validation === "verified") {
        toast("This finding is already human-validated.", "info");
        return;
      }
      setFindings((prev) =>
        prev.map((x) =>
          x.id === findingId
            ? {
                ...x,
                validation: "pending",
                method: "In human validation queue (SLA < 24h if critical/KEV)",
                status: x.status === "New" ? "Assigned" : x.status,
              }
            : x
        )
      );
      if (f.status === "New") moveFinding(findingId, "Assigned");
      setQuota((q) => Math.max(0, q - 4));
      setFeed((prev) => [
        {
          kind: "warn",
          title: `${findingId} entered human validation queue`,
          meta: `Requested now · est. 4 hours · ${Math.max(0, quotaHoursLeft - 4)} hours quota remaining`,
        },
        ...prev,
      ]);
      toast(`Validation request for ${findingId} submitted.`);
      closeModal();
    },
    [findings, moveFinding, toast, closeModal, quotaHoursLeft]
  );

  const requestKevValidation = useCallback(
    (findingId: string) => {
      setFindings((prev) =>
        prev.map((x) =>
          x.id === findingId
            ? {
                ...x,
                validation: "pending",
                method: "Emergent threat validation — KEV fast track (< 24 hours)",
                sla: "24 hours",
                slaState: "soon",
                status: "Assigned",
              }
            : x
        )
      );
      moveFinding(findingId, "Assigned");
      setFeed((prev) => [
        {
          kind: "warn",
          title: `Emergent threat validation requested for ${findingId}`,
          meta: `KEV / emergent track · ${nowLabel()}`,
        },
        ...prev,
      ]);
      toast(`KEV queue: ${findingId} prioritized.`, "warn");
      closeModal();
    },
    [moveFinding, toast, closeModal]
  );

  const markFixedRequestRetest = useCallback(
    (findingId: string) => {
      setFindings((prev) =>
        prev.map((x) =>
          x.id === findingId ? { ...x, status: "Awaiting verification" } : x
        )
      );
      moveFinding(findingId, "Awaiting verification");
      setFeed((prev) => [
        {
          kind: "",
          title: `${findingId} marked fixed — retest scheduled`,
          meta: `Retest does not consume quota · ${nowLabel()}`,
        },
        ...prev,
      ]);
      toast(`Retest for ${findingId} scheduled. Quota not consumed.`);
    },
    [moveFinding, toast]
  );

  const verifyAndClose = useCallback(
    (findingId: string) => {
      const f = findings.find((x) => x.id === findingId);
      if (!f) return;
      const certId = `ACV-${findingId.replace(/^ATC-/, "")}-NWL`;
      const closedItem: ClosedFinding = {
        id: f.id,
        title: f.title,
        asset: f.asset,
        severity: f.severity,
        closedAt: nowLabel(),
        validator: "Matthew C.",
        openDays: 5,
        certId,
      };
      setClosed((c) => [closedItem, ...c]);
      setFindings((prev) => prev.filter((x) => x.id !== findingId));
      moveFinding(findingId, "Closed verified");
      setFeed((prev) => [
        {
          kind: "ok",
          title: `${findingId} closed with verification`,
          meta: `Matthew C. · certificate ${certId} · ${nowLabel()}`,
        },
        ...prev,
      ]);
      toast(`Certificate ${certId} issued.`);
      openModal("cert", findingId);
    },
    [findings, moveFinding, toast, openModal]
  );

  const assignFinding = useCallback(
    (findingId: string, owner: string) => {
      setFindings((prev) =>
        prev.map((x) => (x.id === findingId ? { ...x, owner, status: "Assigned" } : x))
      );
      moveFinding(findingId, "Assigned");
      toast(`${findingId} assigned to ${owner}.`);
    },
    [moveFinding, toast]
  );

  const markAlertRead = useCallback((alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, read: true } : a)));
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const addFindingComment = useCallback(
    (findingId: string, body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      const entry: FindingComment = {
        id: `c-${Math.random().toString(36).slice(2, 8)}`,
        findingId,
        author: "Ilham A.",
        role: "client",
        body: trimmed,
        at: nowLabel(),
      };
      setComments((prev) => [...prev, entry]);
      setFeed((prev) => [
        {
          kind: "",
          title: `Client commented on ${findingId}`,
          meta: `Ilham A. · ${nowLabel()}`,
        },
        ...prev,
      ]);
      toast("Comment posted.");
    },
    [toast]
  );

  const deleteFindingComment = useCallback(
    (commentId: string) => {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast("Comment deleted.");
    },
    [toast]
  );

  const createFinding = useCallback(
    (input: { title: string; asset: string; severity: Severity; category?: string }) => {
      const id = nextFindingId(findings, closed);
      const f: Finding = {
        id,
        title: input.title.trim(),
        asset: input.asset.trim(),
        severity: input.severity,
        kev: false,
        status: "New",
        validation: "auto",
        validator: "",
        validatedAt: "",
        method: "Automated scan — awaiting human validation",
        firstSeen: nowLabel().split(",")[0],
        sla: "7 days",
        slaState: "",
        owner: "Unassigned",
        cvss: input.severity === "critical" ? "9.0" : input.severity === "high" ? "7.5" : "5.0",
        category: input.category?.trim() || "General",
        impact: `Business impact for ${input.asset}: exposure requires triage and remediation.`,
        evidence: `$ scan ${input.asset}\n# created via UI\nseverity=${input.severity}`,
        steps: ["Confirm exposure", "Reproduce safely", "Capture evidence"],
        remediation: ["Apply fix", "Restrict exposure", "Request retest"],
        note: "",
        change: "new",
      };
      setFindings((prev) => [f, ...prev]);
      setBoard((prev) =>
        prev.map((col) =>
          col.key === "New" ? { ...col, ids: [id, ...col.ids.filter((x) => x !== id)] } : col
        )
      );
      setAssets((prev) =>
        prev.map((a) => (a.host === f.asset ? { ...a, findings: (a.findings || 0) + 1 } : a))
      );
      setFeed((prev) => [
        { kind: "warn", title: `${id} created`, meta: `${f.severity} · ${f.asset} · ${nowLabel()}` },
        ...prev,
      ]);
      if (f.severity === "critical" || f.severity === "high") {
        setAlerts((prev) => [
          {
            id: `al-${Math.random().toString(36).slice(2, 7)}`,
            kind: f.severity === "critical" ? "critical" : "high",
            title: `${f.severity[0].toUpperCase()}${f.severity.slice(1)} finding on ${f.asset}`,
            meta: `${id} · created just now`,
            findingId: id,
            read: false,
            at: "just now",
          },
          ...prev,
        ]);
      }
      toast(`${id} created and saved.`);
    },
    [findings, closed, toast]
  );

  const updateFinding = useCallback(
    (findingId: string, patch: Partial<Finding>) => {
      setFindings((prev) => prev.map((x) => (x.id === findingId ? { ...x, ...patch } : x)));
      toast(`${findingId} updated.`);
    },
    [toast]
  );

  const deleteFinding = useCallback(
    (findingId: string) => {
      const f = findings.find((x) => x.id === findingId);
      setFindings((prev) => prev.filter((x) => x.id !== findingId));
      setBoard((prev) => prev.map((col) => ({ ...col, ids: col.ids.filter((id) => id !== findingId) })));
      setComments((prev) => prev.filter((c) => c.findingId !== findingId));
      setClosed((prev) => prev.filter((c) => c.id !== findingId));
      if (f) {
        setAssets((prev) =>
          prev.map((a) =>
            a.host === f.asset ? { ...a, findings: Math.max(0, (a.findings || 0) - 1) } : a
          )
        );
      }
      setFeed((prev) => [
        { kind: "", title: `${findingId} deleted`, meta: nowLabel() },
        ...prev,
      ]);
      toast(`${findingId} deleted.`);
    },
    [findings, toast]
  );

  const createAsset = useCallback(
    (input: Partial<Asset> & { host: string }) => {
      const host = input.host.trim();
      if (!host) return;
      if (assets.some((a) => a.host === host)) {
        toast("Asset host already exists.", "warn");
        return;
      }
      const row: Asset = {
        host,
        type: input.type || "Subdomain",
        src: input.src || "Manual",
        tech: input.tech || "—",
        ports: input.ports || "443",
        status: input.status || "unscanned",
        risk: input.risk || "—",
        seen: "just now",
        findings: input.findings ?? 0,
      };
      setAssets((prev) => [row, ...prev]);
      setFeed((prev) => [
        { kind: "", title: `Asset added: ${host}`, meta: `${row.type} · ${nowLabel()}` },
        ...prev,
      ]);
      toast(`Asset ${host} saved.`);
    },
    [assets, toast]
  );

  const updateAsset = useCallback(
    (host: string, patch: Partial<Asset>) => {
      setAssets((prev) => prev.map((a) => (a.host === host ? { ...a, ...patch, host: patch.host || a.host } : a)));
      toast(`Asset ${host} updated.`);
    },
    [toast]
  );

  const deleteAsset = useCallback(
    (host: string) => {
      setAssets((prev) => prev.filter((a) => a.host !== host));
      setFeed((prev) => [
        { kind: "", title: `Asset deleted: ${host}`, meta: nowLabel() },
        ...prev,
      ]);
      toast(`Asset ${host} deleted.`);
    },
    [toast]
  );

  const resetToSeed = useCallback(async () => {
    skipPersist.current = true;
    await resetStoreFile();
    const store = await saveStore(buildInitialStore());
    hydrate(store);
    skipPersist.current = false;
    toast("Store reset to seed data.");
  }, [hydrate, toast]);

  const value = useMemo(
    () => ({
      ready,
      persistError,
      findings,
      assets,
      board,
      closed,
      feed,
      alerts,
      comments,
      quotaHoursLeft,
      modal,
      modalArg,
      toasts,
      company,
      companies: PORTFOLIO_COMPANIES,
      setCompany,
      openModal,
      closeModal,
      toast,
      requestValidation,
      markFixedRequestRetest,
      moveFinding,
      verifyAndClose,
      requestKevValidation,
      assignFinding,
      markAlertRead,
      markAllAlertsRead,
      addFindingComment,
      deleteFindingComment,
      createFinding,
      updateFinding,
      deleteFinding,
      createAsset,
      updateAsset,
      deleteAsset,
      resetToSeed,
    }),
    [
      ready,
      persistError,
      findings,
      assets,
      board,
      closed,
      feed,
      alerts,
      comments,
      quotaHoursLeft,
      modal,
      modalArg,
      toasts,
      company,
      setCompany,
      openModal,
      closeModal,
      toast,
      requestValidation,
      markFixedRequestRetest,
      moveFinding,
      verifyAndClose,
      requestKevValidation,
      assignFinding,
      markAlertRead,
      markAllAlertsRead,
      addFindingComment,
      deleteFindingComment,
      createFinding,
      updateFinding,
      deleteFinding,
      createAsset,
      updateAsset,
      deleteAsset,
      resetToSeed,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
