import type { TFunction } from "i18next";

export interface ApiErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string;
  timestamp?: string;
  path?: string;
  details?: Record<string, unknown>;
}

export function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    "errorCode" in error &&
    typeof (error as ApiErrorResponse).statusCode === "number" &&
    typeof (error as ApiErrorResponse).errorCode === "string"
  );
}

export function getErrorMessage(error: unknown, t: TFunction): string {
  if (isApiError(error)) {
    const translatedMessage = t(error.errorCode, { ns: "errors", defaultValue: "" });
    if (translatedMessage && translatedMessage !== error.errorCode) {
      return translatedMessage;
    }
    return error.message || t("UNKNOWN_ERROR", { ns: "errors" });
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return t("UNKNOWN_ERROR", { ns: "errors" });
}

export function getErrorCode(error: unknown): string | null {
  if (isApiError(error)) {
    return error.errorCode;
  }
  return null;
}
