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
  Attachment: { input: string; output: string };
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

export type AbandonInput = {
  _?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type DependencyKind =
  | "COUNCIL_ACTION"
  | "GOVERNANCE_VOTE"
  | "ONCHAIN_TX"
  | "OPERATIONAL"
  | "OTHER";

export type DependencyRef = {
  proposalId: Maybe<Scalars["String"]["output"]>;
  txHash: Maybe<Scalars["String"]["output"]>;
  url: Maybe<Scalars["URL"]["output"]>;
};

export type DependencyStatus =
  | "ABANDONED"
  | "BLOCKED"
  | "IN_PROGRESS"
  | "OPEN"
  | "RESOLVED";

export type ExternalDependencyState = {
  assignee: Maybe<Scalars["String"]["output"]>;
  blocks: Array<Scalars["PHID"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  expectedResolution: Maybe<Scalars["DateTime"]["output"]>;
  externalRef: Maybe<DependencyRef>;
  kind: DependencyKind;
  status: DependencyStatus;
  title: Scalars["String"]["output"];
};

export type LinkPledgeInput = {
  pledgeId: Scalars["PHID"]["input"];
};

export type ResolveInput = {
  _?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type SetDependencyDetailsInput = {
  assignee?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  expectedResolution?: InputMaybe<Scalars["DateTime"]["input"]>;
  kind?: InputMaybe<DependencyKind>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetExternalRefInput = {
  proposalId?: InputMaybe<Scalars["String"]["input"]>;
  txHash?: InputMaybe<Scalars["String"]["input"]>;
  url?: InputMaybe<Scalars["URL"]["input"]>;
};

export type UnlinkPledgeInput = {
  pledgeId: Scalars["PHID"]["input"];
};

export type UpdateStatusInput = {
  status: DependencyStatus;
};
