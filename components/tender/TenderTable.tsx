import React from "react";
import { Tender } from "@/types/tender";
import { TenderRow, TenderListItem } from "./TenderRow";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

type SortKey = "code" | "title" | "updatedAt";

export interface TenderTableProps {
  /** Array of tender rows to display. Accepts rows or tenders for flexibility. */
  rows?: Tender[];
  tenders?: Tender[];
  loading: boolean;
  sort: { key: SortKey; dir: "asc" | "desc" } | null;
  onSort: (key: SortKey) => void;
  onSelect: (tender: Tender) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  isDatasetEmpty?: boolean;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
}

const SKELETON_ROWS = 8;

export const TenderTable: React.FC<TenderTableProps> = ({
  rows,
  tenders,
  loading,
  sort,
  onSort,
  onSelect,
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  isDatasetEmpty,
  hasActiveFilters,
  onResetFilters,
}) => {
  const displayRows = rows ?? tenders ?? [];

  const renderSortIcon = (key: SortKey) => {
    if (!sort || sort.key !== key) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />;
    }
    return sort.dir === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-neutral-900" aria-hidden="true" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-neutral-900" aria-hidden="true" />
    );
  };

  const getAriaSort = (key: SortKey): "ascending" | "descending" | "none" => {
    if (!sort || sort.key !== key) return "none";
    return sort.dir === "asc" ? "ascending" : "descending";
  };

  const sortableHeader = (key: SortKey, label: string) => (
    <th
      scope="col"
      aria-sort={getAriaSort(key)}
      className="py-3 px-4 text-xs font-semibold uppercase tracking-wide text-neutral-600 whitespace-nowrap"
    >
      <button
        type="button"
        onClick={() => onSort(key)}
        disabled={loading}
        className="inline-flex items-center gap-1.5 uppercase tracking-wide rounded-sm cursor-pointer select-none hover:text-neutral-900 disabled:cursor-not-allowed"
      >
        <span>{label}</span>
        {renderSortIcon(key)}
      </button>
    </th>
  );

  const plainHeader = (label: string, className = "") => (
    <th
      scope="col"
      className={`py-3 px-4 text-xs font-semibold uppercase tracking-wide text-neutral-600 whitespace-nowrap ${className}`}
    >
      {label}
    </th>
  );

  const showEmpty = !loading && displayRows.length === 0;
  const isTrulyEmptyDataset = isDatasetEmpty ?? (!hasActiveFilters && totalItems === 0);

  const liveMessage = loading
    ? "Memuat daftar tender…"
    : totalItems === 0
    ? "Tidak ada tender untuk ditampilkan."
    : `Menampilkan ${startIndex} sampai ${endIndex} dari ${totalItems} tender.`;

  return (
    <div className="bg-white rounded-md border border-neutral-200 overflow-clip">
      <p role="status" aria-live="polite" className="sr-only">
        {liveMessage}
      </p>

      {/* Desktop / tablet table (>= 640px) */}
      <table className="w-full text-left border-collapse hidden sm:table" aria-busy={loading}>
        <caption className="sr-only">Daftar tender</caption>
        <thead className="bg-neutral-100 sticky top-0 z-10">
          <tr className="border-b border-neutral-200">
            {sortableHeader("code", "Kode")}
            {sortableHeader("title", "Judul")}
            {plainHeader("Instansi", "hidden lg:table-cell")}
            {plainHeader("Status")}
            {sortableHeader("updatedAt", "Diperbarui")}
            {plainHeader("Aksi", "text-right")}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {loading
            ? Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="py-3.5 px-4 w-full"><Skeleton className="h-4 w-full max-w-md" /></td>
                  <td className="py-3.5 px-4 hidden lg:table-cell"><Skeleton className="h-4 w-36" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-5 w-20" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-8 w-16 ml-auto" /></td>
                </tr>
              ))
            : displayRows.map((tender) => (
                <TenderRow key={tender.id} tender={tender} onSelect={onSelect} />
              ))}
        </tbody>
      </table>

      {/* Mobile stacked list (< 640px) */}
      <div className="sm:hidden" aria-busy={loading}>
        {loading ? (
          <div className="divide-y divide-neutral-200">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`mob-skeleton-${idx}`} className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        ) : (
          displayRows.length > 0 && (
            <ul className="divide-y divide-neutral-200" aria-label="Daftar tender">
              {displayRows.map((tender) => (
                <TenderListItem key={tender.id} tender={tender} onSelect={onSelect} />
              ))}
            </ul>
          )
        )}
      </div>

      {/* Empty states: "no data yet" differs from "no matching results" (PRD 4.6) */}
      {showEmpty && (
        <div className="p-4 sm:p-6 border-t border-neutral-200">
          {isTrulyEmptyDataset ? (
            <EmptyState
              title="Belum ada data tender"
              description="Belum ada dokumen tender yang diproses oleh pipeline ekstraksi."
            />
          ) : (
            <EmptyState
              title="Tidak ada tender yang cocok"
              description="Tidak ada tender yang sesuai dengan pencarian atau filter status yang dipilih."
              action={
                onResetFilters && (
                  <Button variant="outline" size="sm" onClick={onResetFilters}>
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Reset pencarian dan filter</span>
                  </Button>
                )
              }
            />
          )}
        </div>
      )}

      {/* Footer: count + pagination */}
      {!loading && totalItems > 0 && (
        <div className="py-3 px-4 border-t border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
          <p>
            Menampilkan{" "}
            <span className="font-semibold text-neutral-900">
              {startIndex}–{endIndex}
            </span>{" "}
            dari <span className="font-semibold text-neutral-900">{totalItems}</span>
          </p>

          <nav aria-label="Paginasi" className="flex items-center gap-2">
            <span className="mr-1">
              Halaman <span className="font-semibold text-neutral-900">{currentPage}</span> dari{" "}
              <span className="font-semibold text-neutral-900">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Halaman sebelumnya"
              className="w-8 px-0"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Halaman berikutnya"
              className="w-8 px-0"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
};
