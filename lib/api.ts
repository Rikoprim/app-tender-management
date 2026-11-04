export class AppError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "UNKNOWN_ERROR", status = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

/** Code used when the caller aborts the request (e.g. modal closed). UI should ignore it. */
export const ABORTED_CODE = "ABORTED";

export function isAbortError(err: unknown): boolean {
  return err instanceof AppError && err.code === ABORTED_CODE;
}

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

const STATUS_MESSAGES: Record<number, string> = {
  404: "Data yang diminta tidak ditemukan.",
  500: "Terjadi kesalahan pada server.",
  503: "Layanan sedang tidak tersedia. Silakan coba beberapa saat lagi.",
};

export async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { timeoutMs = 10000, signal: externalSignal, ...fetchInit } = options;

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", onExternalAbort, { once: true });
  }

  try {
    const res = await fetch(url, { ...fetchInit, signal: controller.signal });

    if (!res.ok) {
      let code = `HTTP_${res.status}`;
      let message = STATUS_MESSAGES[res.status] ?? `Permintaan gagal (status ${res.status}).`;
      try {
        const body: unknown = await res.json();
        if (body && typeof body === "object" && "error" in body) {
          const e = (body as { error?: { code?: unknown; message?: unknown } }).error;
          if (typeof e?.code === "string") code = e.code;
          if (typeof e?.message === "string") message = e.message;
        }
      } catch {
      }
      throw new AppError(message, code, res.status);
    }

    return (await res.json()) as T;
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;

    const isAbort =
      (error instanceof DOMException && error.name === "AbortError") ||
      (error instanceof Error && error.name === "AbortError");

    if (isAbort) {
      if (timedOut) {
        throw new AppError("Permintaan melebihi batas waktu. Periksa koneksi Anda lalu coba lagi.", "TIMEOUT", 408);
      }
      throw new AppError("Permintaan dibatalkan.", ABORTED_CODE, 0);
    }

    if (error instanceof TypeError) {
      throw new AppError("Tidak dapat terhubung ke server. Periksa koneksi jaringan Anda.", "NETWORK_ERROR", 0);
    }

    if (error instanceof SyntaxError) {
      throw new AppError("Respons server tidak valid.", "INVALID_RESPONSE", 500);
    }

    const message = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak terduga.";
    throw new AppError(message, "UNKNOWN_ERROR", 500);
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", onExternalAbort);
  }
}
