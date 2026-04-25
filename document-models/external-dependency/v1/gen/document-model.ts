import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "defi-united/external-dependency",
  name: "ExternalDependency",
  author: {
    name: "Powerhouse",
    website: "https://powerhouse.inc",
  },
  extension: ".dep",
  description:
    "External action that must complete before pledges can settle (governance vote, council action, on-chain tx).",
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
            "type ExternalDependencyState {\n    title: String!\n    description: String\n    kind: DependencyKind!\n    blocks: [PHID!]!\n    status: DependencyStatus!\n    externalRef: DependencyRef\n    expectedResolution: DateTime\n    assignee: String\n}\n\nenum DependencyKind {\n    GOVERNANCE_VOTE\n    COUNCIL_ACTION\n    ONCHAIN_TX\n    OPERATIONAL\n    OTHER\n}\n\nenum DependencyStatus {\n    OPEN\n    IN_PROGRESS\n    RESOLVED\n    BLOCKED\n    ABANDONED\n}\n\ntype DependencyRef {\n    url: URL\n    txHash: String\n    proposalId: String\n}",
          examples: [],
          initialValue:
            '{\n  "title": "",\n  "description": null,\n  "kind": "OPERATIONAL",\n  "blocks": [],\n  "status": "OPEN",\n  "externalRef": null,\n  "expectedResolution": null,\n  "assignee": null\n}',
        },
      },
      modules: [
        {
          id: "ed-tracking",
          name: "tracking",
          description:
            "Track external dependencies that block campaign pledges",
          operations: [
            {
              id: "op-ed-set-details",
              name: "SET_DEPENDENCY_DETAILS",
              description: "Update dependency metadata",
              schema:
                "input SetDependencyDetailsInput {\n    title: String\n    description: String\n    kind: DependencyKind\n    expectedResolution: DateTime\n    assignee: String\n}",
              template: "Update dependency metadata",
              reducer:
                "if (action.input.title) state.title = action.input.title;\nif (action.input.description) state.description = action.input.description;\nif (action.input.kind) state.kind = action.input.kind;\nif (action.input.expectedResolution) state.expectedResolution = action.input.expectedResolution;\nif (action.input.assignee) state.assignee = action.input.assignee;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "op-ed-update-status",
              name: "UPDATE_STATUS",
              description: "Set the dependency status",
              schema:
                "input UpdateStatusInput {\n    status: DependencyStatus!\n}",
              template: "Set the dependency status",
              reducer:
                "if (state.status === 'RESOLVED' && action.input.status !== 'RESOLVED') throw new DependencyAlreadyResolvedError('Cannot move dependency out of RESOLVED state');\nstate.status = action.input.status;",
              errors: [
                {
                  id: "err-ed-already-resolved",
                  name: "DependencyAlreadyResolvedError",
                  code: "DEPENDENCY_ALREADY_RESOLVED",
                  description:
                    "Resolved dependencies cannot be moved back to a non-resolved status",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-ed-link-pledge",
              name: "LINK_PLEDGE",
              description: "Mark a pledge as blocked by this dependency",
              schema: "input LinkPledgeInput {\n    pledgeId: PHID!\n}",
              template: "Mark a pledge as blocked by this dependency",
              reducer:
                "if (state.blocks.includes(action.input.pledgeId)) throw new PledgeAlreadyLinkedError('Pledge is already linked to this dependency');\nstate.blocks.push(action.input.pledgeId);",
              errors: [
                {
                  id: "err-ed-already-linked",
                  name: "PledgeAlreadyLinkedError",
                  code: "PLEDGE_ALREADY_LINKED",
                  description: "Pledge is already linked to this dependency",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-ed-unlink-pledge",
              name: "UNLINK_PLEDGE",
              description: "Remove a pledge from this dependency's blocks list",
              schema: "input UnlinkPledgeInput {\n    pledgeId: PHID!\n}",
              template: "Remove a pledge from this dependency's blocks list",
              reducer:
                "const idx = state.blocks.indexOf(action.input.pledgeId);\nif (idx === -1) throw new PledgeNotLinkedError('Pledge is not linked to this dependency');\nstate.blocks.splice(idx, 1);",
              errors: [
                {
                  id: "err-ed-not-linked",
                  name: "PledgeNotLinkedError",
                  code: "PLEDGE_NOT_LINKED",
                  description:
                    "Pledge is not currently linked to this dependency",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-ed-resolve",
              name: "RESOLVE",
              description: "Mark dependency as resolved",
              schema: "input ResolveInput {\n    _: Boolean\n}",
              template: "Mark dependency as resolved",
              reducer:
                "if (state.status === 'RESOLVED') throw new DependencyAlreadyResolvedError('Dependency is already resolved');\nif (state.status === 'ABANDONED') throw new InvalidStatusTransitionError('Cannot resolve an abandoned dependency');\nstate.status = 'RESOLVED';",
              errors: [
                {
                  id: "err-ed-resolve-already",
                  name: "DependencyAlreadyResolvedError",
                  code: "DEPENDENCY_ALREADY_RESOLVED_RES",
                  description: "Cannot resolve an already-resolved dependency",
                  template: "",
                },
                {
                  id: "err-ed-resolve-abandoned",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_RESOLVE_ABANDONED",
                  description: "Cannot resolve an abandoned dependency",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-ed-abandon",
              name: "ABANDON",
              description: "Mark dependency as abandoned (no longer pursued)",
              schema: "input AbandonInput {\n    _: Boolean\n}",
              template: "Mark dependency as abandoned (no longer pursued)",
              reducer:
                "if (state.status === 'RESOLVED') throw new InvalidStatusTransitionError('Cannot abandon a resolved dependency');\nstate.status = 'ABANDONED';",
              errors: [
                {
                  id: "err-ed-abandon-resolved",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_ABANDON",
                  description: "Cannot abandon a resolved dependency",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-ed-set-ref",
              name: "SET_EXTERNAL_REF",
              description:
                "Attach external references (proposal URL, on-chain tx, etc.)",
              schema:
                "input SetExternalRefInput {\n    url: URL\n    txHash: String\n    proposalId: String\n}",
              template:
                "Attach external references (proposal URL, on-chain tx, etc.)",
              reducer:
                "state.externalRef = {\n  url: action.input.url ?? null,\n  txHash: action.input.txHash ?? null,\n  proposalId: action.input.proposalId ?? null,\n};",
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
