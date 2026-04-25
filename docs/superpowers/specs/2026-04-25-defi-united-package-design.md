# DeFi United — Coordinated DeFi Relief Toolkit

**Spec date:** 2026-04-25
**Repo:** `defi-united-package` (Powerhouse Reactor package)
**Companion app:** `defiunited-web` (Next.js — separate workspace, scaffolded by subagent)
**Status:** Approved for implementation

---

## 1. Purpose

`defi-united-package` is the operational toolkit for a future DeFi United DAO and is designed as a reusable framework for any coordinated DeFi relief / crisis response coalition. DeFi United (responding to the 2026-04-18 rsETH incident) is the first instance.

The toolkit covers the full operational loop: **incident → pledges → external dependencies → on-chain receipts → distribution to affected parties → public communications**.

It is intended as a pitch deliverable to win adoption from Aave DAO, Mantle, Golem Foundation, Lido, and other major contributors to DeFi United, so it must read as production-grade operational software — not a prototype.

## 2. Architecture overview

Hybrid drive layout (chosen during brainstorming):

- **Central DAO drive** — one per DAO instance, hosts the cross-cutting Contributor Profile registry and the DAO-level dashboards. Long-lived.
- **Per-campaign drives** — one per relief effort, named `defi-united-<incident-slug>-<YYYY-MM>`. Spun up at incident time, hold all campaign-scoped documents. Archived when the campaign resolves.

Cross-drive references: a `Pledge` references its `Contributor Profile` via PHID (since profiles live on the DAO drive). All other refs are intra-drive.

```
┌─────────────────────────────────────────────────────────────┐
│  CENTRAL DAO DRIVE                                          │
│  └── DAO Command Center (drive editor)                      │
│      • Contributor Profiles (registry)                      │
│      • Cross-campaign rollup view                           │
│      • Index of active + archived campaigns                 │
└─────────────────────────────────────────────────────────────┘
                            │ PHID refs
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  CAMPAIGN DRIVE (one per relief effort)                     │
│  └── Campaign Operations (drive editor)                     │
│      • 1× Relief Campaign (master)                          │
│      • N× Pledge                                            │
│      • N× External Dependency                               │
│      • N× On-chain Receipt                                  │
│      • 1× Distribution Plan                                 │
│      • N× Status Update                                     │
└─────────────────────────────────────────────────────────────┘
```

## 3. Package layout

```
defi-united-package/
├── document-models/
│   ├── relief-campaign/
│   ├── pledge/
│   ├── contributor-profile/
│   ├── external-dependency/
│   ├── onchain-receipt/
│   ├── distribution-plan/
│   └── status-update/
├── editors/
│   ├── relief-campaign-editor/
│   ├── pledge-editor/
│   ├── contributor-profile-editor/
│   ├── external-dependency-editor/
│   ├── onchain-receipt-editor/
│   ├── distribution-plan-editor/
│   ├── status-update-editor/
│   ├── dao-command-center/      (drive editor — central DAO drive)
│   └── campaign-operations/     (drive editor — per-campaign drive)
├── processors/
│   ├── onchain-receipt-watcher/
│   ├── pledge-reconciliation/
│   └── campaign-rollup/
└── subgraphs/
    ├── public-campaign/
    ├── operations/
    └── contributor-registry/
```

## 4. Document models

All state types follow the `<DocumentModelName>State` naming rule. Operations listed are the primary set; full schemas are produced via `mcp__reactor-mcp__addActions` against each document model.

### 4.1 `defi-united/relief-campaign`

Master document — exactly one per campaign drive.

