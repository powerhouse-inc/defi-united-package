# DeFi United Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the seven document models, two drive editors, three processors, three subgraphs, and Next.js companion app described in `docs/superpowers/specs/2026-04-25-defi-united-package-design.md`.

**Architecture:** Hybrid drive layout — central DAO drive holds Contributor Profile registry, per-campaign drives hold campaign-scoped docs (Relief Campaign, Pledges, Dependencies, Receipts, Distribution Plan, Status Updates). Document models authored via reactor-mcp, then reducers written into `src/reducers/` per project convention. Processors react to receipt arrivals and roll up campaign metrics. Subgraphs expose public + auth-gated GraphQL surfaces over Switchboard. Next.js companion app uses graphql-codegen + graphql-ws to drive a defiunited.world-style live dashboard.

**Tech Stack:** Powerhouse 6.0.0-dev.197 (`document-model`, `reactor-api`, `reactor-browser`, `design-system`, `document-engineering`), TypeScript, Vitest. Companion app: Next 16, React 19, Tailwind, shadcn/Radix, Framer Motion, graphql-request, graphql-ws, TanStack Query.

**Commit policy (per user instruction):** Small incremental commits per logical chunk. **Do NOT include `Co-Authored-By` trailers.** Use the form `git -c user.name="Frank" -c user.email="frank@powerhouse.inc" commit -m "..."`.

---

## Phase 0 — Pre-flight checks

### Task 0.1: Confirm reactor-mcp connectivity and capture the Vetra drive ID

**Why this matters:** Document-model authoring goes through reactor-mcp; without an active connection and a known target drive, every subsequent task blocks.

- [ ] **Step 1:** Call `mcp__reactor-mcp__getDrives` and identify the drive whose ID starts with `vetra-` (this is the source/dev drive the codegen reads). Save the drive id as `VETRA_DRIVE_ID` and the preview drive id (`preview-…`) as `PREVIEW_DRIVE_ID` for later phases. If only one of them exists, that's still fine — note which.
- [ ] **Step 2:** Call `mcp__reactor-mcp__getDocumentModelSchema` with `type: "powerhouse/document-model"` and skim the input shapes for the operations we'll be calling: `SET_MODEL_NAME`, `SET_MODEL_ID`, `SET_MODEL_EXTENSION`, `SET_MODEL_DESCRIPTION`, `SET_AUTHOR_NAME`, `SET_AUTHOR_WEBSITE`, `ADD_MODULE`, `ADD_OPERATION`, `SET_OPERATION_SCHEMA`, `SET_OPERATION_REDUCER`, `ADD_OPERATION_ERROR`, `SET_STATE_SCHEMA`, `SET_INITIAL_STATE`. Confirm whether `id` and `scope` are required on each.
- [ ] **Step 3:** Call `mcp__reactor-mcp__getDocumentModelSchema` with `type: "powerhouse/document-editor"` and capture editor configuration shape (target document model, name, etc.).
- [ ] **Step 4:** Set `powerhouse.manifest.json` package metadata so codegen can run cleanly.

**`powerhouse.manifest.json`** — replace the empty publisher fields:
```json
{
  "name": "defi-united-package",
  "description": "Operational toolkit for coordinated DeFi relief / crisis response coalitions. First instance: DeFi United (April 2026 rsETH incident).",
  "category": "DeFi",
  "publisher": {
    "name": "Powerhouse",
    "url": "https://powerhouse.inc"
  },
  "documentModels": [],
  "apps": [],
  "editors": [],
  "processors": [],
  "subgraphs": [],
  "config": []
}
```

- [ ] **Step 5:** Commit.
```bash
git add powerhouse.manifest.json
git -c user.name="Frank" -c user.email="frank@powerhouse.inc" commit -m "chore: set package metadata for defi-united"
```

---

## Phase 1 — Document models

Each document model is created through this loop. **Reference task = 1.1** (Relief Campaign). Tasks 1.2–1.7 reference this loop and only list per-model diffs (state schema, operations, errors, reducer code).

### Reference loop (applies to every doc model)

For each model:
1. `mcp__reactor-mcp__createDocument` with `driveId: VETRA_DRIVE_ID`, `documentType: "powerhouse/document-model"`. Capture the returned `documentId`.
2. **Single batched `mcp__reactor-mcp__addActions` call** for header + state schema + initial state (saves round trips):
   - `SET_MODEL_NAME` { name }
   - `SET_MODEL_ID` { id: "defi-united/<slug>" }
   - `SET_MODEL_EXTENSION` { extension: ".<ext>" }
   - `SET_MODEL_DESCRIPTION` { description }
   - `SET_AUTHOR_NAME` { name: "Powerhouse" }
   - `SET_AUTHOR_WEBSITE` { website: "https://powerhouse.inc" }
   - `SET_STATE_SCHEMA` { scope: "global", schema: <full GraphQL SDL> }
   - `SET_INITIAL_STATE` { scope: "global", initialValue: <JSON of empty doc> }
3. **Batched `addActions` for modules:** `ADD_MODULE` for each module with `{ id, name, description }`.
4. **Per-operation batched `addActions`:** `ADD_OPERATION { moduleId, id, name, scope: "global" }`, `SET_OPERATION_SCHEMA { id, schema }`, `SET_OPERATION_REDUCER { id, reducer: <body string> }`.
5. **Per-error batched `addActions`:** `ADD_OPERATION_ERROR { operationId, id, errorCode, errorName, errorDescription }`.
6. Confirm/publish so the document is no longer DRAFT (codegen requires a non-draft document).
7. Verify codegen produced `document-models/<slug>/` containing `gen/`, `module.ts`, `schema.graphql`, etc.
8. Hand-write `document-models/<slug>/src/reducers/<module>.ts` mirroring the reducer code we set via MCP (so TS imports work — both must stay in sync, per CLAUDE.md).
9. Run `npm run tsc` and `npm run lint:fix`. Fix any issues until both pass.
10. Write reducer tests in `document-models/<slug>/tests/<module>.test.ts`. Tests assert state changes for happy-path ops and assert `operations[i].error` for error paths (NEVER `.toThrow()`).
11. Run `npx vitest run document-models/<slug>` and confirm green.
12. Commit with message: `feat(<slug>): add <Model Name> document model`.

### Task 1.1: `defi-united/relief-campaign` (reference task — fully detailed)

**Files (auto-generated by codegen + manually authored):**
- Auto (gen): `document-models/relief-campaign/gen/**`, `module.ts`, `schema.graphql`, `actions.ts`, `hooks.ts`, `utils.ts`, `index.ts`, `relief-campaign.json`
- Manual: `document-models/relief-campaign/src/reducers/management.ts`
- Manual: `document-models/relief-campaign/tests/management.test.ts`

