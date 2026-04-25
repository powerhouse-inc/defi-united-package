import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "defi-united/relief-campaign",
  name: "ReliefCampaign",
  author: {
    name: "Powerhouse",
    website: "https://powerhouse.inc",
  },
  extension: ".rcmp",
  description:
    "Master document for a coordinated DeFi relief campaign. One per campaign drive.",
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
            "type ReliefCampaignState {\n    name: String!\n    slug: String!\n    summary: String\n    incidentDate: DateTime\n    status: CampaignStatus!\n    targetAmount: Amount_Tokens\n    affectedAsset: AffectedAsset\n    contributionAddresses: [ContributionAddress!]!\n    riskDisclaimer: String\n    externalLinks: [ExternalLink!]!\n    contributorRegistryDriveId: PHID\n    operatorWallets: [EthereumAddress!]!\n}\n\nenum CampaignStatus {\n    DRAFT\n    ACTIVE\n    EXECUTING\n    RESOLVED\n    FAILED\n    ARCHIVED\n}\n\ntype AffectedAsset {\n    symbol: String!\n    address: EthereumAddress\n    chainId: Int!\n}\n\ntype ContributionAddress {\n    id: OID!\n    chainId: Int!\n    address: EthereumAddress!\n    label: String\n}\n\ntype ExternalLink {\n    id: OID!\n    label: String!\n    url: URL!\n}",
          examples: [],
          initialValue:
            '{\n  "name": "",\n  "slug": "",\n  "summary": null,\n  "incidentDate": null,\n  "status": "DRAFT",\n  "targetAmount": null,\n  "affectedAsset": null,\n  "contributionAddresses": [],\n  "riskDisclaimer": null,\n  "externalLinks": [],\n  "contributorRegistryDriveId": null,\n  "operatorWallets": []\n}',
        },
      },
      modules: [
        {
          id: "rc-mgmt",
          name: "management",
          description:
            "Lifecycle and registry operations for a relief campaign",
          operations: [
            {
              id: "op-rc-set-details",
              name: "SET_CAMPAIGN_DETAILS",
              description: "Update campaign metadata fields",
              schema:
                "input AffectedAssetInput {\n    symbol: String!\n    address: EthereumAddress\n    chainId: Int!\n}\n\ninput SetCampaignDetailsInput {\n    name: String\n    slug: String\n    summary: String\n    incidentDate: DateTime\n    targetAmount: Amount_Tokens\n    affectedAsset: AffectedAssetInput\n    riskDisclaimer: String\n    contributorRegistryDriveId: PHID\n}",
              template: "Update campaign metadata fields",
              reducer:
                "if (action.input.name) state.name = action.input.name;\nif (action.input.slug) state.slug = action.input.slug;\nif (action.input.summary) state.summary = action.input.summary;\nif (action.input.incidentDate) state.incidentDate = action.input.incidentDate;\nif (action.input.targetAmount) state.targetAmount = action.input.targetAmount;\nif (action.input.affectedAsset) {\n  state.affectedAsset = {\n    symbol: action.input.affectedAsset.symbol,\n    chainId: action.input.affectedAsset.chainId,\n    address: action.input.affectedAsset.address ?? null,\n  };\n}\nif (action.input.riskDisclaimer) state.riskDisclaimer = action.input.riskDisclaimer;\nif (action.input.contributorRegistryDriveId) state.contributorRegistryDriveId = action.input.contributorRegistryDriveId;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "op-rc-add-addr",
              name: "ADD_CONTRIBUTION_ADDRESS",
              description:
                "Register an address that can receive relief contributions",
              schema:
                "input AddContributionAddressInput {\n    id: OID!\n    chainId: Int!\n    address: EthereumAddress!\n    label: String\n}",
              template:
                "Register an address that can receive relief contributions",
              reducer:
                "const dup = state.contributionAddresses.find(\n  (c) => c.address.toLowerCase() === action.input.address.toLowerCase() && c.chainId === action.input.chainId,\n);\nif (dup) throw new DuplicateContributionAddressError('Contribution address already exists for this chain');\nstate.contributionAddresses.push({\n  id: action.input.id,\n  chainId: action.input.chainId,\n  address: action.input.address,\n  label: action.input.label || null,\n});",
              errors: [
                {
                  id: "err-rc-dup-addr",
                  name: "DuplicateContributionAddressError",
                  code: "DUPLICATE_CONTRIBUTION_ADDRESS",
                  description:
                    "A contribution address with the same chain and address is already registered",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-rc-rem-addr",
              name: "REMOVE_CONTRIBUTION_ADDRESS",
              description:
                "Remove a previously-registered contribution address",
              schema: "input RemoveContributionAddressInput {\n    id: OID!\n}",
              template: "Remove a previously-registered contribution address",
              reducer:
                "const idx = state.contributionAddresses.findIndex((c) => c.id === action.input.id);\nif (idx === -1) throw new ContributionAddressNotFoundError('No contribution address with that id');\nstate.contributionAddresses.splice(idx, 1);",
              errors: [
                {
                  id: "err-rc-addr-not-found",
                  name: "ContributionAddressNotFoundError",
                  code: "CONTRIBUTION_ADDRESS_NOT_FOUND",
                  description:
                    "No contribution address exists with the supplied id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-rc-start",
              name: "START_CAMPAIGN",
              description: "Transition the campaign from DRAFT to ACTIVE",
              schema: "input StartCampaignInput {\n    _: Boolean\n}",
              template: "Transition the campaign from DRAFT to ACTIVE",
              reducer:
                "if (state.status !== 'DRAFT') throw new InvalidStatusTransitionError(`Cannot start campaign in status ${state.status}`);\nif (!state.slug) throw new MissingCampaignSlugError('Campaign slug must be set before starting');\nif (state.contributionAddresses.length === 0) throw new MissingContributionAddressError('At least one contribution address is required to start a campaign');\nstate.status = 'ACTIVE';",
              errors: [
                {
                  id: "err-rc-start-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION",
                  description:
                    "Campaign cannot transition into the requested status from its current status",
                  template: "",
                },
                {
                  id: "err-rc-start-no-slug",
                  name: "MissingCampaignSlugError",
                  code: "MISSING_CAMPAIGN_SLUG",
                  description: "Campaign slug must be set before starting",
                  template: "",
                },
                {
                  id: "err-rc-start-no-addr",
                  name: "MissingContributionAddressError",
                  code: "MISSING_CONTRIBUTION_ADDRESS",
                  description:
                    "At least one contribution address must be registered before starting",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-rc-resolve",
              name: "MARK_RESOLVED",
              description: "Mark an active or executing campaign as resolved",
              schema: "input MarkResolvedInput {\n    _: Boolean\n}",
              template: "Mark an active or executing campaign as resolved",
              reducer:
                "if (state.status !== 'ACTIVE' && state.status !== 'EXECUTING') throw new InvalidStatusTransitionError(`Cannot resolve a campaign in status ${state.status}`);\nstate.status = 'RESOLVED';",
              errors: [
                {
                  id: "err-rc-resolve-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_RESOLVE",
                  description:
                    "Campaign cannot be resolved from its current status",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-rc-fail",
              name: "MARK_FAILED",
              description:
                "Mark a campaign as failed and append a failure note to the summary",
              schema: "input MarkFailedInput {\n    reason: String\n}",
              template:
                "Mark a campaign as failed and append a failure note to the summary",
              reducer:
                "if (state.status === 'ARCHIVED' || state.status === 'RESOLVED') throw new InvalidStatusTransitionError(`Cannot mark failed in terminal status ${state.status}`);\nstate.status = 'FAILED';\nif (action.input.reason) state.summary = `${state.summary ?? ''}\\n\\nFailed: ${action.input.reason}`.trim();",
              errors: [
                {
                  id: "err-rc-fail-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_FAIL",
                  description:
                    "Campaign cannot be marked failed from its current status",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-rc-archive",
              name: "ARCHIVE_CAMPAIGN",
              description: "Archive a resolved or failed campaign",
              schema: "input ArchiveCampaignInput {\n    _: Boolean\n}",
              template: "Archive a resolved or failed campaign",
              reducer:
                "if (state.status !== 'RESOLVED' && state.status !== 'FAILED') throw new InvalidStatusTransitionError(`Cannot archive a campaign in status ${state.status}`);\nstate.status = 'ARCHIVED';",
              errors: [
                {
                  id: "err-rc-archive-status",
                  name: "InvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_ARCHIVE",
                  description:
                    "Campaign cannot be archived from its current status",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-rc-add-link",
              name: "ADD_EXTERNAL_LINK",
              description: "Append a link to external documentation",
              schema:
                "input AddExternalLinkInput {\n    id: OID!\n    label: String!\n    url: URL!\n}",
              template: "Append a link to external documentation",
              reducer:
                "state.externalLinks.push({\n  id: action.input.id,\n  label: action.input.label,\n  url: action.input.url,\n});",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "op-rc-add-op-wallet",
              name: "ADD_OPERATOR_WALLET",
              description:
                "Authorize an address to write via the operations subgraph",
              schema:
                "input AddOperatorWalletInput {\n    address: EthereumAddress!\n}",
              template:
                "Authorize an address to write via the operations subgraph",
              reducer:
                "const addr = action.input.address.toLowerCase();\nif (state.operatorWallets.some((a) => a.toLowerCase() === addr)) throw new DuplicateOperatorWalletError('Operator wallet already authorized');\nstate.operatorWallets.push(action.input.address);",
              errors: [
                {
                  id: "err-rc-dup-op-wallet",
                  name: "DuplicateOperatorWalletError",
                  code: "DUPLICATE_OPERATOR_WALLET",
                  description: "Operator wallet is already authorized",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-rc-rem-op-wallet",
              name: "REMOVE_OPERATOR_WALLET",
              description: "Revoke an operator wallet's write authorization",
              schema:
                "input RemoveOperatorWalletInput {\n    address: EthereumAddress!\n}",
              template: "Revoke an operator wallet's write authorization",
              reducer:
                "const idx = state.operatorWallets.findIndex((a) => a.toLowerCase() === action.input.address.toLowerCase());\nif (idx === -1) throw new OperatorWalletNotFoundError('Operator wallet not authorized');\nstate.operatorWallets.splice(idx, 1);",
              errors: [
                {
                  id: "err-rc-op-wallet-not-found",
                  name: "OperatorWalletNotFoundError",
                  code: "OPERATOR_WALLET_NOT_FOUND",
                  description: "Operator wallet is not currently authorized",
                  template: "",
                },
              ],
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
