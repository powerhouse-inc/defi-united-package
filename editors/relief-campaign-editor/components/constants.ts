import type { CampaignStatus } from "../../../document-models/relief-campaign/v1/gen/schema/types.js";

export const STATUS_BADGE: Record<CampaignStatus, { bg: string; fg: string }> =
  {
    DRAFT: { bg: "bg-neutral-100", fg: "text-neutral-700" },
    ACTIVE: { bg: "bg-emerald-50", fg: "text-emerald-700" },
    EXECUTING: { bg: "bg-amber-50", fg: "text-amber-700" },
    RESOLVED: { bg: "bg-sky-50", fg: "text-sky-700" },
    FAILED: { bg: "bg-rose-50", fg: "text-rose-700" },
    ARCHIVED: { bg: "bg-neutral-100", fg: "text-neutral-500" },
  };

export const STATUS_LABEL: Record<CampaignStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  EXECUTING: "Executing",
  RESOLVED: "Resolved",
  FAILED: "Failed",
  ARCHIVED: "Archived",
};

/** Allowed lifecycle transitions, mirroring the reducer rules. */
export const CAN_START: CampaignStatus[] = ["DRAFT"];
export const CAN_RESOLVE: CampaignStatus[] = ["ACTIVE", "EXECUTING"];
export const CAN_FAIL: CampaignStatus[] = ["DRAFT", "ACTIVE", "EXECUTING"];
export const CAN_ARCHIVE: CampaignStatus[] = ["RESOLVED", "FAILED"];
