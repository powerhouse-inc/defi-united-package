import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { useCallback } from "react";
import {
  actions,
  useSelectedExternalDependencyDocument,
} from "../../document-models/external-dependency/v1/index.js";
import type {
  DependencyKind,
  DependencyStatus,
} from "../../document-models/external-dependency/v1/gen/types.js";
import { DependencyHeader } from "./components/DependencyHeader.js";
import { DependencyDetailsForm } from "./components/DependencyDetailsForm.js";
import { ExternalRefForm } from "./components/ExternalRefForm.js";
import { LinkedPledges } from "./components/LinkedPledges.js";
import { StatusControls } from "./components/StatusControls.js";

type DetailsPatch = {
  title?: string;
  description?: string;
  kind?: DependencyKind;
  expectedResolution?: string | null;
  assignee?: string;
};

type RefPatch = {
  url: string | null;
  txHash: string | null;
  proposalId: string | null;
};

export default function Editor() {
  const [document, dispatch] = useSelectedExternalDependencyDocument();

  const setDetails = useCallback(
    (patch: DetailsPatch) => {
      dispatch(
        actions.setDependencyDetails({
          title: patch.title ?? null,
          description: patch.description ?? null,
          kind: patch.kind ?? null,
          expectedResolution: patch.expectedResolution ?? null,
          assignee: patch.assignee ?? null,
        }),
      );
    },
    [dispatch],
  );

  const updateStatus = useCallback(
    (status: DependencyStatus) => {
      dispatch(actions.updateStatus({ status }));
    },
    [dispatch],
  );

  const setExternalRef = useCallback(
    (patch: RefPatch) => {
      dispatch(
        actions.setExternalRef({
          url: patch.url,
          txHash: patch.txHash,
          proposalId: patch.proposalId,
        }),
      );
    },
    [dispatch],
  );

  const linkPledge = useCallback(
    (pledgeId: string) => {
      dispatch(actions.linkPledge({ pledgeId }));
    },
    [dispatch],
  );

  const unlinkPledge = useCallback(
    (pledgeId: string) => {
      dispatch(actions.unlinkPledge({ pledgeId }));
    },
    [dispatch],
  );

  const resolve = useCallback(() => {
    dispatch(actions.resolve({ _: null }));
  }, [dispatch]);

  const abandon = useCallback(() => {
    dispatch(actions.abandon({ _: null }));
  }, [dispatch]);

  if (!document) return null;

  const state = document.state.global;

  return (
    <div className="ext-dep-scope">
      <DocumentToolbar />
      <div className="ext-dep-page">
        <div className="ext-dep-page-inner flex flex-col gap-5">
          <DependencyHeader state={state} />
          <StatusControls
            state={state}
            onUpdateStatus={updateStatus}
            onResolve={resolve}
            onAbandon={abandon}
          />
          <DependencyDetailsForm state={state} onSubmit={setDetails} />
          <ExternalRefForm state={state} onSubmit={setExternalRef} />
          <LinkedPledges
            state={state}
            onLink={linkPledge}
            onUnlink={unlinkPledge}
          />
        </div>
      </div>

      <style>{`
        .ext-dep-scope {
          background-color: #f7f8fa;
          color: #0f1115;
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          height: 100%;
          overflow-y: auto;
        }
        .ext-dep-page {
          padding: 24px 28px 64px 28px;
        }
        .ext-dep-page-inner {
          max-width: 880px;
          margin: 0 auto;
        }
        .ext-dep-scope .ext-dep-card {
          background: #ffffff;
          border: 1px solid #e6e8ec;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 1px 2px rgba(15, 17, 21, 0.04);
        }
        .ext-dep-scope .ext-dep-card-title {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #525a6b;
          margin: 0 0 14px 0;
        }
        .ext-dep-scope .ext-dep-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ext-dep-scope .ext-dep-label {
          font-size: 12px;
          font-weight: 500;
          color: #525a6b;
        }
        .ext-dep-scope .ext-dep-input {
          width: 100%;
          padding: 8px 10px;
          font-size: 13px;
          color: #0f1115;
          background: #ffffff;
          border: 1px solid #d6d9e0;
          border-radius: 8px;
          outline: none;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .ext-dep-scope .ext-dep-input:focus {
          border-color: #1a4dd6;
          box-shadow: 0 0 0 3px rgba(26, 77, 214, 0.15);
        }
        .ext-dep-scope .ext-dep-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 8px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: background-color 120ms ease, border-color 120ms ease,
            color 120ms ease, opacity 120ms ease;
        }
        .ext-dep-scope .ext-dep-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ext-dep-scope .ext-dep-btn-primary {
          background-color: #1a4dd6;
          color: #ffffff;
        }
        .ext-dep-scope .ext-dep-btn-primary:hover:not(:disabled) {
          background-color: #1740b8;
        }
        .ext-dep-scope .ext-dep-btn-resolve {
          background-color: #047857;
          color: #ffffff;
        }
        .ext-dep-scope .ext-dep-btn-resolve:hover:not(:disabled) {
          background-color: #036549;
        }
        .ext-dep-scope .ext-dep-btn-abandon {
          background-color: #ffffff;
          color: #b91c1c;
          border-color: #fca5a5;
        }
        .ext-dep-scope .ext-dep-btn-abandon:hover:not(:disabled) {
          background-color: #fef2f2;
        }
        .ext-dep-scope .ext-dep-btn-subtle {
          background-color: #ffffff;
          color: #475569;
          border-color: #cbd5e1;
        }
        .ext-dep-scope .ext-dep-btn-subtle:hover:not(:disabled) {
          background-color: #f1f5f9;
        }
      `}</style>
    </div>
  );
}
