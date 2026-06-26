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

export type AttachGovernanceInput = {
  platform: GovernancePlatform;
  proposalUrl: Scalars["URL"]["input"];
  quorumStatus?: InputMaybe<Scalars["String"]["input"]>;
  voteEndDate?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type CancelPledgeInput = {
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type EditNotesInput = {
  internalNotes?: InputMaybe<Scalars["String"]["input"]>;
  publicNotes?: InputMaybe<Scalars["String"]["input"]>;
};

export type FailPledgeInput = {
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type GovernancePlatform =
  | "AGORA"
  | "FORUM"
  | "OTHER"
  | "SNAPSHOT"
  | "TALLY";

export type MarkConfirmedInput = {
  _?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MarkGovernancePendingInput = {
  _?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MarkReceivedInput = {
  amount: Scalars["Amount_Tokens"]["input"];
  receiptId: Scalars["PHID"]["input"];
  receivedAt: Scalars["DateTime"]["input"];
};

export type PledgeAsset = {
  address: Maybe<Scalars["EthereumAddress"]["output"]>;
  chainId: Scalars["Int"]["output"];
  symbol: Scalars["String"]["output"];
};

export type PledgeAssetInput = {
  address?: InputMaybe<Scalars["EthereumAddress"]["input"]>;
  chainId: Scalars["Int"]["input"];
  symbol: Scalars["String"]["input"];
};

export type PledgeGovernance = {
  platform: GovernancePlatform;
  proposalUrl: Scalars["URL"]["output"];
  quorumStatus: Maybe<Scalars["String"]["output"]>;
  voteEndDate: Maybe<Scalars["DateTime"]["output"]>;
};

export type PledgeState = {
  asset: Maybe<PledgeAsset>;
  contributorProfileId: Maybe<Scalars["PHID"]["output"]>;
  governance: Maybe<PledgeGovernance>;
  internalNotes: Maybe<Scalars["String"]["output"]>;
  pledgedAmount: Maybe<Scalars["Amount_Tokens"]["output"]>;
  publicNotes: Maybe<Scalars["String"]["output"]>;
  receiptIds: Array<Scalars["PHID"]["output"]>;
  receivedAmount: Maybe<Scalars["Amount_Tokens"]["output"]>;
  receivedAt: Maybe<Scalars["DateTime"]["output"]>;
  status: PledgeStatus;
};

export type PledgeStatus =
  | "CANCELLED"
  | "CONFIRMED"
  | "FAILED"
  | "GOVERNANCE_PENDING"
  | "PROPOSED"
  | "RECEIVED";

export type ProposePledgeInput = {
  asset: PledgeAssetInput;
  contributorProfileId: Scalars["PHID"]["input"];
  internalNotes?: InputMaybe<Scalars["String"]["input"]>;
  pledgedAmount: Scalars["Amount_Tokens"]["input"];
  publicNotes?: InputMaybe<Scalars["String"]["input"]>;
};
