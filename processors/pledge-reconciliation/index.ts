/**
 * Pledge Reconciliation Processor
 *
 * Watches for new OnchainReceipt documents and attempts to auto-match them
 * to existing Pledge documents based on:
 * 1. Amount equality
 * 2. Asset symbol match
 * 3. Campaign membership (same drive)
 */

import type {
  IProcessorHostModule,
  ProcessorRecord,
  ProcessorFilter,
} from "@powerhousedao/reactor-browser";
import type { PHDocumentHeader } from "document-model";

const ONCHAIN_RECEIPT_TYPE = "defi-united/onchain-receipt";

interface ReconciliationState {
  processedReceiptIds: Set<string>;
}

export function buildPledgeReconciliation(
  _module: IProcessorHostModule,
): (driveHeader: PHDocumentHeader) => Promise<ProcessorRecord[]> {
  const state: ReconciliationState = {
    processedReceiptIds: new Set(),
  };

  return async (_driveHeader): Promise<ProcessorRecord[]> => {
    const filter: ProcessorFilter = {
      branch: ["main"],
      documentId: ["*"],
      documentType: [ONCHAIN_RECEIPT_TYPE],
      scope: ["global"],
    };

    return [
      {
        filter,
        processor: {
          onOperations: (operations) => reconcile(operations, state),
          onDisconnect: async () => {
            state.processedReceiptIds.clear();
          },
        },
      },
    ];
  };
}

async function reconcile(
  operations: {
    operation: { action: { type: string; input: unknown } };
    context: { documentId: string; resultingState?: string };
  }[],
  state: ReconciliationState,
): Promise<void> {
  for (const op of operations) {
    if (op.operation.action.type !== "RECORD_RECEIPT") continue;

    const receiptId = op.context.documentId;
    if (state.processedReceiptIds.has(receiptId)) continue;
    state.processedReceiptIds.add(receiptId);

    let receiptState: Record<string, unknown> | null = null;
    if (op.context.resultingState) {
      try {
        receiptState = JSON.parse(op.context.resultingState);
      } catch {
        // ignore
      }
    }

    const amount = receiptState?.amount ?? null;
    const symbol = (receiptState?.asset as Record<string, unknown> | undefined)
      ?.symbol as string | undefined;

    console.log(
      `[pledge-reconciliation] New receipt ${receiptId}: amount=${amount}, asset=${symbol}`,
    );

    // TODO: Query pledges in same drive and match.
    // Requires access to reactorClient which is not exposed on IProcessorHostModule.
    // For now, the processor logs the event. The subgraph projections handle
    // the aggregation, and the operator can manually match via the operations API.
  }
}
