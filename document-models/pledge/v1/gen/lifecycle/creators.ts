/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AttachGovernanceInputSchema,
  CancelPledgeInputSchema,
  EditNotesInputSchema,
  FailPledgeInputSchema,
  MarkConfirmedInputSchema,
  MarkGovernancePendingInputSchema,
  MarkReceivedInputSchema,
  ProposePledgeInputSchema,
} from "../schema/zod.js";
import type {
  AttachGovernanceInput,
  CancelPledgeInput,
  EditNotesInput,
  FailPledgeInput,
  MarkConfirmedInput,
  MarkGovernancePendingInput,
  MarkReceivedInput,
  ProposePledgeInput,
} from "../types.js";
import type {
  AttachGovernanceAction,
  CancelPledgeAction,
  EditNotesAction,
  FailPledgeAction,
  MarkConfirmedAction,
  MarkGovernancePendingAction,
  MarkReceivedAction,
  ProposePledgeAction,
} from "./actions.js";

export const proposePledge = (input: ProposePledgeInput) =>
  createAction<ProposePledgeAction>(
    "PROPOSE_PLEDGE",
    { ...input },
    undefined,
    ProposePledgeInputSchema,
    "global",
  );

export const attachGovernance = (input: AttachGovernanceInput) =>
  createAction<AttachGovernanceAction>(
    "ATTACH_GOVERNANCE",
    { ...input },
    undefined,
    AttachGovernanceInputSchema,
    "global",
  );

export const markGovernancePending = (input: MarkGovernancePendingInput) =>
  createAction<MarkGovernancePendingAction>(
    "MARK_GOVERNANCE_PENDING",
    { ...input },
    undefined,
    MarkGovernancePendingInputSchema,
    "global",
  );

export const markConfirmed = (input: MarkConfirmedInput) =>
  createAction<MarkConfirmedAction>(
    "MARK_CONFIRMED",
    { ...input },
    undefined,
    MarkConfirmedInputSchema,
    "global",
  );

export const markReceived = (input: MarkReceivedInput) =>
  createAction<MarkReceivedAction>(
    "MARK_RECEIVED",
    { ...input },
    undefined,
    MarkReceivedInputSchema,
    "global",
  );

export const cancelPledge = (input: CancelPledgeInput) =>
  createAction<CancelPledgeAction>(
    "CANCEL_PLEDGE",
    { ...input },
    undefined,
    CancelPledgeInputSchema,
    "global",
  );

export const failPledge = (input: FailPledgeInput) =>
  createAction<FailPledgeAction>(
    "FAIL_PLEDGE",
    { ...input },
    undefined,
    FailPledgeInputSchema,
    "global",
  );

export const editNotes = (input: EditNotesInput) =>
  createAction<EditNotesAction>(
    "EDIT_NOTES",
    { ...input },
    undefined,
    EditNotesInputSchema,
    "global",
  );