| Field | Type | Notes |
|---|---|---|
| `name` | `String!` | Human-readable campaign name |
| `slug` | `String!` | URL-safe identifier, used in subgraph queries |
| `summary` | `String` | Short description |
| `incidentDate` | `DateTime` | When the incident occurred |
| `status` | `CampaignStatus!` | enum `DRAFT \| ACTIVE \| EXECUTING \| RESOLVED \| FAILED \| ARCHIVED`, default `DRAFT` |
| `targetAmount` | `Amount_Tokens` | ETH-denominated recovery target |
| `affectedAsset` | `AffectedAsset` | `{ symbol, address, chainId }` — for v1 always rsETH |
| `contributionAddresses` | `[ContributionAddress!]!` | `{ chainId, address, label }` — v1 ships ETH mainnet only, schema multi-chain ready |
| `riskDisclaimer` | `String` | Surfaced verbatim on public app |
| `externalLinks` | `[ExternalLink!]!` | Postmortem, Snapshot pages, etc. |
| `contributorRegistryDriveId` | `PHID` | Link back to DAO drive |
| `operatorWallets` | `[EthereumAddress!]!` | Addresses authorized to write via the operations subgraph |

Key operations: `SET_CAMPAIGN_DETAILS`, `ADD_CONTRIBUTION_ADDRESS`, `REMOVE_CONTRIBUTION_ADDRESS`, `START_CAMPAIGN`, `MARK_RESOLVED`, `MARK_FAILED`, `ARCHIVE_CAMPAIGN`, `ADD_EXTERNAL_LINK`, `ADD_OPERATOR_WALLET`, `REMOVE_OPERATOR_WALLET`.

Errors include: `CampaignAlreadyStartedError`, `InvalidStatusTransitionError`, `MissingContributionAddressError`.

### 4.2 `defi-united/pledge`

| Field | Type | Notes |
|---|---|---|
| `contributorProfileId` | `PHID!` | Cross-drive reference to Contributor Profile on DAO drive |
| `pledgedAmount` | `Amount_Tokens!` | |
| `asset` | `PledgeAsset!` | `{ symbol, address, chainId }` |
| `status` | `PledgeStatus!` | enum `PROPOSED \| GOVERNANCE_PENDING \| CONFIRMED \| RECEIVED \| CANCELLED \| FAILED`, default `PROPOSED` |
| `governance` | `PledgeGovernance` | `{ platform: SNAPSHOT\|TALLY\|FORUM\|OTHER, proposalUrl, voteEndDate, quorumStatus }`, nullable |
| `receivedAmount` | `Amount_Tokens` | Set by reconciliation |
| `receivedAt` | `DateTime` | Set by reconciliation |
| `receiptIds` | `[PHID!]!` | Links to OnchainReceipt docs that fulfilled this pledge |
| `publicNotes` | `String` | Surfaced on public app |
| `internalNotes` | `String` | Operations-only |

Key operations: `PROPOSE_PLEDGE`, `ATTACH_GOVERNANCE`, `MARK_GOVERNANCE_PENDING`, `MARK_CONFIRMED`, `MARK_RECEIVED` (called by reconciliation processor — accepts `receiptId`, `receivedAt`, `amount`), `CANCEL_PLEDGE`, `FAIL_PLEDGE`, `EDIT_NOTES`.

Errors: `PledgeAlreadyConfirmedError`, `ReceivedExceedsPledgedError`, `InvalidStatusTransitionError`, `ContributorProfileNotFoundError`, `GovernanceRequiredForPendingError`.

### 4.3 `defi-united/contributor-profile`

Lives on the DAO drive. Reusable across campaigns.

| Field | Type | Notes |
|---|---|---|
| `legalName` | `String` | |
| `displayName` | `String!` | Public-facing |
| `kind` | `ContributorKind!` | enum `DAO \| FOUNDATION \| COMPANY \| INDIVIDUAL` |
| `websiteUrl` | `URL` | |
| `twitterHandle` | `String` | |
| `farcasterHandle` | `String` | |
| `walletAddresses` | `[ContributorWallet!]!` | `{ chainId, address, label }` — used by reconciliation |
| `governanceEndpoints` | `[GovernanceEndpoint!]!` | `{ platform, url }` |
| `trustLevel` | `TrustLevel!` | enum `VERIFIED \| ANNOUNCED \| ANONYMOUS`, default `ANNOUNCED` |

