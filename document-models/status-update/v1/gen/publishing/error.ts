export type ErrorCode =
  | "UpdateAlreadyPublishedError"
  | "MissingTitleOrBodyError"
  | "UpdateNotPublishedError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateAlreadyPublishedError extends Error implements ReducerError {
  errorCode = "UpdateAlreadyPublishedError" as ErrorCode;
  constructor(message = "UpdateAlreadyPublishedError") {
    super(message);
  }
}

export class MissingTitleOrBodyError extends Error implements ReducerError {
  errorCode = "MissingTitleOrBodyError" as ErrorCode;
  constructor(message = "MissingTitleOrBodyError") {
    super(message);
  }
}

export class UpdateNotPublishedError extends Error implements ReducerError {
  errorCode = "UpdateNotPublishedError" as ErrorCode;
  constructor(message = "UpdateNotPublishedError") {
    super(message);
  }
}

export const errors = {
  PublishUpdate: { UpdateAlreadyPublishedError, MissingTitleOrBodyError },

  RetractUpdate: { UpdateNotPublishedError },
};
