import type { PledgeLifecycleOperations } from "document-models/pledge/v1";
import {
  GovernanceRequiredForPendingError,
  InvalidStatusTransitionError,
  PledgeAlreadyProposedError,
  ReceivedExceedsPledgedError,
} from "../../gen/lifecycle/error.js";

export const pledgeLifecycleOperations: PledgeLifecycleOperations = {
  proposePledgeOperation(state, action) {
    if (state.pledgedAmount !== null)
      throw new PledgeAlreadyProposedError("Pledge has already been proposed");
    state.contributorProfileId = action.input.contributorProfileId;
    state.pledgedAmount = action.input.pledgedAmount;
    state.asset = {
      symbol: action.input.asset.symbol,
      chainId: action.input.asset.chainId,
      address: action.input.asset.address ?? null,
    };
    if (action.input.publicNotes) state.publicNotes = action.input.publicNotes;
    if (action.input.internalNotes)
      state.internalNotes = action.input.internalNotes;
  },
  attachGovernanceOperation(state, action) {
    state.governance = {
      platform: action.input.platform,
      proposalUrl: action.input.proposalUrl,
      voteEndDate: action.input.voteEndDate ?? null,
      quorumStatus: action.input.quorumStatus ?? null,
    };
  },
  markGovernancePendingOperation(state, action) {
    if (state.status !== "PROPOSED")
      throw new InvalidStatusTransitionError(
        `Cannot mark governance pending in status ${state.status}`,
      );
    if (!state.governance)
      throw new GovernanceRequiredForPendingError(
        "Cannot mark governance pending without governance details attached",
      );
    state.status = "GOVERNANCE_PENDING";
  },
  markConfirmedOperation(state, action) {
    if (state.status !== "PROPOSED" && state.status !== "GOVERNANCE_PENDING")
      throw new InvalidStatusTransitionError(
        `Cannot confirm pledge in status ${state.status}`,
      );
    state.status = "CONFIRMED";
  },
  markReceivedOperation(state, action) {
    if (
      state.status === "CANCELLED" ||
      state.status === "FAILED" ||
      state.status === "RECEIVED"
    )
      throw new InvalidStatusTransitionError(
        `Cannot mark received in terminal status ${state.status}`,
      );
    const previouslyReceived = Number(state.receivedAmount ?? 0);
    const incoming = Number(action.input.amount);
    const newTotal = previouslyReceived + incoming;
    if (
      state.pledgedAmount !== null &&
      newTotal > Number(state.pledgedAmount)
    ) {
      throw new ReceivedExceedsPledgedError(
        `Cumulative received (${newTotal}) would exceed pledged (${state.pledgedAmount})`,
      );
    }
    state.receivedAmount = newTotal;
    state.receivedAt = action.input.receivedAt;
    if (!state.receiptIds.includes(action.input.receiptId)) {
      state.receiptIds.push(action.input.receiptId);
    }
    state.status = "RECEIVED";
  },
  cancelPledgeOperation(state, action) {
    if (state.status === "RECEIVED" || state.status === "CANCELLED")
      throw new InvalidStatusTransitionError(
        `Cannot cancel pledge in status ${state.status}`,
      );
    state.status = "CANCELLED";
    if (action.input.reason)
      state.internalNotes =
        `${state.internalNotes ?? ""}\n\nCancelled: ${action.input.reason}`.trim();
  },
  failPledgeOperation(state, action) {
    if (state.status === "RECEIVED" || state.status === "FAILED")
      throw new InvalidStatusTransitionError(
        `Cannot fail pledge in status ${state.status}`,
      );
    state.status = "FAILED";
    if (action.input.reason)
      state.internalNotes =
        `${state.internalNotes ?? ""}\n\nFailed: ${action.input.reason}`.trim();
  },
  editNotesOperation(state, action) {
    if (action.input.publicNotes) state.publicNotes = action.input.publicNotes;
    if (action.input.internalNotes)
      state.internalNotes = action.input.internalNotes;
  },
};
