import type {
  DistributionStatus,
  RecipientStatus,
} from "../../../document-models/distribution-plan/v1/gen/schema/types.js";

export const PLAN_STATUS_BADGE: Record<
  DistributionStatus,
  { bg: string; fg: string }
> = {
  DRAFT: { bg: "bg-neutral-100", fg: "text-neutral-700" },
  APPROVED: { bg: "bg-sky-50", fg: "text-sky-700" },
  EXECUTING: { bg: "bg-amber-50", fg: "text-amber-700" },
  COMPLETED: { bg: "bg-emerald-50", fg: "text-emerald-700" },
  CANCELLED: { bg: "bg-rose-50", fg: "text-rose-700" },
};

export const PLAN_STATUS_LABEL: Record<DistributionStatus, string> = {
  DRAFT: "Draft",
  APPROVED: "Approved",
  EXECUTING: "Executing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const RECIPIENT_STATUS_BADGE: Record<
  RecipientStatus,
  { bg: string; fg: string }
> = {
  PLANNED: { bg: "bg-neutral-100", fg: "text-neutral-700" },
  SENT: { bg: "bg-emerald-50", fg: "text-emerald-700" },
  FAILED: { bg: "bg-rose-50", fg: "text-rose-700" },
  REFUNDED: { bg: "bg-amber-50", fg: "text-amber-700" },
};

export const RECIPIENT_STATUS_LABEL: Record<RecipientStatus, string> = {
  PLANNED: "Planned",
  SENT: "Sent",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

/** Plan statuses where editing recipients (add/update/remove) is allowed. */
export const CAN_EDIT_RECIPIENTS: DistributionStatus[] = ["DRAFT"];

/** Plan statuses where per-recipient on-chain status mutations are allowed. */
export const CAN_MUTATE_RECIPIENT_STATUS: DistributionStatus[] = [
  "APPROVED",
  "EXECUTING",
];

/** Plan statuses considered terminal (no further state transitions). */
export const TERMINAL_PLAN_STATUSES: DistributionStatus[] = [
  "COMPLETED",
  "CANCELLED",
];

export function formatTokens(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value === 0) return "0";
  if (value >= 100) return value.toFixed(0);
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

export function truncateId(id: string, head = 6, tail = 4): string {
  if (!id) return "—";
  if (id.length <= head + tail + 3) return id;
  return `${id.slice(0, head)}…${id.slice(-tail)}`;
}

export function truncateAddress(addr: string | null | undefined): string {
  if (!addr) return "—";
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}
