import { PubSub, withFilter } from "graphql-subscriptions";
import type { BaseSubgraph } from "@powerhousedao/reactor-api";
import type { ReliefCampaignDocument } from "../../document-models/relief-campaign/v1/gen/types.js";
import type { PledgeDocument } from "../../document-models/pledge/v1/gen/types.js";
import type { ContributorProfileDocument } from "../../document-models/contributor-profile/v1/gen/types.js";
import type { ExternalDependencyDocument } from "../../document-models/external-dependency/v1/gen/types.js";
import type { OnchainReceiptDocument } from "../../document-models/onchain-receipt/v1/gen/types.js";
import type { StatusUpdateDocument } from "../../document-models/status-update/v1/gen/types.js";
import type { PHDocument } from "document-model";
import type {
  CampaignBundle,
  PublicCampaign,
  PublicReceiptEntry,
} from "./projections.js";
import { projectCampaign } from "./projections.js";
import { fetchLiveBalance, loadOverlayConfig } from "./onchain-overlay.js";

const RELIEF_CAMPAIGN_TYPE = "defi-united/relief-campaign";
const PLEDGE_TYPE = "defi-united/pledge";
const ONCHAIN_RECEIPT_TYPE = "defi-united/onchain-receipt";
const EXTERNAL_DEPENDENCY_TYPE = "defi-united/external-dependency";
const STATUS_UPDATE_TYPE = "defi-united/status-update";
const CONTRIBUTOR_PROFILE_TYPE = "defi-united/contributor-profile";

const CAMPAIGN_RELATED_TYPES = [
  RELIEF_CAMPAIGN_TYPE,
  PLEDGE_TYPE,
  ONCHAIN_RECEIPT_TYPE,
  EXTERNAL_DEPENDENCY_TYPE,
  STATUS_UPDATE_TYPE,
];

const pubSub = new PubSub();

const CAMPAIGN_UPDATED = "CAMPAIGN_UPDATED";
const RECEIPT_ARRIVED = "RECEIPT_ARRIVED";
const STATUS_UPDATE_PUBLISHED = "STATUS_UPDATE_PUBLISHED";

interface DriveBundle {
  driveId: string;
  campaign: ReliefCampaignDocument;
  pledges: PledgeDocument[];
  receipts: OnchainReceiptDocument[];
  dependencies: ExternalDependencyDocument[];
  statusUpdates: StatusUpdateDocument[];
}

async function loadDriveBundle(
  reactorClient: BaseSubgraph["reactorClient"],
  campaign: ReliefCampaignDocument,
): Promise<DriveBundle | null> {
  const parents = await reactorClient.getParents(campaign.header.id);
  const drive = parents.results.at(0);
  if (!drive) return null;
  const driveId = drive.header.id;

  const [pledges, receipts, dependencies, statusUpdates] = await Promise.all([
    reactorClient.find({ type: PLEDGE_TYPE, parentId: driveId }),
    reactorClient.find({ type: ONCHAIN_RECEIPT_TYPE, parentId: driveId }),
    reactorClient.find({ type: EXTERNAL_DEPENDENCY_TYPE, parentId: driveId }),
    reactorClient.find({ type: STATUS_UPDATE_TYPE, parentId: driveId }),
  ]);

  return {
    driveId,
    campaign,
    pledges: pledges.results as PledgeDocument[],
    receipts: receipts.results as OnchainReceiptDocument[],
    dependencies: dependencies.results as ExternalDependencyDocument[],
    statusUpdates: statusUpdates.results as StatusUpdateDocument[],
  };
}

async function loadContributorRegistry(
  reactorClient: BaseSubgraph["reactorClient"],
  campaign: ReliefCampaignDocument,
): Promise<Map<string, ContributorProfileDocument>> {
  const registryDriveId = campaign.state.global.contributorRegistryDriveId;
  const map = new Map<string, ContributorProfileDocument>();

  if (registryDriveId) {
    try {
      const found = await reactorClient.find({
        type: CONTRIBUTOR_PROFILE_TYPE,
        parentId: registryDriveId,
      });
      for (const doc of found.results as ContributorProfileDocument[]) {
        map.set(doc.header.id, doc);
      }
      if (map.size > 0) return map;
    } catch {
      // fall through
    }
  }

  const allProfiles = await reactorClient.find({
    type: CONTRIBUTOR_PROFILE_TYPE,
  });
  for (const doc of allProfiles.results as ContributorProfileDocument[]) {
    map.set(doc.header.id, doc);
  }
  return map;
}

