import type { ExternalDependencyTrackingOperations } from "document-models/external-dependency/v1";
import {
  DependencyAlreadyResolvedError,
  InvalidStatusTransitionError,
  PledgeAlreadyLinkedError,
  PledgeNotLinkedError,
} from "../../gen/tracking/error.js";

export const externalDependencyTrackingOperations: ExternalDependencyTrackingOperations =
  {
    setDependencyDetailsOperation(state, action) {
      if (action.input.title) state.title = action.input.title;
      if (action.input.description)
        state.description = action.input.description;
      if (action.input.kind) state.kind = action.input.kind;
      if (action.input.expectedResolution)
        state.expectedResolution = action.input.expectedResolution;
      if (action.input.assignee) state.assignee = action.input.assignee;
    },
    updateStatusOperation(state, action) {
      if (state.status === "RESOLVED" && action.input.status !== "RESOLVED")
        throw new DependencyAlreadyResolvedError(
          "Cannot move dependency out of RESOLVED state",
        );
      state.status = action.input.status;
    },
    linkPledgeOperation(state, action) {
      if (state.blocks.includes(action.input.pledgeId))
        throw new PledgeAlreadyLinkedError(
          "Pledge is already linked to this dependency",
        );
      state.blocks.push(action.input.pledgeId);
    },
    unlinkPledgeOperation(state, action) {
      const idx = state.blocks.indexOf(action.input.pledgeId);
      if (idx === -1)
        throw new PledgeNotLinkedError(
          "Pledge is not linked to this dependency",
        );
      state.blocks.splice(idx, 1);
    },
    resolveOperation(state, _action) {
      if (state.status === "RESOLVED")
        throw new DependencyAlreadyResolvedError(
          "Dependency is already resolved",
        );
      if (state.status === "ABANDONED")
        throw new InvalidStatusTransitionError(
          "Cannot resolve an abandoned dependency",
        );
      state.status = "RESOLVED";
    },
    abandonOperation(state, _action) {
      if (state.status === "RESOLVED")
        throw new InvalidStatusTransitionError(
          "Cannot abandon a resolved dependency",
        );
      state.status = "ABANDONED";
    },
    setExternalRefOperation(state, action) {
      state.externalRef = {
        url: action.input.url ?? null,
        txHash: action.input.txHash ?? null,
        proposalId: action.input.proposalId ?? null,
      };
    },
  };
