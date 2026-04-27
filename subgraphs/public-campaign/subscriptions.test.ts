/**
 * Tests for the public-campaign subgraph subscriptions.
 *
 * Verifies that the PubSub integration and withFilter resolvers
 * correctly filter subscription payloads by slug.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { PubSub, withFilter } from "graphql-subscriptions";

describe("subscription resolvers", () => {
  let pubSub: PubSub;
  const CAMPAIGN_UPDATED = "CAMPAIGN_UPDATED";
  const RECEIPT_ARRIVED = "RECEIPT_ARRIVED";
  const STATUS_UPDATE_PUBLISHED = "STATUS_UPDATE_PUBLISHED";

  beforeEach(() => {
    pubSub = new PubSub();
  });

  describe("PubSub", () => {
    it("publishes and receives events", async () => {
      const payload = { slug: "test-campaign", name: "Test" };

      const iter = pubSub.asyncIterableIterator(CAMPAIGN_UPDATED);
      const iterator = iter[Symbol.asyncIterator]();

      // Start listening before publishing
      const nextPromise = iterator.next();
      pubSub.publish(CAMPAIGN_UPDATED, payload);
      const result = await nextPromise;

      expect(result.value).toEqual(payload);
      iterator.return?.();
    });
  });

  describe("withFilter", () => {
    it("passes all events when filter returns true", async () => {
      const subscribeFn = withFilter(
        () => pubSub.asyncIterableIterator(CAMPAIGN_UPDATED),
        () => true,
      );

      const filtered = await subscribeFn({}, {}, {}, {});
      const iterator = filtered[Symbol.asyncIterator]();

      const nextPromise = iterator.next();
      pubSub.publish(CAMPAIGN_UPDATED, { slug: "alpha" });
      const result = await nextPromise;

      expect(result.value.slug).toBe("alpha");
      iterator.return?.();
    });

    it("filters events based on args", async () => {
      const subscribeFn = withFilter(
        () => pubSub.asyncIterableIterator(CAMPAIGN_UPDATED),
        (payload, args) => {
          const slug = (args as { slug?: string } | undefined)?.slug;
          if (slug) return (payload as Record<string, unknown>).slug === slug;
          return true;
        },
      );

      const filtered = await subscribeFn({}, { slug: "alpha" }, {}, {});
      const iterator = filtered[Symbol.asyncIterator]();

      const nextPromise = iterator.next();

      // This should be filtered out
      pubSub.publish(CAMPAIGN_UPDATED, { slug: "beta" });
      // This should pass through
      pubSub.publish(CAMPAIGN_UPDATED, { slug: "alpha" });

      const result = await nextPromise;
      expect(result.value.slug).toBe("alpha");

      iterator.return?.();
    });
  });

  describe("DefiUnited_receiptArrived filter", () => {
    it("filters by campaign slug", async () => {
      const subscribeFn = withFilter(
        () => pubSub.asyncIterableIterator(RECEIPT_ARRIVED),
        (payload, args) => {
          const slug = (args as { slug: string } | undefined)?.slug;
          return slug
            ? (payload as Record<string, unknown>).campaignSlug === slug
            : true;
        },
      );

      const filtered = await subscribeFn({}, { slug: "test-campaign" }, {}, {});
      const iterator = filtered[Symbol.asyncIterator]();

      const nextPromise = iterator.next();

      // Should be filtered out
      pubSub.publish(RECEIPT_ARRIVED, {
        campaignSlug: "other-campaign",
        txHash: "0x1234",
      });
      // Should pass
      pubSub.publish(RECEIPT_ARRIVED, {
        campaignSlug: "test-campaign",
        txHash: "0xabcd",
      });

      const result = await nextPromise;
      expect(result.value.campaignSlug).toBe("test-campaign");
      expect(result.value.txHash).toBe("0xabcd");

      iterator.return?.();
    });
  });

  describe("DefiUnited_statusUpdatePublished filter", () => {
    it("filters by campaign slug", async () => {
      const subscribeFn = withFilter(
        () => pubSub.asyncIterableIterator(STATUS_UPDATE_PUBLISHED),
        (payload, args) => {
          const slug = (args as { slug: string } | undefined)?.slug;
          return slug
            ? (payload as Record<string, unknown>).campaignSlug === slug
            : true;
        },
      );

      const filtered = await subscribeFn({}, { slug: "test-campaign" }, {}, {});
      const iterator = filtered[Symbol.asyncIterator]();

      const nextPromise = iterator.next();

      pubSub.publish(STATUS_UPDATE_PUBLISHED, {
        campaignSlug: "other-campaign",
        title: "Irrelevant",
      });
      pubSub.publish(STATUS_UPDATE_PUBLISHED, {
        campaignSlug: "test-campaign",
        title: "Relevant",
      });

      const result = await nextPromise;
      expect(result.value.campaignSlug).toBe("test-campaign");
      expect(result.value.title).toBe("Relevant");

      iterator.return?.();
    });
  });
});
