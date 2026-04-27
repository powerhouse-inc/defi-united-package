/**
 * Switchboard-specific processor factory builders.
 *
 * Processors registered here only run when the host app is "switchboard".
 */
import type { ProcessorFactoryBuilder } from "@powerhousedao/reactor";
import { buildOnchainReceiptWatcher } from "./onchain-receipt-watcher/index.js";
import { buildPledgeReconciliation } from "./pledge-reconciliation/index.js";
import { buildCampaignRollup } from "./campaign-rollup/index.js";

export const processorFactoryBuilders: ProcessorFactoryBuilder[] = [
  // Watch for incoming transfers to campaign contribution addresses
  buildOnchainReceiptWatcher,

  // Auto-match receipts to pledges
  buildPledgeReconciliation,

  // Roll up pledge + receipt totals for campaign projections
  buildCampaignRollup,
];
