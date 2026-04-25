import type {
  DependencyKind,
  DependencyStatus,
} from "../../../document-models/external-dependency/v1/gen/types.js";

export const STATUS_OPTIONS: DependencyStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "BLOCKED",
  "ABANDONED",
];

export const KIND_OPTIONS: DependencyKind[] = [
  "GOVERNANCE_VOTE",
  "COUNCIL_ACTION",
  "ONCHAIN_TX",
  "OPERATIONAL",
  "OTHER",
];

export const STATUS_LABEL: Record<DependencyStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  BLOCKED: "Blocked",
  ABANDONED: "Abandoned",
};

export const STATUS_BADGE_CLASS: Record<DependencyStatus, string> = {
  OPEN: "bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300",
  IN_PROGRESS: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300",
  RESOLVED:
    "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-300",
  BLOCKED: "bg-red-100 text-red-800 ring-1 ring-inset ring-red-300",
  ABANDONED: "bg-zinc-100 text-zinc-500 ring-1 ring-inset ring-zinc-300",
};

export const KIND_LABEL: Record<DependencyKind, string> = {
  GOVERNANCE_VOTE: "Governance vote",
  COUNCIL_ACTION: "Council action",
  ONCHAIN_TX: "On-chain tx",
  OPERATIONAL: "Operational",
  OTHER: "Other",
};

export const KIND_BADGE_CLASS: Record<DependencyKind, string> = {
  GOVERNANCE_VOTE:
    "bg-indigo-100 text-indigo-800 ring-1 ring-inset ring-indigo-300",
  COUNCIL_ACTION:
    "bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-300",
  ONCHAIN_TX: "bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-300",
  OPERATIONAL: "bg-teal-100 text-teal-800 ring-1 ring-inset ring-teal-300",
  OTHER: "bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-300",
};
