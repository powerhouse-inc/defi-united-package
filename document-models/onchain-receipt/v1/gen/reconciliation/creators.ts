/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AttachPledgeInputSchema,
  ClearMatchInputSchema,
  MarkAmbiguousInputSchema,
  OverrideMatchInputSchema,
  RecordReceiptInputSchema,
} from "../schema/zod.js";
import type {
  AttachPledgeInput,
  ClearMatchInput,
  MarkAmbiguousInput,
  OverrideMatchInput,
  RecordReceiptInput,
} from "../types.js";
import type {
  AttachPledgeAction,
  ClearMatchAction,
  MarkAmbiguousAction,
  OverrideMatchAction,
  RecordReceiptAction,
} from "./actions.js";

export const recordReceipt = (input: RecordReceiptInput) =>
  createAction<RecordReceiptAction>(
    "RECORD_RECEIPT",
    { ...input },
    undefined,
    RecordReceiptInputSchema,
    "global",
  );

export const attachPledge = (input: AttachPledgeInput) =>
  createAction<AttachPledgeAction>(
    "ATTACH_PLEDGE",
    { ...input },
    undefined,
    AttachPledgeInputSchema,
    "global",
  );

export const markAmbiguous = (input: MarkAmbiguousInput) =>
  createAction<MarkAmbiguousAction>(
    "MARK_AMBIGUOUS",
    { ...input },
    undefined,
    MarkAmbiguousInputSchema,
    "global",
  );

export const overrideMatch = (input: OverrideMatchInput) =>
  createAction<OverrideMatchAction>(
    "OVERRIDE_MATCH",
    { ...input },
    undefined,
    OverrideMatchInputSchema,
    "global",
  );

export const clearMatch = (input: ClearMatchInput) =>
  createAction<ClearMatchAction>(
    "CLEAR_MATCH",
    { ...input },
    undefined,
    ClearMatchInputSchema,
    "global",
  );
