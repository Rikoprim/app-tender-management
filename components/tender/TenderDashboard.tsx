"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTenderStore } from "@/store/tenderStore";
import { useTenders } from "@/hooks/useTenders";
import {
  searchTenders,
  filterByStatus,
  sortTenders,
  paginateTenders,
  countByStatus,
} from "@/lib/filters";
import { formatDate } from "@/lib/format";
import { TenderToolbar } from "./TenderToolbar";
import { TenderTable } from "./TenderTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { AlertCircle, Database, X } from "lucide-react";
import { Tender } from "@/types/tender";

const TenderDetailModal = dynamic(
  () => import("./TenderDetailModal").then((mod) => mod.TenderDetailModal),
  { ssr: false }
);

export const TenderDashboard: React.FC = () => {
  const query = useTenderStore((state) => state.query);
  const status = useTenderStore((state) => state.status);
  const sort = useTenderStore((state) => state.sort);
  const pageSize = useTenderStore((state) => state.pageSize);
  const currentPage = useTenderStore((state) => state.currentPage);
  const selectedCode = useTenderStore((state) => state.selectedCode);
  const isHydrated = useTenderStore((state) => state.isHydrated);

  const setQuery = useTenderStore((state) => state.setQuery);
  const setStatus = useTenderStore((state) => state.setStatus);
  const toggleSort = useTenderStore((state) => state.toggleSort);
  const setPage = useTenderStore((state) => state.setPage);
  const resetFilters = useTenderStore((state) => state.resetFilters);
  const setSelectedCode = useTenderStore((state) => state.setSelectedCode);
  const resetAll = useTenderStore((state) => state.resetAll);
  const hydrate = useTenderStore((state) => state.hydrate);

  const {
    tenders,
    isLoading,
    error,
    isCachedFallback,
    cachedTimestamp,
    refetch,
  } = useTenders();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (typeof window === "undefined" || isLoading) return;

    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("tender");

    if (codeParam && tenders.length > 0) {
      const match = tenders.find(
        (t) => t.code.toLowerCase() === codeParam.trim().toLowerCase()
      );
      if (match) {
        setSelectedCode(match.code);
      } else {
        setTimeout(() => {
          setToastMessage(`Tender dengan kode "${codeParam}" tidak ditemukan.`);
        }, 0);
        params.delete("tender");
        const nextUrl = `${window.location.pathname}${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        window.history.replaceState({}, "", nextUrl);
      }
    }
  }, [isLoading, tenders, setSelectedCode]);

  const handleSelectTender = (tender: Tender) => {
    setSelectedCode(tender.code);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("tender", tender.code);
      window.history.pushState({}, "", `?${params.toString()}`);
    }
  };

  const handleCloseModal = () => {
    setSelectedCode(null);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.delete("tender");
      const nextQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
      window.history.pushState({}, "", nextQuery);
    }
  };

  const searchedTenders = useMemo(() => {
    return searchTenders(tenders, query);
  }, [tenders, query]);

  const statusCounts = useMemo(() => {
    return countByStatus(searchedTenders);
  }, [searchedTenders]);

  const filteredTenders = useMemo(() => {
    return filterByStatus(searchedTenders, status);
  }, [searchedTenders, status]);

  const sortedTenders = useMemo(() => {
    return sortTenders(filteredTenders, sort);
  }, [filteredTenders, sort]);

  const pagination = useMemo(() => {
    return paginateTenders(sortedTenders, currentPage, pageSize);
  }, [sortedTenders, currentPage, pageSize]);

  const initialModalTender = useMemo(() => {
    if (!selectedCode) return null;
    return tenders.find((t) => t.code === selectedCode) || null;
  }, [selectedCode, tenders]);

  const hasActiveFilters = Boolean(query.trim() || status !== "all" || sort !== null);

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" aria-hidden="true" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-amber-700 hover:text-amber-950 p-1 cursor-pointer"
            aria-label="Tutup pemberitahuan"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Cache Fallback Banner */}
      {isCachedFallback && (
        <div
          role="status"
          className="p-3.5 bg-neutral-100 border border-neutral-300 rounded-md text-neutral-800 text-xs flex flex-wrap items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-neutral-600 flex-shrink-0" aria-hidden="true" />
            <span>
              Menampilkan data tersimpan dari{" "}
              <strong className="font-semibold text-neutral-900">
                {formatDate(cachedTimestamp, true)}
              </strong>
              . Sambungan ke server pipeline ekstraksi sedang terkendala.
            </span>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="text-neutral-900 underline font-medium hover:text-neutral-700 cursor-pointer"
          >
            Coba sambung kembali
          </button>
        </div>
      )}

      {/* Primary Error State (if API failed and no cache is available) */}
      {!isLoading && error && !isCachedFallback && (
        <ErrorState
          title="Gagal Memuat Daftar Tender"
          message={error.message}
          code={error.code}
          onRetry={refetch}
        />
      )}

      {/* Toolbar: Search, Status Filter Segmented, Actions */}
      <TenderToolbar
        query={isHydrated ? query : ""}
        onQueryChange={setQuery}
        status={isHydrated ? status : "all"}
        onStatusChange={setStatus}
        statusCounts={statusCounts}
        onRefresh={refetch}
        onResetStorage={resetAll}
        isRefreshing={isLoading}
      />

      {/* Main Table & List View */}
      <TenderTable
        rows={pagination.items}
        tenders={pagination.items}
        loading={isLoading || !isHydrated}
        sort={sort}
        onSort={toggleSort}
        onSelect={handleSelectTender}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        onPageChange={setPage}
        onResetFilters={resetFilters}
        isDatasetEmpty={tenders.length === 0}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Detail Modal (Dynamic & Lazy Loaded) */}
      {selectedCode && (
        <TenderDetailModal
          code={selectedCode}
          onClose={handleCloseModal}
          initialTender={initialModalTender}
        />
      )}
    </div>
  );
};
