import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "defi-united/distribution-plan",
  name: "DistributionPlan",
  author: {
    name: "Powerhouse",
    website: "https://powerhouse.inc",
  },
  extension: ".dist",
  description:
    "Plan for distributing recovered funds to affected parties. Recipients are tracked individually with allocations and on-chain settlement status.",
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
            "type DistributionPlanState {\n    status: DistributionStatus!\n    methodology: String\n    totalAvailable: Amount_Tokens\n    recipients: [DistributionRecipient!]!\n    approvalRefs: [ApprovalRef!]!\n}\n\nenum DistributionStatus {\n    DRAFT\n    APPROVED\n    EXECUTING\n    COMPLETED\n    CANCELLED\n}\n\nenum RecipientStatus {\n    PLANNED\n    SENT\n    FAILED\n    REFUNDED\n}\n\ntype DistributionRecipient {\n    id: OID!\n    address: EthereumAddress!\n    chainId: Int!\n    allocatedAmount: Amount_Tokens!\n    rationale: String\n    status: RecipientStatus!\n    txHash: String\n}\n\ntype ApprovalRef {\n    id: OID!\n    url: URL!\n    label: String!\n}",
          examples: [],
          initialValue:
            '{\n  "status": "DRAFT",\n  "methodology": null,\n  "totalAvailable": null,\n  "recipients": [],\n  "approvalRefs": []\n}',
        },
      },
      modules: [
        {
          id: "dp-planning",
          name: "planning",
          description: "Plan and execute distribution of recovered funds",
          operations: [
            {
              id: "op-dp-set-meth",
              name: "SET_METHODOLOGY",
              description: "Update methodology and total available amount",
              schema:
                "input SetMethodologyInput {\n    methodology: String\n    totalAvailable: Amount_Tokens\n}",
              template: "Update methodology and total available amount",
              reducer:
                "if (action.input.methodology) state.methodology = action.input.methodology;\nif (action.input.totalAvailable) state.totalAvailable = action.input.totalAvailable;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "op-dp-add-rcpt",
              name: "ADD_RECIPIENT",
              description: "Add a recipient with allocation",
              schema:
                "input AddRecipientInput {\n    id: OID!\n    address: EthereumAddress!\n    chainId: Int!\n    allocatedAmount: Amount_Tokens!\n    rationale: String\n}",
              template: "Add a recipient with allocation",
              reducer:
                "if (state.status !== 'DRAFT') throw new InvalidStatusTransitionError(`Cannot add recipient in status ${state.status}`);\nconst dup = state.recipients.find(\n  (r) => r.address.toLowerCase() === action.input.address.toLowerCase() && r.chainId === action.input.chainId,\n);\nif (dup) throw new DuplicateRecipientError('Recipient already exists for this chain');\nstate.recipients.push({\n  id: action.input.id,\n  address: action.input.address,\n  chainId: action.input.chainId,\n  allocatedAmount: action.input.allocatedAmount,\n  rationale: action.input.rationale ?? null,\n  status: 'PLANNED',\n  txHash: null,\n});",
              errors: [
                {
                  id: "err-dp-add-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_ADD",
                  description: "Cannot add recipient outside of DRAFT",
                  template: "",
                },
                {
                  id: "err-dp-dup-rcpt",
                  name: "DuplicateRecipientError",
                  code: "DUPLICATE_RECIPIENT",
                  description:
                    "Recipient with same address+chain already exists",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-dp-upd-rcpt",
              name: "UPDATE_RECIPIENT",
              description: "Update a planned recipient (DRAFT only)",
              schema:
                "input UpdateRecipientInput {\n    id: OID!\n    allocatedAmount: Amount_Tokens\n    rationale: String\n}",
              template: "Update a planned recipient (DRAFT only)",
              reducer:
                "if (state.status !== 'DRAFT') throw new InvalidStatusTransitionError(`Cannot update recipient in status ${state.status}`);\nconst r = state.recipients.find((x) => x.id === action.input.id);\nif (!r) throw new RecipientNotFoundError('No recipient with that id');\nif (action.input.allocatedAmount) r.allocatedAmount = action.input.allocatedAmount;\nif (action.input.rationale) r.rationale = action.input.rationale;",
              errors: [
                {
                  id: "err-dp-upd-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_UPD",
                  description: "Cannot update recipient outside of DRAFT",
                  template: "",
                },
                {
                  id: "err-dp-upd-not-found",
                  name: "RecipientNotFoundError",
                  code: "RECIPIENT_NOT_FOUND_UPD",
                  description: "No recipient with that id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-dp-rem-rcpt",
              name: "REMOVE_RECIPIENT",
              description: "Remove a planned recipient (DRAFT only)",
              schema: "input RemoveRecipientInput {\n    id: OID!\n}",
              template: "Remove a planned recipient (DRAFT only)",
              reducer:
                "if (state.status !== 'DRAFT') throw new InvalidStatusTransitionError(`Cannot remove recipient in status ${state.status}`);\nconst idx = state.recipients.findIndex((x) => x.id === action.input.id);\nif (idx === -1) throw new RecipientNotFoundError('No recipient with that id');\nstate.recipients.splice(idx, 1);",
              errors: [
                {
                  id: "err-dp-rem-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_REM",
                  description: "Cannot remove recipient outside of DRAFT",
                  template: "",
                },
                {
                  id: "err-dp-rem-not-found",
                  name: "RecipientNotFoundError",
                  code: "RECIPIENT_NOT_FOUND_REM",
                  description: "No recipient with that id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-dp-approve",
              name: "APPROVE_PLAN",
              description: "Approve the plan for execution",
              schema: "input ApprovePlanInput {\n    _: Boolean\n}",
              template: "Approve the plan for execution",
              reducer:
                "if (state.status !== 'DRAFT') throw new InvalidStatusTransitionError(`Cannot approve plan in status ${state.status}`);\nstate.status = 'APPROVED';",
              errors: [
                {
                  id: "err-dp-approve-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_APP",
                  description: "Cannot approve plan outside of DRAFT",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-dp-mark-sent",
              name: "MARK_RECIPIENT_SENT",
              description: "Mark a recipient payout as sent on-chain",
              schema:
                "input MarkRecipientSentInput {\n    id: OID!\n    txHash: String!\n}",
              template: "Mark a recipient payout as sent on-chain",
              reducer:
                "if (state.status !== 'APPROVED' && state.status !== 'EXECUTING') throw new PlanNotApprovedError('Plan must be APPROVED before sending');\nconst r = state.recipients.find((x) => x.id === action.input.id);\nif (!r) throw new RecipientNotFoundError('No recipient with that id');\nr.status = 'SENT';\nr.txHash = action.input.txHash;\nstate.status = 'EXECUTING';",
              errors: [
                {
                  id: "err-dp-sent-not-approved",
                  name: "PlanNotApprovedError",
                  code: "PLAN_NOT_APPROVED_SENT",
                  description: "Plan must be approved before sending",
                  template: "",
                },
                {
                  id: "err-dp-sent-not-found",
                  name: "RecipientNotFoundError",
                  code: "RECIPIENT_NOT_FOUND_SENT",
                  description: "No recipient with that id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-dp-mark-failed",
              name: "MARK_RECIPIENT_FAILED",
              description: "Mark a recipient payout as failed",
              schema: "input MarkRecipientFailedInput {\n    id: OID!\n}",
              template: "Mark a recipient payout as failed",
              reducer:
                "if (state.status !== 'APPROVED' && state.status !== 'EXECUTING') throw new PlanNotApprovedError('Plan must be APPROVED');\nconst r = state.recipients.find((x) => x.id === action.input.id);\nif (!r) throw new RecipientNotFoundError('No recipient with that id');\nr.status = 'FAILED';",
              errors: [
                {
                  id: "err-dp-failed-not-approved",
                  name: "PlanNotApprovedError",
                  code: "PLAN_NOT_APPROVED_FAIL",
                  description: "Plan must be approved",
                  template: "",
                },
                {
                  id: "err-dp-failed-not-found",
                  name: "RecipientNotFoundError",
                  code: "RECIPIENT_NOT_FOUND_FAIL",
                  description: "No recipient with that id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-dp-mark-refunded",
              name: "MARK_RECIPIENT_REFUNDED",
              description: "Mark a recipient payout as refunded",
              schema: "input MarkRecipientRefundedInput {\n    id: OID!\n}",
              template: "Mark a recipient payout as refunded",
              reducer:
                "if (state.status !== 'APPROVED' && state.status !== 'EXECUTING') throw new PlanNotApprovedError('Plan must be APPROVED');\nconst r = state.recipients.find((x) => x.id === action.input.id);\nif (!r) throw new RecipientNotFoundError('No recipient with that id');\nr.status = 'REFUNDED';",
              errors: [
                {
                  id: "err-dp-ref-not-approved",
                  name: "PlanNotApprovedError",
                  code: "PLAN_NOT_APPROVED_REF",
                  description: "Plan must be approved",
                  template: "",
                },
                {
                  id: "err-dp-ref-not-found",
                  name: "RecipientNotFoundError",
                  code: "RECIPIENT_NOT_FOUND_REF",
                  description: "No recipient with that id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-dp-complete",
              name: "COMPLETE_DISTRIBUTION",
              description:
                "Mark distribution as complete (all recipients SENT or REFUNDED)",
              schema: "input CompleteDistributionInput {\n    _: Boolean\n}",
              template:
                "Mark distribution as complete (all recipients SENT or REFUNDED)",
              reducer:
                "if (state.status !== 'EXECUTING') throw new InvalidStatusTransitionError(`Cannot complete plan in status ${state.status}`);\nconst allDone = state.recipients.every((r) => r.status === 'SENT' || r.status === 'REFUNDED');\nif (!allDone) throw new InvalidStatusTransitionError('Cannot complete plan with PLANNED or FAILED recipients');\nstate.status = 'COMPLETED';",
              errors: [
                {
                  id: "err-dp-complete-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_COMPLETE",
                  description:
                    "Cannot complete plan outside of EXECUTING with all recipients done",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-dp-cancel",
              name: "CANCEL_PLAN",
              description: "Cancel the plan",
              schema: "input CancelPlanInput {\n    _: Boolean\n}",
              template: "Cancel the plan",
              reducer:
                "if (state.status === 'COMPLETED' || state.status === 'CANCELLED') throw new InvalidStatusTransitionError(`Cannot cancel plan in status ${state.status}`);\nstate.status = 'CANCELLED';",
              errors: [
                {
                  id: "err-dp-cancel-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_CANCEL",
                  description: "Cannot cancel a terminal plan",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-dp-add-approval",
              name: "ADD_APPROVAL_REF",
              description:
                "Add a reference to a DAO approval (Snapshot, on-chain vote, etc.)",
              schema:
                "input AddApprovalRefInput {\n    id: OID!\n    url: URL!\n    label: String!\n}",
              template:
                "Add a reference to a DAO approval (Snapshot, on-chain vote, etc.)",
              reducer:
                "state.approvalRefs.push({\n  id: action.input.id,\n  url: action.input.url,\n  label: action.input.label,\n});",
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
