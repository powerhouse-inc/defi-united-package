import type { PledgeDocument } from "../../../document-models/pledge/v1/gen/types.js";
import type { OnchainReceiptDocument } from "../../../document-models/onchain-receipt/v1/gen/types.js";
import type { StatusUpdateDocument } from "../../../document-models/status-update/v1/gen/types.js";
import type { ContributorProfileDocument } from "../../../document-models/contributor-profile/v1/gen/types.js";

export type ActivityKind = "PLEDGE" | "RECEIPT" | "UPDATE";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  at: string;
  atMs: number;
  headline: string;
  subline?: string;
  docId: string;
  docKind: "pledge" | "receipt" | "status-update";
}

export interface DeriveActivityInput {
  pledges: PledgeDocument[];
  receipts: OnchainReceiptDocument[];
  statusUpdates: StatusUpdateDocument[];
  contributorProfiles: ContributorProfileDocument[];
  limit?: number;
}

function profileName(
  profiles: ContributorProfileDocument[],
  id: string | null | undefined,
): string {
  if (!id) return "Unknown";
  const p = profiles.find((p) => p.header.id === id);
  return p?.state.global.displayName ?? "Unknown";
}

export function deriveActivity(input: DeriveActivityInput): ActivityEvent[] {
  const {
    pledges,
    receipts,
    statusUpdates,
    contributorProfiles,
    limit = 10,
  } = input;
  const events: ActivityEvent[] = [];

  for (const p of pledges) {
    const at = p.header.lastModifiedAtUtcIso;
    if (!at) continue;
    const name = profileName(
      contributorProfiles,
      p.state.global.contributorProfileId,
    );
    events.push({
      id: `pledge:${p.header.id}:${at}`,
      kind: "PLEDGE",
      at,
      atMs: new Date(at).getTime(),
      headline: `${name} pledge — ${p.state.global.status}`,
      subline:
        p.state.global.pledgedAmount != null
          ? `${p.state.global.pledgedAmount} ${p.state.global.asset?.symbol ?? "ETH"}`
          : undefined,
      docId: p.header.id,
      docKind: "pledge",
    });
  }

  for (const r of receipts) {
    const at = r.header.lastModifiedAtUtcIso;
    if (!at) continue;
    const from = r.state.global.fromAddress ?? "0x?";
    const short =
      from.length >= 10 ? from.slice(0, 6) + "…" + from.slice(-4) : from;
    const symbol = r.state.global.asset?.symbol ?? "";
    const amt = r.state.global.amount != null ? String(r.state.global.amount) : "?";
    events.push({
      id: `receipt:${r.header.id}:${at}`,
      kind: "RECEIPT",
      at,
      atMs: new Date(at).getTime(),
      headline: `${amt} ${symbol} from ${short}`,
      docId: r.header.id,
      docKind: "receipt",
    });
  }

  for (const u of statusUpdates) {
    const at = u.header.lastModifiedAtUtcIso;
    if (!at) continue;
    events.push({
      id: `update:${u.header.id}:${at}`,
      kind: "UPDATE",
      at,
      atMs: new Date(at).getTime(),
      headline: `"${u.state.global.title ?? "Untitled"}" ${u.state.global.publishedAt ? "published" : "drafted"}`,
      docId: u.header.id,
      docKind: "status-update",
    });
  }

  return events.sort((a, b) => b.atMs - a.atMs).slice(0, limit);
}
