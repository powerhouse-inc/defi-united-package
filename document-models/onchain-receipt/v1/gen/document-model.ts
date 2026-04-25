import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "defi-united/onchain-receipt",
  name: "OnchainReceipt",
  author: {
    name: "Powerhouse",
    website: "https://powerhouse.inc",
  },
  extension: ".rcpt",
  description:
    "An on-chain transfer to a campaign contribution address. Created by the receipt-watcher processor and reconciled to a pledge.",
  specifications: [
    {
      state: {
        local: {
          schema: "",
          examples: [],
          initialValue: "",
        },
        global: {
          schema:
            "type OnchainReceiptState {\n    chainId: Int\n    txHash: String\n    blockNumber: Int\n    blockTimestamp: DateTime\n    fromAddress: EthereumAddress\n    toAddress: EthereumAddress\n    asset: ReceiptAsset\n    amount: Amount_Tokens\n    matchedPledgeId: PHID\n    reconciliationStatus: ReconciliationStatus!\n    rawLog: String\n}\n\nenum ReconciliationStatus {\n    UNMATCHED\n    MATCHED\n    AMBIGUOUS\n    MANUALLY_OVERRIDDEN\n}\n\ntype ReceiptAsset {\n    symbol: String!\n    contractAddress: EthereumAddress\n}",
          examples: [],
          initialValue:
            '{\n  "chainId": null,\n  "txHash": null,\n  "blockNumber": null,\n  "blockTimestamp": null,\n  "fromAddress": null,\n  "toAddress": null,\n  "asset": null,\n  "amount": null,\n  "matchedPledgeId": null,\n  "reconciliationStatus": "UNMATCHED",\n  "rawLog": null\n}',
        },
      },
      modules: [
        {
          id: "or-recon",
          name: "reconciliation",
          description: "Receipt recording and pledge reconciliation",
          operations: [
            {
              id: "op-or-record",
              name: "RECORD_RECEIPT",
              description: "Record an on-chain transfer to a campaign address",
              schema:
                "input ReceiptAssetInput {\n    symbol: String!\n    contractAddress: EthereumAddress\n}\n\ninput RecordReceiptInput {\n    chainId: Int!\n    txHash: String!\n    blockNumber: Int!\n    blockTimestamp: DateTime!\n    fromAddress: EthereumAddress!\n    toAddress: EthereumAddress!\n    asset: ReceiptAssetInput!\n    amount: Amount_Tokens!\n    rawLog: String\n}",
              template: "Record an on-chain transfer to a campaign address",
              reducer:
                "if (state.txHash) throw new ReceiptAlreadyRecordedError('Receipt has already been recorded');\nstate.chainId = action.input.chainId;\nstate.txHash = action.input.txHash;\nstate.blockNumber = action.input.blockNumber;\nstate.blockTimestamp = action.input.blockTimestamp;\nstate.fromAddress = action.input.fromAddress;\nstate.toAddress = action.input.toAddress;\nstate.asset = {\n  symbol: action.input.asset.symbol,\n  contractAddress: action.input.asset.contractAddress ?? null,\n};\nstate.amount = action.input.amount;\nif (action.input.rawLog) state.rawLog = action.input.rawLog;",
              errors: [
                {
                  id: "err-or-already-recorded",
                  name: "ReceiptAlreadyRecordedError",
                  code: "RECEIPT_ALREADY_RECORDED",
                  description:
                    "RECORD_RECEIPT has already been called on this document",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-or-attach",
              name: "ATTACH_PLEDGE",
              description: "Mark this receipt as fulfilling a specific pledge",
              schema: "input AttachPledgeInput {\n    pledgeId: PHID!\n}",
              template: "Mark this receipt as fulfilling a specific pledge",
              reducer:
                "state.matchedPledgeId = action.input.pledgeId;\nstate.reconciliationStatus = 'MATCHED';",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "op-or-ambiguous",
              name: "MARK_AMBIGUOUS",
              description:
                "Multiple candidate pledges \u2014 needs manual override",
              schema: "input MarkAmbiguousInput {\n    _: Boolean\n}",
              template:
                "Multiple candidate pledges \u2014 needs manual override",
              reducer: "state.reconciliationStatus = 'AMBIGUOUS';",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "op-or-override",
              name: "OVERRIDE_MATCH",
              description:
                "Manually attach this receipt to a pledge (operator override)",
              schema: "input OverrideMatchInput {\n    pledgeId: PHID!\n}",
              template:
                "Manually attach this receipt to a pledge (operator override)",
              reducer:
                "state.matchedPledgeId = action.input.pledgeId;\nstate.reconciliationStatus = 'MANUALLY_OVERRIDDEN';",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "op-or-clear",
              name: "CLEAR_MATCH",
              description: "Clear any matched pledge and reset to UNMATCHED",
              schema: "input ClearMatchInput {\n    _: Boolean\n}",
              template: "Clear any matched pledge and reset to UNMATCHED",
              reducer:
                "state.matchedPledgeId = null;\nstate.reconciliationStatus = 'UNMATCHED';",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
      ],
      version: 1,
      changeLog: [],
    },
  ],
};
