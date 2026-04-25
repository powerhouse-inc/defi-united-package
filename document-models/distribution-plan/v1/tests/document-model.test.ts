/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsDistributionPlanDocument,
  assertIsDistributionPlanState,
  distributionPlanDocumentType,
  initialGlobalState,
  initialLocalState,
  isDistributionPlanDocument,
  isDistributionPlanState,
  utils,
} from "document-models/distribution-plan/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("DistributionPlan Document Model", () => {
  it("should create a new DistributionPlan document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(distributionPlanDocumentType);
  });

  it("should create a new DistributionPlan document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isDistributionPlanDocument(document)).toBe(true);
    expect(isDistributionPlanState(document.state)).toBe(true);
  });
  it("should reject a document that is not a DistributionPlan document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsDistributionPlanDocument(wrongDocumentType)).toThrow();
      expect(isDistributionPlanDocument(wrongDocumentType)).toBe(false);
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
    expect(isDistributionPlanState(wrongState.state)).toBe(false);
    expect(assertIsDistributionPlanState(wrongState.state)).toThrow();
    expect(isDistributionPlanDocument(wrongState)).toBe(false);
    expect(assertIsDistributionPlanDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isDistributionPlanState(wrongInitialState.state)).toBe(false);
    expect(assertIsDistributionPlanState(wrongInitialState.state)).toThrow();
    expect(isDistributionPlanDocument(wrongInitialState)).toBe(false);
    expect(assertIsDistributionPlanDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isDistributionPlanDocument(missingIdInHeader)).toBe(false);
    expect(assertIsDistributionPlanDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isDistributionPlanDocument(missingNameInHeader)).toBe(false);
    expect(assertIsDistributionPlanDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isDistributionPlanDocument(missingCreatedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsDistributionPlanDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(
      isDistributionPlanDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toBe(false);
    expect(
      assertIsDistributionPlanDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
