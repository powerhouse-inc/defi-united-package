/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AttachGovernanceInput,
  CancelPledgeInput,
  EditNotesInput,
  FailPledgeInput,
  GovernancePlatform,
  MarkConfirmedInput,
  MarkGovernancePendingInput,
  MarkReceivedInput,
  PledgeAsset,
  PledgeAssetInput,
  PledgeGovernance,
  PledgeState,
  PledgeStatus,
  ProposePledgeInput,
} from "./types.js";

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null;

export const definedNonNullAnySchema = z
  .any()
  .refine((v) => isDefinedNonNullAny(v));

export const GovernancePlatformSchema = z.enum([
  "AGORA",
  "FORUM",
  "OTHER",
  "SNAPSHOT",
  "TALLY",
]);

export const PledgeStatusSchema = z.enum([
  "CANCELLED",
  "CONFIRMED",
  "FAILED",
  "GOVERNANCE_PENDING",
  "PROPOSED",
  "RECEIVED",
]);

export function AttachGovernanceInputSchema(): z.ZodObject<
  Properties<AttachGovernanceInput>
> {
  return z.object({
    platform: GovernancePlatformSchema,
    proposalUrl: z.url(),
    quorumStatus: z.string().nullish(),
    voteEndDate: z.iso.datetime().nullish(),
  });
}

export function CancelPledgeInputSchema(): z.ZodObject<
  Properties<CancelPledgeInput>
> {
  return z.object({
    reason: z.string().nullish(),
  });
}

export function EditNotesInputSchema(): z.ZodObject<
  Properties<EditNotesInput>
> {
  return z.object({
    internalNotes: z.string().nullish(),
    publicNotes: z.string().nullish(),
  });
}

export function FailPledgeInputSchema(): z.ZodObject<
  Properties<FailPledgeInput>
> {
  return z.object({
    reason: z.string().nullish(),
  });
}

export function MarkConfirmedInputSchema(): z.ZodObject<
  Properties<MarkConfirmedInput>
> {
  return z.object({
    _: z.boolean().nullish(),
  });
}

export function MarkGovernancePendingInputSchema(): z.ZodObject<
  Properties<MarkGovernancePendingInput>
> {
  return z.object({
    _: z.boolean().nullish(),
  });
}

export function MarkReceivedInputSchema(): z.ZodObject<
  Properties<MarkReceivedInput>
> {
  return z.object({
    amount: z.number(),
    receiptId: z.string(),
    receivedAt: z.iso.datetime(),
  });
}

export function PledgeAssetSchema(): z.ZodObject<Properties<PledgeAsset>> {
  return z.object({
    __typename: z.literal("PledgeAsset").optional(),
    address: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        message: "Invalid Ethereum address format",
      })
      .nullish(),
    chainId: z.number(),
    symbol: z.string(),
  });
}

export function PledgeAssetInputSchema(): z.ZodObject<
  Properties<PledgeAssetInput>
> {
  return z.object({
    address: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        message: "Invalid Ethereum address format",
      })
      .nullish(),
    chainId: z.number(),
    symbol: z.string(),
  });
}

export function PledgeGovernanceSchema(): z.ZodObject<
  Properties<PledgeGovernance>
> {
  return z.object({
    __typename: z.literal("PledgeGovernance").optional(),
    platform: GovernancePlatformSchema,
    proposalUrl: z.url(),
    quorumStatus: z.string().nullish(),
    voteEndDate: z.iso.datetime().nullish(),
  });
}

export function PledgeStateSchema(): z.ZodObject<Properties<PledgeState>> {
  return z.object({
    __typename: z.literal("PledgeState").optional(),
    asset: z.lazy(() => PledgeAssetSchema().nullish()),
    contributorProfileId: z.string().nullish(),
    governance: z.lazy(() => PledgeGovernanceSchema().nullish()),
    internalNotes: z.string().nullish(),
    pledgedAmount: z.number().nullish(),
    publicNotes: z.string().nullish(),
    receiptIds: z.array(z.string()),
    receivedAmount: z.number().nullish(),
    receivedAt: z.iso.datetime().nullish(),
    status: PledgeStatusSchema,
  });
}

export function ProposePledgeInputSchema(): z.ZodObject<
  Properties<ProposePledgeInput>
> {
  return z.object({
    asset: z.lazy(() => PledgeAssetInputSchema()),
    contributorProfileId: z.string(),
    internalNotes: z.string().nullish(),
    pledgedAmount: z.number(),
    publicNotes: z.string().nullish(),
  });
}
