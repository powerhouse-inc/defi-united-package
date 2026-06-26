export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Address: { input: `${string}:0x${string}`; output: `${string}:0x${string}` };
  Amount: {
    input: { unit?: string; value?: number };
    output: { unit?: string; value?: number };
  };
  Amount_Crypto: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Currency: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Fiat: {
    input: { unit: string; value: number };
    output: { unit: string; value: number };
  };
  Amount_Money: { input: number; output: number };
  Amount_Percentage: { input: number; output: number };
  Amount_Tokens: { input: number; output: number };
  AttachmentRef: {
    input: `attachment://v${number}:${string}`;
    output: `attachment://v${number}:${string}`;
  };
  Currency: { input: string; output: string };
  Date: { input: string; output: string };
  DateTime: { input: string; output: string };
  EmailAddress: { input: string; output: string };
  EthereumAddress: { input: string; output: string };
  OID: { input: string; output: string };
  OLabel: { input: string; output: string };
  PHID: { input: string; output: string };
  URL: { input: string; output: string };
  Unknown: { input: unknown; output: unknown };
  Upload: { input: File; output: File };
};

export type AttachPledgeInput = {
  pledgeId: Scalars["PHID"]["input"];
};

export type ClearMatchInput = {
  _?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MarkAmbiguousInput = {
  _?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MarkReorgedInput = {
  _?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type OnchainReceiptState = {
  amount: Maybe<Scalars["Amount_Tokens"]["output"]>;
  asset: Maybe<ReceiptAsset>;
  blockNumber: Maybe<Scalars["Int"]["output"]>;
  blockTimestamp: Maybe<Scalars["DateTime"]["output"]>;
  chainId: Maybe<Scalars["Int"]["output"]>;
  ethEquivalentAmount: Maybe<Scalars["Amount_Tokens"]["output"]>;
  ethPriceUsdAtReceipt: Maybe<Scalars["Float"]["output"]>;
  fromAddress: Maybe<Scalars["EthereumAddress"]["output"]>;
  matchedPledgeId: Maybe<Scalars["PHID"]["output"]>;
  rawLog: Maybe<Scalars["String"]["output"]>;
  reconciliationStatus: ReconciliationStatus;
  toAddress: Maybe<Scalars["EthereumAddress"]["output"]>;
  txHash: Maybe<Scalars["String"]["output"]>;
};

export type OverrideMatchInput = {
  pledgeId: Scalars["PHID"]["input"];
};

export type ReceiptAsset = {
  contractAddress: Maybe<Scalars["EthereumAddress"]["output"]>;
  symbol: Scalars["String"]["output"];
};

export type ReceiptAssetInput = {
  contractAddress?: InputMaybe<Scalars["EthereumAddress"]["input"]>;
  symbol: Scalars["String"]["input"];
};

export type ReconciliationStatus =
  | "AMBIGUOUS"
  | "MANUALLY_OVERRIDDEN"
  | "MATCHED"
  | "REORGED"
  | "UNMATCHED";

export type RecordReceiptInput = {
  amount: Scalars["Amount_Tokens"]["input"];
  asset: ReceiptAssetInput;
  blockNumber: Scalars["Int"]["input"];
  blockTimestamp: Scalars["DateTime"]["input"];
  chainId: Scalars["Int"]["input"];
  ethEquivalentAmount: Scalars["Amount_Tokens"]["input"];
  ethPriceUsdAtReceipt: Scalars["Float"]["input"];
  fromAddress: Scalars["EthereumAddress"]["input"];
  rawLog?: InputMaybe<Scalars["String"]["input"]>;
  toAddress: Scalars["EthereumAddress"]["input"];
  txHash: Scalars["String"]["input"];
};