**State schema (`global` scope):**

```graphql
type ReliefCampaignState {
    name: String!
    slug: String!
    summary: String
    incidentDate: DateTime
    status: CampaignStatus!
    targetAmount: Amount_Tokens
    affectedAsset: AffectedAsset
    contributionAddresses: [ContributionAddress!]!
    riskDisclaimer: String
    externalLinks: [ExternalLink!]!
    contributorRegistryDriveId: PHID
    operatorWallets: [EthereumAddress!]!
}

enum CampaignStatus { DRAFT ACTIVE EXECUTING RESOLVED FAILED ARCHIVED }

type AffectedAsset {
    symbol: String!
    address: EthereumAddress
    chainId: Int!
}

type ContributionAddress {
    id: OID!
    chainId: Int!
    address: EthereumAddress!
    label: String
}

type ExternalLink {
    id: OID!
    label: String!
    url: URL!
}
```

**Initial state:**
```json
{
  "name": "",
  "slug": "",
  "summary": null,
  "incidentDate": null,
  "status": "DRAFT",
  "targetAmount": null,
  "affectedAsset": null,
  "contributionAddresses": [],
  "riskDisclaimer": null,
  "externalLinks": [],
  "contributorRegistryDriveId": null,
  "operatorWallets": []
}
```

**Modules:** single module `management` with all ten operations.

**Operations** (each entry: name | input schema | reducer body | errors):

| Operation | Input schema |
|---|---|
| `SET_CAMPAIGN_DETAILS` | `{ name: String, slug: String, summary: String, incidentDate: DateTime, targetAmount: Amount_Tokens, affectedAsset: AffectedAssetInput, riskDisclaimer: String, contributorRegistryDriveId: PHID }` (root: `SetCampaignDetailsInput`) |
| `ADD_CONTRIBUTION_ADDRESS` | `{ id: OID!, chainId: Int!, address: EthereumAddress!, label: String }` |
| `REMOVE_CONTRIBUTION_ADDRESS` | `{ id: OID! }` |
| `START_CAMPAIGN` | `{ _: Boolean }` (empty-input workaround) |
| `MARK_RESOLVED` | `{ _: Boolean }` |
| `MARK_FAILED` | `{ reason: String }` |
| `ARCHIVE_CAMPAIGN` | `{ _: Boolean }` |
| `ADD_EXTERNAL_LINK` | `{ id: OID!, label: String!, url: URL! }` |
| `ADD_OPERATOR_WALLET` | `{ address: EthereumAddress! }` |
| `REMOVE_OPERATOR_WALLET` | `{ address: EthereumAddress! }` |

`AffectedAssetInput` is the input mirror of `AffectedAsset`:
```graphql
input AffectedAssetInput { symbol: String!, address: EthereumAddress, chainId: Int! }
```

**Errors per operation:**

| Operation | Errors |
|---|---|
| `SET_CAMPAIGN_DETAILS` | (none — all fields optional) |
| `ADD_CONTRIBUTION_ADDRESS` | `DuplicateContributionAddressError` (same address+chainId already exists) |
| `REMOVE_CONTRIBUTION_ADDRESS` | `ContributionAddressNotFoundError` |
| `START_CAMPAIGN` | `InvalidStatusTransitionError` (only DRAFT can become ACTIVE), `MissingContributionAddressError` (need at least one), `MissingCampaignSlugError` |
| `MARK_RESOLVED` | `InvalidStatusTransitionError` |
| `MARK_FAILED` | `InvalidStatusTransitionError` |
| `ARCHIVE_CAMPAIGN` | `InvalidStatusTransitionError` |
| `ADD_EXTERNAL_LINK` | (none) |
| `ADD_OPERATOR_WALLET` | `DuplicateOperatorWalletError` |
| `REMOVE_OPERATOR_WALLET` | `OperatorWalletNotFoundError` |

**Reducer body (set via `SET_OPERATION_REDUCER` and mirrored in `src/reducers/management.ts`):**

```typescript
import type { ReliefCampaignManagementOperations } from "../../gen/management/operations.js";

export const reliefCampaignManagementOperations: ReliefCampaignManagementOperations = {
  setCampaignDetailsOperation(state, action) {
    if (action.input.name) state.name = action.input.name;
    if (action.input.slug) state.slug = action.input.slug;
    if (action.input.summary) state.summary = action.input.summary;
    if (action.input.incidentDate) state.incidentDate = action.input.incidentDate;
    if (action.input.targetAmount) state.targetAmount = action.input.targetAmount;
    if (action.input.affectedAsset) state.affectedAsset = action.input.affectedAsset;
    if (action.input.riskDisclaimer) state.riskDisclaimer = action.input.riskDisclaimer;
    if (action.input.contributorRegistryDriveId) {
      state.contributorRegistryDriveId = action.input.contributorRegistryDriveId;
    }
  },

  addContributionAddressOperation(state, action) {
    const dup = state.contributionAddresses.find(
      (c) =>
        c.address.toLowerCase() === action.input.address.toLowerCase() &&
        c.chainId === action.input.chainId,
    );
    if (dup) throw new DuplicateContributionAddressError("Contribution address already exists for this chain");
    state.contributionAddresses.push({
      id: action.input.id,
      chainId: action.input.chainId,
      address: action.input.address,
      label: action.input.label || null,
    });
  },

  removeContributionAddressOperation(state, action) {
    const idx = state.contributionAddresses.findIndex((c) => c.id === action.input.id);
    if (idx === -1) throw new ContributionAddressNotFoundError("No contribution address with that id");
    state.contributionAddresses.splice(idx, 1);
  },

  startCampaignOperation(state) {
    if (state.status !== "DRAFT") throw new InvalidStatusTransitionError(`Cannot start campaign in status ${state.status}`);
    if (!state.slug) throw new MissingCampaignSlugError("Campaign slug must be set before starting");
    if (state.contributionAddresses.length === 0)
      throw new MissingContributionAddressError("At least one contribution address is required to start a campaign");
    state.status = "ACTIVE";
  },

  markResolvedOperation(state) {
    if (state.status !== "ACTIVE" && state.status !== "EXECUTING")
      throw new InvalidStatusTransitionError(`Cannot resolve a campaign in status ${state.status}`);
    state.status = "RESOLVED";
  },

  markFailedOperation(state, action) {
    if (state.status === "ARCHIVED" || state.status === "RESOLVED")
      throw new InvalidStatusTransitionError(`Cannot mark failed in terminal status ${state.status}`);
    state.status = "FAILED";
    if (action.input.reason) state.summary = `${state.summary ?? ""}\n\nFailed: ${action.input.reason}`.trim();
  },

  archiveCampaignOperation(state) {
    if (state.status !== "RESOLVED" && state.status !== "FAILED")
      throw new InvalidStatusTransitionError(`Cannot archive a campaign in status ${state.status}`);
    state.status = "ARCHIVED";
  },

  addExternalLinkOperation(state, action) {
    state.externalLinks.push({
      id: action.input.id,
      label: action.input.label,
      url: action.input.url,
    });
  },

  addOperatorWalletOperation(state, action) {
    const addr = action.input.address.toLowerCase();
    if (state.operatorWallets.some((a) => a.toLowerCase() === addr))
      throw new DuplicateOperatorWalletError("Operator wallet already authorized");
    state.operatorWallets.push(action.input.address);
  },

  removeOperatorWalletOperation(state, action) {
    const idx = state.operatorWallets.findIndex(
      (a) => a.toLowerCase() === action.input.address.toLowerCase(),
    );
    if (idx === -1) throw new OperatorWalletNotFoundError("Operator wallet not authorized");
    state.operatorWallets.splice(idx, 1);
  },
};
```

