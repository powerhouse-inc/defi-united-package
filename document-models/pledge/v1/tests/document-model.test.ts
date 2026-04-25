/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsPledgeDocument,
  assertIsPledgeState,
  initialGlobalState,
  initialLocalState,
  isPledgeDocument,
  isPledgeState,
  pledgeDocumentType,
  utils,
} from "document-models/pledge/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("Pledge Document Model", () => {
  it("should create a new Pledge document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(pledgeDocumentType);
  });

  it("should create a new Pledge document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isPledgeDocument(document)).toBe(true);
    expect(isPledgeState(document.state)).toBe(true);
  });
  it("should reject a document that is not a Pledge document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsPledgeDocument(wrongDocumentType)).toThrow();
      expect(isPledgeDocument(wrongDocumentType)).toBe(false);
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
    expect(isPledgeState(wrongState.state)).toBe(false);
    expect(assertIsPledgeState(wrongState.state)).toThrow();
    expect(isPledgeDocument(wrongState)).toBe(false);
    expect(assertIsPledgeDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isPledgeState(wrongInitialState.state)).toBe(false);
    expect(assertIsPledgeState(wrongInitialState.state)).toThrow();
    expect(isPledgeDocument(wrongInitialState)).toBe(false);
    expect(assertIsPledgeDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isPledgeDocument(missingIdInHeader)).toBe(false);
    expect(assertIsPledgeDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isPledgeDocument(missingNameInHeader)).toBe(false);
    expect(assertIsPledgeDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isPledgeDocument(missingCreatedAtUtcIsoInHeader)).toBe(false);
    expect(assertIsPledgeDocument(missingCreatedAtUtcIsoInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isPledgeDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(false);
    expect(
      assertIsPledgeDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