Key operations: `SET_PROFILE_DETAILS`, `ADD_WALLET`, `REMOVE_WALLET`, `ADD_GOVERNANCE_ENDPOINT`, `REMOVE_GOVERNANCE_ENDPOINT`, `SET_TRUST_LEVEL`.

### 4.4 `defi-united/external-dependency`

| Field | Type | Notes |
|---|---|---|
| `title` | `String!` | |
| `description` | `String` | |
| `kind` | `DependencyKind!` | enum `GOVERNANCE_VOTE \| COUNCIL_ACTION \| ONCHAIN_TX \| OPERATIONAL \| OTHER` |
| `blocks` | `[PHID!]!` | Pledges that depend on this |
| `status` | `DependencyStatus!` | enum `OPEN \| IN_PROGRESS \| RESOLVED \| BLOCKED \| ABANDONED`, default `OPEN` |
| `externalRef` | `DependencyRef` | `{ url, txHash, proposalId }`, nullable |
| `expectedResolution` | `DateTime` | |
| `assignee` | `String` | DID, name, or organization handle |

Key operations: `ADD_DEPENDENCY`, `UPDATE_STATUS`, `LINK_PLEDGE`, `UNLINK_PLEDGE`, `RESOLVE`, `ABANDON`, `SET_EXTERNAL_REF`.

### 4.5 `defi-united/onchain-receipt`

Created by the receipt-watcher processor; can also be created manually.

| Field | Type | Notes |
|---|---|---|
| `chainId` | `Int!` | |
| `txHash` | `String!` | |
| `blockNumber` | `Int!` | |
| `blockTimestamp` | `DateTime!` | |
| `fromAddress` | `EthereumAddress!` | |
| `toAddress` | `EthereumAddress!` | One of the campaign's contribution addresses |
| `asset` | `ReceiptAsset!` | `{ symbol, contractAddress }` — `contractAddress` null for native ETH |
| `amount` | `Amount_Tokens!` | |
| `matchedPledgeId` | `PHID` | Set by reconciliation processor |
| `reconciliationStatus` | `ReconciliationStatus!` | enum `UNMATCHED \| MATCHED \| AMBIGUOUS \| MANUALLY_OVERRIDDEN`, default `UNMATCHED` |
| `rawLog` | `String` | JSON-encoded raw log for forensics |

Key operations: `RECORD_RECEIPT`, `ATTACH_PLEDGE`, `MARK_AMBIGUOUS`, `OVERRIDE_MATCH`, `CLEAR_MATCH`.

Errors: `DuplicateReceiptError` (same chainId+txHash), `PledgeNotFoundError`.

### 4.6 `defi-united/distribution-plan`

Models the recovery payout. Execution itself is **out of v1 scope** (operators sign multisigs manually); the document is the single source of truth for what should be paid out.

| Field | Type | Notes |
|---|---|---|
| `status` | `DistributionStatus!` | enum `DRAFT \| APPROVED \| EXECUTING \| COMPLETED \| CANCELLED`, default `DRAFT` |
| `methodology` | `String` | How recipients are determined (e.g. "pro-rata to pre-incident rsETH holders") |
| `totalAvailable` | `Amount_Tokens` | |
| `recipients` | `[DistributionRecipient!]!` | `{ id: OID!, address, chainId, allocatedAmount, rationale, status: PLANNED\|SENT\|FAILED\|REFUNDED, txHash }` |
| `approvalRefs` | `[ApprovalRef!]!` | `{ url, label }` — links to DAO votes that approved the plan |

Key operations: `SET_METHODOLOGY`, `ADD_RECIPIENT`, `UPDATE_RECIPIENT`, `REMOVE_RECIPIENT`, `APPROVE_PLAN`, `MARK_RECIPIENT_SENT`, `MARK_RECIPIENT_FAILED`, `MARK_RECIPIENT_REFUNDED`, `COMPLETE_DISTRIBUTION`, `CANCEL_PLAN`, `ADD_APPROVAL_REF`.

