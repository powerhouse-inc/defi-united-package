/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddContributionAddressInput,
  AddExternalLinkInput,
  AddOperatorWalletInput,
  AffectedAsset,
  AffectedAssetInput,
  ArchiveCampaignInput,
  CampaignStatus,
  ContributionAddress,
  ExternalLink,
  MarkFailedInput,
  MarkResolvedInput,
  ReliefCampaignState,
  RemoveContributionAddressInput,
  RemoveOperatorWalletInput,
  SetCampaignDetailsInput,
  StartCampaignInput,
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

export const CampaignStatusSchema = z.enum([
  "ACTIVE",
  "ARCHIVED",
  "DRAFT",
  "EXECUTING",
  "FAILED",
  "RESOLVED",
]);

export function AddContributionAddressInputSchema(): z.ZodObject<
  Properties<AddContributionAddressInput>
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

export function AddExternalLinkInputSchema(): z.ZodObject<
  Properties<AddExternalLinkInput>
> {
  return z.object({
    id: z.string(),
    label: z.string(),
    url: z.url(),
  });
}

export function AddOperatorWalletInputSchema(): z.ZodObject<
  Properties<AddOperatorWalletInput>
> {
  return z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Invalid Ethereum address format",
    }),
  });
}

export function AffectedAssetSchema(): z.ZodObject<Properties<AffectedAsset>> {
  return z.object({
    __typename: z.literal("AffectedAsset").optional(),
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

export function AffectedAssetInputSchema(): z.ZodObject<
  Properties<AffectedAssetInput>
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

export function ArchiveCampaignInputSchema(): z.ZodObject<
  Properties<ArchiveCampaignInput>
> {
  return z.object({
    _: z.boolean().nullish(),
  });
}

export function ContributionAddressSchema(): z.ZodObject<
  Properties<ContributionAddress>
> {
  return z.object({
    __typename: z.literal("ContributionAddress").optional(),
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Invalid Ethereum address format",
    }),
    chainId: z.number(),
    id: z.string(),
    label: z.string().nullish(),
  });
}

export function ExternalLinkSchema(): z.ZodObject<Properties<ExternalLink>> {
  return z.object({
    __typename: z.literal("ExternalLink").optional(),
    id: z.string(),
    label: z.string(),
    url: z.url(),
  });
}

export function MarkFailedInputSchema(): z.ZodObject<
  Properties<MarkFailedInput>
> {
  return z.object({
    reason: z.string().nullish(),
  });
}

export function MarkResolvedInputSchema(): z.ZodObject<
  Properties<MarkResolvedInput>
> {
  return z.object({
    _: z.boolean().nullish(),
  });
}

export function ReliefCampaignStateSchema(): z.ZodObject<
  Properties<ReliefCampaignState>
> {
  return z.object({
    __typename: z.literal("ReliefCampaignState").optional(),
    affectedAsset: z.lazy(() => AffectedAssetSchema().nullish()),
    contributionAddresses: z.array(z.lazy(() => ContributionAddressSchema())),
    contributorRegistryDriveId: z.string().nullish(),
    externalLinks: z.array(z.lazy(() => ExternalLinkSchema())),
    incidentDate: z.iso.datetime().nullish(),
    name: z.string(),
    operatorWallets: z.array(
      z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
        message: "Invalid Ethereum address format",
      }),
    ),
    riskDisclaimer: z.string().nullish(),
    slug: z.string(),
    status: CampaignStatusSchema,
    summary: z.string().nullish(),
    targetAmount: z.number().nullish(),
  });
}

export function RemoveContributionAddressInputSchema(): z.ZodObject<
  Properties<RemoveContributionAddressInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveOperatorWalletInputSchema(): z.ZodObject<
  Properties<RemoveOperatorWalletInput>
> {
  return z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Invalid Ethereum address format",
    }),
  });
}

export function SetCampaignDetailsInputSchema(): z.ZodObject<
  Properties<SetCampaignDetailsInput>
> {
  return z.object({
    affectedAsset: z.lazy(() => AffectedAssetInputSchema().nullish()),
    contributorRegistryDriveId: z.string().nullish(),
    incidentDate: z.iso.datetime().nullish(),
    name: z.string().nullish(),
    riskDisclaimer: z.string().nullish(),
    slug: z.string().nullish(),
    summary: z.string().nullish(),
    targetAmount: z.number().nullish(),
  });
}

export function StartCampaignInputSchema(): z.ZodObject<
  Properties<StartCampaignInput>
> {
  return z.object({
    _: z.boolean().nullish(),
  });
}
