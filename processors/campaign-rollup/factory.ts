/**
 * Campaign rollup processor factory.
 *
 * Registers a processor that recalculates campaign aggregate totals
 * (totalPledged, totalReceived) when pledges or receipts change.
 */
import type { IProcessorHostModule } from "@powerhousedao/reactor-browser";
import { buildCampaignRollup } from "./index.js";

export const campaignRollupProcessorFactory = (
  module: IProcessorHostModule,
) => {
  // Only run on switchboard
  if (module.processorApp !== "switchboard") {
    return async () => [];
  }
  return buildCampaignRollup(module);
};
