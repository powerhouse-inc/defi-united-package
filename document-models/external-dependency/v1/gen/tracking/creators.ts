/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AbandonInputSchema,
  LinkPledgeInputSchema,
  ResolveInputSchema,
  SetDependencyDetailsInputSchema,
  SetExternalRefInputSchema,
  UnlinkPledgeInputSchema,
  UpdateStatusInputSchema,
} from "../schema/zod.js";
import type {
  AbandonInput,
  LinkPledgeInput,
  ResolveInput,
  SetDependencyDetailsInput,
  SetExternalRefInput,
  UnlinkPledgeInput,
  UpdateStatusInput,
} from "../types.js";
import type {
  AbandonAction,
  LinkPledgeAction,
  ResolveAction,
  SetDependencyDetailsAction,
  SetExternalRefAction,
  UnlinkPledgeAction,
  UpdateStatusAction,
} from "./actions.js";

export const setDependencyDetails = (input: SetDependencyDetailsInput) =>
  createAction<SetDependencyDetailsAction>(
    "SET_DEPENDENCY_DETAILS",
    { ...input },
    undefined,
    SetDependencyDetailsInputSchema,
    "global",
  );

export const updateStatus = (input: UpdateStatusInput) =>
  createAction<UpdateStatusAction>(
    "UPDATE_STATUS",
    { ...input },
    undefined,
    UpdateStatusInputSchema,
    "global",
  );

export const linkPledge = (input: LinkPledgeInput) =>
  createAction<LinkPledgeAction>(
    "LINK_PLEDGE",
    { ...input },
    undefined,
    LinkPledgeInputSchema,
    "global",
  );

export const unlinkPledge = (input: UnlinkPledgeInput) =>
  createAction<UnlinkPledgeAction>(
    "UNLINK_PLEDGE",
    { ...input },
    undefined,
    UnlinkPledgeInputSchema,
    "global",
  );

export const resolve = (input: ResolveInput) =>
  createAction<ResolveAction>(
    "RESOLVE",
    { ...input },
    undefined,
    ResolveInputSchema,
    "global",
  );

export const abandon = (input: AbandonInput) =>
  createAction<AbandonAction>(
    "ABANDON",
    { ...input },
    undefined,
    AbandonInputSchema,
    "global",
  );

export const setExternalRef = (input: SetExternalRefInput) =>
  createAction<SetExternalRefAction>(
    "SET_EXTERNAL_REF",
    { ...input },
    undefined,
    SetExternalRefInputSchema,
    "global",
  );
