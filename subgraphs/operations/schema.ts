import { gql } from "graphql-tag";
import type { DocumentNode } from "graphql";

export const schema: DocumentNode = gql`
  """
  Operator-only mutation API for DeFi United relief campaigns.

  Authentication: requires a Renown DID bearer token in the
  \`Authorization: Bearer <jwt>\` header. The recovered wallet address
  must be listed in the target campaign's \`operatorWallets\`. Mints the
  bearer token client-side via @powerhousedao/reactor-browser:
  \`renown.getBearerToken({ expiresIn: 600 })\` — do NOT pass an \`aud\`
  claim or the verifier will reject the token.
  """
  type Mutation {
    DefiUnited_markPledgeConfirmed(
      campaignSlug: String!
      pledgeId: String!
    ): DefiUnited_OperationResult!

    DefiUnited_cancelPledge(
      campaignSlug: String!
      pledgeId: String!
      reason: String
    ): DefiUnited_OperationResult!

    DefiUnited_resolveDependency(
      campaignSlug: String!
      dependencyId: String!
    ): DefiUnited_OperationResult!

    DefiUnited_publishStatusUpdate(
      campaignSlug: String!
      updateId: String!
      publishedAt: String!
    ): DefiUnited_OperationResult!

    DefiUnited_attachReceiptToPledge(
      campaignSlug: String!
      receiptId: String!
      pledgeId: String!
    ): DefiUnited_OperationResult!
  }

  type DefiUnited_OperationResult {
    success: Boolean!
    operatorAddress: String
    error: String
  }
`;
