import type { AlertItem, FindingComment } from "../types";

/** Seed critical/high alerts for the topbar inbox (demo). */
export const SEED_ALERTS: AlertItem[] = [
  {
    id: "al-1",
    kind: "critical",
    title: "Critical finding on vpn.northwindlog.com",
    meta: "Fortinet exposure · human validation pending · just now",
    findingId: "ATC-2026-0002",
    read: false,
    at: "just now",
  },
  {
    id: "al-2",
    kind: "kev",
    title: "KEV match queued for remote.northwindlog.com",
    meta: "Pulse Secure fingerprint · SLA < 24h · 6 hours ago",
    findingId: "ATC-2026-0015",
    read: false,
    at: "6 hours ago",
  },
  {
    id: "al-3",
    kind: "high",
    title: "High finding escalated after validation",
    meta: "Matthew C. · ATC-2026-0001 · 5 hours ago",
    findingId: "ATC-2026-0001",
    read: true,
    at: "5 hours ago",
  },
  {
    id: "al-4",
    kind: "info",
    title: "Email alert sent to security@northwindlog.com",
    meta: "Critical / High digest · demo channel · yesterday",
    read: true,
    at: "yesterday",
  },
];

export const SEED_COMMENTS: FindingComment[] = [
  {
    id: "c-1",
    findingId: "ATC-2026-0001",
    author: "Ilham A.",
    role: "client",
    body: "We think this is on a decommissioned WP Engine account — confirming with DNS owners today.",
    at: "10 Sep 2026, 09:40",
  },
  {
    id: "c-2",
    findingId: "ATC-2026-0001",
    author: "Matthew C.",
    role: "validator",
    body: "Confirmed takeover is still reproducible. Please reclaim or remove the CNAME before we retest.",
    at: "10 Sep 2026, 11:05",
  },
  {
    id: "c-3",
    findingId: "ATC-2026-0002",
    author: "Platform team",
    role: "client",
    body: "Patch window is Friday 22:00 UTC. Can we schedule retest for Saturday morning?",
    at: "11 Sep 2026, 14:20",
  },
];
