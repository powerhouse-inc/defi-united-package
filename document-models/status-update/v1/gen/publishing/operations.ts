/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { StatusUpdateGlobalState } from "../types.js";
import type {
  AttachAnnouncementAction,
  DraftUpdateAction,
  EditUpdateAction,
  PublishUpdateAction,
  RetractUpdateAction,
  SetVisibilityAction,
} from "./actions.js";

export interface StatusUpdatePublishingOperations {
  draftUpdateOperation: (
    state: StatusUpdateGlobalState,
    action: DraftUpdateAction,
    dispatch?: SignalDispatch,
  ) => void;
  editUpdateOperation: (
    state: StatusUpdateGlobalState,
    action: EditUpdateAction,
    dispatch?: SignalDispatch,
  ) => void;
  publishUpdateOperation: (
    state: StatusUpdateGlobalState,
    action: PublishUpdateAction,
    dispatch?: SignalDispatch,
  ) => void;
  attachAnnouncementOperation: (
    state: StatusUpdateGlobalState,
    action: AttachAnnouncementAction,
    dispatch?: SignalDispatch,
  ) => void;
  retractUpdateOperation: (
    state: StatusUpdateGlobalState,
    action: RetractUpdateAction,
    dispatch?: SignalDispatch,
  ) => void;
  setVisibilityOperation: (
    state: StatusUpdateGlobalState,
    action: SetVisibilityAction,
    dispatch?: SignalDispatch,
  ) => void;
}
