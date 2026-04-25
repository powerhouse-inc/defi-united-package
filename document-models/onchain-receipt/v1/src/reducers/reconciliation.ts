import type { OnchainReceiptReconciliationOperations } from "document-models/onchain-receipt/v1";
import { ReceiptAlreadyRecordedError } from "../../gen/reconciliation/error.js";

export const onchainReceiptReconciliationOperations: OnchainReceiptReconciliationOperations =
  {
    recordReceiptOperation(state, action) {
      if (state.txHash)
        throw new ReceiptAlreadyRecordedError(
          "Receipt has already been recorded",
        );
      state.chainId = action.input.chainId;
      state.txHash = action.input.txHash;
      state.blockNumber = action.input.blockNumber;
      state.blockTimestamp = action.input.blockTimestamp;
      state.fromAddress = action.input.fromAddress;
      state.toAddress = action.input.toAddress;
      state.asset = {
        symbol: action.input.asset.symbol,
        contractAddress: action.input.asset.contractAddress ?? null,
      };
      state.amount = action.input.amount;
      if (action.input.rawLog) state.rawLog = action.input.rawLog;
    },
    attachPledgeOperation(state, action) {
      state.matchedPledgeId = action.input.pledgeId;
      state.reconciliationStatus = "MATCHED";
    },
    markAmbiguousOperation(state, action) {
      state.reconciliationStatus = "AMBIGUOUS";
    },
    overrideMatchOperation(state, action) {
      state.matchedPledgeId = action.input.pledgeId;
      state.reconciliationStatus = "MANUALLY_OVERRIDDEN";
    },
    clearMatchOperation(state, action) {
      state.matchedPledgeId = null;
      state.reconciliationStatus = "UNMATCHED";
    },
  };
