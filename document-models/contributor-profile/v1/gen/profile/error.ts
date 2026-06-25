export type ErrorCode =
  | "DuplicateWalletError"
  | "WalletNotFoundError"
  | "DuplicateGovernanceEndpointError"
  | "GovernanceEndpointNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateWalletError extends Error implements ReducerError {
  errorCode = "DuplicateWalletError" as ErrorCode;
  constructor(message = "DuplicateWalletError") {
    super(message);
  }
}

export class WalletNotFoundError extends Error implements ReducerError {
  errorCode = "WalletNotFoundError" as ErrorCode;
  constructor(message = "WalletNotFoundError") {
    super(message);
  }
}

export class DuplicateGovernanceEndpointError
  extends Error
  implements ReducerError
{
  errorCode = "DuplicateGovernanceEndpointError" as ErrorCode;
  constructor(message = "DuplicateGovernanceEndpointError") {
    super(message);
  }
}

export class GovernanceEndpointNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "GovernanceEndpointNotFoundError" as ErrorCode;
  constructor(message = "GovernanceEndpointNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddWallet: { DuplicateWalletError },

  RemoveWallet: { WalletNotFoundError },

  AddGovernanceEndpoint: { DuplicateGovernanceEndpointError },

  RemoveGovernanceEndpoint: { GovernanceEndpointNotFoundError },
};
