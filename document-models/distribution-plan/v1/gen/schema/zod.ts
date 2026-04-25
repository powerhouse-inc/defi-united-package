/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddApprovalRefInput,
  AddRecipientInput,
  ApprovalRef,
  ApprovePlanInput,
  CancelPlanInput,
  CompleteDistributionInput,
  DistributionPlanState,
  DistributionRecipient,
  DistributionStatus,
  MarkRecipientFailedInput,
  MarkRecipientRefundedInput,
  MarkRecipientSentInput,
  RecipientStatus,
  RemoveRecipientInput,
  SetMethodologyInput,
  UpdateRecipientInput,
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

export const DistributionStatusSchema = z.enum([
  "APPROVED",
  "CANCELLED",
  "COMPLETED",
  "DRAFT",
  "EXECUTING",
]);

export const RecipientStatusSchema = z.enum([
  "FAILED",
  "PLANNED",
  "REFUNDED",
  "SENT",
]);

export function AddApprovalRefInputSchema(): z.ZodObject<
  Properties<AddApprovalRefInput>
> {
  return z.object({
    id: z.string(),
    label: z.string(),
    url: z.url(),
  });
}

export function AddRecipientInputSchema(): z.ZodObject<
  Properties<AddRecipientInput>
> {
  return z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Invalid Ethereum address format",
    }),
    allocatedAmount: z.number(),
    chainId: z.number(),
    id: z.string(),
    rationale: z.string().nullish(),
  });
}

export function ApprovalRefSchema(): z.ZodObject<Properties<ApprovalRef>> {
  return z.object({
    __typename: z.literal("ApprovalRef").optional(),
    id: z.string(),
    label: z.string(),
    url: z.url(),
  });
}

export function ApprovePlanInputSchema(): z.ZodObject<
  Properties<ApprovePlanInput>
> {
  return z.object({
    _: z.boolean().nullish(),
  });
}

export function CancelPlanInputSchema(): z.ZodObject<
  Properties<CancelPlanInput>
> {
  return z.object({
    _: z.boolean().nullish(),
  });
}

export function CompleteDistributionInputSchema(): z.ZodObject<
  Properties<CompleteDistributionInput>
> {
  return z.object({
    _: z.boolean().nullish(),
  });
}

export function DistributionPlanStateSchema(): z.ZodObject<
  Properties<DistributionPlanState>
> {
  return z.object({
    __typename: z.literal("DistributionPlanState").optional(),
    approvalRefs: z.array(z.lazy(() => ApprovalRefSchema())),
    methodology: z.string().nullish(),
    recipients: z.array(z.lazy(() => DistributionRecipientSchema())),
    status: DistributionStatusSchema,
    totalAvailable: z.number().nullish(),
  });
}

export function DistributionRecipientSchema(): z.ZodObject<
  Properties<DistributionRecipient>
> {
  return z.object({
    __typename: z.literal("DistributionRecipient").optional(),
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Invalid Ethereum address format",
    }),
    allocatedAmount: z.number(),
    chainId: z.number(),
    id: z.string(),
    rationale: z.string().nullish(),
    status: RecipientStatusSchema,
    txHash: z.string().nullish(),
  });
}

export function MarkRecipientFailedInputSchema(): z.ZodObject<
  Properties<MarkRecipientFailedInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function MarkRecipientRefundedInputSchema(): z.ZodObject<
  Properties<MarkRecipientRefundedInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function MarkRecipientSentInputSchema(): z.ZodObject<
  Properties<MarkRecipientSentInput>
> {
  return z.object({
    id: z.string(),
    txHash: z.string(),
  });
}

export function RemoveRecipientInputSchema(): z.ZodObject<
  Properties<RemoveRecipientInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function SetMethodologyInputSchema(): z.ZodObject<
  Properties<SetMethodologyInput>
> {
  return z.object({
    methodology: z.string().nullish(),
    totalAvailable: z.number().nullish(),
  });
}

export function UpdateRecipientInputSchema(): z.ZodObject<
  Properties<UpdateRecipientInput>
> {
  return z.object({
    allocatedAmount: z.number().nullish(),
    id: z.string(),
    rationale: z.string().nullish(),
  });
}
