import type { BaseSubgraph } from "@powerhousedao/reactor-api";
import { generateId } from "document-model";
import { attachPledge } from "../../document-models/onchain-receipt/v1/gen/reconciliation/creators.js";
import type { AttachPledgeAction } from "../../document-models/onchain-receipt/v1/gen/reconciliation/actions.js";
import {
  cancelPledge,
  markConfirmed,
} from "../../document-models/pledge/v1/gen/lifecycle/creators.js";
import type {
  CancelPledgeAction,
  MarkConfirmedAction,
} from "../../document-models/pledge/v1/gen/lifecycle/actions.js";
import { resolve as resolveDependency } from "../../document-models/external-dependency/v1/gen/tracking/creators.js";
import type { ResolveAction } from "../../document-models/external-dependency/v1/gen/tracking/actions.js";
import { publishUpdate } from "../../document-models/status-update/v1/gen/publishing/creators.js";
import type { PublishUpdateAction } from "../../document-models/status-update/v1/gen/publishing/actions.js";
import type { ReliefCampaignDocument } from "../../document-models/relief-campaign/v1/gen/types.js";

const RELIEF_CAMPAIGN_TYPE = "defi-united/relief-campaign";

interface OperationResult {
  success: boolean;
  operatorAddress: string | null;
  error: string | null;
}

interface OperationsContext {
  user?: { address: string };
}

const DENIED = (msg: string): OperationResult => ({
  success: false,
  operatorAddress: null,
  error: msg,
});

const OK = (operatorAddress: string): OperationResult => ({
  success: true,
  operatorAddress,
  error: null,
});

async function authoriseOperator(
  subgraph: BaseSubgraph,
  ctx: OperationsContext,
  campaignSlug: string,
): Promise<
  { campaign: ReliefCampaignDocument; operator: string } | OperationResult
> {
  const operator = ctx.user?.address;
  if (!operator)
    return DENIED("Authentication required: missing Renown bearer token");

  const all = await subgraph.reactorClient.find({ type: RELIEF_CAMPAIGN_TYPE });
  const campaign = (all.results as ReliefCampaignDocument[]).find(
    (c) => c.state.global.slug === campaignSlug,
  );
  if (!campaign)
    return DENIED(`Campaign with slug "${campaignSlug}" not found`);

  const authorized = campaign.state.global.operatorWallets.some(
    (a) => a.toLowerCase() === operator.toLowerCase(),
  );
  if (!authorized) {
    return DENIED(
      `Wallet ${operator} is not an authorized operator for campaign "${campaignSlug}"`,
    );
  }
  return { campaign, operator };
}

const isError = (
  v: { campaign: ReliefCampaignDocument; operator: string } | OperationResult,
): v is OperationResult => typeof (v as OperationResult).success === "boolean";

export const getResolvers = (
  subgraph: BaseSubgraph,
): Record<string, unknown> => ({
  Mutation: {
    DefiUnited_markPledgeConfirmed: async (
      _root: unknown,
      args: { campaignSlug: string; pledgeId: string },
      ctx: OperationsContext,
    ): Promise<OperationResult> => {
      const auth = await authoriseOperator(subgraph, ctx, args.campaignSlug);
      if (isError(auth)) return auth;
      try {
        const action: MarkConfirmedAction = markConfirmed({ _: null });
        await subgraph.reactorClient.execute(args.pledgeId, "main", [action]);
        return OK(auth.operator);
      } catch (e) {
        return DENIED((e as Error).message);
      }
    },

    DefiUnited_cancelPledge: async (
      _root: unknown,
      args: { campaignSlug: string; pledgeId: string; reason?: string | null },
      ctx: OperationsContext,
    ): Promise<OperationResult> => {
      const auth = await authoriseOperator(subgraph, ctx, args.campaignSlug);
      if (isError(auth)) return auth;
      try {
        const action: CancelPledgeAction = cancelPledge({
          reason: args.reason ?? null,
        });
        await subgraph.reactorClient.execute(args.pledgeId, "main", [action]);
        return OK(auth.operator);
      } catch (e) {
        return DENIED((e as Error).message);
      }
    },

    DefiUnited_resolveDependency: async (
      _root: unknown,
      args: { campaignSlug: string; dependencyId: string },
      ctx: OperationsContext,
    ): Promise<OperationResult> => {
      const auth = await authoriseOperator(subgraph, ctx, args.campaignSlug);
      if (isError(auth)) return auth;
      try {
        const action: ResolveAction = resolveDependency({ _: null });
        await subgraph.reactorClient.execute(args.dependencyId, "main", [
          action,
        ]);
        return OK(auth.operator);
      } catch (e) {
        return DENIED((e as Error).message);
      }
    },

    DefiUnited_publishStatusUpdate: async (
      _root: unknown,
      args: {
        campaignSlug: string;
        updateId: string;
        publishedAt: string;
      },
      ctx: OperationsContext,
    ): Promise<OperationResult> => {
      const auth = await authoriseOperator(subgraph, ctx, args.campaignSlug);
      if (isError(auth)) return auth;
      try {
        const action: PublishUpdateAction = publishUpdate({
          publishedAt: args.publishedAt,
        });
        await subgraph.reactorClient.execute(args.updateId, "main", [action]);
        return OK(auth.operator);
      } catch (e) {
        return DENIED((e as Error).message);
      }
    },

    DefiUnited_attachReceiptToPledge: async (
      _root: unknown,
      args: {
        campaignSlug: string;
        receiptId: string;
        pledgeId: string;
      },
      ctx: OperationsContext,
    ): Promise<OperationResult> => {
      const auth = await authoriseOperator(subgraph, ctx, args.campaignSlug);
      if (isError(auth)) return auth;
      try {
        const action: AttachPledgeAction = attachPledge({
          pledgeId: args.pledgeId,
        });
        await subgraph.reactorClient.execute(args.receiptId, "main", [action]);
        return OK(auth.operator);
      } catch (e) {
        return DENIED((e as Error).message);
      }
    },
  },
});

// `generateId` re-export reserved for future operations that need new ids
// (e.g. drafting a new status update inline). Keep import path stable.
export { generateId };
