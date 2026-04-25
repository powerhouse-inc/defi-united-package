import {
  attachPledge,
  clearMatch,
  isOnchainReceiptDocument,
  markAmbiguous,
  overrideMatch,
  recordReceipt,
  reducer,
  utils,
} from "document-models/onchain-receipt/v1";
import { describe, expect, it } from "vitest";

const FROM = "0x1111111111111111111111111111111111111111";
const TO = "0x0fCa5194baA59a362a835031d9C4A25970effE68";
const TX = "0xdeadbeefcafe1234567890abcdef1234567890abcdef1234567890abcdef1234";
const PLEDGE_A = "ph:pledge:mantle";
const PLEDGE_B = "ph:pledge:aave";

const recordEth = () =>
  recordReceipt({
    chainId: 1,
    txHash: TX,
    blockNumber: 21_000_000,
    blockTimestamp: "2026-04-25T12:00:00.000Z",
    fromAddress: FROM,
    toAddress: TO,
    asset: { symbol: "ETH" },
    amount: 5000,
  });

describe("OnchainReceipt reconciliation reducer", () => {
  it("starts UNMATCHED with no fields populated", () => {
    const doc = utils.createDocument();
    expect(isOnchainReceiptDocument(doc)).toBe(true);
    expect(doc.state.global.reconciliationStatus).toBe("UNMATCHED");
    expect(doc.state.global.txHash).toBeNull();
  });

  it("RECORD_RECEIPT populates all fields and normalises asset.contractAddress", () => {
    const doc = utils.createDocument();
    const next = reducer(doc, recordEth());
    expect(next.state.global.txHash).toBe(TX);
    expect(next.state.global.chainId).toBe(1);
    expect(next.state.global.amount).toBe(5000);
    expect(next.state.global.asset).toEqual({
      symbol: "ETH",
      contractAddress: null,
    });
    expect(next.state.global.reconciliationStatus).toBe("UNMATCHED");
  });

  it("rejects double-record on same document", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, recordEth());
    doc = reducer(doc, recordEth());
    expect(doc.operations.global[1].error).toBe(
      "Receipt has already been recorded",
    );
  });

  it("ATTACH_PLEDGE flips status to MATCHED", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, recordEth());
    doc = reducer(doc, attachPledge({ pledgeId: PLEDGE_A }));
    expect(doc.state.global.matchedPledgeId).toBe(PLEDGE_A);
    expect(doc.state.global.reconciliationStatus).toBe("MATCHED");
  });

  it("MARK_AMBIGUOUS sets status without picking a pledge", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, recordEth());
    doc = reducer(doc, markAmbiguous({ _: null }));
    expect(doc.state.global.reconciliationStatus).toBe("AMBIGUOUS");
    expect(doc.state.global.matchedPledgeId).toBeNull();
  });

  it("OVERRIDE_MATCH wins over a previous MATCHED", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, recordEth());
    doc = reducer(doc, attachPledge({ pledgeId: PLEDGE_A }));
    doc = reducer(doc, overrideMatch({ pledgeId: PLEDGE_B }));
    expect(doc.state.global.matchedPledgeId).toBe(PLEDGE_B);
    expect(doc.state.global.reconciliationStatus).toBe("MANUALLY_OVERRIDDEN");
  });

  it("CLEAR_MATCH resets back to UNMATCHED", () => {
    let doc = utils.createDocument();
    doc = reducer(doc, recordEth());
    doc = reducer(doc, attachPledge({ pledgeId: PLEDGE_A }));
    doc = reducer(doc, clearMatch({ _: null }));
    expect(doc.state.global.matchedPledgeId).toBeNull();
    expect(doc.state.global.reconciliationStatus).toBe("UNMATCHED");
  });

  it("RECORD_RECEIPT supports ERC-20 receipts via contractAddress", () => {
    const doc = utils.createDocument();
    const next = reducer(
      doc,
      recordReceipt({
        chainId: 1,
        txHash: TX,
        blockNumber: 21_000_000,
        blockTimestamp: "2026-04-25T12:00:00.000Z",
        fromAddress: FROM,
        toAddress: TO,
        asset: {
          symbol: "USDC",
          contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        },
        amount: 1000000,
      }),
    );
    expect(next.state.global.asset?.contractAddress).toBe(
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    );
  });
});
