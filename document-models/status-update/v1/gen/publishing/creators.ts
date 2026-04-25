/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AttachAnnouncementInputSchema,
  DraftUpdateInputSchema,
  EditUpdateInputSchema,
  PublishUpdateInputSchema,
  RetractUpdateInputSchema,
  SetVisibilityInputSchema,
} from "../schema/zod.js";
import type {
  AttachAnnouncementInput,
  DraftUpdateInput,
  EditUpdateInput,
  PublishUpdateInput,
  RetractUpdateInput,
  SetVisibilityInput,
} from "../types.js";
import type {
  AttachAnnouncementAction,
  DraftUpdateAction,
  EditUpdateAction,
  PublishUpdateAction,
  RetractUpdateAction,
  SetVisibilityAction,
} from "./actions.js";

export const draftUpdate = (input: DraftUpdateInput) =>
  createAction<DraftUpdateAction>(
    "DRAFT_UPDATE",
    { ...input },
    undefined,
    DraftUpdateInputSchema,
    "global",
  );

export const editUpdate = (input: EditUpdateInput) =>
  createAction<EditUpdateAction>(
    "EDIT_UPDATE",
    { ...input },
    undefined,
    EditUpdateInputSchema,
    "global",
  );

export const publishUpdate = (input: PublishUpdateInput) =>
  createAction<PublishUpdateAction>(
    "PUBLISH_UPDATE",
    { ...input },
    undefined,
    PublishUpdateInputSchema,
    "global",
  );

export const attachAnnouncement = (input: AttachAnnouncementInput) =>
  createAction<AttachAnnouncementAction>(
    "ATTACH_ANNOUNCEMENT",
    { ...input },
    undefined,
    AttachAnnouncementInputSchema,
    "global",
  );

export const retractUpdate = (input: RetractUpdateInput) =>
  createAction<RetractUpdateAction>(
    "RETRACT_UPDATE",
    { ...input },
    undefined,
    RetractUpdateInputSchema,
    "global",
  );

export const setVisibility = (input: SetVisibilityInput) =>
  createAction<SetVisibilityAction>(
    "SET_VISIBILITY",
    { ...input },
    undefined,
    SetVisibilityInputSchema,
    "global",
  );
