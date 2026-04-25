/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsReliefCampaignDocument,
  assertIsReliefCampaignState,
  initialGlobalState,
  initialLocalState,
  isReliefCampaignDocument,
  isReliefCampaignState,
  reliefCampaignDocumentType,
  utils,
} from "document-models/relief-campaign/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("ReliefCampaign Document Model", () => {
  it("should create a new ReliefCampaign document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(reliefCampaignDocumentType);
  });

  it("should create a new ReliefCampaign document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isReliefCampaignDocument(document)).toBe(true);
    expect(isReliefCampaignState(document.state)).toBe(true);
  });
  it("should reject a document that is not a ReliefCampaign document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsReliefCampaignDocument(wrongDocumentType)).toThrow();
      expect(isReliefCampaignDocument(wrongDocumentType)).toBe(false);
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
    expect(isReliefCampaignState(wrongState.state)).toBe(false);
    expect(assertIsReliefCampaignState(wrongState.state)).toThrow();
    expect(isReliefCampaignDocument(wrongState)).toBe(false);
    expect(assertIsReliefCampaignDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isReliefCampaignState(wrongInitialState.state)).toBe(false);
    expect(assertIsReliefCampaignState(wrongInitialState.state)).toThrow();
    expect(isReliefCampaignDocument(wrongInitialState)).toBe(false);
    expect(assertIsReliefCampaignDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isReliefCampaignDocument(missingIdInHeader)).toBe(false);
    expect(assertIsReliefCampaignDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isReliefCampaignDocument(missingNameInHeader)).toBe(false);
    expect(assertIsReliefCampaignDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isReliefCampaignDocument(missingCreatedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsReliefCampaignDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isReliefCampaignDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsReliefCampaignDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
