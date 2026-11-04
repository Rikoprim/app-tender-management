export const STORAGE_VERSION = "v1";

export interface VersionedPayload<T> {
  version: string;
  data: T;
  timestamp?: string;
}

/**
 * Check if window.localStorage is accessible and working.
 */
export function isStorageAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const testKey = "__tdm_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely get an item from localStorage with version validation.
 * If data is corrupted, version mismatch, or storage is blocked, returns defaultValue.
 */
export function getSafeItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return defaultValue;
    }

    const parsed = JSON.parse(raw) as VersionedPayload<T>;
    if (!parsed || typeof parsed !== "object" || parsed.version !== STORAGE_VERSION) {
      removeSafeItem(key);
      return defaultValue;
    }

    return parsed.data !== undefined ? parsed.data : defaultValue;
  } catch (err) {
    console.warn(`[storage] Gagal membaca key "${key}", kembali ke nilai default:`, err);
    removeSafeItem(key);
    return defaultValue;
  }
}

/**
 * Safely set an item into localStorage wrapped in a versioned envelope.
 * Handles quota exceeded and private browsing errors cleanly.
 */
export function setSafeItem<T>(key: string, data: T): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const payload: VersionedPayload<T> = {
      version: STORAGE_VERSION,
      data,
      timestamp: new Date().toISOString(),
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn(`[storage] Gagal menyimpan key "${key}":`, err);
    return false;
  }
}

/**
 * Safely remove an item from localStorage.
 */
export function removeSafeItem(key: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] Gagal menghapus key "${key}":`, err);
  }
}

/**
 * Clear all keys prefixed with 'tdm:'
 */
export function resetAllTdmStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("tdm:")) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      window.localStorage.removeItem(k);
    }
  } catch (err) {
    console.warn("[storage] Gagal mereset storage tdm:", err);
  }
}

