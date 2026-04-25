import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { generateId } from "document-model";
import { useCallback } from "react";

import {
  actions,
  useSelectedContributorProfileDocument,
} from "../../document-models/contributor-profile/v1/index.js";
import type {
  ContributorKind,
  ContributorProfileState,
  GovernancePlatform,
  TrustLevel,
} from "../../document-models/contributor-profile/v1/gen/schema/types.js";

import { GovernanceEndpointsTable } from "./components/GovernanceEndpointsTable.js";
import { ProfileDetailsForm } from "./components/ProfileDetailsForm.js";
import { ProfileHeader } from "./components/ProfileHeader.js";
import { TrustLevelControl } from "./components/TrustLevelControl.js";
import { WalletsTable } from "./components/WalletsTable.js";

export default function Editor() {
  const [document, dispatch] = useSelectedContributorProfileDocument();

  const setProfileDetails = useCallback(
    (input: {
      legalName?: string | null;
      displayName?: string | null;
      kind?: ContributorKind | null;
      websiteUrl?: string | null;
      twitterHandle?: string | null;
      farcasterHandle?: string | null;
    }) => {
      dispatch(actions.setProfileDetails(input));
    },
    [dispatch],
  );

  const setTrustLevel = useCallback(
    (trustLevel: TrustLevel) => {
      dispatch(actions.setTrustLevel({ trustLevel }));
    },
    [dispatch],
  );

  const addWallet = useCallback(
    (chainId: number, address: string, label: string | null) => {
      dispatch(
        actions.addWallet({
          id: generateId(),
          chainId,
          address,
          label,
        }),
      );
    },
    [dispatch],
  );

  const removeWallet = useCallback(
    (id: string) => {
      dispatch(actions.removeWallet({ id }));
    },
    [dispatch],
  );

  const addGovernanceEndpoint = useCallback(
    (platform: GovernancePlatform, url: string) => {
      dispatch(
        actions.addGovernanceEndpoint({
          id: generateId(),
          platform,
          url,
        }),
      );
    },
    [dispatch],
  );

  const removeGovernanceEndpoint = useCallback(
    (id: string) => {
      dispatch(actions.removeGovernanceEndpoint({ id }));
    },
    [dispatch],
  );

  if (!document) return null;
  const state = document.state.global;

  return (
    <div className="contributor-profile-editor">
      <DocumentToolbar />
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-7 py-6 pb-16">
        <ProfileHeader state={state} />
        <ProfileDetailsForm state={state} onSave={setProfileDetails} />
        <TrustLevelControl
          trustLevel={state.trustLevel}
          onChange={setTrustLevel}
        />
        <WalletsTable
          wallets={state.walletAddresses}
          onAdd={addWallet}
          onRemove={removeWallet}
        />
        <GovernanceEndpointsTable
          endpoints={state.governanceEndpoints}
          onAdd={addGovernanceEndpoint}
          onRemove={removeGovernanceEndpoint}
        />
      </div>

      <style>{`
        .contributor-profile-editor {
          background-color: #f7f8fa;
          color: #0f1115;
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          min-height: 100%;
          overflow-y: auto;
        }
        .contributor-profile-editor .cp-input {
          width: 100%;
          background-color: #ffffff;
          border: 1px solid #d4d7de;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          color: #0f1115;
          outline: none;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .contributor-profile-editor .cp-input:focus {
          border-color: #1a4dd6;
          box-shadow: 0 0 0 3px rgba(26, 77, 214, 0.18);
        }
        .contributor-profile-editor .cp-input:disabled {
          background-color: #f3f4f6;
          color: #6b7280;
        }
        .contributor-profile-editor .cp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          border: 1px solid transparent;
          transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease, opacity 120ms ease;
        }
        .contributor-profile-editor .cp-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .contributor-profile-editor .cp-btn-primary {
          background-color: #0f1115;
          color: #ffffff;
        }
        .contributor-profile-editor .cp-btn-primary:hover:not(:disabled) {
          background-color: #1a4dd6;
        }
        .contributor-profile-editor .cp-btn-ghost {
          background-color: transparent;
          color: #525a6b;
          border-color: #d4d7de;
        }
        .contributor-profile-editor .cp-btn-ghost:hover:not(:disabled) {
          background-color: #f1f3f7;
          color: #0f1115;
        }
        .contributor-profile-editor .cp-btn-danger-ghost {
          background-color: transparent;
          color: #be1d3a;
          padding: 4px 10px;
          font-size: 12px;
        }
        .contributor-profile-editor .cp-btn-danger-ghost:hover:not(:disabled) {
          background-color: #fdeaee;
        }
      `}</style>
    </div>
  );
}