function lastUpdateAtFor(bundle: DriveBundle): string | null {
  const candidates: string[] = [];
  candidates.push(bundle.campaign.header.lastModifiedAtUtcIso);
  for (const p of bundle.pledges)
    candidates.push(p.header.lastModifiedAtUtcIso);
  for (const r of bundle.receipts)
    candidates.push(r.header.lastModifiedAtUtcIso);
  for (const d of bundle.dependencies)
    candidates.push(d.header.lastModifiedAtUtcIso);
  for (const u of bundle.statusUpdates)
    candidates.push(u.header.lastModifiedAtUtcIso);
  candidates.sort();
  return candidates[candidates.length - 1] ?? null;
}

async function buildPublicCampaign(
  reactorClient: BaseSubgraph["reactorClient"],
  campaign: ReliefCampaignDocument,
): Promise<PublicCampaign | null> {
  const drive = await loadDriveBundle(reactorClient, campaign);
  if (!drive) return null;
  const profiles = await loadContributorRegistry(reactorClient, campaign);
  const bundle: CampaignBundle = {
    campaign: drive.campaign,
    pledges: drive.pledges,
    receipts: drive.receipts,
    dependencies: drive.dependencies,
    statusUpdates: drive.statusUpdates,
    contributorProfilesById: profiles,
    driveId: drive.driveId,
    lastUpdateAt: lastUpdateAtFor(drive),
  };

  // Live on-chain overlay (cached server-side) — best-effort, returns
  // null on RPC failure or when no Alchemy URL is configured.
  const overlayConfig = loadOverlayConfig();
  const treasury = drive.campaign.state.global.contributionAddresses?.[0];
  const liveBalance = treasury
    ? await fetchLiveBalance({
        alchemyUrl: overlayConfig.alchemyUrl,
        treasuryAddress: treasury.address,
        ethPriceFallbackUsd: overlayConfig.ethPriceFallbackUsd,
      })
    : null;

  return projectCampaign(bundle, liveBalance);
}

// Drive ID → campaign mapping, populated during onSetup
const driveToCampaign = new Map<string, ReliefCampaignDocument>();

function projectReceipt(
  receipt: OnchainReceiptDocument,
  campaign: ReliefCampaignDocument,
): Record<string, unknown> {
  const r = receipt.state.global;
  return {
    id: receipt.header.id,
    campaignSlug: campaign.state.global.slug,
    txHash: r.txHash || null,
    fromAddress: r.fromAddress || null,
    toAddress: r.toAddress || "",
    amount: r.amount ? String(r.amount) : "0",
    assetSymbol: r.asset?.symbol ?? "ETH",
    chainId: r.chainId ?? null,
    blockNumber: r.blockNumber ?? null,
    blockTimestamp: r.blockTimestamp ?? null,
    reconciliationStatus: r.reconciliationStatus,
    matchedPledgeId: r.matchedPledgeId || null,
  };
}

// Module-level unsubscribe tracking
const unsubscribes: Array<() => void> = [];

export const getResolvers = (
  subgraph: BaseSubgraph,
): Record<string, unknown> => ({
  Query: {
    DefiUnited_campaign: async (
      _root: unknown,
      args: { slug: string },
    ): Promise<PublicCampaign | null> => {
      const all = await subgraph.reactorClient.find({
        type: RELIEF_CAMPAIGN_TYPE,
      });
      // Skip archived campaigns even when looked up by slug — orphans
      // from prior seed attempts get archived but their old slug still
      // resolves to a stale doc otherwise.
      const campaign = (all.results as ReliefCampaignDocument[])
        .filter((c) => c.state.global.status !== "ARCHIVED")
        .find((c) => c.state.global.slug === args.slug);
      if (!campaign) return null;
      return buildPublicCampaign(subgraph.reactorClient, campaign);
    },

    DefiUnited_campaigns: async (
      _root: unknown,
      args: { status?: string },
    ): Promise<PublicCampaign[]> => {
      const all = await subgraph.reactorClient.find({
        type: RELIEF_CAMPAIGN_TYPE,
      });
      let campaigns = all.results as ReliefCampaignDocument[];
      if (args.status) {
        campaigns = campaigns.filter(
          (c) => c.state.global.status === args.status,
        );
      } else {
        // Default: hide archived from public listings.
        campaigns = campaigns.filter(
          (c) => c.state.global.status !== "ARCHIVED",
        );
      }
      const projected = await Promise.all(
        campaigns.map((c) => buildPublicCampaign(subgraph.reactorClient, c)),
      );
      return projected.filter((p): p is PublicCampaign => p !== null);
    },
  },

  // Field resolver so `recentReceipts(limit: N)` slices server-side.
  DefiUnited_PublicCampaign: {
    recentReceipts: (
      parent: PublicCampaign,
      args: { limit?: number },
    ): PublicReceiptEntry[] => {
      const limit = args.limit ?? 20;
      return parent.recentReceipts.slice(0, Math.max(0, limit));
    },
  },

  Subscription: {
    DefiUnited_campaignUpdated: {
      subscribe: withFilter(
        () => pubSub.asyncIterableIterator(CAMPAIGN_UPDATED),
        (payload, args) => {
          const slug = (args as { slug?: string } | undefined)?.slug;
          if (slug) return (payload as PublicCampaign).slug === slug;
          return true;
        },
      ),
      resolve: (value: PublicCampaign) => value,
    },

    DefiUnited_receiptArrived: {
      subscribe: withFilter(
        () => pubSub.asyncIterableIterator(RECEIPT_ARRIVED),
        (payload, args) => {
          const slug = (args as { slug: string } | undefined)?.slug;
          return slug
            ? (payload as Record<string, unknown>).campaignSlug === slug
            : true;
        },
      ),
      resolve: (value: Record<string, unknown>) => value,
    },

    DefiUnited_statusUpdatePublished: {
      subscribe: withFilter(
        () => pubSub.asyncIterableIterator(STATUS_UPDATE_PUBLISHED),
        (payload, args) => {
          const slug = (args as { slug: string } | undefined)?.slug;
          return slug
            ? (payload as Record<string, unknown>).campaignSlug === slug
            : true;
        },
      ),
      resolve: (value: Record<string, unknown>) => value,
    },
  },
});

