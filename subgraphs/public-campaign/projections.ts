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
  riskDisclaimer: string | null;
  externalLinks: Array<{ label: string; url: string }>;
  affectedAsset: {
    symbol: string;
    address: string | null;
    chainId: number;
  } | null;
  lastUpdateAt: string | null;
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

export function projectCampaign(bundle: CampaignBundle): PublicCampaign {
  const c = bundle.campaign.state.global;

  let totalPledgedNum = 0;
  let totalReceivedNum = 0;
  for (const pledge of bundle.pledges) {
    const ps = pledge.state.global;
    if (ps.status !== "CANCELLED" && ps.status !== "FAILED") {
      totalPledgedNum += num(ps.pledgedAmount);
    }
    totalReceivedNum += num(ps.receivedAmount);
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
