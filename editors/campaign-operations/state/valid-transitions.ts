export type PledgeStatusValue =
  | "PROPOSED"
  | "GOVERNANCE_PENDING"
  | "CONFIRMED"
  | "RECEIVED"
  | "CANCELLED"
  | "FAILED";

export type PledgeActionName =
  | "markGovernancePending"
  | "markConfirmed"
  | "markReceived"
  | "cancelPledge"
  | "failPledge";

export interface Transition {
  to: PledgeStatusValue;
  action: PledgeActionName;
  disabled?: boolean;
  disabledReason?: string;
}

export function validTransitions(
  current: PledgeStatusValue,
  hasReceipt: boolean,
): Transition[] {
  switch (current) {
    case "PROPOSED":
      return [
        { to: "GOVERNANCE_PENDING", action: "markGovernancePending" },
        { to: "CANCELLED", action: "cancelPledge" },
      ];
    case "GOVERNANCE_PENDING":
      return [
        { to: "CONFIRMED", action: "markConfirmed" },
        { to: "FAILED", action: "failPledge" },
        { to: "CANCELLED", action: "cancelPledge" },
      ];
    case "CONFIRMED":
      return [
        hasReceipt
          ? { to: "RECEIVED", action: "markReceived" }
          : {
              to: "RECEIVED",
              action: "markReceived",
              disabled: true,
              disabledReason: "No matching receipt attributed yet",
            },
        { to: "CANCELLED", action: "cancelPledge" },
      ];
    case "RECEIVED":
    case "CANCELLED":
    case "FAILED":
      return [];
  }
}