// Exported so the subgraph class can call it
export async function setupDocumentChangeListener(subgraph: BaseSubgraph) {
  // Build driveId → campaign map
  const all = await subgraph.reactorClient.find({
    type: RELIEF_CAMPAIGN_TYPE,
  });
  for (const campaign of all.results as ReliefCampaignDocument[]) {
    const parents = await subgraph.reactorClient.getParents(campaign.header.id);
    const drive = parents.results.at(0);
    if (drive) {
      driveToCampaign.set(drive.header.id, campaign);
    }
  }

  // Subscribe to each campaign-related document type separately
  // (SearchFilter.type only accepts a single string)
  const handleDocumentChange = async (
    docType: string,
    doc: PHDocument,
  ): Promise<void> => {
    const changedDocId = doc.header.id;

    // Get the parent drive of the changed document
    const parents = await subgraph.reactorClient.getParents(changedDocId);
    const drive = parents.results.at(0);
    if (!drive) return;

    const campaign = driveToCampaign.get(drive.header.id);
    if (!campaign) return;

    const slug = campaign.state.global.slug;

    // Re-project the full campaign
    const projected = await buildPublicCampaign(
      subgraph.reactorClient,
      campaign,
    );

    if (projected) {
      pubSub.publish(CAMPAIGN_UPDATED, { ...projected });
    }

    // If it's a receipt, also publish the receipt-specific event
    if (docType === ONCHAIN_RECEIPT_TYPE) {
      const receipts = await subgraph.reactorClient.find({
        type: ONCHAIN_RECEIPT_TYPE,
        parentId: drive.header.id,
      });
      const receipt = (receipts.results as OnchainReceiptDocument[]).find(
        (r) => r.header.id === changedDocId,
      );
      if (receipt) {
        pubSub.publish(RECEIPT_ARRIVED, {
          ...projectReceipt(receipt, campaign),
        });
      }
    }

    // If it's a published status update, publish that event too
    if (docType === STATUS_UPDATE_TYPE) {
      const updates = await subgraph.reactorClient.find({
        type: STATUS_UPDATE_TYPE,
        parentId: drive.header.id,
      });
      const update = (updates.results as StatusUpdateDocument[]).find(
        (u) => u.header.id === changedDocId,
      );
      if (update && update.state.global.publishedAt) {
        const us = update.state.global;
        pubSub.publish(STATUS_UPDATE_PUBLISHED, {
          campaignSlug: slug,
          id: update.header.id,
          publishedAt: us.publishedAt,
          title: us.title,
          body: us.body,
          metricsTotalPledged: us.metricsSnapshot?.totalPledged
            ? String(us.metricsSnapshot.totalPledged)
            : null,
          metricsTotalReceived: us.metricsSnapshot?.totalReceived
            ? String(us.metricsSnapshot.totalReceived)
            : null,
          externalAnnouncements: us.externalAnnouncements.map((e) => ({
            platform: e.platform,
            url: e.url,
          })),
        });
      }
    }
  };

  for (const docType of CAMPAIGN_RELATED_TYPES) {
    const unsub = subgraph.reactorClient.subscribe(
      { type: docType },
      (event) => {
        for (const doc of event.documents) {
          handleDocumentChange(docType, doc);
        }
      },
    );
    unsubscribes.push(unsub);
  }
}

// Exported so the subgraph class can call it
export function teardownDocumentChangeListener() {
  for (const unsub of unsubscribes) unsub();
  unsubscribes.length = 0;
}
