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

export type AddGovernanceEndpointInput = {
  id: Scalars["OID"]["input"];
  platform: GovernancePlatform;
  url: Scalars["URL"]["input"];
};

export type AddWalletInput = {
  address: Scalars["EthereumAddress"]["input"];
  chainId: Scalars["Int"]["input"];
  id: Scalars["OID"]["input"];
  label?: InputMaybe<Scalars["String"]["input"]>;
};

export type ContributorKind = "COMPANY" | "DAO" | "FOUNDATION" | "INDIVIDUAL";

export type ContributorProfileState = {
  displayName: Scalars["String"]["output"];
  farcasterHandle: Maybe<Scalars["String"]["output"]>;
  governanceEndpoints: Array<GovernanceEndpoint>;
  kind: ContributorKind;
  legalName: Maybe<Scalars["String"]["output"]>;
  trustLevel: TrustLevel;
  twitterHandle: Maybe<Scalars["String"]["output"]>;
  walletAddresses: Array<ContributorWallet>;
  websiteUrl: Maybe<Scalars["URL"]["output"]>;
};

export type ContributorWallet = {
  address: Scalars["EthereumAddress"]["output"];
  chainId: Scalars["Int"]["output"];
  id: Scalars["OID"]["output"];
  label: Maybe<Scalars["String"]["output"]>;
};

export type GovernanceEndpoint = {
  id: Scalars["OID"]["output"];
  platform: GovernancePlatform;
  url: Scalars["URL"]["output"];
};

export type GovernancePlatform =
  | "AGORA"
  | "FORUM"
  | "OTHER"
  | "SNAPSHOT"
  | "TALLY";

export type RemoveGovernanceEndpointInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveWalletInput = {
  id: Scalars["OID"]["input"];
};

export type SetProfileDetailsInput = {
  displayName?: InputMaybe<Scalars["String"]["input"]>;
  farcasterHandle?: InputMaybe<Scalars["String"]["input"]>;
  kind?: InputMaybe<ContributorKind>;
  legalName?: InputMaybe<Scalars["String"]["input"]>;
  twitterHandle?: InputMaybe<Scalars["String"]["input"]>;
  websiteUrl?: InputMaybe<Scalars["URL"]["input"]>;
};

export type SetTrustLevelInput = {
  trustLevel: TrustLevel;
};

export type TrustLevel = "ANNOUNCED" | "ANONYMOUS" | "VERIFIED";
