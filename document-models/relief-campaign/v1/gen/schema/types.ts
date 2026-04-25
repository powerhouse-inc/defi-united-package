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

export type AddContributionAddressInput = {
  address: Scalars["EthereumAddress"]["input"];
  chainId: Scalars["Int"]["input"];
  id: Scalars["OID"]["input"];
  label?: InputMaybe<Scalars["String"]["input"]>;
};

export type AddExternalLinkInput = {
  id: Scalars["OID"]["input"];
  label: Scalars["String"]["input"];
  url: Scalars["URL"]["input"];
};

export type AddOperatorWalletInput = {
  address: Scalars["EthereumAddress"]["input"];
};

export type AffectedAsset = {
  address: Maybe<Scalars["EthereumAddress"]["output"]>;
  chainId: Scalars["Int"]["output"];
  symbol: Scalars["String"]["output"];
};

export type AffectedAssetInput = {
  address?: InputMaybe<Scalars["EthereumAddress"]["input"]>;
  chainId: Scalars["Int"]["input"];
  symbol: Scalars["String"]["input"];
};

export type ArchiveCampaignInput = {
  _?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type CampaignStatus =
  | "ACTIVE"
  | "ARCHIVED"
  | "DRAFT"
  | "EXECUTING"
  | "FAILED"
  | "RESOLVED";

export type ContributionAddress = {
  address: Scalars["EthereumAddress"]["output"];
  chainId: Scalars["Int"]["output"];
  id: Scalars["OID"]["output"];
  label: Maybe<Scalars["String"]["output"]>;
};

export type ExternalLink = {
  id: Scalars["OID"]["output"];
  label: Scalars["String"]["output"];
  url: Scalars["URL"]["output"];
};

export type MarkFailedInput = {
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type MarkResolvedInput = {
  _?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type ReliefCampaignState = {
  affectedAsset: Maybe<AffectedAsset>;
  contributionAddresses: Array<ContributionAddress>;
  contributorRegistryDriveId: Maybe<Scalars["PHID"]["output"]>;
  externalLinks: Array<ExternalLink>;
  incidentDate: Maybe<Scalars["DateTime"]["output"]>;
  name: Scalars["String"]["output"];
  operatorWallets: Array<Scalars["EthereumAddress"]["output"]>;
  riskDisclaimer: Maybe<Scalars["String"]["output"]>;
  slug: Scalars["String"]["output"];
  status: CampaignStatus;
  summary: Maybe<Scalars["String"]["output"]>;
  targetAmount: Maybe<Scalars["Amount_Tokens"]["output"]>;
};

export type RemoveContributionAddressInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveOperatorWalletInput = {
  address: Scalars["EthereumAddress"]["input"];
};

export type SetCampaignDetailsInput = {
  affectedAsset?: InputMaybe<AffectedAssetInput>;
  contributorRegistryDriveId?: InputMaybe<Scalars["PHID"]["input"]>;
  incidentDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  riskDisclaimer?: InputMaybe<Scalars["String"]["input"]>;
  slug?: InputMaybe<Scalars["String"]["input"]>;
  summary?: InputMaybe<Scalars["String"]["input"]>;
  targetAmount?: InputMaybe<Scalars["Amount_Tokens"]["input"]>;
};

export type StartCampaignInput = {
  _?: InputMaybe<Scalars["Boolean"]["input"]>;
};
