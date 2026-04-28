import { describe, it, expect } from "vitest";
import { deriveTasks, type DeriveTasksInput } from "../state/derive-tasks.js";

const NOW = new Date("2026-04-28T12:00:00Z").getTime();
const HOURS_AGO = (h: number) => new Date(NOW - h * 3600 * 1000).toISOString();
const DAYS_AGO = (d: number) => HOURS_AGO(d * 24);

function fixture(overrides: Partial<DeriveTasksInput> = {}): DeriveTasksInput {
  return {
    now: NOW,
    pledges: [],
    receipts: [],
    dependencies: [],
    statusUpdates: [],
    contributorProfiles: [],
    campaignStatus: "ACTIVE",
    ...overrides,
  };
}

describe("deriveTasks", () => {
  it("returns empty for healthy state", () => {
    expect(deriveTasks(fixture({ campaignStatus: "DRAFT" }))).toEqual([]);
  });

  it("surfaces a vote-ended task for GOVERNANCE_PENDING past voteEndDate", () => {
    const tasks = deriveTasks(
      fixture({
        contributorProfiles: [
          {
            header: { id: "c1" },
            state: { global: { displayName: "Aave DAO" } },
          } as any,
        ],
        pledges: [
          {
            header: { id: "p1" },
            state: {
              global: {
                contributorProfileId: "c1",
                pledgedAmount: 25000,
                status: "GOVERNANCE_PENDING",
                governance: {
                  proposalUrl: "https://snapshot.org/x",
                  voteEndDate: DAYS_AGO(3),
                },
              },
            },
          } as any,
        ],
        campaignStatus: "DRAFT",
      }),
    );
    expect(tasks).toHaveLength(1);
    expect(tasks[0].kind).toBe("VOTE_ENDED");
    expect(tasks[0].pledgeId).toBe("p1");
    expect(tasks[0].headline).toContain("Aave DAO");
    expect(tasks[0].headline).toContain("3");
  });

  it("surfaces a missing-governance task for PROPOSED >24h with no governance", () => {
    const tasks = deriveTasks(
      fixture({
        contributorProfiles: [
          {
            header: { id: "c1" },
            state: { global: { displayName: "Mantle" } },
          } as any,
        ],
        pledges: [
          {
            header: { id: "p1", lastModifiedAtUtcIso: DAYS_AGO(2) },
            state: {
              global: {
                contributorProfileId: "c1",
                status: "PROPOSED",
                governance: null,
              },
            },
          } as any,
        ],
        campaignStatus: "DRAFT",
      }),
    );
    expect(tasks).toHaveLength(1);
    expect(tasks[0].kind).toBe("MISSING_GOVERNANCE");
    expect(tasks[0].pledgeId).toBe("p1");
  });

  it("surfaces a follow-up task for CONFIRMED >7d with no receipts", () => {
    const tasks = deriveTasks(
      fixture({
        contributorProfiles: [
          {
            header: { id: "c1" },
            state: { global: { displayName: "Compound" } },
          } as any,
        ],
        pledges: [
          {
            header: { id: "p1", lastModifiedAtUtcIso: DAYS_AGO(8) },
            state: {
              global: {
                contributorProfileId: "c1",
                status: "CONFIRMED",
                receiptIds: [],
              },
            },
          } as any,
        ],
        campaignStatus: "DRAFT",
      }),
    );
    expect(tasks).toHaveLength(1);
    expect(tasks[0].kind).toBe("CONFIRMED_NO_RECEIPT");
  });

  it("surfaces an unattributed-receipt task", () => {
    const tasks = deriveTasks(
      fixture({
        receipts: [
          {
            header: { id: "r1" },
            state: {
              global: {
                amount: "0.5",
                assetSymbol: "ETH",
                fromAddress: "0xab1234567890abcdef1234567890abcdef123456",
                reconciliationStatus: "UNATTRIBUTED",
              },
            },
          } as any,
        ],
        campaignStatus: "DRAFT",
      }),
    );
    expect(tasks).toHaveLength(1);
    expect(tasks[0].kind).toBe("RECEIPT_UNATTRIBUTED");
  });

  it("surfaces an overdue-dependency task", () => {
    const tasks = deriveTasks(
      fixture({
        dependencies: [
          {
            header: { id: "d1" },
            state: {
              global: {
                title: "KelpDAO bridge remediation",
                status: "OPEN",
                expectedResolution: DAYS_AGO(2),
              },
            },
          } as any,
        ],
        campaignStatus: "DRAFT",
      }),
    );
    expect(tasks).toHaveLength(1);
    expect(tasks[0].kind).toBe("DEP_OVERDUE");
  });

  it("surfaces no-recent-update for ACTIVE campaign with no updates >7d", () => {
    const tasks = deriveTasks(
      fixture({
        statusUpdates: [
          {
            header: { id: "u1" },
            state: {
              global: {
                publishedAt: DAYS_AGO(10),
                visibility: "PUBLIC",
              },
            },
          } as any,
        ],
      }),
    );
    expect(tasks.some((t) => t.kind === "NO_RECENT_UPDATE")).toBe(true);
  });

  it("sorts by urgency: most overdue first", () => {
    const tasks = deriveTasks(
      fixture({
        contributorProfiles: [
          {
            header: { id: "c1" },
            state: { global: { displayName: "A" } },
          } as any,
          {
            header: { id: "c2" },
            state: { global: { displayName: "B" } },
          } as any,
        ],
        pledges: [
          {
            header: { id: "p1" },
            state: {
              global: {
                contributorProfileId: "c1",
                status: "GOVERNANCE_PENDING",
                governance: { voteEndDate: DAYS_AGO(1) },
              },
            },
          } as any,
          {
            header: { id: "p2" },
            state: {
              global: {
                contributorProfileId: "c2",
                status: "GOVERNANCE_PENDING",
                governance: { voteEndDate: DAYS_AGO(5) },
              },
            },
          } as any,
        ],
        campaignStatus: "DRAFT",
      }),
    );
    expect(tasks[0].pledgeId).toBe("p2");
    expect(tasks[1].pledgeId).toBe("p1");
  });
});
