/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsStatusUpdateDocument,
  assertIsStatusUpdateState,
  initialGlobalState,
  initialLocalState,
  isStatusUpdateDocument,
  isStatusUpdateState,
  statusUpdateDocumentType,
  utils,
} from "document-models/status-update/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("StatusUpdate Document Model", () => {
  it("should create a new StatusUpdate document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(statusUpdateDocumentType);
  });

  it("should create a new StatusUpdate document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isStatusUpdateDocument(document)).toBe(true);
    expect(isStatusUpdateState(document.state)).toBe(true);
  });
  it("should reject a document that is not a StatusUpdate document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsStatusUpdateDocument(wrongDocumentType)).toThrow();
      expect(isStatusUpdateDocument(wrongDocumentType)).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
    }
  });
  const wrongState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongState.state.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isStatusUpdateState(wrongState.state)).toBe(false);
    expect(assertIsStatusUpdateState(wrongState.state)).toThrow();
    expect(isStatusUpdateDocument(wrongState)).toBe(false);
    expect(assertIsStatusUpdateDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isStatusUpdateState(wrongInitialState.state)).toBe(false);
    expect(assertIsStatusUpdateState(wrongInitialState.state)).toThrow();
    expect(isStatusUpdateDocument(wrongInitialState)).toBe(false);
    expect(assertIsStatusUpdateDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isStatusUpdateDocument(missingIdInHeader)).toBe(false);
    expect(assertIsStatusUpdateDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isStatusUpdateDocument(missingNameInHeader)).toBe(false);
    expect(assertIsStatusUpdateDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isStatusUpdateDocument(missingCreatedAtUtcIsoInHeader)).toBe(false);
    expect(
      assertIsStatusUpdateDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isStatusUpdateDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsStatusUpdateDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
