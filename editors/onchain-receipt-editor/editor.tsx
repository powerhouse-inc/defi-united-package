import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { useCallback } from "react";

import {
  actions,
  useSelectedOnchainReceiptDocument,
} from "../../document-models/onchain-receipt/v1/index.js";
import type {
  OnchainReceiptState,
  RecordReceiptInput,
} from "../../document-models/onchain-receipt/v1/gen/schema/types.js";

import { ReceiptHeader } from "./components/ReceiptHeader.js";
import { ReceiptDetails } from "./components/ReceiptDetails.js";
import { ReconciliationActions } from "./components/ReconciliationActions.js";
import { RawLog } from "./components/RawLog.js";
import { RecordReceiptForm } from "./components/RecordReceiptForm.js";

export default function Editor() {
  const [document, dispatch] = useSelectedOnchainReceiptDocument();

  const onAttachPledge = useCallback(
    (pledgeId: string) => dispatch(actions.attachPledge({ pledgeId })),
    [dispatch],
  );
  const onMarkAmbiguous = useCallback(
    () => dispatch(actions.markAmbiguous({ _: null })),
    [dispatch],
  );
  const onOverrideMatch = useCallback(
    (pledgeId: string) => dispatch(actions.overrideMatch({ pledgeId })),
    [dispatch],
  );
  const onClearMatch = useCallback(
    () => dispatch(actions.clearMatch({ _: null })),
    [dispatch],
  );
  const onRecordReceipt = useCallback(
    (input: RecordReceiptInput) => dispatch(actions.recordReceipt(input)),
    [dispatch],
  );

  if (!document) return null;
  const state = document.state.global as OnchainReceiptState;
  const isUninitialized = !state.txHash;

  return (
    <div className="onchain-receipt-editor min-h-full bg-neutral-50">
      <DocumentToolbar />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          {isUninitialized ? (
            <RecordReceiptForm onSubmit={onRecordReceipt} />
          ) : (
            <>
              <ReceiptHeader state={state} />
              <ReceiptDetails state={state} />
              <ReconciliationActions
                handlers={{
                  onAttachPledge,
                  onMarkAmbiguous,
                  onOverrideMatch,
                  onClearMatch,
                }}
              />
              <RawLog rawLog={state.rawLog} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
