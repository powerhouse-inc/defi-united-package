import type { PledgeStatus } from "../../../document-models/pledge/v1/gen/types.js";

export const STATUS_LABEL: Record<PledgeStatus, string> = {
  PROPOSED: "Proposed",
  GOVERNANCE_PENDING: "Governance pending",
  CONFIRMED: "Confirmed",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

export const STATUS_PILL_CLASS: Record<PledgeStatus, string> = {
  PROPOSED: "pledge-status--proposed",
  GOVERNANCE_PENDING: "pledge-status--pending",
  CONFIRMED: "pledge-status--confirmed",
  RECEIVED: "pledge-status--received",
  CANCELLED: "pledge-status--cancelled",
  FAILED: "pledge-status--failed",
};

export type PledgeAction =
  | "proposePledge"
  | "attachGovernance"
  | "markGovernancePending"
  | "markConfirmed"
  | "markReceived"
  | "cancelPledge"
  | "failPledge";

/** Which actions are valid given the current status. */
export function allowedActions(status: PledgeStatus): Set<PledgeAction> {
  switch (status) {
    case "PROPOSED":
      return new Set([
        "proposePledge",
        "attachGovernance",
        "markGovernancePending",
        "markConfirmed",
        "cancelPledge",
        "failPledge",
      ]);
    case "GOVERNANCE_PENDING":
      return new Set([
        "attachGovernance",
        "markConfirmed",
        "cancelPledge",
        "failPledge",
      ]);
    case "CONFIRMED":
      return new Set([
        "attachGovernance",
        "markReceived",
        "cancelPledge",
        "failPledge",
      ]);
    case "RECEIVED":
      return new Set(["markReceived"]);
    case "CANCELLED":
    case "FAILED":
      return new Set();
  }
}

export function truncatePhid(phid: string | null | undefined): string {
  if (!phid) return "—";
  if (phid.length <= 14) return phid;
  return `${phid.slice(0, 8)}…${phid.slice(-4)}`;
}
