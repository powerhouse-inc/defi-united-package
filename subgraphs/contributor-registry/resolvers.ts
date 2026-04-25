import type { BaseSubgraph } from "@powerhousedao/reactor-api";
import type { ContributorProfileDocument } from "../../document-models/contributor-profile/v1/gen/types.js";
import type { PledgeDocument } from "../../document-models/pledge/v1/gen/types.js";
import type { ReliefCampaignDocument } from "../../document-models/relief-campaign/v1/gen/types.js";

const CONTRIBUTOR_PROFILE_TYPE = "defi-united/contributor-profile";
const PLEDGE_TYPE = "defi-united/pledge";
const RELIEF_CAMPAIGN_TYPE = "defi-united/relief-campaign";

interface PublicContributorProfile {
  id: string;
  displayName: string;
  kind: string;
  websiteUrl: string | null;
  twitterHandle: string | null;
  farcasterHandle: string | null;
  trustLevel: string;
  campaignParticipation: Array<{
    campaignSlug: string;
    campaignName: string;
    pledgedAmount: string;
    receivedAmount: string | null;
    pledgeStatus: string;
    assetSymbol: string;
  }>;
}

const ANON_DISPLAY = "Anonymous Contributor";

function projectProfile(
  profile: ContributorProfileDocument,
  pledges: PledgeDocument[],
  campaignsByDriveId: Map<string, ReliefCampaignDocument>,
  driveIdByPledgeId: Map<string, string>,
): PublicContributorProfile {
  const cp = profile.state.global;
  const trust = cp.trustLevel;
  const isAnon = trust === "ANONYMOUS";

  const participation = pledges
    .filter((p) => p.state.global.contributorProfileId === profile.header.id)
    .map((p) => {
      const driveId = driveIdByPledgeId.get(p.header.id);
      const campaign = driveId ? campaignsByDriveId.get(driveId) : undefined;
      const ps = p.state.global;
      return {
        campaignSlug: campaign?.state.global.slug ?? "",
        campaignName: campaign?.state.global.name ?? "",
        pledgedAmount: String(ps.pledgedAmount ?? 0),
        receivedAmount:
          ps.receivedAmount !== null && ps.receivedAmount !== undefined
            ? String(ps.receivedAmount)
            : null,
        pledgeStatus: ps.status,
        assetSymbol: ps.asset?.symbol ?? "ETH",
      };
    })
    .filter((p) => p.campaignSlug !== "");

  return {
    id: profile.header.id,
    displayName: isAnon ? ANON_DISPLAY : cp.displayName,
    kind: cp.kind,
    websiteUrl: isAnon ? null : (cp.websiteUrl ?? null),
    twitterHandle: isAnon ? null : (cp.twitterHandle ?? null),
    farcasterHandle: isAnon ? null : (cp.farcasterHandle ?? null),
    trustLevel: trust,
    campaignParticipation: participation,
  };
}

async function loadAll(reactorClient: BaseSubgraph["reactorClient"]): Promise<{
  profiles: ContributorProfileDocument[];
  pledges: PledgeDocument[];
  campaignsByDriveId: Map<string, ReliefCampaignDocument>;
  driveIdByPledgeId: Map<string, string>;
}> {
  const [profilesResult, pledgesResult, campaignsResult] = await Promise.all([
    reactorClient.find({ type: CONTRIBUTOR_PROFILE_TYPE }),
    reactorClient.find({ type: PLEDGE_TYPE }),
    reactorClient.find({ type: RELIEF_CAMPAIGN_TYPE }),
  ]);

  const profiles = profilesResult.results as ContributorProfileDocument[];
  const pledges = pledgesResult.results as PledgeDocument[];
  const campaigns = campaignsResult.results as ReliefCampaignDocument[];

  const campaignsByDriveId = new Map<string, ReliefCampaignDocument>();
  for (const c of campaigns) {
    const parents = await reactorClient.getParents(c.header.id);
    const drive = parents.results.at(0);
    if (drive) campaignsByDriveId.set(drive.header.id, c);
  }

  const driveIdByPledgeId = new Map<string, string>();
  for (const p of pledges) {
    const parents = await reactorClient.getParents(p.header.id);
    const drive = parents.results.at(0);
    if (drive) driveIdByPledgeId.set(p.header.id, drive.header.id);
  }

  return { profiles, pledges, campaignsByDriveId, driveIdByPledgeId };
}

export const getResolvers = (
  subgraph: BaseSubgraph,
): Record<string, unknown> => ({
  Query: {
    DefiUnited_contributors: async (
      _root: unknown,
      args: { trustLevel?: string; kind?: string },
    ): Promise<PublicContributorProfile[]> => {
      const data = await loadAll(subgraph.reactorClient);
      return data.profiles
        .filter((p) =>
          args.trustLevel
            ? p.state.global.trustLevel === args.trustLevel
            : true,
        )
        .filter((p) => (args.kind ? p.state.global.kind === args.kind : true))
        .map((p) =>
          projectProfile(
            p,
            data.pledges,
            data.campaignsByDriveId,
            data.driveIdByPledgeId,
          ),
        );
    },
    DefiUnited_contributor: async (
      _root: unknown,
      args: { id: string },
    ): Promise<PublicContributorProfile | null> => {
      const data = await loadAll(subgraph.reactorClient);
      const profile = data.profiles.find((p) => p.header.id === args.id);
      if (!profile) return null;
      return projectProfile(
        profile,
        data.pledges,
        data.campaignsByDriveId,
        data.driveIdByPledgeId,
      );
    },
  },
});
