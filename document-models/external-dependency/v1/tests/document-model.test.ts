/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsExternalDependencyDocument,
  assertIsExternalDependencyState,
  externalDependencyDocumentType,
  initialGlobalState,
  initialLocalState,
  isExternalDependencyDocument,
  isExternalDependencyState,
  utils,
} from "document-models/external-dependency/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("ExternalDependency Document Model", () => {
  it("should create a new ExternalDependency document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(externalDependencyDocumentType);
  });

  it("should create a new ExternalDependency document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isExternalDependencyDocument(document)).toBe(true);
    expect(isExternalDependencyState(document.state)).toBe(true);
  });
  it("should reject a document that is not a ExternalDependency document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsExternalDependencyDocument(wrongDocumentType)).toThrow();
      expect(isExternalDependencyDocument(wrongDocumentType)).toBe(false);
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
    expect(isExternalDependencyState(wrongState.state)).toBe(false);
    expect(assertIsExternalDependencyState(wrongState.state)).toThrow();
    expect(isExternalDependencyDocument(wrongState)).toBe(false);
    expect(assertIsExternalDependencyDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isExternalDependencyState(wrongInitialState.state)).toBe(false);
    expect(assertIsExternalDependencyState(wrongInitialState.state)).toThrow();
    expect(isExternalDependencyDocument(wrongInitialState)).toBe(false);
    expect(assertIsExternalDependencyDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isExternalDependencyDocument(missingIdInHeader)).toBe(false);
    expect(assertIsExternalDependencyDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isExternalDependencyDocument(missingNameInHeader)).toBe(false);
    expect(assertIsExternalDependencyDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isExternalDependencyDocument(missingCreatedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsExternalDependencyDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(
      isExternalDependencyDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toBe(false);
    expect(
      assertIsExternalDependencyDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