### 4.7 `defi-united/status-update`

| Field | Type | Notes |
|---|---|---|
| `publishedAt` | `DateTime` | null while draft |
| `visibility` | `UpdateVisibility!` | enum `PUBLIC \| CONTRIBUTORS_ONLY \| INTERNAL`, default `INTERNAL` |
| `authorProfileId` | `PHID` | Contributor Profile of the author |
| `title` | `String!` | |
| `body` | `String!` | Markdown |
| `metricsSnapshot` | `MetricsSnapshot` | `{ totalPledged, totalReceived, dependenciesResolved }` — captured at publish time |
| `externalAnnouncements` | `[ExternalAnnouncement!]!` | `{ platform: TWITTER\|FARCASTER\|MIRROR\|BLOG, url }` |

Key operations: `DRAFT_UPDATE`, `EDIT_UPDATE`, `PUBLISH_UPDATE` (sets `publishedAt`, captures `metricsSnapshot`), `ATTACH_ANNOUNCEMENT`, `RETRACT_UPDATE`, `SET_VISIBILITY`.

## 5. Drive editors

### 5.1 DAO Command Center (central drive)

- **Header strip:** DAO name, count of active campaigns, total ETH-equivalent recovered across history (read from a cross-drive aggregation served by the contributor-registry subgraph).
- **Active campaigns grid:** card per campaign showing target, % received, status, blocking deps count, last update timestamp; click opens the campaign drive.
- **Contributor registry tab:** searchable list of `Contributor Profile` documents; click opens the document editor.
- **Start-new-campaign wizard:** spins up a new campaign drive (`ADD_DRIVE`), seeds a `Relief Campaign` document, and links it back to the DAO drive via `contributorRegistryDriveId`.

### 5.2 Campaign Operations (per-campaign drive)

- **Header strip:** campaign name, status badge, live thermometer (`X ETH / Y target`), pulse animation when receipts arrive (subscription-driven from the operations subgraph).
- **Pledge board:** kanban with columns `PROPOSED → GOVERNANCE_PENDING → CONFIRMED → RECEIVED`. Drag to update; cards show org logo, amount, and live governance vote status (linked Snapshot/Tally embed).
- **Dependency graph:** small DAG visualization of `External Dependency` documents; nodes turn green as resolved.
- **On-chain feed:** live-updating list of receipts with reconciliation status; click to manually re-match (`ATTACH_PLEDGE`, `OVERRIDE_MATCH`).
- **Distribution panel:** recipient list, allocated vs. sent counters, approval refs.
- **Comms timeline:** status updates with publish/draft toggle and "post to Twitter/Farcaster" actions (these set `externalAnnouncements`; actual posting is a manual step in v1).

Both drive editors must include `<DocumentToolbar />` from `@powerhousedao/design-system/connect/index` per project rules.

## 6. Processors

### 6.1 `onchain-receipt-watcher`

- **Trigger:** block polling per chain configured on each campaign's `contributionAddresses`. v1 supports Ethereum mainnet only.
- **Reads:** `Relief Campaign` doc (for the watch addresses); RPC endpoint via processor config.
- **Writes:** creates `OnchainReceipt` documents in the campaign drive when transfers to a watched address are detected.
- **Idempotency:** keyed on `chainId + txHash + logIndex`. Duplicate detection raises `DuplicateReceiptError` and the operation is skipped.
- **Confirmations:** receipts are recorded only after `RECEIPT_CONFIRMATIONS` blocks (default 3).

### 6.2 `pledge-reconciliation`

- **Trigger:** new `OnchainReceipt` document committed.
- **Reads:** all Pledges in the campaign drive; Contributor Profiles in the DAO drive (to resolve `fromAddress` → contributor).
- **Writes:**
  - Sets `OnchainReceipt.matchedPledgeId` and `reconciliationStatus`.
  - On match, dispatches `MARK_RECEIVED` on the Pledge (input includes `receiptId`, `receivedAt`, `amount`).
