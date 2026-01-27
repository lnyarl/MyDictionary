import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { ERROR_CODES, type ErrorCode } from "@stashy/shared";
import type { Request, Response } from "express";

import { BusinessException } from "../exceptions/business.exception";

interface ExceptionResponseObject {
  message?: string;
  error?: string;
  errorCode?: ErrorCode;
  details?: Record<string, unknown>;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let errorCode: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
    let details: Record<string, unknown> | undefined;

    if (exception instanceof BusinessException) {
      status = exception.getStatus();
      message = exception.message;
      errorCode = exception.errorCode;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const responseObj = exceptionResponse as ExceptionResponseObject;
        message = responseObj.message || exception.message;
        if (responseObj.errorCode) {
          errorCode = responseObj.errorCode;
        }
      }

      errorCode = this.mapHttpStatusToErrorCode(status, errorCode);
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} - [${errorCode}] ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details && { details }),
    });
  }

  private mapHttpStatusToErrorCode(status: HttpStatus, currentCode: ErrorCode): ErrorCode {
    if (currentCode !== ERROR_CODES.INTERNAL_SERVER_ERROR) {
      return currentCode;
    }

    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return ERROR_CODES.AUTH_UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ERROR_CODES.FORBIDDEN_ACCESS;
      case HttpStatus.NOT_FOUND:
        return ERROR_CODES.UNKNOWN_ERROR;
      case HttpStatus.BAD_REQUEST:
        return ERROR_CODES.VALIDATION_FAILED;
      default:
        return ERROR_CODES.INTERNAL_SERVER_ERROR;
    }
  }
}