> When written into `SET_OPERATION_REDUCER`, only the *body* of each operation is needed (no function header, no imports — they get auto-generated). The mirror file in `src/reducers/management.ts` keeps the imports/structure shown above.

**Reducer tests (`document-models/relief-campaign/tests/management.test.ts`):**

```typescript
import { describe, it, expect } from "vitest";
import { generateId } from "document-model";
import utils from "../gen/utils.js";
import { reducer } from "../gen/reducer.js";
import {
  setCampaignDetails,
  addContributionAddress,
  removeContributionAddress,
  startCampaign,
  markResolved,
  markFailed,
  archiveCampaign,
  addExternalLink,
  addOperatorWallet,
  removeOperatorWallet,
} from "../gen/creators.js";

describe("relief-campaign management reducer", () => {
  it("starts in DRAFT with empty collections", () => {
    const doc = utils.createDocument();
    expect(doc.state.global.status).toBe("DRAFT");
    expect(doc.state.global.contributionAddresses).toEqual([]);
    expect(doc.state.global.operatorWallets).toEqual([]);
  });

  it("sets campaign details", () => {
    const doc = utils.createDocument();
    const next = reducer(
      doc,
      setCampaignDetails({
        name: "rsETH Recovery",
        slug: "rseth-2026-04",
        summary: "Coordinated relief for the rsETH incident",
        targetAmount: "100000",
      }),
    );
    expect(next.state.global.name).toBe("rsETH Recovery");
    expect(next.state.global.slug).toBe("rseth-2026-04");
    expect(next.state.global.targetAmount).toBe("100000");
  });

  it("adds and removes contribution addresses", () => {
    let doc = utils.createDocument();
    const id = generateId();
    doc = reducer(doc, addContributionAddress({ id, chainId: 1, address: "0xabc...", label: "main" }));
    expect(doc.state.global.contributionAddresses).toHaveLength(1);
    doc = reducer(doc, removeContributionAddress({ id }));
    expect(doc.state.global.contributionAddresses).toHaveLength(0);
  });

  it("rejects duplicate contribution address", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, addContributionAddress({ id: generateId(), chainId: 1, address: "0xabc" }));
    doc = reducer(doc, addContributionAddress({ id: generateId(), chainId: 1, address: "0xabc" }));
    expect(doc.operations.global[1].error).toBe("Contribution address already exists for this chain");
    expect(doc.state.global.contributionAddresses).toHaveLength(1);
  });

  it("rejects START_CAMPAIGN without slug or addresses", () => {
    const doc = utils.createDocument();
    const next = reducer(doc, startCampaign({ _: null }));
    expect(next.operations.global[0].error).toBe("Campaign slug must be set before starting");
    expect(next.state.global.status).toBe("DRAFT");
  });

  it("transitions DRAFT → ACTIVE → RESOLVED → ARCHIVED", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, setCampaignDetails({ slug: "x" }));
    doc = reducer(doc, addContributionAddress({ id: generateId(), chainId: 1, address: "0xabc" }));
    doc = reducer(doc, startCampaign({ _: null }));
    expect(doc.state.global.status).toBe("ACTIVE");
    doc = reducer(doc, markResolved({ _: null }));
    expect(doc.state.global.status).toBe("RESOLVED");
    doc = reducer(doc, archiveCampaign({ _: null }));
    expect(doc.state.global.status).toBe("ARCHIVED");
  });

  it("rejects MARK_RESOLVED while DRAFT", () => {
    const doc = utils.createDocument();
    const next = reducer(doc, markResolved({ _: null }));
    expect(next.operations.global[0].error).toContain("Cannot resolve a campaign in status DRAFT");
  });

  it("rejects duplicate operator wallet (case-insensitive)", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, addOperatorWallet({ address: "0xABCDEF" }));
    doc = reducer(doc, addOperatorWallet({ address: "0xabcdef" }));
    expect(doc.operations.global[1].error).toBe("Operator wallet already authorized");
    expect(doc.state.global.operatorWallets).toHaveLength(1);
  });
});
```

**Steps:**

- [ ] **Step 1:** Build the full `addActions` payload for the document model (header + state schema + initial state + module + operations + errors + reducers) following the Reference loop above. Use a single `mcp__reactor-mcp__createDocument` to allocate the doc and a small number of batched `mcp__reactor-mcp__addActions` calls (one per logical group: header, modules, ops-batch-1, ops-batch-2, errors, …).
- [ ] **Step 2:** Confirm the document is published / not in DRAFT state. Codegen will fire and produce `document-models/relief-campaign/`.
- [ ] **Step 3:** Inspect the generated tree under `document-models/relief-campaign/` to confirm `gen/`, `module.ts`, `schema.graphql`, `index.ts` all exist.
- [ ] **Step 4:** Create `document-models/relief-campaign/src/index.ts`:
```typescript
export * from "./reducers/management.js";
```
- [ ] **Step 5:** Create `document-models/relief-campaign/src/reducers/management.ts` with the reducer body above. Errors are referenced by name (no imports required — codegen wires them).
- [ ] **Step 6:** Create `document-models/relief-campaign/tests/management.test.ts` with the tests above.
- [ ] **Step 7:** Run `npm run tsc`. Fix any type errors until clean.
- [ ] **Step 8:** Run `npm run lint:fix`. Fix any lint errors until clean.
- [ ] **Step 9:** Run `npx vitest run document-models/relief-campaign`. Expected: all tests green.
- [ ] **Step 10:** Add Relief Campaign to `document-models/document-models.ts` (codegen normally handles this — verify it did). Update the import list in `document-models/index.ts` if needed.
- [ ] **Step 11:** Commit:
```bash
git add document-models/relief-campaign/ document-models/document-models.ts document-models/index.ts
git -c user.name="Frank" -c user.email="frank@powerhouse.inc" commit -m "feat(relief-campaign): add Relief Campaign document model"
```

