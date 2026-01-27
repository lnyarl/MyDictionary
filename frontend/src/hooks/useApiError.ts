import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { getErrorMessage, isApiError } from "@/lib/error-handler";

import { toast } from "./use-toast";

interface UseApiErrorOptions {
  showToast?: boolean;
}

export function useApiError(options: UseApiErrorOptions = {}) {
  const { showToast = true } = options;
  const { t } = useTranslation();

  const handleError = useCallback(
    (error: unknown) => {
      const message = getErrorMessage(error, t);
      const errorCode = isApiError(error) ? error.errorCode : null;

      if (showToast) {
        toast({
          variant: "destructive",
          description: message,
        });
      }

      return { message, errorCode };
    },
    [t, showToast],
  );

  const wrapAsync = useCallback(
    <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
      return asyncFn().catch((error) => {
        handleError(error);
        return null;
      });
    },
    [handleError],
  );

  return {
    handleError,
    wrapAsync,
    getErrorMessage: (error: unknown) => getErrorMessage(error, t),
  };
}