- **Matching policy:**
  1. `fromAddress` matches a wallet on a Contributor Profile linked to exactly one non-`RECEIVED` Pledge in this campaign → `MATCHED`.
  2. Multiple candidate pledges → `AMBIGUOUS`; receipt waits for manual `ATTACH_PLEDGE`.
  3. No candidate → `UNMATCHED`; retained so a later `ATTACH_PLEDGE` can link it.
- Manual `OVERRIDE_MATCH` always wins and sets `MANUALLY_OVERRIDDEN`.

### 6.3 `campaign-rollup`

- **Trigger:** any state-changing operation on docs in a campaign drive.
- **Reads:** `Relief Campaign`, `Pledge[]`, `OnchainReceipt[]`, `External Dependency[]`.
- **Writes:** maintains a derived `campaign-metrics` record (one per campaign) with fields:
  - `totalPledged`, `totalReceived`, `targetAmount`, `percentReceived`
  - `pledgeCount`, `pledgesByStatus` (breakdown)
  - `dependenciesBlocking`, `dependenciesResolved`
  - `lastUpdateAt`
- This record is the primary read surface for the public-campaign subgraph and the live thermometer/dashboards.

### 6.4 Configuration

Declared in `powerhouse.manifest.json` and surfaced as Vetra environment variables:

| Name | Type | Default | Required |
|---|---|---|---|
| `DEFI_UNITED_RPC_URL_1` | `secret` | — | yes (for receipt-watcher) |
| `BLOCK_POLL_INTERVAL_MS` | `var` | `12000` | no |
| `RECEIPT_CONFIRMATIONS` | `var` | `3` | no |

Multi-chain config (`DEFI_UNITED_RPC_URL_<chainId>`) is schema-ready but only chain `1` is wired in v1.

## 7. Subgraphs

### 7.1 `public-campaign` (unauthenticated)

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
  slug, name, summary, status, targetAmount, totalPledged, totalReceived
  percentReceived, contributionAddresses, contributorsPublic: [PublicContributor!]!
  dependenciesPublic: [PublicDependency!]!
  recentUpdates: [PublicStatusUpdate!]!
  riskDisclaimer
}
```

Returns redacted views — display name, public wallet, public notes only. No internal notes, no PII.

### 7.2 `operations` (auth-gated via Renown DID bearer token)

Full read/write surface for DAO operators: pledge editing, dependency mutations, draft updates, manual reconciliation overrides.

**Auth pattern (mirrors vetra.to):**
- Client calls `renown.getBearerToken({ expiresIn: 600 })` via the `useRenown()` hook from `@powerhousedao/reactor-browser`.
- Token is sent as `Authorization: Bearer <jwt>` header on every request.
- Subgraph resolver verifies via `verifyAuthBearerToken` and authorizes against the Campaign's `operatorWallets` list (added as a field on the Relief Campaign doc — see follow-up below).
- **Critical compatibility note:** do NOT pass `aud` when minting tokens (the switchboard's verifier doesn't configure an expected audience and `did-jwt` rejects tokens with an `aud` claim — captured in `vetra.to/modules/cloud/cloud-auth-bridge.tsx`).

Operator authorization is rooted in the Relief Campaign's `operatorWallets` field (see 4.1).

### 7.3 `contributor-registry` (public read)

Cross-campaign discovery: list verified contributors and their participation history.

```graphql
type Query {
  contributors(trustLevel: TrustLevel, kind: ContributorKind): [PublicContributorProfile!]!
  contributor(slug: String!): PublicContributorProfile
}

