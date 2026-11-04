import { useState, useEffect, useCallback } from "react";
import { TenderDetail } from "@/types/tender";
import { fetchJson, AppError, isAbortError } from "@/lib/api";

export interface UseTenderDetailResult {
  detail: TenderDetail | null;
  isLoading: boolean;
  error: AppError | null;
  refetch: () => void;
}

/**
 * Fetches the detail of one tender. The request is cancelled with
 * AbortController when the code changes or the component unmounts (PRD 10).
 * Mount with `key={code}` so state resets per tender.
 */
export function useTenderDetail(code: string | null): UseTenderDetailResult {
  const [detail, setDetail] = useState<TenderDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(code));
  const [error, setError] = useState<AppError | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState<number>(0);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setFetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!code) return;

    const controller = new AbortController();

    fetchJson<{ data: TenderDetail }>(`/api/tenders/${encodeURIComponent(code)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (controller.signal.aborted) return;
        setDetail(response.data);
        setError(null);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || isAbortError(err)) return;
        setError(
          err instanceof AppError
            ? err
            : new AppError("Gagal memuat detail tender.", "FETCH_DETAIL_FAILED")
        );
        setDetail(null);
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [code, fetchTrigger]);

  return {
    detail,
    isLoading: Boolean(code) && isLoading,
    error,
    refetch,
  };
}
