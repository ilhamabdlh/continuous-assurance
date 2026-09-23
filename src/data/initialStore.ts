import { DEMO } from "./demo";
import { DEFAULT_COMPANY } from "./companies";
import { SEED_ALERTS, SEED_COMMENTS } from "./engagement";
import type {
  AlertItem,
  Asset,
  BoardColumn,
  ClosedFinding,
  Finding,
  FindingComment,
} from "../types";

export interface JsonStore {
  version: number;
  updatedAt: string;
  companyName: string;
  quotaHoursLeft: number;
  findings: Finding[];
  board: { key: BoardColumn; ids: string[] }[];
  closed: ClosedFinding[];
  feed: { kind: string; title: string; meta: string }[];
  alerts: AlertItem[];
  comments: FindingComment[];
  assets: Asset[];
}

export function buildInitialStore(): JsonStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    companyName: DEFAULT_COMPANY.name,
    quotaHoursLeft: 84,
    findings: DEMO.findings.map((f) => ({ ...f })),
    board: DEMO.board.map((c) => ({ ...c, ids: [...c.ids] })),
    closed: DEMO.closed.map((c) => ({ ...c })),
    feed: [...DEMO.verificationFeed],
    alerts: SEED_ALERTS.map((a) => ({ ...a })),
    comments: SEED_COMMENTS.map((c) => ({ ...c })),
    assets: DEMO.assets.map((a) => ({ ...a })),
  };
}
