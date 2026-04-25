import type { ReliefCampaignManagementOperations } from "document-models/relief-campaign/v1";
import {
  ContributionAddressNotFoundError,
  DuplicateContributionAddressError,
  DuplicateOperatorWalletError,
  InvalidStatusTransitionError,
  MissingCampaignSlugError,
  MissingContributionAddressError,
  OperatorWalletNotFoundError,
} from "../../gen/management/error.js";

export const reliefCampaignManagementOperations: ReliefCampaignManagementOperations =
  {
    setCampaignDetailsOperation(state, action) {
      if (action.input.name) state.name = action.input.name;
      if (action.input.slug) state.slug = action.input.slug;
      if (action.input.summary) state.summary = action.input.summary;
      if (action.input.incidentDate)
        state.incidentDate = action.input.incidentDate;
      if (action.input.targetAmount)
        state.targetAmount = action.input.targetAmount;
      if (action.input.affectedAsset) {
        state.affectedAsset = {
          symbol: action.input.affectedAsset.symbol,
          chainId: action.input.affectedAsset.chainId,
          address: action.input.affectedAsset.address ?? null,
        };
      }
      if (action.input.riskDisclaimer)
        state.riskDisclaimer = action.input.riskDisclaimer;
      if (action.input.contributorRegistryDriveId)
        state.contributorRegistryDriveId =
          action.input.contributorRegistryDriveId;
    },
    addContributionAddressOperation(state, action) {
      const dup = state.contributionAddresses.find(
        (c) =>
          c.address.toLowerCase() === action.input.address.toLowerCase() &&
          c.chainId === action.input.chainId,
      );
      if (dup)
        throw new DuplicateContributionAddressError(
          "Contribution address already exists for this chain",
        );
      state.contributionAddresses.push({
        id: action.input.id,
        chainId: action.input.chainId,
        address: action.input.address,
        label: action.input.label || null,
      });
    },
    removeContributionAddressOperation(state, action) {
      const idx = state.contributionAddresses.findIndex(
        (c) => c.id === action.input.id,
      );
      if (idx === -1)
        throw new ContributionAddressNotFoundError(
          "No contribution address with that id",
        );
      state.contributionAddresses.splice(idx, 1);
    },
    startCampaignOperation(state, _action) {
      if (state.status !== "DRAFT")
        throw new InvalidStatusTransitionError(
          `Cannot start campaign in status ${state.status}`,
        );
      if (!state.slug)
        throw new MissingCampaignSlugError(
          "Campaign slug must be set before starting",
        );
      if (state.contributionAddresses.length === 0)
        throw new MissingContributionAddressError(
          "At least one contribution address is required to start a campaign",
        );
      state.status = "ACTIVE";
    },
    markResolvedOperation(state, _action) {
      if (state.status !== "ACTIVE" && state.status !== "EXECUTING")
        throw new InvalidStatusTransitionError(
          `Cannot resolve a campaign in status ${state.status}`,
        );
      state.status = "RESOLVED";
    },
    markFailedOperation(state, action) {
      if (state.status === "ARCHIVED" || state.status === "RESOLVED")
        throw new InvalidStatusTransitionError(
          `Cannot mark failed in terminal status ${state.status}`,
        );
      state.status = "FAILED";
      if (action.input.reason)
        state.summary =
          `${state.summary ?? ""}\n\nFailed: ${action.input.reason}`.trim();
    },
    archiveCampaignOperation(state, _action) {
      if (state.status !== "RESOLVED" && state.status !== "FAILED")
        throw new InvalidStatusTransitionError(
          `Cannot archive a campaign in status ${state.status}`,
        );
      state.status = "ARCHIVED";
    },
    addExternalLinkOperation(state, action) {
      state.externalLinks.push({
        id: action.input.id,
        label: action.input.label,
        url: action.input.url,
      });
    },
    addOperatorWalletOperation(state, action) {
      const addr = action.input.address.toLowerCase();
      if (state.operatorWallets.some((a) => a.toLowerCase() === addr))
        throw new DuplicateOperatorWalletError(
          "Operator wallet already authorized",
        );
      state.operatorWallets.push(action.input.address);
    },
    removeOperatorWalletOperation(state, action) {
      const idx = state.operatorWallets.findIndex(
        (a) => a.toLowerCase() === action.input.address.toLowerCase(),
      );
      if (idx === -1)
        throw new OperatorWalletNotFoundError("Operator wallet not authorized");
      state.operatorWallets.splice(idx, 1);
    },
  };
