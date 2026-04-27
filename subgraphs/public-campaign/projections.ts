import type { ReliefCampaignDocument } from "../../document-models/relief-campaign/v1/gen/types.js";
import type { PledgeDocument } from "../../document-models/pledge/v1/gen/types.js";
import type { ContributorProfileDocument } from "../../document-models/contributor-profile/v1/gen/types.js";
import type { ExternalDependencyDocument } from "../../document-models/external-dependency/v1/gen/types.js";
import type { OnchainReceiptDocument } from "../../document-models/onchain-receipt/v1/gen/types.js";
import type { StatusUpdateDocument } from "../../document-models/status-update/v1/gen/types.js";

export interface CampaignBundle {
  campaign: ReliefCampaignDocument;
  pledges: PledgeDocument[];
  receipts: OnchainReceiptDocument[];
  dependencies: ExternalDependencyDocument[];
  statusUpdates: StatusUpdateDocument[];
  contributorProfilesById: Map<string, ContributorProfileDocument>;
  driveId: string;
  lastUpdateAt: string | null;
}

const num = (v: number | string | null | undefined): number => {
  if (v === null || v === undefined) return 0;
  return typeof v === "number" ? v : Number(v);
};

const str = (v: number | string | null | undefined): string =>
  v === null || v === undefined ? "0" : String(v);

export interface PublicCampaign {
  slug: string;
  name: string;
  summary: string | null;
  status: string;
  incidentDate: string | null;
  targetAmount: string | null;
  totalPledged: string;
  totalReceived: string;
  percentReceived: number;
  pledgeCount: number;
  dependenciesBlocking: number;
  dependenciesResolved: number;
  contributionAddresses: Array<{
    chainId: number;
    address: string;
    label: string | null;
  }>;
  contributorsPublic: PublicPledge[];
  dependenciesPublic: PublicDependency[];
  recentUpdates: PublicStatusUpdate[];
  recentReceipts: PublicReceiptEntry[];
  recentOnchainTransfers: PublicReceiptEntry[];
  onchainLiveBalance: OnchainLiveBalance | null;
  pendingReceiptsEthEquivalent: string | null;
  riskDisclaimer: string | null;
  externalLinks: Array<{ label: string; url: string }>;
  affectedAsset: {
    symbol: string;
    address: string | null;
    chainId: number;
  } | null;
  lastUpdateAt: string | null;
}

export interface PublicReceiptEntry {
  id: string;
  txHash: string;
  blockNumber: number;
  blockTimestamp: string;
  fromAddress: string;
  /** Reverse-resolved ENS primary name for `fromAddress`, if any. */
  fromEnsName: string | null;
  toAddress: string;
  assetSymbol: string;
  assetContractAddress: string | null;
  amount: string;
  ethEquivalentAmount: string;
  ethPriceUsdAtReceipt: number;
  reconciliationStatus: string;
  matchedPledgeId: string | null;
}

export interface OnchainLiveBalance {
  totalEthEquivalent: string;
  perAsset: Array<{
    symbol: string;
    contractAddress: string | null;
    rawBalance: string;
    formattedAmount: string;
    ethEquivalent: string;
  }>;
  fetchedAt: string;
  ethPriceUsd: number;
}

export interface PublicPledge {
  contributorDisplayName: string;
  contributorTrustLevel: string;
  contributorWebsiteUrl: string | null;
  contributorTwitter: string | null;
  pledgedAmount: string;
  receivedAmount: string | null;
  assetSymbol: string;
  status: string;
  governanceProposalUrl: string | null;
  governancePlatform: string | null;
  publicNotes: string | null;
}

export interface PublicDependency {
  title: string;
  description: string | null;
  kind: string;
  status: string;
  externalRefUrl: string | null;
  externalRefProposalId: string | null;
  expectedResolution: string | null;
}

export interface PublicStatusUpdate {
  id: string;
  publishedAt: string;
  title: string;
  body: string;
  metricsTotalPledged: string | null;
  metricsTotalReceived: string | null;
  externalAnnouncements: Array<{ platform: string; url: string }>;
}

const ANON_DISPLAY = "Anonymous Contributor";

