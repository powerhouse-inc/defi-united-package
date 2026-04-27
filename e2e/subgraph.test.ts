/**
 * E2E tests for the public-campaign subgraph against Switchboard.
 *
 * These tests verify that the GraphQL queries return correct data
 * when run against a live Switchboard instance. They are skipped
 * by default and should be run with `VETRA_SWITCHBOARD_URL` set
 * to the Switchboard GraphQL endpoint.
 *
 * Run: VETRA_SWITCHBOARD_URL=http://localhost:4001/graphql npm test -- e2e
 */

import { describe, it, expect, beforeAll } from "vitest";

const SWITCHBOARD_URL =
  process.env.VETRA_SWITCHBOARD_URL ||
  "http://localhost:4001/graphql/defi-united-public-campaign";

async function graphqlQuery(
  query: string,
  variables?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await fetch(SWITCHBOARD_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const body = (await response.json()) as Record<string, unknown>;

  if (body.errors && Array.isArray(body.errors) && body.errors.length > 0) {
    throw new Error(`GraphQL error: ${JSON.stringify(body.errors[0])}`);
  }

  return (body.data || {}) as Record<string, unknown>;
}

const CAMPAIGN_QUERY = `
  query Campaign($slug: String!) {
    DefiUnited_campaign(slug: $slug) {
      slug
      name
      status
      totalPledged
      totalReceived
      percentReceived
      pledgeCount
      dependenciesBlocking
      dependenciesResolved
      contributionAddresses {
        chainId
        address
        label
      }
      contributorsPublic {
        contributorDisplayName
        pledgedAmount
        status
      }
      dependenciesPublic {
        title
        status
        kind
      }
      recentUpdates {
        id
        title
        publishedAt
      }
      affectedAsset {
        symbol
        chainId
      }
    }
  }
`;

const CAMPAIGNS_QUERY = `
  query Campaigns($status: DefiUnited_CampaignStatus) {
    DefiUnited_campaigns(status: $status) {
      slug
      name
      status
      totalPledged
      totalReceived
      pledgeCount
    }
  }
`;

describe("public-campaign subgraph e2e", () => {
  let isConnected = true;

  beforeAll(() => {
    // Check if the Switchboard URL is reachable
    if (!process.env.VETRA_SWITCHBOARD_URL) {
      console.log(
        "Skipping e2e tests: set VETRA_SWITCHBOARD_URL to run against Switchboard",
      );
      isConnected = false;
    }
  });

  it("should connect to Switchboard", async () => {
    if (!isConnected) return;

    try {
      const result = await graphqlQuery(`
        query {
          __typename
        }
      `);
      expect(result).toBeDefined();
    } catch {
      isConnected = false;
      console.log("Switchboard not reachable, remaining tests will be skipped");
    }
  });

  it("should return null for non-existent campaign slug", async () => {
    if (!isConnected) return;

    const data = await graphqlQuery(CAMPAIGN_QUERY, {
      slug: "non-existent-campaign-slug",
    });

    expect(data.DefiUnited_campaign).toBeNull();
  });

  it("should return an empty array for campaigns query with no data", async () => {
    if (!isConnected) return;

    const data = await graphqlQuery(CAMPAIGNS_QUERY, { status: "ACTIVE" });

    expect(Array.isArray(data.DefiUnited_campaigns)).toBe(true);
  });

  it("should return campaign data for existing campaigns", async () => {
    if (!isConnected) return;

    const data = await graphqlQuery(CAMPAIGNS_QUERY);

    const campaigns = data.DefiUnited_campaigns as Array<
      Record<string, unknown>
    >;

    if (campaigns.length === 0) {
      console.log(
        "No campaigns found — skipping detailed assertions. Load demo data first.",
      );
      return;
    }

    for (const campaign of campaigns) {
      expect(campaign).toHaveProperty("slug");
      expect(campaign).toHaveProperty("name");
      expect(campaign).toHaveProperty("status");
      expect(campaign).toHaveProperty("totalPledged");
      expect(campaign).toHaveProperty("totalReceived");
      expect(campaign).toHaveProperty("percentReceived");
      expect(campaign).toHaveProperty("pledgeCount");
      expect(typeof campaign.pledgeCount).toBe("number");
      expect((campaign.percentReceived as number) >= 0).toBe(true);
    }

    // Verify the single-campaign query works for each returned campaign
    for (const campaign of campaigns) {
      const slug = campaign.slug as string;
      const singleData = await graphqlQuery(CAMPAIGN_QUERY, { slug });
      const single = singleData.DefiUnited_campaign as Record<string, unknown>;

      expect(single).not.toBeNull();
      expect(single?.slug).toBe(slug);
      expect(single?.name).toBe(campaign.name);
    }
  });

  it("should filter campaigns by status", async () => {
    if (!isConnected) return;

    const allData = await graphqlQuery(CAMPAIGNS_QUERY);
    const allCampaigns = allData.DefiUnited_campaigns as Array<
      Record<string, unknown>
    >;

    if (allCampaigns.length === 0) {
      console.log("No campaigns found — skipping status filter test");
      return;
    }

    // Group by status and verify each filter works
    const statuses = [...new Set(allCampaigns.map((c) => c.status))];

    for (const status of statuses) {
      const filteredData = await graphqlQuery(CAMPAIGNS_QUERY, { status });
      const filtered = filteredData.DefiUnited_campaigns as Array<
        Record<string, unknown>
      >;

      expect(filtered.every((c) => c.status === status)).toBe(true);
      expect(filtered.length).toBe(
        allCampaigns.filter((c) => c.status === status).length,
      );
    }
  });
});