type PublicContributorProfile {
  displayName, kind, websiteUrl, twitterHandle, farcasterHandle
  trustLevel
  campaignParticipation: [CampaignParticipation!]!
}
```

## 8. `defiunited-web` Next.js companion app

Spawned via subagent after document models and subgraphs are scaffolded. Mirrors the vetra.to stack.

**Stack:** Next 16 + Turbopack, React 19, Tailwind, shadcn/Radix, Framer Motion, Lottie, `graphql-request` (queries), `graphql-ws` (subscriptions), `@tanstack/react-query`, `graphql-codegen` against the live Switchboard schema.

**Routes:**

- `/` — DeFi United landing page modeled on defiunited.world. Hero with live `total raised` driven by the `campaignUpdated` subscription, contribution address with copy/QR, contributors table with pending/confirmed status, FAQ + risk disclaimer.
- `/campaigns/[slug]` — per-campaign deep view (public): live thermometer, pledge board (read-only), dependency graph, on-chain receipt feed, comms timeline.
- `/contributors/[slug]` — contributor profile across campaigns.
- `/api/embed/campaign/[slug]` — embeddable JSON for third parties consuming the public data.

**Operator surface (auth-gated via Renown):**
- `/admin` (or modal overlay on operator-recognized sessions) — exposes the `operations` subgraph mutations: edit pledges, manage dependencies, draft and publish status updates, manual reconciliation overrides. Uses `useRenown()` + `<RenownProvider />` + `<CloudAuthBridge />` pattern.

**Pitch hooks (these matter for the Aave / Mantle / Golem / Lido pitch):**

1. Live ticker pulse animation on every receipt arrival — Stani sees his 5,000 ETH land on screen.
2. Per-pledge drill-down with embedded live governance vote status.
3. Dependency graph that visibly clears as blockers resolve — answers the "is this actually going to work?" question.
4. "Embed live data" code snippet on the public page showing the public-campaign subgraph query — positions DeFi United as a platform others can build on.
5. "Fork this for your own crisis" footer CTA linking the package on the Vetra registry — positions DeFi United as the template for future relief efforts.

## 9. Testing strategy

- **Reducer unit tests** per document model: happy paths plus each declared error type, asserting `operations[i].error` (per CLAUDE.md guidance — never `.toThrow()`).
- **Processor tests:** mocked RPC client with fixture transfers, asserting the reconciliation matrix (`MATCHED` / `AMBIGUOUS` / `UNMATCHED`) across single, multi, and zero candidate scenarios.
- **Subgraph tests:** snapshot tests of GraphQL responses against fixture documents; auth tests verifying the operations subgraph rejects unauthenticated and unauthorized callers.
- **Next.js app:** Playwright smoke tests for landing render, subscription connection, and operator-mode token bridge.
- **Quality gates after every batch of generated/edited code:** `npm run tsc`, `npm run lint:fix`.

## 10. Out of v1 scope

- Multi-chain receipt watching (schema is ready; only chainId 1 is wired).
- Distribution executor (recipients model exists; on-chain payouts are signed manually by operators).
- Auto-resolution of External Dependencies by polling external sources (Snapshot, Tally, on-chain). Dependencies remain user-curated in v1.
- DAO membership / roles modeling beyond the `operatorWallets` field on Relief Campaign.

## 11. Open follow-ups (acknowledged, not blockers)

- `chainId` is represented as raw `Int!` everywhere for forward compatibility; revisit later if a stable enum becomes useful.
- Long-term: integrate a multisig executor for the distribution plan; this is a v2 effort and explicitly excluded here.

## 12. Build sequence

The implementation plan (produced next via the writing-plans skill) will sequence work in this order:

1. Document models — schemas, reducers, error types, examples (via reactor-mcp).
2. Quality gate — `npm run tsc`, `npm run lint:fix`.
3. Per-document editors.
4. Processors — receipt watcher, reconciliation, campaign rollup.
5. Subgraphs — public-campaign first (powers the public app), then operations, then contributor-registry.
6. Drive editors — DAO Command Center, Campaign Operations.
7. Quality gate.
8. Subagent dispatch: scaffold `defiunited-web` Next.js companion app against the live subgraph schema.
9. Playwright smoke pass on the companion app.

Each step ends with a verification gate before the next begins.
