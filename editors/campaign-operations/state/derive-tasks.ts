import type { PledgeDocument } from "../../../document-models/pledge/v1/gen/types.js";
import type { OnchainReceiptDocument } from "../../../document-models/onchain-receipt/v1/gen/types.js";
import type { ExternalDependencyDocument } from "../../../document-models/external-dependency/v1/gen/types.js";
import type { StatusUpdateDocument } from "../../../document-models/status-update/v1/gen/types.js";
import type { ContributorProfileDocument } from "../../../document-models/contributor-profile/v1/gen/types.js";

export type TaskKind =
  | "VOTE_ENDED"
  | "MISSING_GOVERNANCE"
  | "CONFIRMED_NO_RECEIPT"
  | "RECEIPT_UNATTRIBUTED"
  | "DEP_OVERDUE"
  | "NO_RECENT_UPDATE";

export interface Task {
  id: string;
  kind: TaskKind;
  urgencyMs: number;
  headline: string;
  subline?: string;
  pledgeId?: string;
  receiptId?: string;
  dependencyId?: string;
  primary?: {
    label: string;
    actionType:
      | "STATUS_DROPDOWN"
      | "GOVERNANCE_POPOVER"
      | "PLEDGE_PICKER"
      | "STATUS_UPDATE_CREATE"
      | "OPEN_IN_RIGHT_PANE";
  };
}

export interface DeriveTasksInput {
  now: number;
  pledges: PledgeDocument[];
  receipts: OnchainReceiptDocument[];
  dependencies: ExternalDependencyDocument[];
  statusUpdates: StatusUpdateDocument[];
  contributorProfiles: ContributorProfileDocument[];
  campaignStatus: string;
}

const DAY = 24 * 3600 * 1000;

function profileName(
  profiles: ContributorProfileDocument[],
  id: string | null | undefined,
): string {
  if (!id) return "Unknown";
  const p = profiles.find((p) => p.header.id === id);
  return p?.state.global.displayName ?? "Unknown";
}

function daysAgo(now: number, iso: string): number {
  return Math.floor((now - new Date(iso).getTime()) / DAY);
}

export function deriveTasks(input: DeriveTasksInput): Task[] {
  const {
    now,
    pledges,
    receipts,
    dependencies,
    statusUpdates,
    contributorProfiles,
    campaignStatus,
  } = input;
  const tasks: Task[] = [];

  for (const p of pledges) {
    const g = p.state.global;
    if (g.status === "GOVERNANCE_PENDING" && g.governance?.voteEndDate) {
      const end = new Date(g.governance.voteEndDate).getTime();
      if (end < now) {
        const days = daysAgo(now, g.governance.voteEndDate);
        const name = profileName(contributorProfiles, g.contributorProfileId);
        tasks.push({
          id: `vote-ended:${p.header.id}`,
          kind: "VOTE_ENDED",
          urgencyMs: now - end,
          headline: `${name} vote ended ${days}d ago — confirm?`,
          pledgeId: p.header.id,
          primary: { label: "Confirm / Fail", actionType: "STATUS_DROPDOWN" },
        });
      }
    }
  }

  for (const p of pledges) {
    const g = p.state.global;
    const lastMod = p.header.lastModifiedAtUtcIso;
    if (g.status === "PROPOSED" && !g.governance && lastMod) {
      const ageMs = now - new Date(lastMod).getTime();
      if (ageMs > DAY) {
        const name = profileName(contributorProfiles, g.contributorProfileId);
        tasks.push({
          id: `missing-gov:${p.header.id}`,
          kind: "MISSING_GOVERNANCE",
          urgencyMs: ageMs,
          headline: `${name} pledge has no governance link yet`,
          pledgeId: p.header.id,
          primary: { label: "Attach governance", actionType: "GOVERNANCE_POPOVER" },
        });
      }
    }
  }

  for (const p of pledges) {
    const g = p.state.global;
    const lastMod = p.header.lastModifiedAtUtcIso;
    if (
      g.status === "CONFIRMED" &&
      (g.receiptIds?.length ?? 0) === 0 &&
      lastMod
    ) {
      const ageMs = now - new Date(lastMod).getTime();
      if (ageMs > 7 * DAY) {
        const days = Math.floor(ageMs / DAY);
        const name = profileName(contributorProfiles, g.contributorProfileId);
        tasks.push({
          id: `confirmed-no-receipt:${p.header.id}`,
          kind: "CONFIRMED_NO_RECEIPT",
          urgencyMs: ageMs - 7 * DAY,
          headline: `${name} confirmed ${days}d ago, no receipt yet`,
          pledgeId: p.header.id,
          primary: { label: "Open pledge", actionType: "OPEN_IN_RIGHT_PANE" },
        });
      }
    }
  }

  for (const r of receipts) {
    const status = r.state.global.reconciliationStatus as string;
    if (status === "UNMATCHED" || status === "UNATTRIBUTED") {
      const from = r.state.global.fromAddress ?? "0x?";
      const short =
        from.length >= 10 ? from.slice(0, 6) + "…" + from.slice(-4) : from;
      const symbol = r.state.global.asset?.symbol ?? "";
      const amt = r.state.global.amount != null ? String(r.state.global.amount) : "?";
      tasks.push({
        id: `receipt-unattrib:${r.header.id}`,
        kind: "RECEIPT_UNATTRIBUTED",
        urgencyMs: 1,
        headline: `${amt} ${symbol} from ${short} not attributed`,
        receiptId: r.header.id,
        primary: { label: "Attribute to pledge", actionType: "PLEDGE_PICKER" },
      });
    }
  }

  for (const d of dependencies) {
    const g = d.state.global;
    if (
      (g.status === "OPEN" || g.status === "IN_PROGRESS") &&
      g.expectedResolution &&
      new Date(g.expectedResolution).getTime() < now
    ) {
      const days = daysAgo(now, g.expectedResolution);
      tasks.push({
        id: `dep-overdue:${d.header.id}`,
        kind: "DEP_OVERDUE",
        urgencyMs: now - new Date(g.expectedResolution).getTime(),
        headline: `${g.title} overdue by ${days}d`,
        dependencyId: d.header.id,
        primary: { label: "Update status", actionType: "STATUS_DROPDOWN" },
      });
    }
  }

  if (campaignStatus === "ACTIVE") {
    const lastPub = statusUpdates
      .map((u) => u.state.global.publishedAt)
      .filter((p): p is string => !!p)
      .sort()
      .reverse()[0];
    const ageMs = lastPub
      ? now - new Date(lastPub).getTime()
      : Infinity;
    if (ageMs > 7 * DAY) {
      const days = Number.isFinite(ageMs) ? Math.floor(ageMs / DAY) : null;
      tasks.push({
        id: "no-recent-update:campaign",
        kind: "NO_RECENT_UPDATE",
        urgencyMs: Number.isFinite(ageMs) ? ageMs : 999 * DAY,
        headline:
          days !== null
            ? `No public update in ${days}d — publish progress?`
            : "No public update yet — publish first one?",
        primary: {
          label: "+ Status update",
          actionType: "STATUS_UPDATE_CREATE",
        },
      });
    }
  }

  return tasks.sort((a, b) => b.urgencyMs - a.urgencyMs);
}
