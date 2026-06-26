import { generateMock } from "document-model";
import {
  abandon,
  AbandonInputSchema,
  isExternalDependencyDocument,
  linkPledge,
  LinkPledgeInputSchema,
  reducer,
  resolve,
  ResolveInputSchema,
  setDependencyDetails,
  SetDependencyDetailsInputSchema,
  setExternalRef,
  SetExternalRefInputSchema,
  unlinkPledge,
  UnlinkPledgeInputSchema,
  updateStatus,
  UpdateStatusInputSchema,
  utils,
} from "document-models/external-dependency/v1";
import { describe, expect, it } from "vitest";

describe("TrackingOperations", () => {
  it("should handle setDependencyDetails operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetDependencyDetailsInputSchema(), {
      expectedResolution: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, setDependencyDetails(input));

    expect(isExternalDependencyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_DEPENDENCY_DETAILS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateStatusInputSchema());

    const updatedDocument = reducer(document, updateStatus(input));

    expect(isExternalDependencyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle linkPledge operation", () => {
    const document = utils.createDocument();
    const input = generateMock(LinkPledgeInputSchema());

    const updatedDocument = reducer(document, linkPledge(input));

    expect(isExternalDependencyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "LINK_PLEDGE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle unlinkPledge operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UnlinkPledgeInputSchema());

    const updatedDocument = reducer(document, unlinkPledge(input));

    expect(isExternalDependencyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UNLINK_PLEDGE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle resolve operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ResolveInputSchema());

    const updatedDocument = reducer(document, resolve(input));

    expect(isExternalDependencyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("RESOLVE");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle abandon operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AbandonInputSchema());

    const updatedDocument = reducer(document, abandon(input));

    expect(isExternalDependencyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ABANDON");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setExternalRef operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetExternalRefInputSchema());

    const updatedDocument = reducer(document, setExternalRef(input));

    expect(isExternalDependencyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_EXTERNAL_REF",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