export function projectCampaign(
  bundle: CampaignBundle,
  liveBalance: OnchainLiveBalance | null = null,
  recentOnchainTransfers: PublicReceiptEntry[] = [],
): PublicCampaign {
  const c = bundle.campaign.state.global;

  let totalPledgedNum = 0;
  for (const pledge of bundle.pledges) {
    const ps = pledge.state.global;
    if (ps.status !== "CANCELLED" && ps.status !== "FAILED") {
      totalPledgedNum += num(ps.pledgedAmount);
    }
  }

  // totalReceived = sum of receipt.ethEquivalentAmount across non-REORGED
  // on-chain receipts. Document-derived audit trail.
  let totalReceivedNum = 0;
  for (const r of bundle.receipts) {
    const rs = r.state.global;
    if (rs.reconciliationStatus === "REORGED") continue;
    totalReceivedNum += num(rs.ethEquivalentAmount);
  }

  const targetNum = num(c.targetAmount);
  const percentReceived =
    targetNum > 0
      ? Math.round((totalReceivedNum / targetNum) * 10000) / 100
      : 0;

  const contributorsPublic = bundle.pledges
    .filter((p) => p.state.global.status !== "CANCELLED")
    .map((p): PublicPledge => {
      const ps = p.state.global;
      const profile = ps.contributorProfileId
        ? bundle.contributorProfilesById.get(ps.contributorProfileId)
        : undefined;
      const cp = profile?.state.global;
      const trust = cp?.trustLevel ?? "ANONYMOUS";
      const display =
        trust === "ANONYMOUS"
          ? ANON_DISPLAY
          : (cp?.displayName ?? ANON_DISPLAY);
      return {
        contributorDisplayName: display,
        contributorTrustLevel: trust,
        contributorWebsiteUrl:
          trust === "ANONYMOUS" ? null : (cp?.websiteUrl ?? null),
        contributorTwitter:
          trust === "ANONYMOUS" ? null : (cp?.twitterHandle ?? null),
        pledgedAmount: str(ps.pledgedAmount),
        receivedAmount: ps.receivedAmount ? str(ps.receivedAmount) : null,
        assetSymbol: ps.asset?.symbol ?? "ETH",
        status: ps.status,
        governanceProposalUrl: ps.governance?.proposalUrl ?? null,
        governancePlatform: ps.governance?.platform ?? null,
        publicNotes: ps.publicNotes ?? null,
      };
    });

  const dependenciesPublic = bundle.dependencies.map((d): PublicDependency => {
    const ds = d.state.global;
    return {
      title: ds.title,
      description: ds.description ?? null,
      kind: ds.kind,
      status: ds.status,
      externalRefUrl: ds.externalRef?.url ?? null,
      externalRefProposalId: ds.externalRef?.proposalId ?? null,
      expectedResolution: ds.expectedResolution ?? null,
    };
  });

  const dependenciesBlocking = bundle.dependencies.filter(
    (d) =>
      d.state.global.status === "OPEN" ||
      d.state.global.status === "IN_PROGRESS" ||
      d.state.global.status === "BLOCKED",
  ).length;
  const dependenciesResolved = bundle.dependencies.filter(
    (d) => d.state.global.status === "RESOLVED",
  ).length;

  const recentUpdates = bundle.statusUpdates
    .filter(
      (u) =>
        u.state.global.publishedAt && u.state.global.visibility === "PUBLIC",
    )
    .sort((a, b) =>
      (b.state.global.publishedAt ?? "").localeCompare(
        a.state.global.publishedAt ?? "",
      ),
    )
    .slice(0, 10)
    .map((u): PublicStatusUpdate => {
      const us = u.state.global;
      return {
        id: u.header.id,
        publishedAt: us.publishedAt!,
        title: us.title,
        body: us.body,
        metricsTotalPledged: us.metricsSnapshot?.totalPledged
          ? str(us.metricsSnapshot.totalPledged)
          : null,
        metricsTotalReceived: us.metricsSnapshot?.totalReceived
          ? str(us.metricsSnapshot.totalReceived)
          : null,
        externalAnnouncements: us.externalAnnouncements.map((e) => ({
          platform: e.platform,
          url: e.url,
        })),
      };
    });

  // Newest-first feed of on-chain receipts (capped to a sane default; the
  // resolver further trims by `limit` argument).
  const recentReceipts: PublicReceiptEntry[] = bundle.receipts
    .filter((r) => !!r.state.global.txHash)
    .sort(
      (a, b) =>
        (b.state.global.blockNumber ?? 0) - (a.state.global.blockNumber ?? 0),
    )
    .slice(0, 100)
    .map((r): PublicReceiptEntry => {
      const rs = r.state.global;
      return {
        id: r.header.id,
        txHash: rs.txHash ?? "",
        blockNumber: rs.blockNumber ?? 0,
        blockTimestamp: rs.blockTimestamp ?? "",
        fromAddress: rs.fromAddress ?? "",
        // Document-derived receipts don't carry ENS; the live overlay
        // resolves it for the on-chain feed only.
        fromEnsName: null,
        toAddress: rs.toAddress ?? "",
        assetSymbol: rs.asset?.symbol ?? "ETH",
        assetContractAddress: rs.asset?.contractAddress ?? null,
        amount: str(rs.amount),
        ethEquivalentAmount: str(rs.ethEquivalentAmount),
        ethPriceUsdAtReceipt: rs.ethPriceUsdAtReceipt ?? 0,
        reconciliationStatus: rs.reconciliationStatus,
        matchedPledgeId: rs.matchedPledgeId ?? null,
      };
    });

  // Pending = max(0, liveBalance - totalReceived). Negative or zero → "0".
  let pendingReceiptsEthEquivalent: string | null = null;
  if (liveBalance) {
    const liveNum = num(liveBalance.totalEthEquivalent);
    const pending = liveNum - totalReceivedNum;
    pendingReceiptsEthEquivalent = pending > 0 ? str(pending) : "0";
  }

  return {
    slug: c.slug,
    name: c.name,
    summary: c.summary ?? null,
    status: c.status,
    incidentDate: c.incidentDate ?? null,
    targetAmount: c.targetAmount ? str(c.targetAmount) : null,
    totalPledged: str(totalPledgedNum),
    totalReceived: str(totalReceivedNum),
    percentReceived,
    pledgeCount: bundle.pledges.length,
    dependenciesBlocking,
    dependenciesResolved,
    recentReceipts,
    recentOnchainTransfers,
    onchainLiveBalance: liveBalance,
    pendingReceiptsEthEquivalent,
    contributionAddresses: c.contributionAddresses.map((a) => ({
      chainId: a.chainId,
      address: a.address,
      label: a.label ?? null,
    })),
    contributorsPublic,
    dependenciesPublic,
    recentUpdates,
    riskDisclaimer: c.riskDisclaimer ?? null,
    externalLinks: c.externalLinks.map((l) => ({ label: l.label, url: l.url })),
    affectedAsset: c.affectedAsset
      ? {
          symbol: c.affectedAsset.symbol,
          address: c.affectedAsset.address ?? null,
          chainId: c.affectedAsset.chainId,
        }
      : null,
    lastUpdateAt: bundle.lastUpdateAt,
  };
}
