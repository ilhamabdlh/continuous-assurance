import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEMO } from "../data/demo";
import type {
  BoardColumn,
  ClosedFinding,
  Finding,
  ModalKind,
  Toast,
} from "../types";

interface AppState {
  findings: Finding[];
  board: { key: BoardColumn; ids: string[] }[];
  closed: ClosedFinding[];
  feed: { kind: string; title: string; meta: string }[];
  quotaHoursLeft: number;
  modal: ModalKind;
  modalArg?: string;
  toasts: Toast[];
  openModal: (kind: ModalKind, arg?: string) => void;
  closeModal: () => void;
  toast: (message: string, tone?: Toast["tone"]) => void;
  requestValidation: (findingId: string) => void;
  markFixedRequestRetest: (findingId: string) => void;
  moveFinding: (findingId: string, to: BoardColumn) => void;
  verifyAndClose: (findingId: string) => void;
  requestKevValidation: (findingId: string) => void;
  assignFinding: (findingId: string, owner: string) => void;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [findings, setFindings] = useState(DEMO.findings.map((f) => ({ ...f })));
  const [board, setBoard] = useState(
    DEMO.board.map((c) => ({ ...c, ids: [...c.ids] }))
  );
  const [closed, setClosed] = useState(DEMO.closed.map((c) => ({ ...c })));
  const [feed, setFeed] = useState([...DEMO.verificationFeed]);
  const [quotaHoursLeft, setQuota] = useState(84);
  const [modal, setModal] = useState<ModalKind>(null);
  const [modalArg, setModalArg] = useState<string | undefined>();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, tone: Toast["tone"] = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

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
        ids: col.key === to
          ? col.ids.includes(findingId)
            ? col.ids
            : [...col.ids, findingId]
          : col.ids.filter((id) => id !== findingId),
      }))
    );
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
          x.id === findingId
            ? { ...x, status: "Awaiting verification" }
            : x
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
      const certId = `ACV-${findingId.replace("CA-", "")}-NWL`;
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
        prev.map((x) =>
          x.id === findingId
            ? { ...x, owner, status: "Assigned" }
            : x
        )
      );
      moveFinding(findingId, "Assigned");
      toast(`${findingId} assigned to ${owner}.`);
    },
    [moveFinding, toast]
  );

  const value = useMemo(
    () => ({
      findings,
      board,
      closed,
      feed,
      quotaHoursLeft,
      modal,
      modalArg,
      toasts,
      openModal,
      closeModal,
      toast,
      requestValidation,
      markFixedRequestRetest,
      moveFinding,
      verifyAndClose,
      requestKevValidation,
      assignFinding,
    }),
    [
      findings,
      board,
      closed,
      feed,
      quotaHoursLeft,
      modal,
      modalArg,
      toasts,
      openModal,
      closeModal,
      toast,
      requestValidation,
      markFixedRequestRetest,
      moveFinding,
      verifyAndClose,
      requestKevValidation,
      assignFinding,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
