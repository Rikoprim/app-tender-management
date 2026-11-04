import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { TenderStatusBadge } from "./TenderStatusBadge";
import { ExtractionSummary } from "./ExtractionSummary";
import { AuditLogList } from "./AuditLogList";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useTenderDetail } from "@/hooks/useTenderDetail";
import { Tender } from "@/types/tender";

interface TenderDetailModalProps {
  code: string | null;
  onClose: () => void;
  initialTender?: Tender | null;
}

export const TenderDetailModal: React.FC<TenderDetailModalProps> = ({
  code,
  onClose,
  initialTender,
}) => {
  const [activeTab, setActiveTab] = useState<string>("extraction");
  const [prevCode, setPrevCode] = useState<string | null>(code);
  const { detail, isLoading, error, refetch } = useTenderDetail(code);

  if (code !== prevCode) {
    setPrevCode(code);
    setActiveTab("extraction");
  }

  if (!code) return null;

  const currentTender = detail || initialTender;
  const auditCount = detail?.auditLog.length ?? 0;

  const tabs: TabItem[] = [
    {
      id: "extraction",
      label: "Ringkasan Ekstraksi",
    },
    {
      id: "audit",
      label: "Log Audit Kepatuhan",
      badge: (
        <span className="px-1.5 py-0.2 rounded-full text-xs font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
          {auditCount}
        </span>
      ),
    },
  ];

  const modalTitle = (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
          {code}
        </span>
        {currentTender && <TenderStatusBadge status={currentTender.status} />}
        {currentTender?.agency && (
          <span className="text-xs text-neutral-500 truncate max-w-xs sm:max-w-md">
            • {currentTender.agency}
          </span>
        )}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 leading-snug">
        {currentTender?.title || "Memuat judul tender..."}
      </h3>
    </div>
  );

  return (
    <Modal
      open={Boolean(code)}
      onClose={onClose}
      title={modalTitle}
      size="xl"
      ariaLabel={`Detail Tender ${code}`}
    >
      <div className="space-y-5">
        {/* Tab Navigation */}
        <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4 py-2" role="status" aria-label="Memuat detail dokumen">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <ErrorState
            title="Gagal Memuat Detail Dokumen"
            message={error.message}
            code={error.code}
            onRetry={refetch}
          />
        )}

        {/* Tab Panels */}
        {!isLoading && !error && detail && (
          <div>
            <div
              id="panel-extraction"
              role="tabpanel"
              aria-labelledby="tab-extraction"
              hidden={activeTab !== "extraction"}
            >
              {activeTab === "extraction" && <ExtractionSummary tender={detail} />}
            </div>

            <div
              id="panel-audit"
              role="tabpanel"
              aria-labelledby="tab-audit"
              hidden={activeTab !== "audit"}
            >
              {activeTab === "audit" && <AuditLogList entries={detail.auditLog} />}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
