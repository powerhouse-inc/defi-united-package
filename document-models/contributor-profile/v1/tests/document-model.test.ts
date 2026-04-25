/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsContributorProfileDocument,
  assertIsContributorProfileState,
  contributorProfileDocumentType,
  initialGlobalState,
  initialLocalState,
  isContributorProfileDocument,
  isContributorProfileState,
  utils,
} from "document-models/contributor-profile/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("ContributorProfile Document Model", () => {
  it("should create a new ContributorProfile document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(contributorProfileDocumentType);
  });

  it("should create a new ContributorProfile document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isContributorProfileDocument(document)).toBe(true);
    expect(isContributorProfileState(document.state)).toBe(true);
  });
  it("should reject a document that is not a ContributorProfile document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsContributorProfileDocument(wrongDocumentType)).toThrow();
      expect(isContributorProfileDocument(wrongDocumentType)).toBe(false);
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
    expect(isContributorProfileState(wrongState.state)).toBe(false);
    expect(assertIsContributorProfileState(wrongState.state)).toThrow();
    expect(isContributorProfileDocument(wrongState)).toBe(false);
    expect(assertIsContributorProfileDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isContributorProfileState(wrongInitialState.state)).toBe(false);
    expect(assertIsContributorProfileState(wrongInitialState.state)).toThrow();
    expect(isContributorProfileDocument(wrongInitialState)).toBe(false);
    expect(assertIsContributorProfileDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isContributorProfileDocument(missingIdInHeader)).toBe(false);
    expect(assertIsContributorProfileDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isContributorProfileDocument(missingNameInHeader)).toBe(false);
    expect(assertIsContributorProfileDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isContributorProfileDocument(missingCreatedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsContributorProfileDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(
      isContributorProfileDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toBe(false);
    expect(
      assertIsContributorProfileDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
