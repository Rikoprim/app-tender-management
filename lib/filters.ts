import { Tender, TenderStatus } from "@/types/tender";

/**
 * Filter tenders based on substring match in code or title.
 * Case-insensitive, trims leading/trailing spaces.
 * Safe against regex special characters by using substring search (`includes`).
 */
export function searchTenders(tenders: Tender[], query: string): Tender[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return tenders;
  }

  return tenders.filter((t) => {
    const codeMatch = t.code.toLowerCase().includes(trimmed);
    const titleMatch = t.title.toLowerCase().includes(trimmed);
    return codeMatch || titleMatch;
  });
}

/**
 * Filter tenders by status ("all" | "ingested" | "pending" | "failed").
 */
export function filterByStatus(
  tenders: Tender[],
  status: TenderStatus | "all"
): Tender[] {
  if (status === "all") {
    return tenders;
  }
  return tenders.filter((t) => t.status === status);
}

/**
 * Sort tenders by key and direction (asc | desc).
 * Returns a new array, does not mutate the original.
 */
export function sortTenders(
  tenders: Tender[],
  sort: { key: "code" | "title" | "updatedAt"; dir: "asc" | "desc" } | null
): Tender[] {
  if (!sort) {
    return tenders;
  }

  const { key, dir } = sort;
  const factor = dir === "asc" ? 1 : -1;

  return [...tenders].sort((a, b) => {
    if (key === "updatedAt") {
      const timeA = new Date(a.updatedAt).getTime();
      const timeB = new Date(b.updatedAt).getTime();
      return (timeA - timeB) * factor;
    }

    const valA = a[key] ?? "";
    const valB = b[key] ?? "";
    return valA.localeCompare(valB, "id", { sensitivity: "base" }) * factor;
  });
}

export interface PaginationResult {
  items: Tender[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Paginate an array of tenders.
 * Automatically clamps currentPage between 1 and totalPages.
 */
export function paginateTenders(
  tenders: Tender[],
  page: number,
  pageSize: number
): PaginationResult {
  const totalItems = tenders.length;
  const validPageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / validPageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const start = (safePage - 1) * validPageSize;
  const end = Math.min(start + validPageSize, totalItems);
  const items = tenders.slice(start, end);

  return {
    items,
    totalPages,
    totalItems,
    currentPage: safePage,
    startIndex: totalItems === 0 ? 0 : start + 1,
    endIndex: end,
  };
}

/**
 * Calculate count per status from a list of tenders.
 */
export function countByStatus(tenders: Tender[]): {
  all: number;
  ingested: number;
  pending: number;
  failed: number;
} {
  const counts = {
    all: tenders.length,
    ingested: 0,
    pending: 0,
    failed: 0,
  };

  for (const t of tenders) {
    if (t.status === "ingested") counts.ingested++;
    else if (t.status === "pending") counts.pending++;
    else if (t.status === "failed") counts.failed++;
  }

  return counts;
}

