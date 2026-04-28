import { describe, it, expect } from "vitest";
import {
  deriveActivity,
  type DeriveActivityInput,
} from "../state/derive-activity.js";

function fixture(
  overrides: Partial<DeriveActivityInput> = {},
): DeriveActivityInput {
  return {
    pledges: [],
    receipts: [],
    statusUpdates: [],
    contributorProfiles: [],
    limit: 10,
    ...overrides,
  };
}

describe("deriveActivity", () => {
  it("returns empty for empty drive", () => {
    expect(deriveActivity(fixture())).toEqual([]);
  });

  it("emits one event per pledge created", () => {
    const events = deriveActivity(
      fixture({
        pledges: [
          {
            header: { id: "p1", lastModifiedAtUtcIso: "2026-04-28T10:00:00Z" },
            state: {
              global: {
                contributorProfileId: "c1",
                status: "PROPOSED",
                pledgedAmount: 100,
              },
            },
          } as any,
        ],
        contributorProfiles: [
          {
            header: { id: "c1" },
            state: { global: { displayName: "Acme" } },
          } as any,
        ],
      }),
    );
    expect(events).toHaveLength(1);
    expect(events[0].kind).toBe("PLEDGE");
    expect(events[0].headline).toContain("Acme");
  });

  it("merges all event types in reverse-chrono order", () => {
    const events = deriveActivity(
      fixture({
        pledges: [
          {
            header: { id: "p1", lastModifiedAtUtcIso: "2026-04-28T10:00:00Z" },
            state: { global: { contributorProfileId: "c1" } },
          } as any,
        ],
        receipts: [
          {
            header: { id: "r1", lastModifiedAtUtcIso: "2026-04-28T11:00:00Z" },
            state: {
              global: {
                amount: "0.5",
                assetSymbol: "ETH",
                fromAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
              },
            },
          } as any,
        ],
        statusUpdates: [
          {
            header: { id: "u1", lastModifiedAtUtcIso: "2026-04-28T12:00:00Z" },
            state: {
              global: {
                title: "Coalition formed",
                visibility: "PUBLIC",
                publishedAt: "2026-04-28T12:00:00Z",
              },
            },
          } as any,
        ],
        contributorProfiles: [
          {
            header: { id: "c1" },
            state: { global: { displayName: "X" } },
          } as any,
        ],
      }),
    );
    expect(events.map((e) => e.kind)).toEqual(["UPDATE", "RECEIPT", "PLEDGE"]);
  });

  it("respects the limit", () => {
    const pledges = Array.from({ length: 20 }).map(
      (_, i) =>
        ({
          header: {
            id: `p${i}`,
            lastModifiedAtUtcIso: `2026-04-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
          },
          state: { global: { contributorProfileId: "c1" } },
        }) as any,
    );
    const events = deriveActivity(
      fixture({
        pledges,
        limit: 5,
        contributorProfiles: [
          {
            header: { id: "c1" },
            state: { global: { displayName: "X" } },
          } as any,
        ],
      }),
    );
    expect(events).toHaveLength(5);
  });
});
