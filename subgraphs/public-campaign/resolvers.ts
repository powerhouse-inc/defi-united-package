import type { BaseSubgraph } from "@powerhousedao/reactor-api";
import type { ReliefCampaignDocument } from "../../document-models/relief-campaign/v1/gen/types.js";
import type { PledgeDocument } from "../../document-models/pledge/v1/gen/types.js";
import type { ContributorProfileDocument } from "../../document-models/contributor-profile/v1/gen/types.js";
import type { ExternalDependencyDocument } from "../../document-models/external-dependency/v1/gen/types.js";
import type { OnchainReceiptDocument } from "../../document-models/onchain-receipt/v1/gen/types.js";
import type { StatusUpdateDocument } from "../../document-models/status-update/v1/gen/types.js";
import type { CampaignBundle, PublicCampaign } from "./projections.js";
import { projectCampaign } from "./projections.js";

const RELIEF_CAMPAIGN_TYPE = "defi-united/relief-campaign";
const PLEDGE_TYPE = "defi-united/pledge";
const ONCHAIN_RECEIPT_TYPE = "defi-united/onchain-receipt";
const EXTERNAL_DEPENDENCY_TYPE = "defi-united/external-dependency";
const STATUS_UPDATE_TYPE = "defi-united/status-update";
const CONTRIBUTOR_PROFILE_TYPE = "defi-united/contributor-profile";

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

  // Try the linked DAO drive first; fall back to a global search across drives.
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
  return projectCampaign(bundle);
}

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
      const campaign = (all.results as ReliefCampaignDocument[]).find(
        (c) => c.state.global.slug === args.slug,
      );
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
      }
      const projected = await Promise.all(
        campaigns.map((c) => buildPublicCampaign(subgraph.reactorClient, c)),
      );
      return projected.filter((p): p is PublicCampaign => p !== null);
    },
  },
});