### Task 1.2: `defi-united/contributor-profile`

Following the reference loop. **Diffs from 1.1:**

- **State schema:** see spec §4.3. `legalName: String, displayName: String!, kind: ContributorKind!, websiteUrl: URL, twitterHandle: String, farcasterHandle: String, walletAddresses: [ContributorWallet!]!, governanceEndpoints: [GovernanceEndpoint!]!, trustLevel: TrustLevel!`
- **Initial state:** all-empty / defaults: `displayName: ""`, `kind: "DAO"`, `trustLevel: "ANNOUNCED"`, lists empty.
- **Module:** `profile`
- **Operations:** `SET_PROFILE_DETAILS`, `ADD_WALLET`, `REMOVE_WALLET`, `ADD_GOVERNANCE_ENDPOINT`, `REMOVE_GOVERNANCE_ENDPOINT`, `SET_TRUST_LEVEL`
- **Errors:** `DuplicateWalletError` (`ADD_WALLET`), `WalletNotFoundError` (`REMOVE_WALLET`), `DuplicateGovernanceEndpointError`, `GovernanceEndpointNotFoundError`
- **Reducer pattern:** mirrors 1.1 — case-insensitive address comparisons; truthy-checks for optional inputs; error throws by name.
- **Tests:** create / set details / wallet add+remove with duplicate rejection / set trust level / governance endpoint add+remove.

Steps mirror Task 1.1, Steps 1–11. Commit message: `feat(contributor-profile): add Contributor Profile document model`.

### Task 1.3: `defi-united/pledge`

**Diffs from 1.1:**

