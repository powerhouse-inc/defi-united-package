import type {
  ContributorKind,
  GovernancePlatform,
  TrustLevel,
} from "../../../document-models/contributor-profile/v1/gen/schema/types.js";

export const KIND_LABEL: Record<ContributorKind, string> = {
  DAO: "DAO",
  FOUNDATION: "Foundation",
  COMPANY: "Company",
  INDIVIDUAL: "Individual",
};

export const KIND_OPTIONS: ContributorKind[] = [
  "DAO",
  "FOUNDATION",
  "COMPANY",
  "INDIVIDUAL",
];

export const TRUST_LABEL: Record<TrustLevel, string> = {
  VERIFIED: "Verified",
  ANNOUNCED: "Announced",
  ANONYMOUS: "Anonymous",
};

export const TRUST_OPTIONS: TrustLevel[] = [
  "VERIFIED",
  "ANNOUNCED",
  "ANONYMOUS",
];

export const TRUST_BADGE: Record<TrustLevel, { bg: string; fg: string }> = {
  VERIFIED: { bg: "bg-emerald-50", fg: "text-emerald-700" },
  ANNOUNCED: { bg: "bg-sky-50", fg: "text-sky-700" },
  ANONYMOUS: { bg: "bg-neutral-100", fg: "text-neutral-600" },
};

export const PLATFORM_LABEL: Record<GovernancePlatform, string> = {
  SNAPSHOT: "Snapshot",
  TALLY: "Tally",
  FORUM: "Forum",
  AGORA: "Agora",
  OTHER: "Other",
};

export const PLATFORM_OPTIONS: GovernancePlatform[] = [
  "SNAPSHOT",
  "TALLY",
  "FORUM",
  "AGORA",
  "OTHER",
];
