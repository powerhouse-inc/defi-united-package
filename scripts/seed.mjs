#!/usr/bin/env node
/**
 * scripts/seed.mjs
 *
 * Wipes the lower-stakes DeFi United tenant (*.defiunited.w3b.li) and reseeds
 * it from the live demo's public-campaign projection (*.defiunited.web3.berlin).
 *
 * Usage:
 *   node scripts/seed.mjs [--target <url>] [--dry-run]
 *
 * Environment:
 *   SEED_JWT  — override the Bearer token (recommended for production).
 *               Falls back to the hardcoded token below for the MVP demo run.
 *
 * =============================================================================
 * SCHEMA NOTES (discovered by introspection on 2026-04-28)
 * =============================================================================
 *
 * /graphql/r  mutations used:
 *   createEmptyDocument(documentType: String!, parentIdentifier: String): GqlDocument
 *     — use this, NOT createDocument (which requires full reactor-serialised form)
 *   mutateDocument(documentIdentifier: String!, actions: [JSONObject!]!): PHDocument
 *     actions = [{ id, type, scope, timestampUtcMs, input }]
 *     — id and timestampUtcMs are REQUIRED or the reactor's DB write fails with
 *       "invalid input syntax for type timestamp with time zone: 0NaN-NaN-NaN…"
 *   renameDocument(documentIdentifier: String!, name: String!): PHDocument
 *   deleteDocuments(identifiers: [String!]!, propagate: PropagationMode)
 *   addChildren(parentIdentifier: String!, documentIdentifiers: [String!]!)
 *
 * /graphql/r  queries used:
 *   documentChildren(parentIdentifier: String!): PHDocumentResultPage
 *     → { items { id documentType name }, totalCount }
 *
 * Document types (defi-united package):
 *   defi-united/relief-campaign   — actions: SET_CAMPAIGN_DETAILS, START_CAMPAIGN,
 *                                             ADD_CONTRIBUTION_ADDRESS
 *   defi-united/contributor-profile — actions: SET_PROFILE_DETAILS, SET_TRUST_LEVEL
 *   defi-united/pledge            — actions: PROPOSE_PLEDGE, ATTACH_GOVERNANCE,
 *                                             MARK_CONFIRMED, MARK_GOVERNANCE_PENDING
 *   defi-united/external-dependency — actions: SET_DEPENDENCY_DETAILS, UPDATE_STATUS,
 *                                               SET_EXTERNAL_REF
 *   defi-united/status-update     — actions: DRAFT_UPDATE, PUBLISH_UPDATE
 *
 * =============================================================================
 * SECURITY: hard-deny list — never write to these hosts
 * =============================================================================
 */

// ---------------------------------------------------------------------------
// HARD DENY-LIST — checked FIRST before any auth or fetch
// ---------------------------------------------------------------------------
const FORBIDDEN_TARGET_HOSTS = [
  'switchboard.defiunited.web3.berlin',
  'defiunited.web3.berlin',
];

const DEFAULT_TARGET = 'https://switchboard.defiunited.w3b.li/graphql/r';
const SOURCE_ENDPOINT = 'https://switchboard.defiunited.web3.berlin/graphql/defi-united-public-campaign';
const DRIVE_ID = 'df1fba92-7f31-4309-8424-82c97e412d34';

// NOTE: future iterations should read from env var SEED_JWT
// This token expires 2026-07-02. Rotate via Renown before that.
const HARDCODED_JWT =
  'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Nzc5ODk0MzEsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiY2hhaW5JZCI6MSwibmV0d29ya0lkIjoiZWlwMTU1IiwiYWRkcmVzcyI6IjB4MUFEM2Q3MmU1NEZiMGVCNDZlODdGODJmNzdCMjg0RkM4YTY2YjE2QyJ9fSwic3ViIjoiZGlkOmtleTp6RG5hZVFWSnI5YndZYXd5Y3dpVE1MZ01LdHdwRktEdjRXaGlZckFMRzNVRFJiMURBIiwiaXNzIjoiZGlkOmtleTp6RG5hZVFWSnI5YndZYXd5Y3dpVE1MZ01LdHdwRktEdjRXaGlZckFMRzNVRFJiMURBIn0.LECKmhG6iSU2b7KN45AuRQbfvDZgmtyZVG99-ZhCm2qX5B4HvH6QujaMhrhSRnGH0S9mFeaEsgD1H2ujmpcLRg';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const targetFlag = args.indexOf('--target');
