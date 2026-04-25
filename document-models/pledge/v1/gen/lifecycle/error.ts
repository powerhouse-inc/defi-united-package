export type ErrorCode =
  | "PledgeAlreadyProposedError"
  | "InvalidStatusTransitionError"
  | "GovernanceRequiredForPendingError"
  | "ReceivedExceedsPledgedError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class PledgeAlreadyProposedError extends Error implements ReducerError {
  errorCode = "PledgeAlreadyProposedError" as ErrorCode;
  constructor(message = "PledgeAlreadyProposedError") {
    super(message);
  }
}

export class InvalidStatusTransitionError
  extends Error
  implements ReducerError
{
  errorCode = "InvalidStatusTransitionError" as ErrorCode;
  constructor(message = "InvalidStatusTransitionError") {
    super(message);
  }
}

export class GovernanceRequiredForPendingError
  extends Error
  implements ReducerError
{
  errorCode = "GovernanceRequiredForPendingError" as ErrorCode;
  constructor(message = "GovernanceRequiredForPendingError") {
    super(message);
  }
}

export class ReceivedExceedsPledgedError extends Error implements ReducerError {
  errorCode = "ReceivedExceedsPledgedError" as ErrorCode;
  constructor(message = "ReceivedExceedsPledgedError") {
    super(message);
  }
}

export const errors = {
  ProposePledge: { PledgeAlreadyProposedError },
  MarkGovernancePending: {
    InvalidStatusTransitionError,
    GovernanceRequiredForPendingError,
  },
  MarkConfirmed: { InvalidStatusTransitionError },
  MarkReceived: { InvalidStatusTransitionError, ReceivedExceedsPledgedError },
  CancelPledge: { InvalidStatusTransitionError },
  FailPledge: { InvalidStatusTransitionError },
};
