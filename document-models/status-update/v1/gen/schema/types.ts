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

export type AnnouncementPlatform = "BLOG" | "FARCASTER" | "MIRROR" | "TWITTER";

export type AttachAnnouncementInput = {
  id: Scalars["OID"]["input"];
  platform: AnnouncementPlatform;
  url: Scalars["URL"]["input"];
};

export type DraftUpdateInput = {
  authorProfileId?: InputMaybe<Scalars["PHID"]["input"]>;
  body?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  visibility?: InputMaybe<UpdateVisibility>;
};

export type EditUpdateInput = {
  body?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type ExternalAnnouncement = {
  id: Scalars["OID"]["output"];
  platform: AnnouncementPlatform;
  url: Scalars["URL"]["output"];
};

export type MetricsSnapshot = {
  dependenciesResolved: Maybe<Scalars["Int"]["output"]>;
  totalPledged: Maybe<Scalars["Amount_Tokens"]["output"]>;
  totalReceived: Maybe<Scalars["Amount_Tokens"]["output"]>;
};

export type MetricsSnapshotInput = {
  dependenciesResolved?: InputMaybe<Scalars["Int"]["input"]>;
  totalPledged?: InputMaybe<Scalars["Amount_Tokens"]["input"]>;
  totalReceived?: InputMaybe<Scalars["Amount_Tokens"]["input"]>;
};

export type PublishUpdateInput = {
  metricsSnapshot?: InputMaybe<MetricsSnapshotInput>;
  publishedAt: Scalars["DateTime"]["input"];
};

export type RetractUpdateInput = {
  _?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type SetVisibilityInput = {
  visibility: UpdateVisibility;
};

export type StatusUpdateState = {
  authorProfileId: Maybe<Scalars["PHID"]["output"]>;
  body: Scalars["String"]["output"];
  externalAnnouncements: Array<ExternalAnnouncement>;
  metricsSnapshot: Maybe<MetricsSnapshot>;
  publishedAt: Maybe<Scalars["DateTime"]["output"]>;
  title: Scalars["String"]["output"];
  visibility: UpdateVisibility;
};

export type UpdateVisibility = "CONTRIBUTORS_ONLY" | "INTERNAL" | "PUBLIC";