const target = targetFlag !== -1 ? args[targetFlag + 1] : DEFAULT_TARGET;
const dryRun = args.includes('--dry-run');

// ---------------------------------------------------------------------------
// SECURITY CHECK — before any auth or network I/O
// ---------------------------------------------------------------------------
{
  let targetHost;
  try {
    targetHost = new URL(target).hostname;
  } catch {
    console.error(`FATAL: Cannot parse target URL: ${target}`);
    process.exit(1);
  }
  for (const forbidden of FORBIDDEN_TARGET_HOSTS) {
    if (targetHost === forbidden || targetHost.endsWith(`.${forbidden}`)) {
      console.error(
        `\nFATAL: Write target "${targetHost}" matches forbidden host "${forbidden}".\n` +
        `The live demo is READ-ONLY. Aborting immediately.\n`,
      );
      process.exit(1);
    }
  }
}

const JWT = process.env.SEED_JWT ?? HARDCODED_JWT;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function gql(endpoint, query, variables = {}, auth = false, retries = 8) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers['Authorization'] = `Bearer ${JWT}`;

  for (let attempt = 0; attempt < retries; attempt++) {
    let res;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
      });
    } catch (networkErr) {
      // Connection-level error (ECONNREFUSED, etc.) — server is restarting
      if (attempt < retries - 1) {
        const wait = Math.min(5000 * (attempt + 1), 30000);
        log(`   [retry ${attempt + 1}/${retries}] network error, waiting ${wait}ms…`);
        await sleep(wait);
        continue;
      }
      throw networkErr;
    }

    if (res.status === 502 || res.status === 503) {
      if (attempt < retries - 1) {
        const wait = Math.min(5000 * (attempt + 1), 30000);
        log(`   [retry ${attempt + 1}/${retries}] HTTP ${res.status}, waiting ${wait}ms…`);
        await sleep(wait);
        continue;
      }
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} from ${endpoint}: ${text.slice(0, 300)}`);
    }

    const json = await res.json();
    if (json.errors?.length) {
      throw new Error(`GraphQL errors: ${JSON.stringify(json.errors.slice(0, 3))}`);
    }
    return json.data;
  }
  throw new Error(`All ${retries} attempts failed for ${endpoint}`);
}

function log(msg) {
  console.log(msg);
}

function die(msg, created = null) {
  console.error(`\nFATAL: ${msg}`);
  if (created) {
    console.error('Partial state — documents created so far:');
    console.error(JSON.stringify(created, null, 2));
  }
  process.exit(1);
}

// Track everything created so we can report on partial failure
const created = { campaigns: [], contributors: [], pledges: [], deps: [], updates: [] };

// ---------------------------------------------------------------------------
// Step 1: Fetch live data (READ-ONLY source)
// ---------------------------------------------------------------------------
log('\n========================================');
log('  DeFi United Seed Script');
log('========================================');
log(`Source: ${SOURCE_ENDPOINT}`);
log(`Target: ${target}  [drive=${DRIVE_ID}]`);
if (dryRun) log('DRY-RUN mode — no writes will be made');
log('');

log('>> Fetching live data from source…');

const SOURCE_QUERY = `{
  DefiUnited_campaign(slug: "rseth-2026-04") {
    slug name summary status incidentDate targetAmount riskDisclaimer
    affectedAsset { symbol address chainId }
    contributionAddresses { chainId address label }
    contributorsPublic {
      contributorDisplayName contributorTrustLevel
      contributorWebsiteUrl contributorTwitter
      pledgedAmount receivedAmount assetSymbol
      status governanceProposalUrl governancePlatform publicNotes
    }
    dependenciesPublic {
      title description kind status
      externalRefUrl externalRefProposalId expectedResolution
    }
    recentUpdates {
      id publishedAt title body
      metricsTotalPledged metricsTotalReceived
      externalAnnouncements { platform url }
    }
  }
}`;

let campaign;
try {
  const srcData = await gql(SOURCE_ENDPOINT, SOURCE_QUERY);
  campaign = srcData.DefiUnited_campaign;
} catch (err) {
  die(`Failed to fetch source data: ${err.message}`);
}

log(`   Campaign: "${campaign.name}" (${campaign.slug})`);
log(`   Contributors: ${campaign.contributorsPublic.length}`);
log(`   Dependencies: ${campaign.dependenciesPublic.length}`);
log(`   Status updates: ${campaign.recentUpdates.length}`);

// ---------------------------------------------------------------------------
// Step 2: List existing docs on target
// ---------------------------------------------------------------------------
log('\n>> Listing existing documents on target drive…');

const LIST_QUERY = `
  query ListChildren($parent: String!) {
    documentChildren(parentIdentifier: $parent) {
      items { id documentType name }
      totalCount
    }
  }
