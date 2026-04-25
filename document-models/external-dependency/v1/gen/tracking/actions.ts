/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AbandonInput,
  LinkPledgeInput,
  ResolveInput,
  SetDependencyDetailsInput,
  SetExternalRefInput,
  UnlinkPledgeInput,
  UpdateStatusInput,
} from "../types.js";

export type SetDependencyDetailsAction = Action & {
  type: "SET_DEPENDENCY_DETAILS";
  input: SetDependencyDetailsInput;
};
export type UpdateStatusAction = Action & {
  type: "UPDATE_STATUS";
  input: UpdateStatusInput;
};
export type LinkPledgeAction = Action & {
  type: "LINK_PLEDGE";
  input: LinkPledgeInput;
};
export type UnlinkPledgeAction = Action & {
  type: "UNLINK_PLEDGE";
  input: UnlinkPledgeInput;
};
export type ResolveAction = Action & { type: "RESOLVE"; input: ResolveInput };
export type AbandonAction = Action & { type: "ABANDON"; input: AbandonInput };
export type SetExternalRefAction = Action & {
  type: "SET_EXTERNAL_REF";
  input: SetExternalRefInput;
};

export type ExternalDependencyTrackingAction =
  | SetDependencyDetailsAction
  | UpdateStatusAction
  | LinkPledgeAction
  | UnlinkPledgeAction
  | ResolveAction
  | AbandonAction
  | SetExternalRefAction;
