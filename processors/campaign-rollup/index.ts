/**
 * Campaign Rollup Processor
 *
 * Watches for pledge and receipt changes and recalculates the campaign
 * aggregate totals (totalPledged, totalReceived).
 */

import type {
  IProcessorHostModule,
  ProcessorRecord,
  ProcessorFilter,
} from "@powerhousedao/reactor-browser";
import type { PHDocumentHeader } from "document-model";

const PLEDGE_TYPE = "defi-united/pledge";
const ONCHAIN_RECEIPT_TYPE = "defi-united/onchain-receipt";

export function buildCampaignRollup(
  _module: IProcessorHostModule,
): (driveHeader: PHDocumentHeader) => Promise<ProcessorRecord[]> {
  const driveTotals = new Map<
    string,
    { pledged: number; received: number; updatedAt: string }
  >();

  return async (driveHeader): Promise<ProcessorRecord[]> => {
    const filter: ProcessorFilter = {
      branch: ["main"],
      documentId: ["*"],
      documentType: [PLEDGE_TYPE, ONCHAIN_RECEIPT_TYPE],
      scope: ["global"],
    };

    return [
      {
        filter,
        processor: {
          onOperations: (operations) =>
            rollup(operations, driveHeader.id, driveTotals),
          onDisconnect: async () => {
            driveTotals.clear();
          },
        },
      },
    ];
  };
}

async function rollup(
  operations: {
    operation: { action: { type: string } };
    context: { documentId: string; resultingState?: string };
  }[],
  driveId: string,
  driveTotals: Map<
    string,
    { pledged: number; received: number; updatedAt: string }
  >,
): Promise<void> {
  for (const op of operations) {
    if (!op.context.resultingState) continue;

    let state: Record<string, unknown>;
    try {
      state = JSON.parse(op.context.resultingState);
    } catch {
      continue;
    }

    const status = state.status as string | undefined;
    if (status === "CANCELLED" || status === "FAILED") continue;

    const pledgedAmount = Number(state.pledgedAmount) || 0;
    const receivedAmount = Number(state.receivedAmount) || 0;

    const existing = driveTotals.get(driveId) || {
      pledged: 0,
      received: 0,
      updatedAt: "",
    };
    existing.pledged = pledgedAmount;
    existing.received = receivedAmount;
    existing.updatedAt = new Date().toISOString();
    driveTotals.set(driveId, existing);
  }
}