`;

let existingDocs;
try {
  const listData = await gql(target, LIST_QUERY, { parent: DRIVE_ID }, true);
  existingDocs = listData.documentChildren.items;
} catch (err) {
  die(`Failed to list documents: ${err.message}`);
}

log(`   Found ${existingDocs.length} documents to delete`);

// ---------------------------------------------------------------------------
// Preflight banner
// ---------------------------------------------------------------------------
log('\n========================================');
log('  PREFLIGHT SUMMARY');
log('========================================');
log(`  Target host  : ${new URL(target).hostname}`);
log(`  Drive ID     : ${DRIVE_ID}`);
log(`  Will delete  : ${existingDocs.length} existing docs`);
log(`  Will create  :`);
log(`    1 relief-campaign`);
log(`    ${campaign.contributorsPublic.length} contributor-profiles`);
log(`    ${campaign.contributorsPublic.length} pledges`);
log(`    ${campaign.dependenciesPublic.length} external-dependencies`);
log(`    ${campaign.recentUpdates.length} status-updates`);
log(`  Total creates: ${1 + campaign.contributorsPublic.length * 2 + campaign.dependenciesPublic.length + campaign.recentUpdates.length}`);
log('========================================\n');

if (dryRun) {
  log('DRY-RUN: stopping before any writes.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Step 3: Wipe target
// ---------------------------------------------------------------------------
log('>> Wiping existing documents…');

if (existingDocs.length > 0) {
  const DELETE_MUTATION = `
    mutation DeleteDocs($ids: [String!]!) {
      deleteDocuments(identifiers: $ids)
    }
  `;
  try {
    await gql(target, DELETE_MUTATION, { ids: existingDocs.map(d => d.id) }, true);
    log(`   Deleted ${existingDocs.length} documents`);
  } catch (err) {
    die(`Failed to delete documents: ${err.message}`);
  }
} else {
  log('   Nothing to delete');
}

// ---------------------------------------------------------------------------
// Helpers for create + addChildren
// ---------------------------------------------------------------------------

const CREATE_EMPTY_MUTATION = `
  mutation CreateEmptyDoc($documentType: String!, $parent: String) {
    createEmptyDocument(documentType: $documentType, parentIdentifier: $parent) {
      id documentType name
    }
  }
`;

const RENAME_MUTATION = `
  mutation RenameDoc($id: String!, $name: String!) {
    renameDocument(documentIdentifier: $id, name: $name) { id }
  }
`;

const MUTATE_MUTATION = `
  mutation MutateDoc($id: String!, $actions: [JSONObject!]!) {
    mutateDocument(documentIdentifier: $id, actions: $actions) { id }
  }
`;

const ADD_CHILDREN_MUTATION = `
  mutation AddChildren($parent: String!, $ids: [String!]!) {
    addChildren(parentIdentifier: $parent, documentIdentifiers: $ids) { id }
  }
