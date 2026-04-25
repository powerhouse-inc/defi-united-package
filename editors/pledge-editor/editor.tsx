import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { useCallback } from "react";
import {
  actions,
  useSelectedPledgeDocument,
} from "../../document-models/pledge/v1/index.js";
import type {
  GovernancePlatform,
  PledgeState,
} from "../../document-models/pledge/v1/gen/types.js";
import { PledgeHeader } from "./components/PledgeHeader.js";
import { ProposeForm } from "./components/ProposeForm.js";
import { StateMachineButtons } from "./components/StateMachineButtons.js";
import { GovernanceSubform } from "./components/GovernanceSubform.js";
import { ReceiptsList } from "./components/ReceiptsList.js";
import { NotesEditor } from "./components/NotesEditor.js";

export default function Editor() {
  const [document, dispatch] = useSelectedPledgeDocument();

  const proposePledge = useCallback(
    (input: {
      contributorProfileId: string;
      pledgedAmount: number;
      asset: { symbol: string; address: string | null; chainId: number };
      publicNotes: string | null;
      internalNotes: string | null;
    }) => {
      dispatch(
        actions.proposePledge({
          contributorProfileId: input.contributorProfileId,
          pledgedAmount: input.pledgedAmount,
          asset: {
            symbol: input.asset.symbol,
            address: input.asset.address,
            chainId: input.asset.chainId,
          },
          publicNotes: input.publicNotes,
          internalNotes: input.internalNotes,
        }),
      );
    },
    [dispatch],
  );

  const attachGovernance = useCallback(
    (input: {
      platform: GovernancePlatform;
      proposalUrl: string;
      voteEndDate: string | null;
      quorumStatus: string | null;
    }) => {
      dispatch(
        actions.attachGovernance({
          platform: input.platform,
          proposalUrl: input.proposalUrl,
          voteEndDate: input.voteEndDate,
          quorumStatus: input.quorumStatus,
        }),
      );
    },
    [dispatch],
  );

  const markGovernancePending = useCallback(
    () => dispatch(actions.markGovernancePending({ _: null })),
    [dispatch],
  );

  const markConfirmed = useCallback(
    () => dispatch(actions.markConfirmed({ _: null })),
    [dispatch],
  );

  const markReceived = useCallback(
    ({ receiptId, amount }: { receiptId: string; amount: number }) =>
      dispatch(
        actions.markReceived({
          receiptId,
          amount,
          receivedAt: new Date().toISOString(),
        }),
      ),
    [dispatch],
  );

  const cancelPledge = useCallback(
    (reason: string) =>
      dispatch(actions.cancelPledge({ reason: reason || null })),
    [dispatch],
  );

  const failPledge = useCallback(
    (reason: string) =>
      dispatch(actions.failPledge({ reason: reason || null })),
    [dispatch],
  );

  const editNotes = useCallback(
    (input: {
      publicNotes: string | null;
      internalNotes: string | null;
    }) => dispatch(actions.editNotes(input)),
    [dispatch],
  );

  if (!document) return null;

  const state = document.state.global as PledgeState;

  return (
    <div className="pledge-scope">
      <DocumentToolbar />
      <div className="pledge-page">
        <div className="pledge-page__inner">
          <PledgeHeader state={state} />

          <ProposeForm state={state} on={{ proposePledge }} />

          <StateMachineButtons
            state={state}
            on={{
              markGovernancePending,
              markConfirmed,
              markReceived,
              cancelPledge,
              failPledge,
            }}
          />

          <GovernanceSubform state={state} on={{ attachGovernance }} />

          <ReceiptsList state={state} />

          <NotesEditor state={state} on={{ editNotes }} />
        </div>
      </div>

      <style>{`
        .pledge-scope {
          background-color: #f7f8fa;
          color: #0f1115;
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          height: 100%;
          overflow-y: auto;
        }
        .pledge-scope a {
          color: #1a4dd6;
          text-decoration: none;
        }
        .pledge-scope a:hover {
          text-decoration: underline;
        }
        .pledge-page {
          padding: 24px 28px 64px 28px;
        }
        .pledge-page__inner {
          max-width: 980px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* Header */
        .pledge-scope .pledge-header {
          background: #ffffff;
          border: 1px solid #e6e8ec;
          border-radius: 12px;
          padding: 22px 24px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 1px 2px rgba(15, 17, 21, 0.04);
        }
        .pledge-scope .pledge-header__eyebrow {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          font-weight: 600;
        }
        .pledge-scope .pledge-header__title {
          font-size: 28px;
          font-weight: 600;
          margin: 4px 0 6px 0;
          line-height: 1.1;
        }
        .pledge-scope .pledge-header__symbol {
          font-size: 16px;
          font-weight: 500;
          color: #525a6b;
          margin-left: 6px;
        }
        .pledge-scope .pledge-header__sub {
          margin: 0;
          color: #525a6b;
          font-size: 13px;
        }
        .pledge-scope .pledge-header__phid {
          background: #f1f3f7;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
        .pledge-scope .pledge-header__chain {
          margin-left: 8px;
          color: #6b7280;
        }

        /* Status pill */
        .pledge-scope .pledge-status-pill {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid transparent;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .pledge-scope .pledge-status--proposed {
          background: #eef2ff;
          color: #3949ab;
          border-color: #c5cae9;
        }
        .pledge-scope .pledge-status--pending {
          background: #fff8e1;
          color: #8d6e0a;
          border-color: #f7d774;
        }
        .pledge-scope .pledge-status--confirmed {
          background: #e6f0ff;
          color: #1a4dd6;
          border-color: #b8d0ff;
        }
        .pledge-scope .pledge-status--received {
          background: #e6f7ee;
          color: #1f7a3f;
          border-color: #b6e3c7;
        }
        .pledge-scope .pledge-status--cancelled {
          background: #f1f3f7;
          color: #525a6b;
          border-color: #d8dde6;
        }
        .pledge-scope .pledge-status--failed {
          background: #fdecec;
          color: #b53a3a;
          border-color: #f5bdbd;
        }

        /* Cards */
        .pledge-scope .pledge-card {
          background: #ffffff;
          border: 1px solid #e6e8ec;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 1px 2px rgba(15, 17, 21, 0.04);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .pledge-scope .pledge-card__title {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #525a6b;
          margin: 0;
        }
        .pledge-scope .pledge-card__collapse-toggle {
          all: unset;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .pledge-scope .pledge-card__chevron {
          font-size: 12px;
          color: #525a6b;
        }

        /* Form primitives */
        .pledge-scope .pledge-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pledge-scope .pledge-form-row {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        .pledge-scope .pledge-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 180px;
        }
        .pledge-scope .pledge-form-group--grow {
          flex: 1;
          min-width: 220px;
        }
        .pledge-scope .pledge-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .pledge-scope .pledge-label {
          font-size: 12px;
          font-weight: 500;
          color: #525a6b;
        }
        .pledge-scope .pledge-input,
        .pledge-scope .pledge-textarea {
          font: inherit;
          font-size: 14px;
          padding: 8px 10px;
          border: 1px solid #d8dde6;
          border-radius: 8px;
          background: #ffffff;
          color: #0f1115;
          outline: none;
          transition: border-color 120ms ease, box-shadow 120ms ease;
          width: 100%;
          box-sizing: border-box;
        }
        .pledge-scope .pledge-textarea {
          resize: vertical;
          min-height: 80px;
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .pledge-scope .pledge-input:focus,
        .pledge-scope .pledge-textarea:focus {
          border-color: #1a4dd6;
          box-shadow: 0 0 0 3px rgba(26, 77, 214, 0.18);
        }
        .pledge-scope .pledge-input:disabled,
        .pledge-scope .pledge-textarea:disabled {
          background: #f7f8fa;
          color: #6b7280;
          cursor: not-allowed;
        }

        /* Buttons */
        .pledge-scope .pledge-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pledge-scope .pledge-actions__row {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        .pledge-scope .pledge-btn {
          font: inherit;
          font-size: 13px;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: background-color 120ms ease, border-color 120ms ease;
          white-space: nowrap;
        }
        .pledge-scope .pledge-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .pledge-scope .pledge-btn--primary {
          background: #0f1115;
          color: #ffffff;
          border-color: #0f1115;
        }
        .pledge-scope .pledge-btn--primary:not(:disabled):hover {
          background: #25282e;
          border-color: #25282e;
        }
        .pledge-scope .pledge-btn--neutral {
          background: #ffffff;
          color: #0f1115;
          border-color: #d8dde6;
        }
        .pledge-scope .pledge-btn--neutral:not(:disabled):hover {
          background: #f1f3f7;
        }
        .pledge-scope .pledge-btn--danger {
          background: #ffffff;
          color: #b53a3a;
          border-color: #f5bdbd;
        }
        .pledge-scope .pledge-btn--danger:not(:disabled):hover {
          background: #fdecec;
        }

        /* Receipts */
        .pledge-scope .pledge-meta {
          margin: 0;
          color: #525a6b;
          font-size: 13px;
        }
        .pledge-scope .pledge-meta__sep {
          margin-left: 6px;
          color: #6b7280;
        }
        .pledge-scope .pledge-empty {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
          font-style: italic;
        }
        .pledge-scope .pledge-receipts {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pledge-scope .pledge-receipts__item {
          background: #f7f8fa;
          border: 1px solid #e6e8ec;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 13px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pledge-scope .pledge-receipts__hint {
          font-size: 11px;
          color: #6b7280;
        }
        .pledge-scope .pledge-receipts__full {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          word-break: break-all;
        }

        /* Privacy badges */
        .pledge-scope .pledge-badge {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid transparent;
        }
        .pledge-scope .pledge-badge--public {
          background: #e6f0ff;
          color: #1a4dd6;
          border-color: #b8d0ff;
        }
        .pledge-scope .pledge-badge--internal {
          background: #f1f3f7;
          color: #525a6b;
          border-color: #d8dde6;
        }
      `}</style>
    </div>
  );
}
