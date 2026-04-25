/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddGovernanceEndpointInput,
  AddWalletInput,
  ContributorKind,
  ContributorProfileState,
  ContributorWallet,
  GovernanceEndpoint,
  GovernancePlatform,
  RemoveGovernanceEndpointInput,
  RemoveWalletInput,
  SetProfileDetailsInput,
  SetTrustLevelInput,
  TrustLevel,
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

export const ContributorKindSchema = z.enum([
  "COMPANY",
  "DAO",
  "FOUNDATION",
  "INDIVIDUAL",
]);

export const GovernancePlatformSchema = z.enum([
  "AGORA",
  "FORUM",
  "OTHER",
  "SNAPSHOT",
  "TALLY",
]);

export const TrustLevelSchema = z.enum(["ANNOUNCED", "ANONYMOUS", "VERIFIED"]);

export function AddGovernanceEndpointInputSchema(): z.ZodObject<
  Properties<AddGovernanceEndpointInput>
> {
  return z.object({
    id: z.string(),
    platform: GovernancePlatformSchema,
    url: z.url(),
  });
}

export function AddWalletInputSchema(): z.ZodObject<
  Properties<AddWalletInput>
> {
  return z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Invalid Ethereum address format",
    }),
    chainId: z.number(),
    id: z.string(),
    label: z.string().nullish(),
  });
}

export function ContributorProfileStateSchema(): z.ZodObject<
  Properties<ContributorProfileState>
> {
  return z.object({
    __typename: z.literal("ContributorProfileState").optional(),
    displayName: z.string(),
    farcasterHandle: z.string().nullish(),
    governanceEndpoints: z.array(z.lazy(() => GovernanceEndpointSchema())),
    kind: ContributorKindSchema,
    legalName: z.string().nullish(),
    trustLevel: TrustLevelSchema,
    twitterHandle: z.string().nullish(),
    walletAddresses: z.array(z.lazy(() => ContributorWalletSchema())),
    websiteUrl: z.url().nullish(),
  });
}

export function ContributorWalletSchema(): z.ZodObject<
  Properties<ContributorWallet>
> {
  return z.object({
    __typename: z.literal("ContributorWallet").optional(),
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Invalid Ethereum address format",
    }),
    chainId: z.number(),
    id: z.string(),
    label: z.string().nullish(),
  });
}

export function GovernanceEndpointSchema(): z.ZodObject<
  Properties<GovernanceEndpoint>
> {
  return z.object({
    __typename: z.literal("GovernanceEndpoint").optional(),
    id: z.string(),
    platform: GovernancePlatformSchema,
    url: z.url(),
  });
}

export function RemoveGovernanceEndpointInputSchema(): z.ZodObject<
  Properties<RemoveGovernanceEndpointInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveWalletInputSchema(): z.ZodObject<
  Properties<RemoveWalletInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function SetProfileDetailsInputSchema(): z.ZodObject<
  Properties<SetProfileDetailsInput>
> {
  return z.object({
    displayName: z.string().nullish(),
    farcasterHandle: z.string().nullish(),
    kind: ContributorKindSchema.nullish(),
    legalName: z.string().nullish(),
    twitterHandle: z.string().nullish(),
    websiteUrl: z.url().nullish(),
  });
}

export function SetTrustLevelInputSchema(): z.ZodObject<
  Properties<SetTrustLevelInput>
> {
  return z.object({
    trustLevel: TrustLevelSchema,
  });
}
