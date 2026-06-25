import { generateMock } from "document-model";
import {
  attachAnnouncement,
  AttachAnnouncementInputSchema,
  draftUpdate,
  DraftUpdateInputSchema,
  editUpdate,
  EditUpdateInputSchema,
  isStatusUpdateDocument,
  publishUpdate,
  PublishUpdateInputSchema,
  reducer,
  retractUpdate,
  RetractUpdateInputSchema,
  setVisibility,
  SetVisibilityInputSchema,
  utils,
} from "document-models/status-update/v1";
import { describe, expect, it } from "vitest";

describe("PublishingOperations", () => {
  it("should handle draftUpdate operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DraftUpdateInputSchema());

    const updatedDocument = reducer(document, draftUpdate(input));

    expect(isStatusUpdateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DRAFT_UPDATE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle editUpdate operation", () => {
    const document = utils.createDocument();
    const input = generateMock(EditUpdateInputSchema());

    const updatedDocument = reducer(document, editUpdate(input));

    expect(isStatusUpdateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "EDIT_UPDATE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle publishUpdate operation", () => {
    const document = utils.createDocument();
    const input = generateMock(PublishUpdateInputSchema());

    const updatedDocument = reducer(document, publishUpdate(input));

    expect(isStatusUpdateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "PUBLISH_UPDATE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle attachAnnouncement operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AttachAnnouncementInputSchema());

    const updatedDocument = reducer(document, attachAnnouncement(input));

    expect(isStatusUpdateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ATTACH_ANNOUNCEMENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle retractUpdate operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RetractUpdateInputSchema());

    const updatedDocument = reducer(document, retractUpdate(input));

    expect(isStatusUpdateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "RETRACT_UPDATE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setVisibility operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetVisibilityInputSchema());

    const updatedDocument = reducer(document, setVisibility(input));

    expect(isStatusUpdateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_VISIBILITY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
