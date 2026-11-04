import { describe, it, expect } from "vitest";
import {
  searchTenders,
  filterByStatus,
  sortTenders,
  paginateTenders,
  countByStatus,
} from "../lib/filters";
import { Tender } from "../types/tender";

const MOCK_DATA: Tender[] = [
  {
    id: "1",
    code: "TND-2026-0001",
    title: "Pengadaan Komputer Kantor",
    agency: "Kemenkeu",
    status: "ingested",
    updatedAt: "2026-11-01T10:00:00.000Z",
  },
  {
    id: "2",
    code: "TND-2026-0002",
    title: "Pembangunan Jembatan Beton",
    agency: "PUPR",
    status: "pending",
    updatedAt: "2026-11-02T12:00:00.000Z",
  },
  {
    id: "3",
    code: "TND-2026-0003",
    title: "Renovasi Rumah Sakit Umum",
    agency: "Kemenkes",
    status: "failed",
    updatedAt: "2026-11-03T08:00:00.000Z",
  },
  {
    id: "4",
    code: "TND-2026-0004",
    title: "Pengadaan Alat Kesehatan",
    agency: "Kemenkes",
    status: "ingested",
    updatedAt: "2026-10-30T14:00:00.000Z",
  },
];

describe("filters.ts", () => {
  describe("searchTenders", () => {
    it("returns all items when query is empty or spaces only", () => {
      expect(searchTenders(MOCK_DATA, "")).toHaveLength(4);
      expect(searchTenders(MOCK_DATA, "   ")).toHaveLength(4);
    });

    it("matches substring in code case-insensitively", () => {
      const results = searchTenders(MOCK_DATA, "tnd-2026-0002");
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe("TND-2026-0002");
    });

    it("matches substring in title case-insensitively", () => {
      const results = searchTenders(MOCK_DATA, "pengadaan");
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.id)).toEqual(["1", "4"]);
    });

    it("handles regex special characters safely without crashing", () => {
      expect(() => searchTenders(MOCK_DATA, ".*[a-z]+(?=test)")).not.toThrow();
      const results = searchTenders(MOCK_DATA, ".*[a-z]+(?=test)");
      expect(results).toHaveLength(0);
    });
  });

  describe("filterByStatus", () => {
    it("returns all items when status is 'all'", () => {
      expect(filterByStatus(MOCK_DATA, "all")).toHaveLength(4);
    });

    it("filters accurately by ingested, pending, and failed", () => {
      expect(filterByStatus(MOCK_DATA, "ingested")).toHaveLength(2);
      expect(filterByStatus(MOCK_DATA, "pending")).toHaveLength(1);
      expect(filterByStatus(MOCK_DATA, "failed")).toHaveLength(1);
    });
  });

  describe("sortTenders", () => {
    it("returns original order when sort is null", () => {
      const sorted = sortTenders(MOCK_DATA, null);
      expect(sorted.map((r) => r.id)).toEqual(["1", "2", "3", "4"]);
    });

    it("sorts by code ascending and descending", () => {
      const asc = sortTenders(MOCK_DATA, { key: "code", dir: "asc" });
      expect(asc[0].code).toBe("TND-2026-0001");
      expect(asc[3].code).toBe("TND-2026-0004");

      const desc = sortTenders(MOCK_DATA, { key: "code", dir: "desc" });
      expect(desc[0].code).toBe("TND-2026-0004");
      expect(desc[3].code).toBe("TND-2026-0001");
    });

    it("sorts by updatedAt accurately based on timestamp", () => {
      const desc = sortTenders(MOCK_DATA, { key: "updatedAt", dir: "desc" });
      expect(desc[0].id).toBe("3");
      expect(desc[3].id).toBe("4");
    });

    it("sorts by title alphabetically", () => {
      const asc = sortTenders(MOCK_DATA, { key: "title", dir: "asc" });
      expect(asc[0].title).toBe("Pembangunan Jembatan Beton");
    });
  });

  describe("paginateTenders", () => {
    it("paginates items with correct start/end indices", () => {
      const page1 = paginateTenders(MOCK_DATA, 1, 2);
      expect(page1.items).toHaveLength(2);
      expect(page1.totalPages).toBe(2);
      expect(page1.startIndex).toBe(1);
      expect(page1.endIndex).toBe(2);
      expect(page1.currentPage).toBe(1);

      const page2 = paginateTenders(MOCK_DATA, 2, 2);
      expect(page2.items).toHaveLength(2);
      expect(page2.startIndex).toBe(3);
      expect(page2.endIndex).toBe(4);
      expect(page2.currentPage).toBe(2);
    });

    it("clamps page out of bounds safely", () => {
      const clampedHigh = paginateTenders(MOCK_DATA, 999, 2);
      expect(clampedHigh.currentPage).toBe(2);

      const clampedLow = paginateTenders(MOCK_DATA, -5, 2);
      expect(clampedLow.currentPage).toBe(1);
    });

    it("handles empty items array gracefully", () => {
      const empty = paginateTenders([], 1, 10);
      expect(empty.items).toHaveLength(0);
      expect(empty.totalItems).toBe(0);
      expect(empty.totalPages).toBe(1);
      expect(empty.startIndex).toBe(0);
      expect(empty.endIndex).toBe(0);
    });
  });

  describe("countByStatus", () => {
    it("computes status distribution accurately", () => {
      const counts = countByStatus(MOCK_DATA);
      expect(counts.all).toBe(4);
      expect(counts.ingested).toBe(2);
      expect(counts.pending).toBe(1);
      expect(counts.failed).toBe(1);
    });
  });
});

