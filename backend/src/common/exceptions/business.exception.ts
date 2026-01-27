import { HttpException, HttpStatus } from "@nestjs/common";
import type { ErrorCode } from "@stashy/shared";

export class BusinessException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(
    errorCode: ErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: Record<string, unknown>,
  ) {
    super(
      {
        errorCode,
        message,
        details,
      },
      statusCode,
    );
    this.errorCode = errorCode;
    this.details = details;
  }
}
export const badRequest = (
  errorCode: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
) => {
  return new BusinessException(errorCode, message, HttpStatus.BAD_REQUEST, details);
};

export const unauthorized = (errorCode: ErrorCode, message: string) => {
  return new BusinessException(errorCode, message, HttpStatus.UNAUTHORIZED);
};

export const forbidden = (errorCode: ErrorCode, message: string) => {
  return new BusinessException(errorCode, message, HttpStatus.FORBIDDEN);
};

export const notFound = (errorCode: ErrorCode, message: string) => {
  return new BusinessException(errorCode, message, HttpStatus.NOT_FOUND);
};

export const conflict = (errorCode: ErrorCode, message: string) => {
  return new BusinessException(errorCode, message, HttpStatus.CONFLICT);
};

export const internal = (errorCode: ErrorCode, message: string) => {
  return new BusinessException(errorCode, message, HttpStatus.INTERNAL_SERVER_ERROR);
};
