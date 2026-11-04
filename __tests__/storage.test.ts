import { describe, it, expect, beforeEach, vi, beforeAll } from "vitest";
import {
  getSafeItem,
  setSafeItem,
  resetAllTdmStorage,
} from "../store/storage";

class LocalStorageMock {
  private store: Record<string, string> = {};

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe("storage.ts", () => {
  beforeAll(() => {
    const mockStorage = new LocalStorageMock();
    Object.defineProperty(globalThis, "window", {
      value: { localStorage: mockStorage },
      writable: true,
      configurable: true,
    });
  });

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("stores and retrieves versioned payload successfully", () => {
    const success = setSafeItem("tdm:test", { foo: "bar" });
    expect(success).toBe(true);

    const retrieved = getSafeItem("tdm:test", { foo: "default" });
    expect(retrieved).toEqual({ foo: "bar" });
  });

  it("discards data and returns default value on corrupted JSON", () => {
    window.localStorage.setItem("tdm:corrupted", "{ broken json invalid ... ");
    const retrieved = getSafeItem("tdm:corrupted", "fallback");
    expect(retrieved).toBe("fallback");
    expect(window.localStorage.getItem("tdm:corrupted")).toBeNull();
  });

  it("discards data and returns default value on schema version mismatch", () => {
    window.localStorage.setItem(
      "tdm:old_version",
      JSON.stringify({ version: "v0_ancient", data: { obsolete: true } })
    );

    const retrieved = getSafeItem("tdm:old_version", { obsolete: false });
    expect(retrieved).toEqual({ obsolete: false });
    expect(window.localStorage.getItem("tdm:old_version")).toBeNull();
  });

  it("handles localStorage quota exceeded or write errors gracefully without throwing", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError", "QuotaExceededError");
    });

    expect(() => setSafeItem("tdm:quota_fail", { data: 123 })).not.toThrow();
    const result = setSafeItem("tdm:quota_fail", { data: 123 });
    expect(result).toBe(false);
  });

  it("resets all and only keys prefixed with 'tdm:'", () => {
    setSafeItem("tdm:ui", { query: "test" });
    setSafeItem("tdm:notes", { TND: "note" });
    window.localStorage.setItem("other_app_key", "keep_me");

    resetAllTdmStorage();

    expect(window.localStorage.getItem("tdm:ui")).toBeNull();
    expect(window.localStorage.getItem("tdm:notes")).toBeNull();
    expect(window.localStorage.getItem("other_app_key")).toBe("keep_me");
  });
});
