import type { ContributorProfileProfileOperations } from "document-models/contributor-profile/v1";
import {
  DuplicateGovernanceEndpointError,
  DuplicateWalletError,
  GovernanceEndpointNotFoundError,
  WalletNotFoundError,
} from "../../gen/profile/error.js";

export const contributorProfileProfileOperations: ContributorProfileProfileOperations =
  {
    setProfileDetailsOperation(state, action) {
      if (action.input.legalName) state.legalName = action.input.legalName;
      if (action.input.displayName)
        state.displayName = action.input.displayName;
      if (action.input.kind) state.kind = action.input.kind;
      if (action.input.websiteUrl) state.websiteUrl = action.input.websiteUrl;
      if (action.input.twitterHandle)
        state.twitterHandle = action.input.twitterHandle;
      if (action.input.farcasterHandle)
        state.farcasterHandle = action.input.farcasterHandle;
    },
    addWalletOperation(state, action) {
      const dup = state.walletAddresses.find(
        (w) =>
          w.address.toLowerCase() === action.input.address.toLowerCase() &&
          w.chainId === action.input.chainId,
      );
      if (dup)
        throw new DuplicateWalletError(
          "Wallet already registered for this chain",
        );
      state.walletAddresses.push({
        id: action.input.id,
        chainId: action.input.chainId,
        address: action.input.address,
        label: action.input.label || null,
      });
    },
    removeWalletOperation(state, action) {
      const idx = state.walletAddresses.findIndex(
        (w) => w.id === action.input.id,
      );
      if (idx === -1) throw new WalletNotFoundError("No wallet with that id");
      state.walletAddresses.splice(idx, 1);
    },
    addGovernanceEndpointOperation(state, action) {
      const dup = state.governanceEndpoints.find(
        (e) =>
          e.platform === action.input.platform && e.url === action.input.url,
      );
      if (dup)
        throw new DuplicateGovernanceEndpointError(
          "Governance endpoint already registered",
        );
      state.governanceEndpoints.push({
        id: action.input.id,
        platform: action.input.platform,
        url: action.input.url,
      });
    },
    removeGovernanceEndpointOperation(state, action) {
      const idx = state.governanceEndpoints.findIndex(
        (e) => e.id === action.input.id,
      );
      if (idx === -1)
        throw new GovernanceEndpointNotFoundError(
          "No governance endpoint with that id",
        );
      state.governanceEndpoints.splice(idx, 1);
    },
    setTrustLevelOperation(state, action) {
      state.trustLevel = action.input.trustLevel;
    },
  };
