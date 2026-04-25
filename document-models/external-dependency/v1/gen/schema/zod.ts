/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AbandonInput,
  DependencyKind,
  DependencyRef,
  DependencyStatus,
  ExternalDependencyState,
  LinkPledgeInput,
  ResolveInput,
  SetDependencyDetailsInput,
  SetExternalRefInput,
  UnlinkPledgeInput,
  UpdateStatusInput,
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

export const DependencyKindSchema = z.enum([
  "COUNCIL_ACTION",
  "GOVERNANCE_VOTE",
  "ONCHAIN_TX",
  "OPERATIONAL",
  "OTHER",
]);

export const DependencyStatusSchema = z.enum([
  "ABANDONED",
  "BLOCKED",
  "IN_PROGRESS",
  "OPEN",
  "RESOLVED",
]);

export function AbandonInputSchema(): z.ZodObject<Properties<AbandonInput>> {
  return z.object({
    _: z.boolean().nullish(),
  });
}

export function DependencyRefSchema(): z.ZodObject<Properties<DependencyRef>> {
  return z.object({
    __typename: z.literal("DependencyRef").optional(),
    proposalId: z.string().nullish(),
    txHash: z.string().nullish(),
    url: z.url().nullish(),
  });
}

export function ExternalDependencyStateSchema(): z.ZodObject<
  Properties<ExternalDependencyState>
> {
  return z.object({
    __typename: z.literal("ExternalDependencyState").optional(),
    assignee: z.string().nullish(),
    blocks: z.array(z.string()),
    description: z.string().nullish(),
    expectedResolution: z.iso.datetime().nullish(),
    externalRef: z.lazy(() => DependencyRefSchema().nullish()),
    kind: DependencyKindSchema,
    status: DependencyStatusSchema,
    title: z.string(),
  });
}

export function LinkPledgeInputSchema(): z.ZodObject<
  Properties<LinkPledgeInput>
> {
  return z.object({
    pledgeId: z.string(),
  });
}

export function ResolveInputSchema(): z.ZodObject<Properties<ResolveInput>> {
  return z.object({
    _: z.boolean().nullish(),
  });
}

export function SetDependencyDetailsInputSchema(): z.ZodObject<
  Properties<SetDependencyDetailsInput>
> {
  return z.object({
    assignee: z.string().nullish(),
    description: z.string().nullish(),
    expectedResolution: z.iso.datetime().nullish(),
    kind: DependencyKindSchema.nullish(),
    title: z.string().nullish(),
  });
}

export function SetExternalRefInputSchema(): z.ZodObject<
  Properties<SetExternalRefInput>
> {
  return z.object({
    proposalId: z.string().nullish(),
    txHash: z.string().nullish(),
    url: z.url().nullish(),
  });
}

export function UnlinkPledgeInputSchema(): z.ZodObject<
  Properties<UnlinkPledgeInput>
> {
  return z.object({
    pledgeId: z.string(),
  });
}

export function UpdateStatusInputSchema(): z.ZodObject<
  Properties<UpdateStatusInput>
> {
  return z.object({
    status: DependencyStatusSchema,
  });
}
