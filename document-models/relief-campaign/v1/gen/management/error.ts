export type ErrorCode =
  | "DuplicateContributionAddressError"
  | "ContributionAddressNotFoundError"
  | "InvalidStatusTransitionError"
  | "MissingCampaignSlugError"
  | "MissingContributionAddressError"
  | "DuplicateOperatorWalletError"
  | "OperatorWalletNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateContributionAddressError
  extends Error
  implements ReducerError
{
  errorCode = "DuplicateContributionAddressError" as ErrorCode;
  constructor(message = "DuplicateContributionAddressError") {
    super(message);
  }
}

export class ContributionAddressNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "ContributionAddressNotFoundError" as ErrorCode;
  constructor(message = "ContributionAddressNotFoundError") {
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

export class MissingCampaignSlugError extends Error implements ReducerError {
  errorCode = "MissingCampaignSlugError" as ErrorCode;
  constructor(message = "MissingCampaignSlugError") {
    super(message);
  }
}

export class MissingContributionAddressError
  extends Error
  implements ReducerError
{
  errorCode = "MissingContributionAddressError" as ErrorCode;
  constructor(message = "MissingContributionAddressError") {
    super(message);
  }
}

export class DuplicateOperatorWalletError
  extends Error
  implements ReducerError
{
  errorCode = "DuplicateOperatorWalletError" as ErrorCode;
  constructor(message = "DuplicateOperatorWalletError") {
    super(message);
  }
}

export class OperatorWalletNotFoundError extends Error implements ReducerError {
  errorCode = "OperatorWalletNotFoundError" as ErrorCode;
  constructor(message = "OperatorWalletNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddContributionAddress: { DuplicateContributionAddressError },
  RemoveContributionAddress: { ContributionAddressNotFoundError },
  StartCampaign: {
    InvalidStatusTransitionError,
    MissingCampaignSlugError,
    MissingContributionAddressError,
  },
  MarkResolved: { InvalidStatusTransitionError },
  MarkFailed: { InvalidStatusTransitionError },
  ArchiveCampaign: { InvalidStatusTransitionError },
  AddOperatorWallet: { DuplicateOperatorWalletError },
  RemoveOperatorWallet: { OperatorWalletNotFoundError },
};
