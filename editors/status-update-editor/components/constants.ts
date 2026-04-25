import type {
  AnnouncementPlatform,
  UpdateVisibility,
} from "../../../document-models/status-update/v1/gen/schema/types.js";

export const VISIBILITY_OPTIONS: UpdateVisibility[] = [
  "PUBLIC",
  "CONTRIBUTORS_ONLY",
  "INTERNAL",
];

export const VISIBILITY_LABEL: Record<UpdateVisibility, string> = {
  PUBLIC: "Public",
  CONTRIBUTORS_ONLY: "Contributors only",
  INTERNAL: "Internal",
};

export const VISIBILITY_BADGE: Record<
  UpdateVisibility,
  { bg: string; fg: string; dot: string }
> = {
  PUBLIC: {
    bg: "bg-emerald-50",
    fg: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  CONTRIBUTORS_ONLY: {
    bg: "bg-amber-50",
    fg: "text-amber-700",
    dot: "bg-amber-500",
  },
  INTERNAL: {
    bg: "bg-neutral-100",
    fg: "text-neutral-600",
    dot: "bg-neutral-400",
  },
};

export const PLATFORM_OPTIONS: AnnouncementPlatform[] = [
  "TWITTER",
  "FARCASTER",
  "MIRROR",
  "BLOG",
];

export const PLATFORM_LABEL: Record<AnnouncementPlatform, string> = {
  TWITTER: "Twitter / X",
  FARCASTER: "Farcaster",
  MIRROR: "Mirror",
  BLOG: "Blog",
};