- **State schema:** see spec §4.2.
- **Module:** `lifecycle`
- **Operations:** `PROPOSE_PLEDGE`, `ATTACH_GOVERNANCE`, `MARK_GOVERNANCE_PENDING`, `MARK_CONFIRMED`, `MARK_RECEIVED`, `CANCEL_PLEDGE`, `FAIL_PLEDGE`, `EDIT_NOTES`
- **Errors:** `PledgeAlreadyConfirmedError`, `ReceivedExceedsPledgedError`, `InvalidStatusTransitionError`, `ContributorProfileNotFoundError` (skip in v1 — we can't dereference cross-drive PHIDs from a pure reducer; we accept any PHID and let the editor / processor handle dereferencing), `GovernanceRequiredForPendingError`
- **Status transitions:** `PROPOSED → GOVERNANCE_PENDING → CONFIRMED → RECEIVED`, `PROPOSED → CONFIRMED` (skip governance), any non-terminal → `CANCELLED` or `FAILED`.
- **Reducer:** state machine via switch on current `status`; on `MARK_RECEIVED`, append `receiptId` to `receiptIds` and accumulate `receivedAmount`. Reject if cumulative receivedAmount would exceed `pledgedAmount` (when amounts are present and the asset matches).

Tests cover: propose with amount + asset, attach governance, transitions, error cases (governance pending without governance attached, marking received twice without exceeding, exceeding raises ReceivedExceedsPledgedError, invalid transitions).

Commit message: `feat(pledge): add Pledge document model`.

### Task 1.4: `defi-united/external-dependency`

**Diffs from 1.1:**

- **State schema:** see spec §4.4.
- **Module:** `tracking`
- **Operations:** `SET_DEPENDENCY_DETAILS`, `UPDATE_STATUS`, `LINK_PLEDGE`, `UNLINK_PLEDGE`, `RESOLVE`, `ABANDON`, `SET_EXTERNAL_REF`
- **Errors:** `DependencyAlreadyResolvedError` (RESOLVE on RESOLVED), `PledgeAlreadyLinkedError`, `PledgeNotLinkedError`, `InvalidStatusTransitionError`
- **Reducer:** straight state assignments; LINK_PLEDGE pushes `blocks` after dedupe.
- **Tests:** create, status updates, link/unlink dedup, resolve transitions.

Commit message: `feat(external-dependency): add External Dependency document model`.

### Task 1.5: `defi-united/onchain-receipt`

**Diffs from 1.1:**

- **State schema:** see spec §4.5.
- **Module:** `reconciliation`
- **Operations:** `RECORD_RECEIPT` (initial), `ATTACH_PLEDGE`, `MARK_AMBIGUOUS`, `OVERRIDE_MATCH`, `CLEAR_MATCH`
- **Errors:** `ReceiptAlreadyRecordedError` (idempotency on chainId+txHash+logIndex — but note the reducer can only check fields stored on this single doc; cross-doc dedupe is enforced at the processor layer; skip the error for v1 reducer), `PledgeIdRequiredError`
- **Reducer:** RECORD_RECEIPT writes all fields; ATTACH_PLEDGE sets `matchedPledgeId` and `reconciliationStatus = "MATCHED"`; OVERRIDE_MATCH sets `MANUALLY_OVERRIDDEN`; CLEAR_MATCH resets to `UNMATCHED`.
- **Tests:** record, attach, override priority, clear.

Commit message: `feat(onchain-receipt): add On-chain Receipt document model`.

### Task 1.6: `defi-united/distribution-plan`

**Diffs from 1.1:**

- **State schema:** see spec §4.6.
- **Module:** `planning`
- **Operations:** `SET_METHODOLOGY`, `ADD_RECIPIENT`, `UPDATE_RECIPIENT`, `REMOVE_RECIPIENT`, `APPROVE_PLAN`, `MARK_RECIPIENT_SENT`, `MARK_RECIPIENT_FAILED`, `MARK_RECIPIENT_REFUNDED`, `COMPLETE_DISTRIBUTION`, `CANCEL_PLAN`, `ADD_APPROVAL_REF`
- **Errors:** `RecipientNotFoundError`, `DuplicateRecipientError` (same address+chainId), `PlanNotApprovedError` (sending before APPROVED), `InvalidStatusTransitionError`
- **Reducer:** APPROVE_PLAN requires DRAFT; MARK_RECIPIENT_* require `APPROVED` or `EXECUTING`; COMPLETE_DISTRIBUTION requires all recipients SENT or REFUNDED.
- **Tests:** add/remove/update recipients, approval gate, completion gate.

Commit message: `feat(distribution-plan): add Distribution Plan document model`.

### Task 1.7: `defi-united/status-update`

**Diffs from 1.1:**

- **State schema:** see spec §4.7.
- **Module:** `publishing`
- **Operations:** `DRAFT_UPDATE` (set title/body/visibility/authorProfileId), `EDIT_UPDATE`, `PUBLISH_UPDATE` (input: `{ publishedAt: DateTime!, metricsSnapshot: MetricsSnapshotInput }`), `ATTACH_ANNOUNCEMENT`, `RETRACT_UPDATE`, `SET_VISIBILITY`
- **Errors:** `UpdateAlreadyPublishedError` (PUBLISH_UPDATE on already-published), `UpdateNotPublishedError` (RETRACT on draft), `MissingTitleOrBodyError` (PUBLISH without both)
- **Reducer:** PUBLISH_UPDATE sets `publishedAt` and stores `metricsSnapshot` from input; RETRACT_UPDATE clears `publishedAt`.
- **Tests:** draft + edit, publish requires title+body, retract behavior.

Commit message: `feat(status-update): add Status Update document model`.

### Task 1.8: Phase 1 quality gate

- [ ] Run `npm run tsc` on the whole package — expect 0 errors.
- [ ] Run `npm run lint:fix` — expect clean.
- [ ] Run `npx vitest run` — all reducer tests green.
- [ ] No commit needed if no fixes; otherwise commit `chore: phase 1 quality gate`.

---

## Phase 2 — Document editors (per-document)

Editor creation pattern:

1. `mcp__reactor-mcp__createDocument` on `VETRA_DRIVE_ID` with type `powerhouse/document-editor`.
2. `mcp__reactor-mcp__addActions` to set: editor name, target document model id, etc. (consult the editor schema captured in Task 0.1 step 3).
3. Confirm/publish — codegen produces `editors/<editor-name>/` containing `editor.tsx`, `module.ts`, hooks.
4. Replace `editor.tsx`'s placeholder body with the real UI (using `useSelected<X>Document` from the generated hook), keeping the boilerplate `<DocumentToolbar />` import.
5. Extract sub-components into `editors/<editor-name>/components/` for clarity.
6. Run `npm run tsc` + `npm run lint:fix`. Commit.

**Editors to build (one per document model):**

### Task 2.1: `relief-campaign-editor`
- Header card: name, slug, status badge, target amount.
- Editable fields: name, slug, summary, target amount, risk disclaimer, contribution addresses table with add/remove, external links, operator wallets table.
- Lifecycle action buttons: `Start campaign`, `Mark resolved`, `Mark failed`, `Archive` — each gated on current status.
- Errors surface inline; status transitions trigger toast feedback.
- Commit: `feat(editors): relief-campaign editor`.

### Task 2.2: `contributor-profile-editor`
- Form fields for legal/display name, kind enum select, websiteUrl, twitterHandle, farcasterHandle, trustLevel.
- Wallet table (chainId, address, label) with add/remove.
- Governance endpoint table.
- Commit: `feat(editors): contributor-profile editor`.

### Task 2.3: `pledge-editor`
- Header: contributor (resolved via `contributorProfileId`), amount, asset.
- Status pill + state-machine transitions as buttons.
- Governance subform (collapsed when not present): platform select, proposalUrl, voteEndDate, quorumStatus.
- Receipts list (read-only, derived from `receiptIds` — placeholder until subgraph delivers).
- Public/internal notes editors with privacy badge.
- Commit: `feat(editors): pledge editor`.

### Task 2.4: `external-dependency-editor`
- Title + description, kind select, status select.
- Linked pledges multiselect (PHIDs entered manually for v1; richer picker is a v2 polish).
- External ref form (url, txHash, proposalId).
- Resolve/Abandon buttons.
- Commit: `feat(editors): external-dependency editor`.

### Task 2.5: `onchain-receipt-editor`
- Mostly read-only — receipts are processor-created.
- Reconciliation status badge.
- "Attach pledge" / "Override match" / "Clear match" buttons.
- Raw log toggle.
- Commit: `feat(editors): onchain-receipt editor`.

### Task 2.6: `distribution-plan-editor`
- Methodology textarea.
- Recipients table with allocation, status, txHash columns; add/remove/update.
- Approval refs list with add.
- Approve / Complete / Cancel buttons gated on status + recipient invariants.
- Commit: `feat(editors): distribution-plan editor`.

### Task 2.7: `status-update-editor`
- Markdown editor for body, title, visibility select, author profile id.
- "Save draft" / "Publish" / "Retract" actions.
- External announcements table.
- Commit: `feat(editors): status-update editor`.

### Task 2.8: Phase 2 quality gate
- `npm run tsc`, `npm run lint:fix`, `npx vitest run`. Commit only if fixes are required.

---

## Phase 3 — Drive editors

Drive editors are document editors targeting `powerhouse/document-drive`. They render the drive view in Connect.

### Task 3.1: `dao-command-center` (drive editor on the central DAO drive)

Create with `apps/driveEditor: "dao-command-center"` configuration in the editor doc.

UI:
- Header strip: DAO name (from drive metadata), aggregate "ETH recovered to date" placeholder (real value plugged in from contributor-registry subgraph during Phase 6).
- Tab 1 — Active campaigns grid: enumerate campaign drives via `useDrives()` filtered by drive name prefix `defi-united-`; per drive, fetch the Relief Campaign doc via `useDocument(driveId, "powerhouse/relief-campaign", id)`. Render card with name, status, target/received bar (received pulled from `campaign-rollup` derived doc once Phase 5 is in place; placeholder "—" until then).
- Tab 2 — Contributors registry: list `Contributor Profile` documents on the DAO drive with search.
- Tab 3 — "Start a campaign" wizard: form (name, slug, summary, incidentDate, targetAmount, contributionAddress) → on submit, calls `addDrive` to create a new campaign drive and dispatches a chain of actions to seed the Relief Campaign document inside it.

Commit: `feat(drive-editors): DAO Command Center`.

### Task 3.2: `campaign-operations` (drive editor on a campaign drive)

UI sections (single page, scrollable / tabbed):
- Header strip with status badge + thermometer (uses `campaign-rollup` doc once available; placeholder until Phase 5).
- Pledge board (kanban): four columns by status; drag dispatches `MARK_GOVERNANCE_PENDING` / `MARK_CONFIRMED` / `MARK_RECEIVED` accordingly.
- Dependency board: simple list/grid; nodes color-coded by status. Resolve / Abandon inline.
- On-chain receipts feed: chronological list, reconciliation status pill, "Attach pledge" inline.
- Distribution panel: read-only summary linking to the Distribution Plan editor.
- Comms timeline: status updates list with publish controls.

Commit: `feat(drive-editors): Campaign Operations`.

### Task 3.3: Editor registration check

Verify `editors/editors.ts` exports both drive editors plus all seven document editors. Codegen normally writes this; if not, add manually:

```typescript
import type { EditorModule } from "document-model";
import { ReliefCampaignEditor } from "./relief-campaign-editor/module.js";
import { ContributorProfileEditor } from "./contributor-profile-editor/module.js";
import { PledgeEditor } from "./pledge-editor/module.js";
import { ExternalDependencyEditor } from "./external-dependency-editor/module.js";
import { OnchainReceiptEditor } from "./onchain-receipt-editor/module.js";
import { DistributionPlanEditor } from "./distribution-plan-editor/module.js";
import { StatusUpdateEditor } from "./status-update-editor/module.js";
import { DaoCommandCenter } from "./dao-command-center/module.js";
import { CampaignOperations } from "./campaign-operations/module.js";

export const editors: EditorModule[] = [
  ReliefCampaignEditor,
  ContributorProfileEditor,
  PledgeEditor,
  ExternalDependencyEditor,
  OnchainReceiptEditor,
  DistributionPlanEditor,
  StatusUpdateEditor,
  DaoCommandCenter,
  CampaignOperations,
];
```

`tsc` / `lint:fix`. Commit `chore: register all editors`.

---

## Phase 4 — Processors

Processors live entirely in source — no MCP scaffolding. Each processor has its own folder with `factory`-style entry, plus tests under `processors/<name>/tests/`.

### Task 4.1: `onchain-receipt-watcher`

**Files:**
- Create: `processors/onchain-receipt-watcher/index.ts` (processor entry)
- Create: `processors/onchain-receipt-watcher/eth-rpc.ts` (small JSON-RPC client)
- Create: `processors/onchain-receipt-watcher/index.test.ts`
- Modify: `processors/factory.ts` (register the processor)

Responsibilities:
- For each Relief Campaign in the system whose `status` is `ACTIVE` or `EXECUTING`, poll each `contributionAddress` (chainId, address) for new transfers.
- v1: only chainId == 1, native ETH transfers + ERC-20 Transfer logs to the watched address. Ignore other chains.
- Confirmations: only act on transfers where `currentBlock - blockNumber >= RECEIPT_CONFIRMATIONS`.
- For each new transfer, dispatch `RECORD_RECEIPT` (via reactor's document service) onto the campaign drive that owns the address.
- Idempotency: keyed on `chainId + txHash + logIndex`. Maintain a small in-memory `Set<string>` per process instance and a defensive check by reading existing receipts before recording.

Steps follow TDD:
- [ ] Write `eth-rpc.ts` with a `getLogs(filter)` and `getBlockNumber()` shape, using `fetch` against `process.env.DEFI_UNITED_RPC_URL_1`. Pure functions; injectable `fetch` for tests.
- [ ] Write tests with a mocked RPC fixture (a JSON file under `processors/onchain-receipt-watcher/__fixtures__/eth-logs.json`).
- [ ] Implement the watcher loop. Persist last-seen block per (driveId, chainId, address) using a small KV (the reactor processor base provides one; if not, use an in-memory map and document the gap).
- [ ] Run tests, then `npm run tsc` + `npm run lint:fix`. Commit: `feat(processors): on-chain receipt watcher`.

### Task 4.2: `pledge-reconciliation`

Triggered when an `OnchainReceipt` document is committed.

- [ ] Read the receipt.
- [ ] Read all Pledges in the same campaign drive.
- [ ] Read Contributor Profiles in the DAO drive (drive id resolved via the campaign's `contributorRegistryDriveId` field).
- [ ] Build a candidate set of pledges where the receipt's `fromAddress` matches any wallet on the linked Contributor Profile, AND status ≠ `RECEIVED`.
- [ ] Apply the matching policy from the spec (single → MATCHED + dispatch `MARK_RECEIVED`; many → AMBIGUOUS; none → UNMATCHED).
- [ ] Tests: synthetic receipts + pledges → assert reconciliation outcomes for single/multi/zero candidates.
- [ ] Commit: `feat(processors): pledge reconciliation`.

### Task 4.3: `campaign-rollup`

Triggered on any state-changing op on a campaign drive doc.

- [ ] Reads Campaign + all Pledges + all Receipts + all Dependencies.
- [ ] Computes derived metrics: `totalPledged`, `totalReceived`, `percentReceived`, `pledgesByStatus`, `dependenciesBlocking`, `dependenciesResolved`, `lastUpdateAt`.
- [ ] Writes/updates a `campaign-metrics` derived record (type to be a small custom doc model OR a processor-managed key/value if the framework supports it — fallback: a JSON record on the campaign drive's local scope).
- [ ] Tests: build a fixture campaign with N pledges/receipts/deps; assert the rollup matches.
- [ ] Commit: `feat(processors): campaign rollup`.

### Task 4.4: Processor wiring

- [ ] Update `processors/factory.ts` to register all three processors with the reactor runtime (follow the existing pattern in `processors/factory.ts`).
- [ ] `npm run tsc`, `npm run lint:fix`, `npx vitest run processors`. Commit `chore: wire processors into factory`.

---

## Phase 5 — Subgraphs

Subgraphs are GraphQL modules exposed via Switchboard. Each is a folder under `subgraphs/`.

### Task 5.1: `public-campaign` (unauthenticated)

Files:
- `subgraphs/public-campaign/index.ts` — module entry
- `subgraphs/public-campaign/schema.graphql` — types
- `subgraphs/public-campaign/resolvers.ts`
- `subgraphs/public-campaign/projections.ts` — pure functions mapping documents → public DTOs (so tests don't need a live reactor)
- `subgraphs/public-campaign/__tests__/projections.test.ts`

GraphQL schema:
```graphql
type Query {
  campaign(slug: String!): PublicCampaign
  campaigns(status: CampaignStatus): [PublicCampaign!]!
}

type Subscription {
  campaignUpdated(slug: String!): PublicCampaign!
  receiptArrived(slug: String!): PublicReceipt!
  statusUpdatePublished(slug: String!): PublicStatusUpdate!
}

type PublicCampaign {
  slug: String!
  name: String!
  summary: String
  status: CampaignStatus!
  targetAmount: String
  totalPledged: String!
  totalReceived: String!
  percentReceived: Float!
  contributionAddresses: [PublicContributionAddress!]!
  contributorsPublic: [PublicContributor!]!
  dependenciesPublic: [PublicDependency!]!
  recentUpdates: [PublicStatusUpdate!]!
  riskDisclaimer: String
  externalLinks: [PublicExternalLink!]!
}

type PublicContributionAddress { chainId: Int!, address: String!, label: String }
type PublicContributor {
  displayName: String!
  trustLevel: TrustLevel!
  websiteUrl: String
  twitterHandle: String
  pledgedAmount: String
  pledgeStatus: PledgeStatus!
}
type PublicDependency { title: String!, kind: DependencyKind!, status: DependencyStatus!, externalRefUrl: String }
type PublicStatusUpdate { id: String!, publishedAt: String!, title: String!, body: String!, externalAnnouncements: [PublicExternalAnnouncement!]! }
type PublicExternalAnnouncement { platform: String!, url: String! }
type PublicReceipt { txHash: String!, fromAddress: String!, amount: String!, asset: String!, blockTimestamp: String!, matchedContributor: String }
type PublicExternalLink { label: String!, url: String! }

enum CampaignStatus { DRAFT ACTIVE EXECUTING RESOLVED FAILED ARCHIVED }
enum PledgeStatus { PROPOSED GOVERNANCE_PENDING CONFIRMED RECEIVED CANCELLED FAILED }
enum DependencyKind { GOVERNANCE_VOTE COUNCIL_ACTION ONCHAIN_TX OPERATIONAL OTHER }
enum DependencyStatus { OPEN IN_PROGRESS RESOLVED BLOCKED ABANDONED }
enum TrustLevel { VERIFIED ANNOUNCED ANONYMOUS }
```

Resolver implementation:
- For `campaign(slug)`: enumerate campaign drives, find the one whose Relief Campaign matches the slug, project into `PublicCampaign` redacting internal notes / PII.
- For subscriptions: forward reactor document-changed events through a filter that only emits when the document type is one of the campaign-scoped models *and* the campaign matches the requested slug.

Tests target `projections.ts` only — no live reactor.

Commit: `feat(subgraphs): public-campaign read API + subscriptions`.

### Task 5.2: `operations` (auth-gated via Renown DID bearer)

Files:
- `subgraphs/operations/index.ts`
- `subgraphs/operations/schema.graphql`
- `subgraphs/operations/auth.ts` — verifies bearer token via `verifyAuthBearerToken` from `@powerhousedao/reactor-api`; resolves caller wallet; checks against the Relief Campaign's `operatorWallets`.
- `subgraphs/operations/resolvers.ts`
- `subgraphs/operations/__tests__/auth.test.ts`

GraphQL surface mirrors the document operations (1:1 mapping):
```graphql
type Mutation {
  proposePledge(slug: String!, contributorProfileId: String!, pledgedAmount: String!, asset: PledgeAssetInput!): String!
  attachGovernance(slug: String!, pledgeId: String!, governance: PledgeGovernanceInput!): Boolean!
  markPledgeConfirmed(slug: String!, pledgeId: String!): Boolean!
  cancelPledge(slug: String!, pledgeId: String!): Boolean!
  addDependency(slug: String!, title: String!, kind: DependencyKind!, description: String): String!
  resolveDependency(slug: String!, dependencyId: String!): Boolean!
  draftStatusUpdate(slug: String!, title: String!, body: String!, visibility: UpdateVisibility!): String!
  publishStatusUpdate(slug: String!, updateId: String!): Boolean!
  attachReceiptToPledge(slug: String!, receiptId: String!, pledgeId: String!): Boolean!
}
```

Auth flow:
- Read `Authorization: Bearer <jwt>` header.
- Verify with `verifyAuthBearerToken` (no `aud` config — same constraint as vetra.to).
- Resolve the caller's wallet address from the verified DID (use `did:ethr` extraction).
- Look up the Relief Campaign by `slug`, ensure caller's address is in `operatorWallets`. Otherwise throw `AuthorizationError`.

Tests: missing header → 401; wrong wallet → 403; right wallet → mutation dispatched (mock reactor service).

Commit: `feat(subgraphs): operations API with Renown DID auth`.

### Task 5.3: `contributor-registry`

Files:
- `subgraphs/contributor-registry/index.ts`
- `subgraphs/contributor-registry/schema.graphql`
- `subgraphs/contributor-registry/resolvers.ts`

Surface:
```graphql
type Query {
  contributors(trustLevel: TrustLevel, kind: ContributorKind): [PublicContributorProfile!]!
  contributor(slug: String!): PublicContributorProfile
}
type PublicContributorProfile {
  slug: String!
  displayName: String!
  kind: ContributorKind!
  websiteUrl: String
  twitterHandle: String
  farcasterHandle: String
  trustLevel: TrustLevel!
  campaignParticipation: [CampaignParticipation!]!
}
type CampaignParticipation { campaignSlug: String!, pledgedAmount: String!, status: PledgeStatus! }
enum ContributorKind { DAO FOUNDATION COMPANY INDIVIDUAL }
```

Resolver: enumerate Contributor Profile docs on the DAO drive; per profile, scan campaign drives for Pledges referencing this profile id.

Tests: against fixture documents.

Commit: `feat(subgraphs): contributor-registry public read API`.

### Task 5.4: Subgraph wiring + quality gate

- [ ] Update `subgraphs/index.ts` to export all three subgraph modules.
- [ ] `npm run tsc`, `npm run lint:fix`, `npx vitest run subgraphs`.
- [ ] Commit `chore: wire subgraphs into package`.

---

## Phase 6 — Demo data

A minimal seeded campaign on the preview drive so the package boots into something demoable.

### Task 6.1: Seed DeFi United campaign

- [ ] Create a new campaign drive `defi-united-rseth-2026-04` via `mcp__reactor-mcp__addDrive`.
- [ ] On that drive, create one Relief Campaign document via `mcp__reactor-mcp__createDocument` and configure it via `addActions` with the real DeFi United numbers (target ~70k ETH, contribution address `0x0fCa5194baA59a362a835031d9C4A25970effE68`, riskDisclaimer copy from defiunited.world).
- [ ] On the DAO drive (or the campaign drive if no DAO drive exists in dev — use the `vetra-{hash}` drive as a substitute), create Contributor Profile documents for: Mantle, Aave DAO, Ether.Fi, Lido, Stani Kulechov, Golem Foundation, Emilio Frangella, BGD Labs, LayerZero, Ethena, Ink Foundation, Frax Finance.
- [ ] Create Pledge documents on the campaign drive matching the website's data: Mantle 30k (GOVERNANCE_PENDING), Aave DAO 25k (GOVERNANCE_PENDING), Ether.Fi 5k (GOVERNANCE_PENDING), Lido 2.5k (GOVERNANCE_PENDING), Stani 5k (CONFIRMED), Golem 1k (CONFIRMED), Emilio Frangella 0.5k (CONFIRMED), BGD Labs 0.35k (CONFIRMED), the rest as PROPOSED.
- [ ] Create three External Dependency documents reflecting the public dependencies (KelpDAO reopens withdrawals, Arbitrum Security Council releases frozen ETH, governance approvals).
- [ ] Create one Distribution Plan document with `methodology: "Pro-rata to verified rsETH holders pre-incident"` and `status: DRAFT`.
- [ ] Create one published Status Update titled "DeFi United launches recovery effort" summarizing the situation.
- [ ] Commit screenshot evidence path / state? — no commit needed (all data lives on the live drive). Just record what was seeded in the next plan task.

---

## Phase 7 — Next.js companion app (`defiunited-web`)

Spawned via subagent.

### Task 7.1: Dispatch the companion-app subagent

Use the Agent tool with subagent_type `general-purpose` (or `feature-dev:code-architect` if available), with the following prompt template:

> **Task:** Scaffold a new Next.js companion app at `../defiunited-web` (sibling of `defi-united-package`) that mirrors `../vetra.to`'s stack and consumes the Switchboard GraphQL endpoint defined by `defi-united-package`. The app must read as a production-grade public-facing site for the DeFi United relief coalition (defiunited.world). Use Next 16 + Turbopack, React 19, Tailwind, shadcn/Radix, Framer Motion, Lottie, graphql-request (queries), graphql-ws (subscriptions), TanStack Query, graphql-codegen targeted at the local Switchboard schema (default `http://localhost:4001/graphql`, env-overridable as `NEXT_PUBLIC_SWITCHBOARD_URL`).
>
> **Routes:**
> - `/` — landing page modeled on defiunited.world: hero with subscription-driven `total raised` counter that pulses on every new receipt, contribution address card with copy + QR, contributors table grouped by status, FAQ + risk disclaimer, "Embed live data" code snippet, "Fork this for your own crisis" footer linking the Vetra registry.
> - `/campaigns/[slug]` — per-campaign deep view: live thermometer, pledge board (read-only), dependency graph, on-chain receipt feed, comms timeline.
> - `/contributors/[slug]` — contributor profile across campaigns.
> - `/api/embed/campaign/[slug]` — embeddable JSON for third-party dashboards.
> - `/admin` — operator-gated mutations via Renown DID; gate using `useRenown()` from `@powerhousedao/reactor-browser`, mint bearer token with `getBearerToken({ expiresIn: 600 })` (do NOT pass `aud` — see `vetra.to/modules/cloud/cloud-auth-bridge.tsx` for the exact pattern). Wire a `<CloudAuthBridge />` near the root.
>
> **Pitch hooks (must implement):**
> 1. Live ticker pulse on every receipt arrival via `Subscription.receiptArrived(slug:)`.
> 2. Per-pledge live governance status — when a pledge has a Snapshot or Tally URL, embed an iframe or fetch the vote state and show "X% quorum, Y days remaining".
> 3. Dependency graph that lights up green as nodes resolve.
> 4. Visible "Live GraphQL" snippet on the landing page showing the public-campaign query.
> 5. "Fork this for your own crisis" CTA in the footer linking https://registry.dev.vetra.io/defi-united-package.
>
> **Stack constraints:**
> - Match `vetra.to/codegen.ts` patterns; generated types into `modules/__generated__/graphql/`.
> - `next.config.ts` should set `output: 'standalone'` and `experimental.externalDir: true`.
> - Tailwind theme should match defiunited.world's neutral/professional palette — light background, near-black text, accent for status pills.
> - Include a Playwright smoke test that loads `/`, asserts the contribution address renders, and asserts a live subscription connects.
>
> **Deliverables:**
> - Working `pnpm dev` (or `npm run dev`) starting the app on `http://localhost:3000`.
> - Codegen wired (`pnpm codegen` against the local Switchboard).
> - At least one round-trip test where seeded campaign data renders.
> - Small incremental commits, NO `Co-Authored-By` trailers. Use `git -c user.name="Frank" -c user.email="frank@powerhouse.inc" commit ...`.
>
> **Reference:** `/home/froid/projects/powerhouse/vetra.to/` is the canonical example of this pattern. Mirror its module layout (`modules/<feature>/...` with co-located `.gql` files) rather than inventing your own.
>
> When done, report: app dir path, list of routes implemented, screenshot of the landing page, list of commits made.

- [ ] Dispatch the subagent.
- [ ] When it returns, do an inline review pass — open each created file, run `pnpm tsc` and the Playwright smoke test in the new app, verify the landing page renders against the live local Switchboard.
- [ ] If review surfaces issues, send a follow-up SendMessage to the same subagent or fix inline.
- [ ] Commit any fixes inside `defi-united-package` (e.g. README pointer to the companion app): `docs: link defiunited-web companion app`.

---

## Phase 8 — Final integration smoke + README

### Task 8.1: Update README

Replace the boilerplate `README.md` with a concise overview:
- What the package is (operational toolkit for coordinated DeFi relief).
- Architecture diagram (drives + editors + processors + subgraphs).
- Document model summary table.
- Link to the spec and plan in `docs/superpowers/`.
- Quick-start: `pnpm install && pnpm vetra` to open Vetra Studio.
- Companion app pointer.

Commit: `docs: rewrite README with package overview`.

### Task 8.2: End-to-end smoke

- [ ] Start `ph vetra` if not already running.
- [ ] Open Connect at `http://localhost:3000`, navigate to the seeded campaign drive.
- [ ] Verify the Campaign Operations drive editor renders with seeded pledges, dependencies, and updates.
- [ ] Open the companion app (`pnpm dev` in `../defiunited-web`); verify the landing page shows the live numbers.
- [ ] Make a manual mutation in Connect (e.g. mark a Pledge confirmed); verify the companion app updates within ~5s via subscription.
- [ ] Record any defects as new follow-up tasks.

### Task 8.3: Final commit + status

- [ ] If everything green: `git -c user.name="Frank" -c user.email="frank@powerhouse.inc" commit --allow-empty -m "release: v0.1.0 ready for review"` (only if there are pending fixes; otherwise skip the empty commit).
- [ ] Print final status: list of commits, open follow-ups, what's tested vs. not.

---

## Notes for the executor

- The reactor-mcp document-model authoring loop is verbose; batch `addActions` aggressively (one big array per logical group rather than one call per action). The MCP API supports it.
- After every `SET_OPERATION_REDUCER`, also write the same body into `src/reducers/<module>.ts` per CLAUDE.md guidance — both must stay in sync.
- After each MCP-driven document model creation, **wait and verify** that the codegen produced the expected files before moving to reducer hand-coding. If files don't appear, the document is probably still DRAFT — confirm/publish it.
- Tests assert `operations[i].error` rather than `.toThrow()` — this is non-negotiable per CLAUDE.md.
- Commit cadence: one commit per task at minimum; split if a task balloons.
- If stuck on a particular MCP call (parameters wrong, document refuses to publish, etc.) — capture the error verbatim, look at how an existing package solved the same case (e.g. `../builder-profile`), and try again. Do not skip.
- If a phase quality gate fails repeatedly on a non-trivial issue, stop and surface it rather than papering over with `--no-verify` or coercion.
