import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "defi-united/pledge",
  name: "Pledge",
  author: {
    name: "Powerhouse",
    website: "https://powerhouse.inc",
  },
  extension: ".pldg",
  description:
    "A pledge by a contributor toward a relief campaign. Tracks governance state and on-chain settlement.",
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
            "type PledgeState {\n    contributorProfileId: PHID\n    pledgedAmount: Amount_Tokens\n    asset: PledgeAsset\n    status: PledgeStatus!\n    governance: PledgeGovernance\n    receivedAmount: Amount_Tokens\n    receivedAt: DateTime\n    receiptIds: [PHID!]!\n    publicNotes: String\n    internalNotes: String\n}\n\nenum PledgeStatus {\n    PROPOSED\n    GOVERNANCE_PENDING\n    CONFIRMED\n    RECEIVED\n    CANCELLED\n    FAILED\n}\n\nenum GovernancePlatform {\n    SNAPSHOT\n    TALLY\n    FORUM\n    AGORA\n    OTHER\n}\n\ntype PledgeAsset {\n    symbol: String!\n    address: EthereumAddress\n    chainId: Int!\n}\n\ntype PledgeGovernance {\n    platform: GovernancePlatform!\n    proposalUrl: URL!\n    voteEndDate: DateTime\n    quorumStatus: String\n}",
          examples: [],
          initialValue:
            '{\n  "contributorProfileId": null,\n  "pledgedAmount": null,\n  "asset": null,\n  "status": "PROPOSED",\n  "governance": null,\n  "receivedAmount": null,\n  "receivedAt": null,\n  "receiptIds": [],\n  "publicNotes": null,\n  "internalNotes": null\n}',
        },
      },
      modules: [
        {
          id: "pl-lifecycle",
          name: "lifecycle",
          description:
            "Pledge lifecycle from proposal through governance, confirmation, and settlement",
          operations: [
            {
              id: "op-pl-propose",
              name: "PROPOSE_PLEDGE",
              description: "Propose a new pledge from a contributor",
              schema:
                "input PledgeAssetInput {\n    symbol: String!\n    address: EthereumAddress\n    chainId: Int!\n}\n\ninput ProposePledgeInput {\n    contributorProfileId: PHID!\n    pledgedAmount: Amount_Tokens!\n    asset: PledgeAssetInput!\n    publicNotes: String\n    internalNotes: String\n}",
              template: "Propose a new pledge from a contributor",
              reducer:
                "if (state.pledgedAmount !== null) throw new PledgeAlreadyProposedError('Pledge has already been proposed');\nstate.contributorProfileId = action.input.contributorProfileId;\nstate.pledgedAmount = action.input.pledgedAmount;\nstate.asset = {\n  symbol: action.input.asset.symbol,\n  chainId: action.input.asset.chainId,\n  address: action.input.asset.address ?? null,\n};\nif (action.input.publicNotes) state.publicNotes = action.input.publicNotes;\nif (action.input.internalNotes) state.internalNotes = action.input.internalNotes;",
              errors: [
                {
                  id: "err-pl-already-proposed",
                  name: "PledgeAlreadyProposedError",
                  code: "PLEDGE_ALREADY_PROPOSED",
                  description:
                    "PROPOSE_PLEDGE has already been called on this document",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-pl-attach-gov",
              name: "ATTACH_GOVERNANCE",
              description:
                "Attach governance metadata (proposal URL, vote dates, quorum)",
              schema:
                "input AttachGovernanceInput {\n    platform: GovernancePlatform!\n    proposalUrl: URL!\n    voteEndDate: DateTime\n    quorumStatus: String\n}",
              template:
                "Attach governance metadata (proposal URL, vote dates, quorum)",
              reducer:
                "state.governance = {\n  platform: action.input.platform,\n  proposalUrl: action.input.proposalUrl,\n  voteEndDate: action.input.voteEndDate ?? null,\n  quorumStatus: action.input.quorumStatus ?? null,\n};",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "op-pl-mark-gov-pending",
              name: "MARK_GOVERNANCE_PENDING",
              description:
                "Move pledge into GOVERNANCE_PENDING (requires governance attached)",
              schema: "input MarkGovernancePendingInput {\n    _: Boolean\n}",
              template:
                "Move pledge into GOVERNANCE_PENDING (requires governance attached)",
              reducer:
                "if (state.status !== 'PROPOSED') throw new InvalidStatusTransitionError(`Cannot mark governance pending in status ${state.status}`);\nif (!state.governance) throw new GovernanceRequiredForPendingError('Cannot mark governance pending without governance details attached');\nstate.status = 'GOVERNANCE_PENDING';",
              errors: [
                {
                  id: "err-pl-gov-pending-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_GOV",
                  description:
                    "Cannot mark governance pending from current status",
                  template: "",
                },
                {
                  id: "err-pl-gov-required",
                  name: "GovernanceRequiredForPendingError",
                  code: "GOVERNANCE_REQUIRED_FOR_PENDING",
                  description:
                    "Governance details must be attached before marking governance pending",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-pl-mark-confirmed",
              name: "MARK_CONFIRMED",
              description: "Confirm a pledge",
              schema: "input MarkConfirmedInput {\n    _: Boolean\n}",
              template: "Confirm a pledge",
              reducer:
                "if (state.status !== 'PROPOSED' && state.status !== 'GOVERNANCE_PENDING') throw new InvalidStatusTransitionError(`Cannot confirm pledge in status ${state.status}`);\nstate.status = 'CONFIRMED';",
              errors: [
                {
                  id: "err-pl-confirm-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_CONFIRM",
                  description: "Cannot confirm pledge from current status",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-pl-mark-received",
              name: "MARK_RECEIVED",
              description: "Record an on-chain receipt against this pledge",
              schema:
                "input MarkReceivedInput {\n    receiptId: PHID!\n    receivedAt: DateTime!\n    amount: Amount_Tokens!\n}",
              template: "Record an on-chain receipt against this pledge",
              reducer:
                "if (state.status === 'CANCELLED' || state.status === 'FAILED' || state.status === 'RECEIVED') throw new InvalidStatusTransitionError(`Cannot mark received in terminal status ${state.status}`);\nconst previouslyReceived = Number(state.receivedAmount ?? 0);\nconst incoming = Number(action.input.amount);\nconst newTotal = previouslyReceived + incoming;\nif (state.pledgedAmount !== null && newTotal > Number(state.pledgedAmount)) {\n  throw new ReceivedExceedsPledgedError(`Cumulative received (${newTotal}) would exceed pledged (${state.pledgedAmount})`);\n}\nstate.receivedAmount = newTotal;\nstate.receivedAt = action.input.receivedAt;\nif (!state.receiptIds.includes(action.input.receiptId)) {\n  state.receiptIds.push(action.input.receiptId);\n}\nstate.status = 'RECEIVED';",
              errors: [
                {
                  id: "err-pl-received-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_RECEIVED",
                  description: "Cannot mark received in terminal status",
                  template: "",
                },
                {
                  id: "err-pl-exceeds-pledged",
                  name: "ReceivedExceedsPledgedError",
                  code: "RECEIVED_EXCEEDS_PLEDGED",
                  description:
                    "Cumulative receipts would exceed the pledged amount",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-pl-cancel",
              name: "CANCEL_PLEDGE",
              description: "Cancel a non-terminal pledge",
              schema: "input CancelPledgeInput {\n    reason: String\n}",
              template: "Cancel a non-terminal pledge",
              reducer:
                "if (state.status === 'RECEIVED' || state.status === 'CANCELLED') throw new InvalidStatusTransitionError(`Cannot cancel pledge in status ${state.status}`);\nstate.status = 'CANCELLED';\nif (action.input.reason) state.internalNotes = `${state.internalNotes ?? ''}\\n\\nCancelled: ${action.input.reason}`.trim();",
              errors: [
                {
                  id: "err-pl-cancel-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_CANCEL",
                  description: "Cannot cancel pledge from current status",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-pl-fail",
              name: "FAIL_PLEDGE",
              description:
                "Mark a pledge as failed (governance rejected, contributor backed out, etc.)",
              schema: "input FailPledgeInput {\n    reason: String\n}",
              template:
                "Mark a pledge as failed (governance rejected, contributor backed out, etc.)",
              reducer:
                "if (state.status === 'RECEIVED' || state.status === 'FAILED') throw new InvalidStatusTransitionError(`Cannot fail pledge in status ${state.status}`);\nstate.status = 'FAILED';\nif (action.input.reason) state.internalNotes = `${state.internalNotes ?? ''}\\n\\nFailed: ${action.input.reason}`.trim();",
              errors: [
                {
                  id: "err-pl-fail-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_FAIL",
                  description: "Cannot fail pledge from current status",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-pl-edit-notes",
              name: "EDIT_NOTES",
              description: "Update public and/or internal notes",
              schema:
                "input EditNotesInput {\n    publicNotes: String\n    internalNotes: String\n}",
              template: "Update public and/or internal notes",
              reducer:
                "if (action.input.publicNotes) state.publicNotes = action.input.publicNotes;\nif (action.input.internalNotes) state.internalNotes = action.input.internalNotes;",
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
