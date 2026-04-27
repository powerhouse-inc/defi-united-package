/**
 * Pledge reconciliation processor factory.
 *
 * Registers a processor that auto-matches OnchainReceipt documents to
 * Pledge documents when the amount, asset, and campaign match.
 */
import type { IProcessorHostModule } from "@powerhousedao/reactor-browser";
import { buildPledgeReconciliation } from "./index.js";

export const pledgeReconciliationProcessorFactory = (
  module: IProcessorHostModule,
) => {
  // Only run on switchboard
  if (module.processorApp !== "switchboard") {
    return async () => [];
  }
  return buildPledgeReconciliation(module);
};
