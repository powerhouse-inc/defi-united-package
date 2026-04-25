/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AttachAnnouncementInput,
  DraftUpdateInput,
  EditUpdateInput,
  PublishUpdateInput,
  RetractUpdateInput,
  SetVisibilityInput,
} from "../types.js";

export type DraftUpdateAction = Action & {
  type: "DRAFT_UPDATE";
  input: DraftUpdateInput;
};
export type EditUpdateAction = Action & {
  type: "EDIT_UPDATE";
  input: EditUpdateInput;
};
export type PublishUpdateAction = Action & {
  type: "PUBLISH_UPDATE";
  input: PublishUpdateInput;
};
export type AttachAnnouncementAction = Action & {
  type: "ATTACH_ANNOUNCEMENT";
  input: AttachAnnouncementInput;
};
export type RetractUpdateAction = Action & {
  type: "RETRACT_UPDATE";
  input: RetractUpdateInput;
};
export type SetVisibilityAction = Action & {
  type: "SET_VISIBILITY";
  input: SetVisibilityInput;
};

export type StatusUpdatePublishingAction =
  | DraftUpdateAction
  | EditUpdateAction
  | PublishUpdateAction
  | AttachAnnouncementAction
  | RetractUpdateAction
  | SetVisibilityAction;
