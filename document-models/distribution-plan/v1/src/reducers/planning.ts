import type { DistributionPlanPlanningOperations } from "document-models/distribution-plan/v1";
import {
  DuplicateRecipientError,
  InvalidStatusTransitionError,
  PlanNotApprovedError,
  RecipientNotFoundError,
} from "../../gen/planning/error.js";

export const distributionPlanPlanningOperations: DistributionPlanPlanningOperations =
  {
    setMethodologyOperation(state, action) {
      if (action.input.methodology)
        state.methodology = action.input.methodology;
      if (action.input.totalAvailable)
        state.totalAvailable = action.input.totalAvailable;
    },
    addRecipientOperation(state, action) {
      if (state.status !== "DRAFT")
        throw new InvalidStatusTransitionError(
          `Cannot add recipient in status ${state.status}`,
        );
      const dup = state.recipients.find(
        (r) =>
          r.address.toLowerCase() === action.input.address.toLowerCase() &&
          r.chainId === action.input.chainId,
      );
      if (dup)
        throw new DuplicateRecipientError(
          "Recipient already exists for this chain",
        );
      state.recipients.push({
        id: action.input.id,
        address: action.input.address,
        chainId: action.input.chainId,
        allocatedAmount: action.input.allocatedAmount,
        rationale: action.input.rationale ?? null,
        status: "PLANNED",
        txHash: null,
      });
    },
    updateRecipientOperation(state, action) {
      if (state.status !== "DRAFT")
        throw new InvalidStatusTransitionError(
          `Cannot update recipient in status ${state.status}`,
        );
      const r = state.recipients.find((x) => x.id === action.input.id);
      if (!r) throw new RecipientNotFoundError("No recipient with that id");
      if (action.input.allocatedAmount)
        r.allocatedAmount = action.input.allocatedAmount;
      if (action.input.rationale) r.rationale = action.input.rationale;
    },
    removeRecipientOperation(state, action) {
      if (state.status !== "DRAFT")
        throw new InvalidStatusTransitionError(
          `Cannot remove recipient in status ${state.status}`,
        );
      const idx = state.recipients.findIndex((x) => x.id === action.input.id);
      if (idx === -1)
        throw new RecipientNotFoundError("No recipient with that id");
      state.recipients.splice(idx, 1);
    },
    approvePlanOperation(state, _action) {
      if (state.status !== "DRAFT")
        throw new InvalidStatusTransitionError(
          `Cannot approve plan in status ${state.status}`,
        );
      state.status = "APPROVED";
    },
    markRecipientSentOperation(state, action) {
      if (state.status !== "APPROVED" && state.status !== "EXECUTING")
        throw new PlanNotApprovedError("Plan must be APPROVED before sending");
      const r = state.recipients.find((x) => x.id === action.input.id);
      if (!r) throw new RecipientNotFoundError("No recipient with that id");
      r.status = "SENT";
      r.txHash = action.input.txHash;
      state.status = "EXECUTING";
    },
    markRecipientFailedOperation(state, action) {
      if (state.status !== "APPROVED" && state.status !== "EXECUTING")
        throw new PlanNotApprovedError("Plan must be APPROVED");
      const r = state.recipients.find((x) => x.id === action.input.id);
      if (!r) throw new RecipientNotFoundError("No recipient with that id");
      r.status = "FAILED";
    },
    markRecipientRefundedOperation(state, action) {
      if (state.status !== "APPROVED" && state.status !== "EXECUTING")
        throw new PlanNotApprovedError("Plan must be APPROVED");
      const r = state.recipients.find((x) => x.id === action.input.id);
      if (!r) throw new RecipientNotFoundError("No recipient with that id");
      r.status = "REFUNDED";
    },
    completeDistributionOperation(state, _action) {
      if (state.status !== "EXECUTING")
        throw new InvalidStatusTransitionError(
          `Cannot complete plan in status ${state.status}`,
        );
      const allDone = state.recipients.every(
        (r) => r.status === "SENT" || r.status === "REFUNDED",
      );
      if (!allDone)
        throw new InvalidStatusTransitionError(
          "Cannot complete plan with PLANNED or FAILED recipients",
        );
      state.status = "COMPLETED";
    },
    cancelPlanOperation(state, _action) {
      if (state.status === "COMPLETED" || state.status === "CANCELLED")
        throw new InvalidStatusTransitionError(
          `Cannot cancel plan in status ${state.status}`,
        );
      state.status = "CANCELLED";
    },
    addApprovalRefOperation(state, action) {
      state.approvalRefs.push({
        id: action.input.id,
        url: action.input.url,
        label: action.input.label,
      });
    },
  };
