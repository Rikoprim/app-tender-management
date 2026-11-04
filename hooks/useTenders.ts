import { useState, useEffect, useCallback } from "react";
import { Tender, CachedTenders } from "@/types/tender";
import { fetchJson, AppError, isAbortError } from "@/lib/api";
import { getSafeItem, setSafeItem } from "@/store/storage";

export const CACHE_KEY = "tdm:cache";

export interface UseTendersResult {
  tenders: Tender[];
  isLoading: boolean;
  error: AppError | null;
  isCachedFallback: boolean;
  cachedTimestamp: string | null;
  refetch: () => void;
}

function isTenderArray(value: unknown): value is Tender[] {
  return (
    Array.isArray(value) &&
    value.every(
      (t) =>
        t &&
        typeof t === "object" &&
        typeof (t as Tender).code === "string" &&
        typeof (t as Tender).title === "string" &&
        typeof (t as Tender).status === "string"
    )
  );
}

export function useTenders(): UseTendersResult {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);
  const [isCachedFallback, setIsCachedFallback] = useState<boolean>(false);
  const [cachedTimestamp, setCachedTimestamp] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState<number>(0);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setFetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchJson<{ data: Tender[] }>("/api/tenders", { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        const data = isTenderArray(response?.data) ? response.data : [];
        setTenders(data);
        setError(null);
        setIsCachedFallback(false);
        setCachedTimestamp(null);

        const cachePayload: CachedTenders = {
          version: "v1",
          timestamp: new Date().toISOString(),
          data,
        };
        setSafeItem(CACHE_KEY, cachePayload);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || isAbortError(err)) return;

        setError(
          err instanceof AppError ? err : new AppError("Gagal memuat data tender.", "FETCH_FAILED")
        );

        const cached = getSafeItem<CachedTenders | null>(CACHE_KEY, null);
        if (cached && isTenderArray(cached.data) && cached.data.length > 0) {
          setTenders(cached.data);
          setIsCachedFallback(true);
          setCachedTimestamp(typeof cached.timestamp === "string" ? cached.timestamp : null);
        } else {
          setTenders([]);
          setIsCachedFallback(false);
          setCachedTimestamp(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [fetchTrigger]);

  return { tenders, isLoading, error, isCachedFallback, cachedTimestamp, refetch };
}
