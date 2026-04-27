/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AttachPledgeInput,
  ClearMatchInput,
  MarkAmbiguousInput,
  MarkReorgedInput,
  OnchainReceiptState,
  OverrideMatchInput,
  ReceiptAsset,
  ReceiptAssetInput,
  ReconciliationStatus,
  RecordReceiptInput,
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

export const ReconciliationStatusSchema = z.enum([
  "AMBIGUOUS",
  "MANUALLY_OVERRIDDEN",
  "MATCHED",
  "REORGED",
  "UNMATCHED",
]);

export function AttachPledgeInputSchema(): z.ZodObject<
  Properties<AttachPledgeInput>
> {
  return z.object({
    pledgeId: z.string(),
  });
}

export function ClearMatchInputSchema(): z.ZodObject<
  Properties<ClearMatchInput>
> {
  return z.object({
    _: z.boolean().nullish(),
  });
}

export function MarkAmbiguousInputSchema(): z.ZodObject<
  Properties<MarkAmbiguousInput>
> {
  return z.object({
    _: z.boolean().nullish(),
  });
}

export function MarkReorgedInputSchema(): z.ZodObject<
  Properties<MarkReorgedInput>
> {
  return z.object({
    _: z.boolean().nullish(),
  });
}

export function OnchainReceiptStateSchema(): z.ZodObject<
  Properties<OnchainReceiptState>
> {
  return z.object({
    __typename: z.literal("OnchainReceiptState").optional(),
    amount: z.number().nullish(),
    asset: z.lazy(() => ReceiptAssetSchema().nullish()),
    blockNumber: z.number().nullish(),
    blockTimestamp: z.iso.datetime().nullish(),
    chainId: z.number().nullish(),
    ethEquivalentAmount: z.number().nullish(),
    ethPriceUsdAtReceipt: z.number().nullish(),
    fromAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        message: "Invalid Ethereum address format",
      })
      .nullish(),
    matchedPledgeId: z.string().nullish(),
    rawLog: z.string().nullish(),
    reconciliationStatus: ReconciliationStatusSchema,
    toAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        message: "Invalid Ethereum address format",
      })
      .nullish(),
    txHash: z.string().nullish(),
  });
}

export function OverrideMatchInputSchema(): z.ZodObject<
  Properties<OverrideMatchInput>
> {
  return z.object({
    pledgeId: z.string(),
  });
}

export function ReceiptAssetSchema(): z.ZodObject<Properties<ReceiptAsset>> {
  return z.object({
    __typename: z.literal("ReceiptAsset").optional(),
    contractAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        message: "Invalid Ethereum address format",
      })
      .nullish(),
    symbol: z.string(),
  });
}

export function ReceiptAssetInputSchema(): z.ZodObject<
  Properties<ReceiptAssetInput>
> {
  return z.object({
    contractAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        message: "Invalid Ethereum address format",
      })
      .nullish(),
    symbol: z.string(),
  });
}

export function RecordReceiptInputSchema(): z.ZodObject<
  Properties<RecordReceiptInput>
> {
  return z.object({
    amount: z.number(),
    asset: z.lazy(() => ReceiptAssetInputSchema()),
    blockNumber: z.number(),
    blockTimestamp: z.iso.datetime(),
    chainId: z.number(),
    ethEquivalentAmount: z.number(),
    ethPriceUsdAtReceipt: z.number(),
    fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Invalid Ethereum address format",
    }),
    rawLog: z.string().nullish(),
    toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Invalid Ethereum address format",
    }),
    txHash: z.string(),
  });
}