`;

// ---------------------------------------------------------------------------
// Action builder helpers
// ---------------------------------------------------------------------------
// Actions require: id, type, scope, timestampUtcMs (ISO string), input
// Without id + timestampUtcMs the reactor's DB write throws a timestamptz error.
let _actionCounter = 0;
const SEED_TIMESTAMP = new Date().toISOString();

function makeAction(type, input, scope = 'global') {
  _actionCounter++;
  return {
    id: `seed-${_actionCounter.toString().padStart(6, '0')}`,
    type,
    scope,
    timestampUtcMs: SEED_TIMESTAMP,
    input,
  };
}

/**
 * Convert Amount_Tokens from source (string) to schema-expected number.
 * The public-campaign subgraph returns Amount_Tokens as strings; the
 * document model Zod schemas validate them as z.number().
 */
function toNumber(v) {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

async function createDoc(docType, name) {
  const data = await gql(
    target,
    CREATE_EMPTY_MUTATION,
    { documentType: docType, parent: DRIVE_ID },
    true,
  );
  const docId = data.createEmptyDocument.id;
  // Name is set via renameDocument since createEmptyDocument doesn't take a name
  if (name) {
    await gql(target, RENAME_MUTATION, { id: docId, name }, true);
  }
  return docId;
}

async function mutateDoc(id, actions) {
  await gql(target, MUTATE_MUTATION, { id, actions }, true);
}

// ---------------------------------------------------------------------------
// Step 4a: Create relief-campaign
// ---------------------------------------------------------------------------
log('>> Creating relief-campaign…');

let campaignDocId;
try {
  campaignDocId = await createDoc('defi-united/relief-campaign', campaign.name);
  created.campaigns.push(campaignDocId);

  const campaignActions = [
    makeAction('SET_CAMPAIGN_DETAILS', {
      name: campaign.name,
      slug: campaign.slug,
      summary: campaign.summary,
      incidentDate: campaign.incidentDate,
      targetAmount: toNumber(campaign.targetAmount),
      affectedAsset: campaign.affectedAsset
        ? {
            symbol: campaign.affectedAsset.symbol,
            address: campaign.affectedAsset.address ?? null,
            chainId: campaign.affectedAsset.chainId,
          }
        : null,
      riskDisclaimer: campaign.riskDisclaimer,
    }),
  ];

  // Add contribution addresses
  for (let i = 0; i < campaign.contributionAddresses.length; i++) {
    const ca = campaign.contributionAddresses[i];
    campaignActions.push(makeAction('ADD_CONTRIBUTION_ADDRESS', {
      id: `contrib-addr-${i + 1}`,
      chainId: ca.chainId,
      address: ca.address,
      label: ca.label ?? null,
    }));
  }

  // Activate the campaign if it's not DRAFT
  if (campaign.status !== 'DRAFT') {
    campaignActions.push(makeAction('START_CAMPAIGN', { _: null }));
  }

  await mutateDoc(campaignDocId, campaignActions);
  log(`   Created campaign "${campaign.name}" (${campaignDocId})`);
} catch (err) {
  die(`Failed to create campaign: ${err.message}`, created);
}

// ---------------------------------------------------------------------------
// Step 4b: Create contributor-profiles
// ---------------------------------------------------------------------------
log(`\n>> Creating ${campaign.contributorsPublic.length} contributor profiles…`);

// Map from contributor display name → profile doc ID (for pledge references)
const profileIdByName = {};

for (const contributor of campaign.contributorsPublic) {
  try {
    const profileId = await createDoc('defi-united/contributor-profile', contributor.contributorDisplayName);
    created.contributors.push(profileId);

    // Strip leading @ from twitter handle if present
    const twitterHandle = contributor.contributorTwitter
      ? contributor.contributorTwitter.replace(/^@/, '')
      : null;

    await mutateDoc(profileId, [
      makeAction('SET_PROFILE_DETAILS', {
        displayName: contributor.contributorDisplayName,
        websiteUrl: contributor.contributorWebsiteUrl ?? null,
        twitterHandle: twitterHandle ?? null,
      }),
      makeAction('SET_TRUST_LEVEL', {
        trustLevel: contributor.contributorTrustLevel ?? 'ANNOUNCED',
      }),
    ]);

    profileIdByName[contributor.contributorDisplayName] = profileId;
    log(`   ${contributor.contributorDisplayName} → ${profileId}`);
  } catch (err) {
    die(`Failed to create contributor "${contributor.contributorDisplayName}": ${err.message}`, created);
  }
}

// ---------------------------------------------------------------------------
// Step 4c: Create pledges
// ---------------------------------------------------------------------------
log(`\n>> Creating ${campaign.contributorsPublic.length} pledges…`);

for (const contributor of campaign.contributorsPublic) {
  const profileId = profileIdByName[contributor.contributorDisplayName];
  const pledgeName = `${contributor.contributorDisplayName} pledge`;

  try {
    const pledgeId = await createDoc('defi-united/pledge', pledgeName);
    created.pledges.push(pledgeId);

    const actions = [
      makeAction('PROPOSE_PLEDGE', {
        contributorProfileId: profileId,
        pledgedAmount: toNumber(contributor.pledgedAmount) ?? 0,
        asset: {
          symbol: contributor.assetSymbol ?? 'ETH',
          address: null,
          chainId: 1,
        },
        publicNotes: contributor.publicNotes ?? null,
      }),
    ];

    // Attach governance if present
    if (contributor.governanceProposalUrl && contributor.governancePlatform) {
      actions.push(makeAction('ATTACH_GOVERNANCE', {
        platform: contributor.governancePlatform,
        proposalUrl: contributor.governanceProposalUrl,
      }));
    }

    // Advance status
    if (contributor.status === 'GOVERNANCE_PENDING') {
      actions.push(makeAction('MARK_GOVERNANCE_PENDING', { _: null }));
    } else if (
      contributor.status === 'CONFIRMED' ||
      contributor.status === 'RECEIVED'
    ) {
      actions.push(makeAction('MARK_CONFIRMED', { _: null }));
    }

    await mutateDoc(pledgeId, actions);
    log(`   ${pledgeName} (${contributor.status}) → ${pledgeId}`);
  } catch (err) {
    die(`Failed to create pledge for "${contributor.contributorDisplayName}": ${err.message}`, created);
  }
}

// ---------------------------------------------------------------------------
// Step 4d: Create external-dependencies
// ---------------------------------------------------------------------------
log(`\n>> Creating ${campaign.dependenciesPublic.length} external dependencies…`);

// Normalise DependencyKind: live data uses uppercase, schema enums are uppercase — should be fine
// Normalise DependencyStatus: live data uses ABANDONED, RESOLVED, OPEN, etc.
for (const dep of campaign.dependenciesPublic) {
  try {
    const depId = await createDoc('defi-united/external-dependency', dep.title);
    created.deps.push(depId);

    const actions = [
      makeAction('SET_DEPENDENCY_DETAILS', {
        title: dep.title,
        description: dep.description ?? null,
        kind: dep.kind,
        expectedResolution: dep.expectedResolution ?? null,
      }),
    ];

    if (dep.externalRefUrl || dep.externalRefProposalId) {
      actions.push(makeAction('SET_EXTERNAL_REF', {
        url: dep.externalRefUrl ?? null,
        proposalId: dep.externalRefProposalId ?? null,
      }));
    }

    // Advance to correct status
    if (dep.status === 'RESOLVED') {
      actions.push(makeAction('UPDATE_STATUS', { status: 'RESOLVED' }));
    } else if (dep.status === 'ABANDONED') {
      actions.push(makeAction('UPDATE_STATUS', { status: 'ABANDONED' }));
    } else if (dep.status === 'BLOCKED') {
      actions.push(makeAction('UPDATE_STATUS', { status: 'BLOCKED' }));
    } else if (dep.status === 'IN_PROGRESS') {
      actions.push(makeAction('UPDATE_STATUS', { status: 'IN_PROGRESS' }));
    }
    // OPEN is initial state, no action needed

    await mutateDoc(depId, actions);
    log(`   "${dep.title}" (${dep.status}) → ${depId}`);
  } catch (err) {
    die(`Failed to create dependency "${dep.title}": ${err.message}`, created);
  }
}

// ---------------------------------------------------------------------------
// Step 4e: Create status-updates
// ---------------------------------------------------------------------------
log(`\n>> Creating ${campaign.recentUpdates.length} status updates…`);

// AnnouncementPlatform enum values in schema: TWITTER, FARCASTER, MIRROR, BLOG
// Map source platform strings to schema enum values
const PLATFORM_MAP = {
  twitter: 'TWITTER',
  farcaster: 'FARCASTER',
  mirror: 'MIRROR',
  blog: 'BLOG',
  TWITTER: 'TWITTER',
  FARCASTER: 'FARCASTER',
  MIRROR: 'MIRROR',
  BLOG: 'BLOG',
};

for (const update of campaign.recentUpdates) {
  try {
    const updateId = await createDoc('defi-united/status-update', update.title);
    created.updates.push(updateId);

    const actions = [
      makeAction('DRAFT_UPDATE', {
        title: update.title,
        body: update.body,
        visibility: 'PUBLIC',
      }),
    ];

    // Attach external announcements before publishing
    if (update.externalAnnouncements?.length) {
      for (let i = 0; i < update.externalAnnouncements.length; i++) {
        const ann = update.externalAnnouncements[i];
        const platform = PLATFORM_MAP[ann.platform] ?? 'BLOG';
        actions.push(makeAction('ATTACH_ANNOUNCEMENT', {
          id: `ann-${update.id}-${i}`,
          platform,
          url: ann.url,
        }));
      }
    }

    // Publish
    const metricsSnapshot = {
      totalPledged: toNumber(update.metricsTotalPledged),
      totalReceived: toNumber(update.metricsTotalReceived),
    };
    actions.push(makeAction('PUBLISH_UPDATE', {
      publishedAt: update.publishedAt,
      metricsSnapshot,
    }));

    await mutateDoc(updateId, actions);
    log(`   "${update.title}" → ${updateId}`);
  } catch (err) {
    die(`Failed to create status update "${update.title}": ${err.message}`, created);
  }
}

// ---------------------------------------------------------------------------
// Step 5: addChildren — attach all new docs to the drive
// ---------------------------------------------------------------------------
log('\n>> Attaching all new documents as drive children…');

const allNewIds = [
  campaignDocId,
  ...Object.values(profileIdByName),
  ...created.pledges,
  ...created.deps,
  ...created.updates,
];

try {
  await gql(target, ADD_CHILDREN_MUTATION, { parent: DRIVE_ID, ids: allNewIds }, true);
  log(`   Attached ${allNewIds.length} documents to drive ${DRIVE_ID}`);
} catch (err) {
  // addChildren may error if docs were already attached at creation time (parentIdentifier was set)
  // Log a warning but don't abort — the drive already got parentIdentifier on createDocument
  log(`   WARNING: addChildren returned an error (docs may already be attached): ${err.message}`);
}

// ---------------------------------------------------------------------------
// Step 6: Verification
// ---------------------------------------------------------------------------
log('\n>> Verifying via public-campaign projection on target…');

const VERIFY_ENDPOINT = 'https://switchboard.defiunited.w3b.li/graphql/defi-united-public-campaign';

let verifyResult;
try {
  const vData = await gql(VERIFY_ENDPOINT, SOURCE_QUERY);
  verifyResult = vData.DefiUnited_campaign;
} catch (err) {
  log(`   WARNING: Verification query failed: ${err.message}`);
  log('   This may mean the subgraph needs a moment to index — check manually.');
  verifyResult = null;
}

// ---------------------------------------------------------------------------
// Final report
// ---------------------------------------------------------------------------
log('\n========================================');
log('  SEED COMPLETE');
log('========================================');
log(`  Deleted from target : ${existingDocs.length} docs`);
log(`  Created campaigns   : ${created.campaigns.length}`);
log(`  Created contributors: ${created.contributors.length}`);
log(`  Created pledges     : ${created.pledges.length}`);
log(`  Created deps        : ${created.deps.length}`);
log(`  Created updates     : ${created.updates.length}`);
log(`  Total created       : ${created.campaigns.length + created.contributors.length + created.pledges.length + created.deps.length + created.updates.length}`);

if (verifyResult) {
  log('\n  --- Verification (public-campaign subgraph) ---');
  log(`  Campaign name       : ${verifyResult.name}`);
  log(`  Status              : ${verifyResult.status}`);
  log(`  Contributors        : ${verifyResult.contributorsPublic?.length ?? '?'}`);
  log(`  Dependencies        : ${verifyResult.dependenciesPublic?.length ?? '?'}`);
  log(`  Status updates      : ${verifyResult.recentUpdates?.length ?? '?'}`);
  log(`  Latest totalPledged : ${verifyResult.recentUpdates?.[0]?.metricsTotalPledged ?? '?'}`);
} else {
  log('\n  Verification skipped (subgraph not yet indexed or query failed).');
}

log('========================================\n');
