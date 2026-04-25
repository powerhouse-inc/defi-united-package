import { generateId } from "document-model";
import {
  attachAnnouncement,
  draftUpdate,
  editUpdate,
  isStatusUpdateDocument,
  publishUpdate,
  reducer,
  retractUpdate,
  setVisibility,
  utils,
} from "document-models/status-update/v1";
import { describe, expect, it } from "vitest";

const PUB_AT = "2026-04-25T15:00:00.000Z";

describe("StatusUpdate publishing reducer", () => {
  it("starts INTERNAL with empty title/body", () => {
    const doc = utils.createDocument();
    expect(isStatusUpdateDocument(doc)).toBe(true);
    expect(doc.state.global.visibility).toBe("INTERNAL");
    expect(doc.state.global.title).toBe("");
    expect(doc.state.global.body).toBe("");
    expect(doc.state.global.publishedAt).toBeNull();
  });

  it("DRAFT_UPDATE sets fields", () => {
    const doc = utils.createDocument();
    const next = reducer(
      doc,
      draftUpdate({
        title: "DeFi United launches recovery effort",
        body: "Initial pledges have been received...",
        visibility: "PUBLIC",
        authorProfileId: "ph:contrib:powerhouse",
      }),
    );
    expect(next.state.global.title).toBe(
      "DeFi United launches recovery effort",
    );
    expect(next.state.global.body).toBe(
      "Initial pledges have been received...",
    );
    expect(next.state.global.visibility).toBe("PUBLIC");
  });

  it("EDIT_UPDATE updates title and body", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, draftUpdate({ title: "v1", body: "v1" }));
    doc = reducer(doc, editUpdate({ title: "v2", body: "v2" }));
    expect(doc.state.global.title).toBe("v2");
    expect(doc.state.global.body).toBe("v2");
  });

  it("PUBLISH_UPDATE requires title and body", () => {
    const doc = utils.createDocument();
    const next = reducer(doc, publishUpdate({ publishedAt: PUB_AT }));
    expect(next.operations.global[0].error).toBe(
      "Title and body must be set before publishing",
    );
  });

  it("PUBLISH_UPDATE captures metrics snapshot", () => {
    let doc = utils.createDocument();
    doc = reducer(
      doc,
      draftUpdate({ title: "Update", body: "Body content here" }),
    );
    doc = reducer(
      doc,
      publishUpdate({
        publishedAt: PUB_AT,
        metricsSnapshot: {
          totalPledged: 70000,
          totalReceived: 6850,
          dependenciesResolved: 1,
        },
      }),
    );
    expect(doc.state.global.publishedAt).toBe(PUB_AT);
    expect(doc.state.global.metricsSnapshot).toEqual({
      totalPledged: 70000,
      totalReceived: 6850,
      dependenciesResolved: 1,
    });
  });

  it("rejects double-publish", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, draftUpdate({ title: "T", body: "B" }));
    doc = reducer(doc, publishUpdate({ publishedAt: PUB_AT }));
    doc = reducer(doc, publishUpdate({ publishedAt: PUB_AT }));
    expect(doc.operations.global[2].error).toBe(
      "Update has already been published",
    );
  });

  it("RETRACT_UPDATE clears publishedAt", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, draftUpdate({ title: "T", body: "B" }));
    doc = reducer(doc, publishUpdate({ publishedAt: PUB_AT }));
    expect(doc.state.global.publishedAt).toBe(PUB_AT);
    doc = reducer(doc, retractUpdate({ _: null }));
    expect(doc.state.global.publishedAt).toBeNull();
  });

  it("RETRACT_UPDATE rejects when not published", () => {
    const doc = utils.createDocument();
    const next = reducer(doc, retractUpdate({ _: null }));
    expect(next.operations.global[0].error).toBe(
      "Update is not currently published",
    );
  });

  it("ATTACH_ANNOUNCEMENT appends external links", () => {
    let doc = utils.createDocument();
    doc = reducer(
      doc,
      attachAnnouncement({
        id: generateId(),
        platform: "TWITTER",
        url: "https://twitter.com/defiunited/status/123",
      }),
    );
    doc = reducer(
      doc,
      attachAnnouncement({
        id: generateId(),
        platform: "FARCASTER",
        url: "https://warpcast.com/defiunited/0xabc",
      }),
    );
    expect(doc.state.global.externalAnnouncements).toHaveLength(2);
  });

  it("SET_VISIBILITY changes the visibility", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, setVisibility({ visibility: "CONTRIBUTORS_ONLY" }));
    expect(doc.state.global.visibility).toBe("CONTRIBUTORS_ONLY");
  });
});
