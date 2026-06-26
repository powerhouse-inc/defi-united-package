import { generateMock } from "document-model";
import {
  addGovernanceEndpoint,
  AddGovernanceEndpointInputSchema,
  addWallet,
  AddWalletInputSchema,
  isContributorProfileDocument,
  reducer,
  removeGovernanceEndpoint,
  RemoveGovernanceEndpointInputSchema,
  removeWallet,
  RemoveWalletInputSchema,
  setProfileDetails,
  SetProfileDetailsInputSchema,
  setTrustLevel,
  SetTrustLevelInputSchema,
  utils,
} from "document-models/contributor-profile/v1";
import { describe, expect, it } from "vitest";

describe("ProfileOperations", () => {
  it("should handle setProfileDetails operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetProfileDetailsInputSchema());

    const updatedDocument = reducer(document, setProfileDetails(input));

    expect(isContributorProfileDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_PROFILE_DETAILS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addWallet operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddWalletInputSchema());

    const updatedDocument = reducer(document, addWallet(input));

    expect(isContributorProfileDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_WALLET");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeWallet operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveWalletInputSchema());

    const updatedDocument = reducer(document, removeWallet(input));

    expect(isContributorProfileDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_WALLET",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addGovernanceEndpoint operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddGovernanceEndpointInputSchema());

    const updatedDocument = reducer(document, addGovernanceEndpoint(input));

    expect(isContributorProfileDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_GOVERNANCE_ENDPOINT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeGovernanceEndpoint operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveGovernanceEndpointInputSchema());

    const updatedDocument = reducer(document, removeGovernanceEndpoint(input));

    expect(isContributorProfileDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_GOVERNANCE_ENDPOINT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setTrustLevel operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetTrustLevelInputSchema());

    const updatedDocument = reducer(document, setTrustLevel(input));

    expect(isContributorProfileDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_TRUST_LEVEL",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
