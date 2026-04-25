export type ErrorCode =
  | "InvalidStatusTransitionError"
  | "DuplicateRecipientError"
  | "RecipientNotFoundError"
  | "PlanNotApprovedError";

export interface ReducerError {
  errorCode: ErrorCode;
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

export class DuplicateRecipientError extends Error implements ReducerError {
  errorCode = "DuplicateRecipientError" as ErrorCode;
  constructor(message = "DuplicateRecipientError") {
    super(message);
  }
}

export class RecipientNotFoundError extends Error implements ReducerError {
  errorCode = "RecipientNotFoundError" as ErrorCode;
  constructor(message = "RecipientNotFoundError") {
    super(message);
  }
}

export class PlanNotApprovedError extends Error implements ReducerError {
  errorCode = "PlanNotApprovedError" as ErrorCode;
  constructor(message = "PlanNotApprovedError") {
    super(message);
  }
}

export const errors = {
  AddRecipient: { InvalidStatusTransitionError, DuplicateRecipientError },
  UpdateRecipient: { InvalidStatusTransitionError, RecipientNotFoundError },
  RemoveRecipient: { InvalidStatusTransitionError, RecipientNotFoundError },
  ApprovePlan: { InvalidStatusTransitionError },
  MarkRecipientSent: { PlanNotApprovedError, RecipientNotFoundError },
  MarkRecipientFailed: { PlanNotApprovedError, RecipientNotFoundError },
  MarkRecipientRefunded: { PlanNotApprovedError, RecipientNotFoundError },
  CompleteDistribution: { InvalidStatusTransitionError },
  CancelPlan: { InvalidStatusTransitionError },
};
