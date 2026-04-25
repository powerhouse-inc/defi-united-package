# DeFi United — Coordinated Relief Toolkit

Operational toolkit for coordinated DeFi relief / crisis response coalitions, built as a [Powerhouse](https://powerhouse.inc) Reactor package.

The first instance is **DeFi United** ([defiunited.world](https://defiunited.world/)), the relief effort responding to the April 2026 rsETH incident — but the document models, editors, processors, and subgraphs are designed to support any future incident-response coalition.

## What's in the package

### Document models

Seven first-class document types covering the full operational loop from incident → pledges → external dependencies → on-chain receipts → distribution → public communications.

| Model | What it represents |
|---|---|
| `defi-united/relief-campaign` | Master document per relief effort. Target, status, contribution addresses, operator wallets. |
| `defi-united/pledge` | A contributor's commitment, with full lifecycle: `PROPOSED → GOVERNANCE_PENDING → CONFIRMED → RECEIVED`. Tracks governance proposal links and on-chain receipt fulfillment. |
| `defi-united/contributor-profile` | Reusable profile for an org / individual that contributes across campaigns. Wallet registry + governance endpoints + trust level. |
| `defi-united/external-dependency` | Third-party action that blocks settlement (governance vote, council action, on-chain tx). Linked to the pledges it blocks. |
| `defi-united/onchain-receipt` | An inbound transfer to a contribution address, reconciled against pledges by sender wallet. |
| `defi-united/distribution-plan` | Recovery payout plan: methodology, recipients, allocations, on-chain settlement status. |
| `defi-united/status-update` | Public or operator-only updates with metrics snapshot and external announcement links. |

All seven follow the strict reducer rules (pure, deterministic, named errors, error storage in `operations[i].error`). 100+ behaviour tests cover happy paths, state-machine transitions, and every named error.

### Drives

Hybrid layout:

- **DAO drive** — long-lived, holds the cross-campaign Contributor Profile registry.
- **Per-campaign drive** — spun up at incident time (e.g. `defi-united-rseth-2026-04`), holds the Relief Campaign + Pledges + Dependencies + Receipts + Distribution Plan + Status Updates for that effort.

A campaign drive can be archived once its work is done without disturbing the DAO drive or other ongoing campaigns.

### Subgraphs (GraphQL exposed via Switchboard)

| Name | Auth | Purpose |
|---|---|---|
| `defi-united-public-campaign` | None (public read) | `DefiUnited_campaign(slug)` and `DefiUnited_campaigns(status)` — redacted public view: totals, contributors (display name + amount + status), dependencies, recent published updates. Suitable for embedding on `defiunited.world` or third-party dashboards. |
| `defi-united-contributor-registry` | None (public read) | `DefiUnited_contributors(...)` — cross-campaign discovery; per-contributor history of which campaigns they participated in. |
| `defi-united-operations` | Renown DID bearer token | Operator mutations: `markPledgeConfirmed`, `cancelPledge`, `resolveDependency`, `publishStatusUpdate`, `attachReceiptToPledge`. Caller's wallet (recovered from the JWT) must be in the campaign's `operatorWallets` list. |

Auth pattern mirrors `vetra.to`: client mints `renown.getBearerToken({ expiresIn: 600 })` and sends `Authorization: Bearer <jwt>`. **Do not pass `aud`** when minting — the verifier rejects tokens with an unconfigured audience.

### Companion app

A separate Next.js app at `../defiunited-web` provides the public-facing dashboard modeled on the defiunited.world page, driven entirely by these subgraphs.

## Quick start

```bash
pnpm install
pnpm vetra              # opens Vetra Studio (Connect on 3001, Switchboard on 4001)
```

Then point your browser at [http://localhost:3001](http://localhost:3001) and explore the seeded campaign drive `defi-united-rseth-2026-04`.

Verify the public subgraph is live:

```bash
curl -s http://localhost:4001/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ DefiUnited_campaign(slug: \"rseth-2026-04\") { name totalPledged totalReceived percentReceived contributorsPublic { contributorDisplayName pledgedAmount status } } }"}'
```

## Quality gates

```bash
pnpm tsc                # typescript check (clean)
pnpm lint:fix           # eslint
pnpm test               # vitest run (100+ tests across reducers + projections)
```

## Design references

- Spec: [`docs/superpowers/specs/2026-04-25-defi-united-package-design.md`](docs/superpowers/specs/2026-04-25-defi-united-package-design.md)
- Plan: [`docs/superpowers/plans/2026-04-25-defi-united-package.md`](docs/superpowers/plans/2026-04-25-defi-united-package.md)
- Companion app reference: `../vetra.to/`

## Status

v1 ships the document models, subgraphs, demo data, and companion app. Out of v1: live on-chain receipt-watcher (the schema is multi-chain ready; ETH mainnet is the only chain wired in), automated dependency monitoring, and on-chain distribution executor.

## License

AGPL-3.0-only.
