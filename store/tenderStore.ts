import { create } from "zustand";
import { TenderStatus, UiPrefs } from "@/types/tender";
import {
  getSafeItem,
  setSafeItem,
  resetAllTdmStorage,
  isStorageAvailable,
} from "./storage";

export const UI_PREFS_KEY = "tdm:ui";
export const NOTES_KEY = "tdm:notes";

type SortState = UiPrefs["sort"];
type SortKey = "code" | "title" | "updatedAt";

const DEFAULT_UI_PREFS: UiPrefs = {
  query: "",
  status: "all",
  sort: null,
  pageSize: 10,
};

const VALID_STATUSES: ReadonlyArray<UiPrefs["status"]> = ["all", "ingested", "pending", "failed"];
const VALID_SORT_KEYS: ReadonlyArray<SortKey> = ["code", "title", "updatedAt"];

/** Validate a stored UiPrefs payload field-by-field; fall back to defaults on anything odd. */
function sanitizeUiPrefs(raw: unknown): UiPrefs {
  if (!raw || typeof raw !== "object") return DEFAULT_UI_PREFS;
  const r = raw as Partial<Record<keyof UiPrefs, unknown>>;

  const query = typeof r.query === "string" ? r.query.slice(0, 200) : "";
  const status = VALID_STATUSES.includes(r.status as UiPrefs["status"])
    ? (r.status as UiPrefs["status"])
    : "all";

  let sort: SortState = null;
  if (r.sort && typeof r.sort === "object") {
    const s = r.sort as { key?: unknown; dir?: unknown };
    if (VALID_SORT_KEYS.includes(s.key as SortKey) && (s.dir === "asc" || s.dir === "desc")) {
      sort = { key: s.key as SortKey, dir: s.dir };
    }
  }

  const pageSize =
    typeof r.pageSize === "number" && Number.isInteger(r.pageSize) && r.pageSize > 0 && r.pageSize <= 100
      ? r.pageSize
      : DEFAULT_UI_PREFS.pageSize;

  return { query, status, sort, pageSize };
}

function sanitizeNotes(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v.slice(0, 1000);
  }
  return out;
}

export interface TenderState extends UiPrefs {
  /** Current page (session only, not persisted — PRD 4.5 stores page size only) */
  currentPage: number;
  /** Tender opened in the detail modal */
  selectedCode: string | null;
  /** Review notes keyed by tender code */
  notes: Record<string, string>;
  /** true once localStorage has been read on the client */
  isHydrated: boolean;
  /** false when localStorage is unavailable / failing (memory-only mode) */
  storageOk: boolean;

  setQuery: (query: string) => void;
  setStatus: (status: TenderStatus | "all") => void;
  toggleSort: (key: SortKey) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetFilters: () => void;
  setSelectedCode: (code: string | null) => void;
  setNote: (code: string, note: string) => void;
  resetAll: () => void;
  hydrate: () => void;
}

export const useTenderStore = create<TenderState>((set, get) => {
  /** Persist UI prefs, but never before hydration (would overwrite saved data). */
  const persistUi = () => {
    const s = get();
    if (!s.isHydrated) return;
    const prefs: UiPrefs = {
      query: s.query,
      status: s.status,
      sort: s.sort,
      pageSize: s.pageSize,
    };
    const ok = setSafeItem(UI_PREFS_KEY, prefs);
    if (!ok && s.storageOk) set({ storageOk: false });
  };

  return {
    ...DEFAULT_UI_PREFS,
    currentPage: 1,
    selectedCode: null,
    notes: {},
    isHydrated: false,
    storageOk: true,

    setQuery: (query) => {
      if (query === get().query) return;
      set({ query, currentPage: 1 });
      persistUi();
    },

    setStatus: (status) => {
      if (status === get().status) return;
      set({ status, currentPage: 1 });
      persistUi();
    },

    toggleSort: (key) => {
      const current = get().sort;
      let next: SortState;
      if (!current || current.key !== key) next = { key, dir: "asc" };
      else if (current.dir === "asc") next = { key, dir: "desc" };
      else next = null;
      set({ sort: next, currentPage: 1 });
      persistUi();
    },

    setPage: (currentPage) => set({ currentPage: Math.max(1, currentPage) }),

    setPageSize: (pageSize) => {
      set({ pageSize, currentPage: 1 });
      persistUi();
    },

    resetFilters: () => {
      set({ query: "", status: "all", sort: null, currentPage: 1 });
      persistUi();
    },

    setSelectedCode: (selectedCode) => set({ selectedCode }),

    setNote: (code, note) => {
      const updated = { ...get().notes, [code]: note.slice(0, 1000) };
      set({ notes: updated });
      if (!get().isHydrated) return;
      const ok = setSafeItem(NOTES_KEY, updated);
      if (!ok && get().storageOk) set({ storageOk: false });
    },

    resetAll: () => {
      resetAllTdmStorage();
      set({ ...DEFAULT_UI_PREFS, currentPage: 1, notes: {} });
    },

    hydrate: () => {
      if (typeof window === "undefined") return;
      const storageOk = isStorageAvailable();
      const ui = sanitizeUiPrefs(getSafeItem<unknown>(UI_PREFS_KEY, DEFAULT_UI_PREFS));
      const notes = sanitizeNotes(getSafeItem<unknown>(NOTES_KEY, {}));
      set({ ...ui, notes, isHydrated: true, storageOk });
    },
  };
});

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === null || event.key === UI_PREFS_KEY || event.key === NOTES_KEY) {
      const { query, status } = useTenderStore.getState();
      useTenderStore.getState().hydrate();
      const next = useTenderStore.getState();
      if (next.query !== query || next.status !== status) {
        useTenderStore.setState({ currentPage: 1 });
      }
    }
  });
}
