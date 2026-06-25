import { generateMock } from "document-model";
import {
  addContributionAddress,
  AddContributionAddressInputSchema,
  addExternalLink,
  AddExternalLinkInputSchema,
  addOperatorWallet,
  AddOperatorWalletInputSchema,
  archiveCampaign,
  ArchiveCampaignInputSchema,
  isReliefCampaignDocument,
  markFailed,
  MarkFailedInputSchema,
  markResolved,
  MarkResolvedInputSchema,
  reducer,
  removeContributionAddress,
  RemoveContributionAddressInputSchema,
  removeOperatorWallet,
  RemoveOperatorWalletInputSchema,
  setCampaignDetails,
  SetCampaignDetailsInputSchema,
  startCampaign,
  StartCampaignInputSchema,
  utils,
} from "document-models/relief-campaign/v1";
import { describe, expect, it } from "vitest";

describe("ManagementOperations", () => {
  it("should handle setCampaignDetails operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetCampaignDetailsInputSchema());

    const updatedDocument = reducer(document, setCampaignDetails(input));

    expect(isReliefCampaignDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_CAMPAIGN_DETAILS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addContributionAddress operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddContributionAddressInputSchema());

    const updatedDocument = reducer(document, addContributionAddress(input));

    expect(isReliefCampaignDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_CONTRIBUTION_ADDRESS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeContributionAddress operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveContributionAddressInputSchema());

    const updatedDocument = reducer(document, removeContributionAddress(input));

    expect(isReliefCampaignDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_CONTRIBUTION_ADDRESS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle startCampaign operation", () => {
    const document = utils.createDocument();
    const input = generateMock(StartCampaignInputSchema());

    const updatedDocument = reducer(document, startCampaign(input));

    expect(isReliefCampaignDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "START_CAMPAIGN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markResolved operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkResolvedInputSchema());

    const updatedDocument = reducer(document, markResolved(input));

    expect(isReliefCampaignDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_RESOLVED",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markFailed operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkFailedInputSchema());

    const updatedDocument = reducer(document, markFailed(input));

    expect(isReliefCampaignDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_FAILED",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle archiveCampaign operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ArchiveCampaignInputSchema());

    const updatedDocument = reducer(document, archiveCampaign(input));

    expect(isReliefCampaignDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ARCHIVE_CAMPAIGN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addExternalLink operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddExternalLinkInputSchema());

    const updatedDocument = reducer(document, addExternalLink(input));

    expect(isReliefCampaignDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_EXTERNAL_LINK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addOperatorWallet operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddOperatorWalletInputSchema());

    const updatedDocument = reducer(document, addOperatorWallet(input));

    expect(isReliefCampaignDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_OPERATOR_WALLET",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeOperatorWallet operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveOperatorWalletInputSchema());

    const updatedDocument = reducer(document, removeOperatorWallet(input));

    expect(isReliefCampaignDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_OPERATOR_WALLET",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
