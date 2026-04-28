import { describe, it, expect } from "vitest";
import { validTransitions } from "../state/valid-transitions.js";

describe("validTransitions", () => {
  it("PROPOSED can go to GOVERNANCE_PENDING or CANCELLED", () => {
    expect(validTransitions("PROPOSED", false)).toEqual([
      { to: "GOVERNANCE_PENDING", action: "markGovernancePending" },
      { to: "CANCELLED", action: "cancelPledge" },
    ]);
  });

  it("GOVERNANCE_PENDING can go to CONFIRMED, FAILED, or CANCELLED", () => {
    expect(validTransitions("GOVERNANCE_PENDING", false)).toEqual([
      { to: "CONFIRMED", action: "markConfirmed" },
      { to: "FAILED", action: "failPledge" },
      { to: "CANCELLED", action: "cancelPledge" },
    ]);
  });

  it("CONFIRMED → RECEIVED requires a receipt", () => {
    const noReceipt = validTransitions("CONFIRMED", false);
    expect(noReceipt[0].to).toBe("RECEIVED");
    expect(noReceipt[0].disabled).toBe(true);
    expect(noReceipt[0].disabledReason).toBe("No matching receipt attributed yet");
    expect(noReceipt[1]).toEqual({ to: "CANCELLED", action: "cancelPledge" });

    const hasReceipt = validTransitions("CONFIRMED", true);
    expect(hasReceipt[0]).toEqual({ to: "RECEIVED", action: "markReceived" });
    expect(hasReceipt[1]).toEqual({ to: "CANCELLED", action: "cancelPledge" });
  });

  it("RECEIVED, CANCELLED, FAILED are terminal", () => {
    expect(validTransitions("RECEIVED", false)).toEqual([]);
    expect(validTransitions("CANCELLED", false)).toEqual([]);
    expect(validTransitions("FAILED", false)).toEqual([]);
  });
});
