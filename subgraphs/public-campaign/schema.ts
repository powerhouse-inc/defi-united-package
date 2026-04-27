import { gql } from "graphql-tag";
import type { DocumentNode } from "graphql";

export const schema: DocumentNode = gql`
  """
  Public, unauthenticated read API for DeFi United relief campaigns.
  Suitable for embedding on defiunited.world and third-party dashboards.
  All views are redacted: no internal notes, no PII, no operator wallets.
  """
  type Query {
    "Find a single campaign by slug."
    DefiUnited_campaign(slug: String!): DefiUnited_PublicCampaign
    "List campaigns, optionally filtered by status."
    DefiUnited_campaigns(
      status: DefiUnited_CampaignStatus
    ): [DefiUnited_PublicCampaign!]!
  }

  """
  Real-time campaign updates. Fires whenever a document belonging to a
  campaign changes (pledge, receipt, dependency, status update, campaign).
  """
  type Subscription {
    "Any campaign document changed — resolves to the full projected campaign."
    DefiUnited_campaignUpdated(slug: String): DefiUnited_PublicCampaign

    "A new on-chain receipt arrived for a campaign."
    DefiUnited_receiptArrived(slug: String!): DefiUnited_PublicReceipt

    "A status update was published or edited."
    DefiUnited_statusUpdatePublished(
      slug: String!
    ): DefiUnited_PublicStatusUpdate
  }

  enum DefiUnited_CampaignStatus {
    DRAFT
    ACTIVE
    EXECUTING
    RESOLVED
    FAILED
    ARCHIVED
  }

  enum DefiUnited_PledgeStatus {
    PROPOSED
    GOVERNANCE_PENDING
    CONFIRMED
    RECEIVED
    CANCELLED
    FAILED
  }

  enum DefiUnited_DependencyKind {
    GOVERNANCE_VOTE
    COUNCIL_ACTION
    ONCHAIN_TX
    OPERATIONAL
    OTHER
  }

  enum DefiUnited_DependencyStatus {
    OPEN
    IN_PROGRESS
    RESOLVED
    BLOCKED
    ABANDONED
  }

  type DefiUnited_PublicCampaign {
    slug: String!
    name: String!
    summary: String
    status: DefiUnited_CampaignStatus!
    incidentDate: String
    targetAmount: String
    totalPledged: String!
    totalReceived: String!
    percentReceived: Float!
    pledgeCount: Int!
    dependenciesBlocking: Int!
    dependenciesResolved: Int!
    contributionAddresses: [DefiUnited_PublicContributionAddress!]!
    contributorsPublic: [DefiUnited_PublicPledge!]!
    dependenciesPublic: [DefiUnited_PublicDependency!]!
    recentUpdates: [DefiUnited_PublicStatusUpdate!]!
    riskDisclaimer: String
    externalLinks: [DefiUnited_PublicExternalLink!]!
    affectedAsset: DefiUnited_PublicAffectedAsset
    lastUpdateAt: String
  }

  type DefiUnited_PublicAffectedAsset {
    symbol: String!
    address: String
    chainId: Int!
  }

  type DefiUnited_PublicContributionAddress {
    chainId: Int!
    address: String!
    label: String
  }

  type DefiUnited_PublicPledge {
    contributorDisplayName: String!
    contributorTrustLevel: String!
    contributorWebsiteUrl: String
    contributorTwitter: String
    pledgedAmount: String!
    receivedAmount: String
    assetSymbol: String!
    status: DefiUnited_PledgeStatus!
    governanceProposalUrl: String
    governancePlatform: String
    publicNotes: String
  }

  type DefiUnited_PublicDependency {
    title: String!
    description: String
    kind: DefiUnited_DependencyKind!
    status: DefiUnited_DependencyStatus!
    externalRefUrl: String
    externalRefProposalId: String
    expectedResolution: String
  }

  type DefiUnited_PublicStatusUpdate {
    id: String!
    publishedAt: String!
    title: String!
    body: String!
    metricsTotalPledged: String
    metricsTotalReceived: String
    externalAnnouncements: [DefiUnited_PublicExternalAnnouncement!]!
  }

  type DefiUnited_PublicExternalAnnouncement {
    platform: String!
    url: String!
  }

  type DefiUnited_PublicExternalLink {
    label: String!
    url: String!
  }

  """
  Standalone receipt type for the subscription feed — mirrors the public
  receipt properties without requiring a full campaign projection.
  """
  type DefiUnited_PublicReceipt {
    id: String!
    campaignSlug: String!
    txHash: String
    fromAddress: String
    toAddress: String!
    amount: String!
    assetSymbol: String!
    chainId: Int
    blockNumber: Int
    blockTimestamp: String
    reconciliationStatus: String!
    matchedPledgeId: String
  }
`;
