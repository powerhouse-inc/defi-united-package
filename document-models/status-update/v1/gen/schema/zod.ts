/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AnnouncementPlatform,
  AttachAnnouncementInput,
  DraftUpdateInput,
  EditUpdateInput,
  ExternalAnnouncement,
  MetricsSnapshot,
  MetricsSnapshotInput,
  PublishUpdateInput,
  RetractUpdateInput,
  SetVisibilityInput,
  StatusUpdateState,
  UpdateVisibility,
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

export const AnnouncementPlatformSchema = z.enum([
  "BLOG",
  "FARCASTER",
  "MIRROR",
  "TWITTER",
]);

export const UpdateVisibilitySchema = z.enum([
  "CONTRIBUTORS_ONLY",
  "INTERNAL",
  "PUBLIC",
]);

export function AttachAnnouncementInputSchema(): z.ZodObject<
  Properties<AttachAnnouncementInput>
> {
  return z.object({
    id: z.string(),
    platform: AnnouncementPlatformSchema,
    url: z.url(),
  });
}

export function DraftUpdateInputSchema(): z.ZodObject<
  Properties<DraftUpdateInput>
> {
  return z.object({
    authorProfileId: z.string().nullish(),
    body: z.string().nullish(),
    title: z.string().nullish(),
    visibility: UpdateVisibilitySchema.nullish(),
  });
}

export function EditUpdateInputSchema(): z.ZodObject<
  Properties<EditUpdateInput>
> {
  return z.object({
    body: z.string().nullish(),
    title: z.string().nullish(),
  });
}

export function ExternalAnnouncementSchema(): z.ZodObject<
  Properties<ExternalAnnouncement>
> {
  return z.object({
    __typename: z.literal("ExternalAnnouncement").optional(),
    id: z.string(),
    platform: AnnouncementPlatformSchema,
    url: z.url(),
  });
}

export function MetricsSnapshotSchema(): z.ZodObject<
  Properties<MetricsSnapshot>
> {
  return z.object({
    __typename: z.literal("MetricsSnapshot").optional(),
    dependenciesResolved: z.number().nullish(),
    totalPledged: z.number().nullish(),
    totalReceived: z.number().nullish(),
  });
}

export function MetricsSnapshotInputSchema(): z.ZodObject<
  Properties<MetricsSnapshotInput>
> {
  return z.object({
    dependenciesResolved: z.number().nullish(),
    totalPledged: z.number().nullish(),
    totalReceived: z.number().nullish(),
  });
}

export function PublishUpdateInputSchema(): z.ZodObject<
  Properties<PublishUpdateInput>
> {
  return z.object({
    metricsSnapshot: z.lazy(() => MetricsSnapshotInputSchema().nullish()),
    publishedAt: z.iso.datetime(),
  });
}

export function RetractUpdateInputSchema(): z.ZodObject<
  Properties<RetractUpdateInput>
> {
  return z.object({
    _: z.boolean().nullish(),
  });
}

export function SetVisibilityInputSchema(): z.ZodObject<
  Properties<SetVisibilityInput>
> {
  return z.object({
    visibility: UpdateVisibilitySchema,
  });
}

export function StatusUpdateStateSchema(): z.ZodObject<
  Properties<StatusUpdateState>
> {
  return z.object({
    __typename: z.literal("StatusUpdateState").optional(),
    authorProfileId: z.string().nullish(),
    body: z.string(),
    externalAnnouncements: z.array(z.lazy(() => ExternalAnnouncementSchema())),
    metricsSnapshot: z.lazy(() => MetricsSnapshotSchema().nullish()),
    publishedAt: z.iso.datetime().nullish(),
    title: z.string(),
    visibility: UpdateVisibilitySchema,
  });
}
