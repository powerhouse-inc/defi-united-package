import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { generateId } from "document-model";
import { useCallback } from "react";

import {
  actions,
  useSelectedDistributionPlanDocument,
} from "../../document-models/distribution-plan/v1/index.js";
import type { DistributionPlanState } from "../../document-models/distribution-plan/v1/gen/schema/types.js";

import { ApprovalRefsTable } from "./components/ApprovalRefsTable.js";
import { LifecycleControls } from "./components/LifecycleControls.js";
import { MethodologyCard } from "./components/MethodologyCard.js";
import { PlanHeader } from "./components/PlanHeader.js";
import { RecipientsTable } from "./components/RecipientsTable.js";

export default function Editor() {
  const [document, dispatch] = useSelectedDistributionPlanDocument();

  // Methodology + total available
  const handleSaveMethodology = useCallback(
    (input: { methodology: string; totalAvailable: number | null }) => {
      dispatch(
        actions.setMethodology({
          methodology: input.methodology,
          totalAvailable: input.totalAvailable,
        }),
      );
    },
    [dispatch],
  );

  // Recipients
  const handleAddRecipient = useCallback(
    (input: {
      address: string;
      chainId: number;
      allocatedAmount: number;
      rationale: string | null;
    }) => {
      dispatch(
        actions.addRecipient({
          id: generateId(),
          address: input.address,
          chainId: input.chainId,
          allocatedAmount: input.allocatedAmount,
          rationale: input.rationale,
        }),
      );
    },
    [dispatch],
  );

  const handleUpdateRecipient = useCallback(
    (input: {
      id: string;
      allocatedAmount: number | null;
      rationale: string | null;
    }) => {
      dispatch(
        actions.updateRecipient({
          id: input.id,
          allocatedAmount: input.allocatedAmount,
          rationale: input.rationale,
        }),
      );
    },
    [dispatch],
  );

  const handleRemoveRecipient = useCallback(
    (id: string) => {
      dispatch(actions.removeRecipient({ id }));
    },
    [dispatch],
  );

  const handleMarkSent = useCallback(
    (input: { id: string; txHash: string }) => {
      dispatch(actions.markRecipientSent(input));
    },
    [dispatch],
  );

  const handleMarkFailed = useCallback(
    (id: string) => {
      dispatch(actions.markRecipientFailed({ id }));
    },
    [dispatch],
  );

  const handleMarkRefunded = useCallback(
    (id: string) => {
      dispatch(actions.markRecipientRefunded({ id }));
    },
    [dispatch],
  );

  // Approval refs
  const handleAddApprovalRef = useCallback(
    (input: { url: string; label: string }) => {
      dispatch(
        actions.addApprovalRef({
          id: generateId(),
          url: input.url,
          label: input.label,
        }),
      );
    },
    [dispatch],
  );

  // Lifecycle
  const handleApprove = useCallback(() => {
    dispatch(actions.approvePlan({ _: null }));
  }, [dispatch]);

  const handleComplete = useCallback(() => {
    dispatch(actions.completeDistribution({ _: null }));
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    dispatch(actions.cancelPlan({ _: null }));
  }, [dispatch]);

  if (!document) return null;
  const state = document.state.global as DistributionPlanState;
  const planEditable = state.status === "DRAFT";

  return (
    <div className="distribution-plan-editor">
      <DocumentToolbar />
      <div className="dpe-page">
        <div className="dpe-page-inner">
          <PlanHeader state={state} />
          <MethodologyCard
            state={state}
            disabled={!planEditable}
            onSave={handleSaveMethodology}
          />
          <RecipientsTable
            planStatus={state.status}
            recipients={state.recipients}
            onAdd={handleAddRecipient}
            onUpdate={handleUpdateRecipient}
            onRemove={handleRemoveRecipient}
            onMarkSent={handleMarkSent}
            onMarkFailed={handleMarkFailed}
            onMarkRefunded={handleMarkRefunded}
          />
          <ApprovalRefsTable
            approvalRefs={state.approvalRefs}
            onAdd={handleAddApprovalRef}
          />
          <LifecycleControls
            status={state.status}
            onApprove={handleApprove}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        </div>
      </div>

      <style>{`
        .distribution-plan-editor {
          background-color: #f7f8fa;
          color: #0f1115;
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          min-height: 100%;
          overflow-y: auto;
        }
        .distribution-plan-editor .dpe-page {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 28px 64px 28px;
        }
        .distribution-plan-editor .dpe-page-inner {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
      `}</style>
    </div>
  );
}
