# Architecture & concepts

This guide is for engineers who are **new to Powerhouse**. It explains the building blocks (document models, editors, processors, subgraphs) using `defi-united-package` as the running example, then walks through the data flow from a contributor sending ETH to the dashboard counter ticking.

If you already work on Powerhouse, skip to [Document models](#document-models) — the rest is concept ramp.

---

## TL;DR — what's Powerhouse, in one minute

**Powerhouse** is an open framework for building operations software for DAOs and on-chain organizations. Instead of a traditional backend (REST API + Postgres + UI), you describe your operational artifacts as **document models**, register **editors** (React components) that operators use to manipulate them, and optionally add **processors** (background jobs that produce/consume documents) and **subgraphs** (custom GraphQL views over the documents). The whole thing runs inside a **Reactor** — the engine that loads packages and sync documents across nodes.

Three runtime hosts you'll see referenced:

| | What it is | What it runs |
|---|---|---|
| **Switchboard** | The server-side host. A Node service. | Document storage, your processors, your subgraphs — exposed as GraphQL on `/graphql/<subgraph-name>`. |
| **Connect** | The default web client / operator UI. | Loads document models + editors from the package. Operators use it to drive workflows. |
| **Vetra** | Local dev environment that bundles a Switchboard + a Connect. | One command (`pnpm vetra`) for an end-to-end local stack. |

A **package** (this repo) is the deployable unit. It bundles document models, editors, processors, and subgraphs together. Packages are published to a Powerhouse registry; tenants load them via `PH_REGISTRY_PACKAGES=name@version`.

```
┌─────────────────────────────────────────┐    ┌─────────────────┐
│ Package: defi-united-package@1.1.6      │    │ Registry        │
│   document-models/  ⟶  state + ops      │ ─► │ registry.dev.   │
│   editors/          ⟶  React UIs        │    │ vetra.io        │
│   processors/       ⟶  background jobs  │    └────────┬────────┘
│   subgraphs/        ⟶  GraphQL views    │             │
└─────────────────────────────────────────┘             │
                                                        │ load by name@version
                                                        ▼
┌──────────────────────────────────────────────────────────────────┐
│ Switchboard tenant                                               │
│   Loads document models   ⟶  understands the OnchainReceipt etc. │
│   Loads subgraphs         ⟶  exposes /graphql/defi-united-public │
│   Loads processors        ⟶  runs the receipt watcher            │
│   Document drives         ⟶  per-tenant working state            │
└──────────────────────────────────────────────────────────────────┘
                                                        ▲
                                                        │
                                              Connect (operators)
                                              Frontend (public)
```

---

## Document models

A document model is the schema + reducer for one type of document. Think of it as a tiny git repo for state: every change is an immutable operation, the current state is the fold of all operations, and you can replay history.

A document model defines:

1. **State schema** — the shape of the document's state (GraphQL SDL)
2. **Operations** — the allowed mutations (each with an input schema, a reducer, and named errors)
3. **Errors** — typed failure conditions

Here's `defi-united/onchain-receipt` as an example:

```graphql
type OnchainReceiptState {
  chainId: Int
  txHash: String
  blockNumber: Int
  blockTimestamp: DateTime
  fromAddress: EthereumAddress
  toAddress: EthereumAddress
  asset: ReceiptAsset
  amount: Amount_Tokens
  ethEquivalentAmount: Amount_Tokens
  ethPriceUsdAtReceipt: Float
  matchedPledgeId: PHID
  reconciliationStatus: ReconciliationStatus!
  rawLog: String
}

enum ReconciliationStatus {
  UNMATCHED  MATCHED  AMBIGUOUS  MANUALLY_OVERRIDDEN  REORGED
}
```

Operations on this model:

| Operation | What it does |
|---|---|
| `RECORD_RECEIPT` | First time it's called: copies tx data + ETH-equivalent into state. Throws `ReceiptAlreadyRecordedError` if called twice on the same document. |
| `ATTACH_PLEDGE` | Sets `matchedPledgeId` and `reconciliationStatus = MATCHED`. |
| `MARK_AMBIGUOUS` | Multiple candidate pledges; needs operator review. |
| `OVERRIDE_MATCH` | Operator manually attaches the receipt to a specific pledge. |
| `CLEAR_MATCH` | Reset to UNMATCHED. |
| `MARK_REORGED` | The block reorged out; total computations should exclude this receipt. |

### Reducers are pure

A reducer is a synchronous, deterministic function `(state, action) → void` that mutates the state in-place (Mutative wraps it so you get immutability for free). **No `Date.now()`, no `Math.random()`, no I/O** — anything dynamic must come from the action input. This is what makes documents replayable.

The reducer for `RECORD_RECEIPT` (slightly trimmed):

```ts
recordReceiptOperation(state, action) {
  if (state.txHash) throw new ReceiptAlreadyRecordedError("already recorded");
  state.chainId = action.input.chainId;
  state.txHash = action.input.txHash;
  // ...
  state.amount = action.input.amount;
  state.ethEquivalentAmount = action.input.ethEquivalentAmount;
  state.ethPriceUsdAtReceipt = action.input.ethPriceUsdAtReceipt;
}
```

If a reducer throws, the operation is **still appended** to the document — but with `operation.error` set to the error message. State is not mutated. This gives you a complete audit trail including failed attempts.

### Why this matters

Document models give you four things for free:

1. **Audit trail** — every state change is an immutable operation, in order.
2. **Replayability** — the package can be redeployed and the same operations produce the same state.
3. **Conflict-free sync** — drives sync between nodes via append-only operation logs.
4. **A typed reducer surface** — the schema is the API contract; you can't bypass it.

This package's seven document models cover the full operational loop:

| Model | Lifecycle |
|---|---|
| `relief-campaign` | `DRAFT → ACTIVE → EXECUTING → RESOLVED` (or `FAILED` / `ARCHIVED`) |
| `pledge` | `PROPOSED → GOVERNANCE_PENDING → CONFIRMED → RECEIVED` (or `CANCELLED` / `FAILED`) |
| `onchain-receipt` | `UNMATCHED → MATCHED` (or `AMBIGUOUS`, `MANUALLY_OVERRIDDEN`, `REORGED`) |
| `external-dependency` | `OPEN → IN_PROGRESS → RESOLVED` (or `BLOCKED`, `ABANDONED`) |
| `distribution-plan` | `DRAFT → APPROVED → EXECUTING → SETTLED` |
| `status-update` | `DRAFT → PUBLISHED` |
| `contributor-profile` | Long-lived; rarely state-machine driven |

---

## Drives

A **drive** is a folder of documents. It's itself a document of type `powerhouse/document-drive`, so the same operations + audit-trail model applies recursively.

This package uses a hybrid layout:

- **DAO drive** (long-lived) — holds `contributor-profile` documents, shared across campaigns
- **Per-campaign drive** (e.g. `defi-united-rseth-2026-04`) — holds the `relief-campaign` + `pledge`s + `onchain-receipt`s + `external-dependency`s + `distribution-plan` + `status-update`s for that effort

When the rsETH effort wraps, the campaign drive can be archived without disturbing the DAO drive or any future incident.

---

## Editors

An **editor** is a React component that operates on one or more documents. Connect (the operator UI) loads them from the package and renders one when an operator opens a document.

Two flavors in this package:

### Per-model editors

Each document type has a single-document editor at `editors/<name>-editor/`. They use auto-generated hooks (`useSelectedPledgeDocument`, etc.) that handle dispatching actions back into the reactor:

```tsx
import { useSelectedPledgeDocument } from "../hooks/usePledgeDocument.js";
import { markConfirmed } from "../../document-models/pledge/v1/gen/creators.js";

export default function PledgeEditor() {
  const [document, dispatch] = useSelectedPledgeDocument();

  return (
    <button onClick={() => dispatch(markConfirmed({ _: null }))}>
      Mark confirmed
    </button>
  );
}
```

The hook is generated by codegen; the action creator is generated from the operation schema. Your code is just UI + business calls.

### `campaign-operations` drive editor

A higher-level editor that operates at the **drive** level rather than a single document. It renders a Kanban-style lifecycle dashboard with sections for setup, pledges, dependencies, comms, and distribution. Lets the operator drive the whole campaign without bouncing between document tabs.

---

## Processors

A **processor** is a server-side background job, hosted inside Switchboard. It's the right place to put anything async, side-effecting, or scheduled — things that don't fit a synchronous reducer.

Processors:

- subscribe to operations on documents matching a filter
- can call external services (RPCs, HTTP, etc.)
- dispatch new actions back into the reactor (which become operations on existing or new documents)

`onchain-receipt-watcher` is the only processor in this package. It watches campaigns, polls Alchemy, and dispatches `RECORD_RECEIPT` actions when new transfers land.

```
                     Operations on relief-campaign
                       ┌─────────────────────────┐
       ┌──────────────►│   onOperations(...)     │
       │               │   - cache campaign      │
       │               │   - ensure poll loop    │
       │               └─────────────────────────┘
       │                          │
       │                          ▼
       │              setInterval (12s default)
       │                          │
       │              ┌───────────▼─────────────┐
       │              │ alchemy_getAssetTransfers│
       │              │ Chainlink ETH/USD       │
       │              └───────────┬─────────────┘
       │                          │ for each new transfer:
       │                          ▼
       │              compute ethEquivalent at block
       │                          │
       │                          ▼
       │              recordReceipt(input) ─► dispatch ─┐
       │                                                │
       └────────────────── new operation ◄──────────────┘
```

Key design choices:

- **Single Alchemy URL for everything.** `alchemy_getAssetTransfers` covers both native ETH and ERC-20 transfers in one call. `eth_call` reads the Chainlink ETH/USD feed for the price oracle. Same RPC for `eth_getBalance` / `balanceOf` in the live-balance overlay.
- **6-confirmation depth** before recording, so reorgs are extremely rare. If one happens, an operator runs `MARK_REORGED` via Connect and the totals self-heal.
- **Idempotency keyed by `(chainId, txHash, uniqueId)`** kept in an in-memory `Set`. Cold-start seeds the set from existing receipts on the drive.
- **Pricing is pinned at receipt time.** The reducer stores `ethEquivalentAmount` and `ethPriceUsdAtReceipt`. Future price-feed changes don't re-price history — the audit trail is stable.

Reducers can't make RPC calls (they must be deterministic). Processors are how you bridge the deterministic doc world to non-deterministic external state.

---

## Subgraphs

A **subgraph** is a typed GraphQL view over the documents. It's how the outside world reads data — the API contract for clients, dashboards, embeds.

Each subgraph is a class extending `BaseSubgraph` with a `name`, `typeDefs` (SDL), `resolvers`, and optional pubsub for subscriptions. Switchboard mounts each at `/graphql/<name>`.

This package ships three:

| Endpoint | Auth | Used by |
|---|---|---|
| `/graphql/defi-united-public-campaign` | None | The public dashboard. Headline numbers, contributor list, dependencies, status updates, recent on-chain transfers. |
| `/graphql/defi-united-contributor-registry` | None | Cross-campaign discovery: a contributor's history of participations. |
| `/graphql/defi-united-operations` | Renown DID bearer | Operator-only mutations. |

Subgraphs aren't auto-generated from documents. They're hand-written so you can shape, redact, denormalize, and merge in non-document data. The `public-campaign` subgraph is the most interesting because it does all four:

- **Shape** — projects raw `Pledge` documents into a `DefiUnited_PublicPledge` type optimized for the dashboard
- **Redact** — anonymous contributors are surfaced as "Anonymous Contributor" with no website / Twitter
- **Denormalize** — joins pledges with their contributor profile in one round-trip
- **Merge non-document data** — `onchainLiveBalance` reads from Alchemy directly; `recentOnchainTransfers` calls `alchemy_getAssetTransfers`; sender ENS names come from the Universal Resolver

This is why `totalReceived` can be document-derived (the audit trail) while the UI still shows the actual on-chain treasury balance: the subgraph layers the live overlay on top.

---

## End-to-end data flow

Putting it all together — what happens when a contributor sends 5 ETH to the campaign treasury?

```
 t=0   contributor signs and broadcasts a tx to 0x0fCa…effE68
       │
       │ ~12s later: tx mines into block N
       │
 t≈5s  Frontend's next 5s poll hits /graphql/defi-united-public-campaign
       │
       │ resolver: fetchLiveBalance(...) → eth_call balanceOf
       │           sees treasury balance jumped by 5 ETH
       │           returns onchainLiveBalance.totalEthEquivalent += 5
       │
       │ pendingReceiptsEthEquivalent = max(0, live - totalReceived)
       │           = +5 ETH
       │
       │ frontend hero: AnimatedNumber tweens from T → T + 5
       │ small "+5.00 ETH inbound" pill appears
       │
 t≈72s block N+6 — tx is now confirmation-deep enough
       │
       │ onchain-receipt-watcher's poll cycle picks it up
       │ alchemy_getAssetTransfers returns the transfer
       │ resolves Chainlink price at block N (cached 60s)
       │ computes ethEquivalentAmount = 5 (ETH = 5 ETH)
       │ dispatches RECORD_RECEIPT to a new OnchainReceipt document
       │
       │ reducer runs synchronously; operation appended; state mutated
       │
 t≈77s next frontend poll
       │
       │ public-campaign re-projects:
       │   totalReceived = T + 5 (now includes the receipt)
       │   pendingReceiptsEthEquivalent = max(0, 537 - 537) = 0
       │   recentReceipts now has the new entry
       │
       │ frontend: same headline number (no animation), pending pill fades
       │           live ticker grows by one row with the tx hash + ENS
       │           name + Etherscan link
```

The headline counter ticks **immediately** because the live-balance overlay sees the chain in real time. The audit trail catches up ~70s later. The user-visible experience is "instant + verifiable" — the UI never lies about what's actually on-chain, but it doesn't make the user wait for confirmation depth either.

---

## Where things live

```
defi-united-package/
├── document-models/         ← state schema + reducers + tests per type
│   └── onchain-receipt/
│       ├── onchain-receipt.json   (the model definition)
│       ├── v1/
│       │   ├── schema.graphql     (state SDL)
│       │   ├── gen/               (codegen output — DO NOT EDIT)
│       │   ├── src/reducers/      (your reducer code)
│       │   └── tests/             (vitest)
│       └── upgrades/              (versioned migrations)
│
├── editors/                 ← React components per document type + drive
│   ├── pledge-editor/
│   ├── relief-campaign-editor/
│   └── campaign-operations/       (drive-level lifecycle dashboard)
│
├── processors/              ← server-side background jobs
│   └── onchain-receipt-watcher/
│       ├── index.ts               (poll loop + dispatch)
│       └── eth-rpc.ts             (Alchemy / Chainlink helpers)
│
└── subgraphs/               ← custom GraphQL views
    ├── public-campaign/
    │   ├── schema.ts              (type defs)
    │   ├── resolvers.ts
    │   ├── projections.ts         (doc → public type mappers)
    │   ├── onchain-overlay.ts     (live Alchemy reads + caching)
    │   └── ens.ts                 (reverse ENS via Universal Resolver)
    ├── contributor-registry/
    └── operations/                (Renown-gated mutations)
```

---

## Further reading

- [Powerhouse docs](https://docs.powerhouse.io/) — official framework docs
- [Renown auth pattern](https://docs.powerhouse.io/renown) — how the operations subgraph authenticates
- [Vetra Studio guide](https://docs.powerhouse.io/vetra) — local dev environment
- [`../defiunited-web`](../../defiunited-web) — the public-facing companion frontend
