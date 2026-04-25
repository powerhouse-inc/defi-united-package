export type ErrorCode =
  | "DependencyAlreadyResolvedError"
  | "PledgeAlreadyLinkedError"
  | "PledgeNotLinkedError"
  | "InvalidStatusTransitionError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DependencyAlreadyResolvedError
  extends Error
  implements ReducerError
{
  errorCode = "DependencyAlreadyResolvedError" as ErrorCode;
  constructor(message = "DependencyAlreadyResolvedError") {
    super(message);
  }
}

export class PledgeAlreadyLinkedError extends Error implements ReducerError {
  errorCode = "PledgeAlreadyLinkedError" as ErrorCode;
  constructor(message = "PledgeAlreadyLinkedError") {
    super(message);
  }
}

export class PledgeNotLinkedError extends Error implements ReducerError {
  errorCode = "PledgeNotLinkedError" as ErrorCode;
  constructor(message = "PledgeNotLinkedError") {
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

export const errors = {
  UpdateStatus: { DependencyAlreadyResolvedError },
  LinkPledge: { PledgeAlreadyLinkedError },
  UnlinkPledge: { PledgeNotLinkedError },
  Resolve: { DependencyAlreadyResolvedError, InvalidStatusTransitionError },
  Abandon: { InvalidStatusTransitionError },
};
