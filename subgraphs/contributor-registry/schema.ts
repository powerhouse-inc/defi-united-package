import { gql } from "graphql-tag";
import type { DocumentNode } from "graphql";

export const schema: DocumentNode = gql`
  """
  Public read API for the cross-campaign contributor registry. Lists every
  Contributor Profile across the DAO drive plus a derived view of which
  campaigns each contributor has participated in.
  """
  type Query {
    DefiUnited_contributors(
      trustLevel: String
      kind: String
    ): [DefiUnited_PublicContributorProfile!]!
    DefiUnited_contributor(id: String!): DefiUnited_PublicContributorProfile
  }

  type DefiUnited_PublicContributorProfile {
    id: String!
    displayName: String!
    kind: String!
    websiteUrl: String
    twitterHandle: String
    farcasterHandle: String
    trustLevel: String!
    campaignParticipation: [DefiUnited_CampaignParticipation!]!
  }

  type DefiUnited_CampaignParticipation {
    campaignSlug: String!
    campaignName: String!
    pledgedAmount: String!
    receivedAmount: String
    pledgeStatus: String!
    assetSymbol: String!
  }
`;
