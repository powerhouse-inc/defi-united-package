export type ErrorCode = "ReceiptAlreadyRecordedError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class ReceiptAlreadyRecordedError extends Error implements ReducerError {
  errorCode = "ReceiptAlreadyRecordedError" as ErrorCode;
  constructor(message = "ReceiptAlreadyRecordedError") {
    super(message);
  }
}

export const errors = {
  RecordReceipt: { ReceiptAlreadyRecordedError },
};
