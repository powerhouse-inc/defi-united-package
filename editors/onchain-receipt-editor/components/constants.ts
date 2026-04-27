import type { ReconciliationStatus } from "../../../document-models/onchain-receipt/v1/gen/schema/types.js";

export const STATUS_BADGE: Record<
  ReconciliationStatus,
  { bg: string; fg: string; ring: string }
> = {
  UNMATCHED: {
    bg: "bg-neutral-100",
    fg: "text-neutral-700",
    ring: "ring-neutral-200",
  },
  MATCHED: {
    bg: "bg-emerald-50",
    fg: "text-emerald-700",
    ring: "ring-emerald-200",
  },
  AMBIGUOUS: {
    bg: "bg-amber-50",
    fg: "text-amber-800",
    ring: "ring-amber-200",
  },
  MANUALLY_OVERRIDDEN: {
    bg: "bg-sky-50",
    fg: "text-sky-700",
    ring: "ring-sky-200",
  },
  REORGED: {
    bg: "bg-purple-50",
    fg: "text-purple-700",
    ring: "ring-purple-200",
  },
};

export const STATUS_LABEL: Record<ReconciliationStatus, string> = {
  UNMATCHED: "Unmatched",
  MATCHED: "Matched",
  AMBIGUOUS: "Ambiguous",
  MANUALLY_OVERRIDDEN: "Manually overridden",
  REORGED: "Reorged",
};

/** Truncate an address-like string to a short form. */
export function truncate(
  value: string | null | undefined,
  lead = 6,
  tail = 4,
): string {
  if (!value) return "—";
  if (value.length <= lead + tail + 1) return value;
  return `${value.slice(0, lead)}…${value.slice(-tail)}`;
}

/** Format an Amount_Tokens value. */
export function formatTokens(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value === 0) return "0";
  if (value >= 100) return value.toFixed(2);
  if (value >= 1) return value.toFixed(4);
  return value.toFixed(6);
}

export function formatTimestamp(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function etherscanUrl(txHash: string | null | undefined): string | null {
  if (!txHash) return null;
  return `https://etherscan.io/tx/${txHash}`;
}
