import React, { useState, useEffect } from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { SegmentedControl, SegmentedOption } from "@/components/ui/SegmentedControl";
import { TenderStatus } from "@/types/tender";
import { Button } from "@/components/ui/Button";
import { RefreshCw, Trash2 } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface TenderToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  status: TenderStatus | "all";
  onStatusChange: (status: TenderStatus | "all") => void;
  statusCounts: {
    all: number;
    ingested: number;
    pending: number;
    failed: number;
  };
  onRefresh: () => void;
  onResetStorage: () => void;
  isRefreshing?: boolean;
}

export const TenderToolbar: React.FC<TenderToolbarProps> = ({
  query,
  onQueryChange,
  status,
  onStatusChange,
  statusCounts,
  onRefresh,
  onResetStorage,
  isRefreshing = false,
}) => {
  const [localInput, setLocalInput] = useState<string>(query);
  const [prevQuery, setPrevQuery] = useState<string>(query);
  const debouncedInput = useDebouncedValue(localInput, 250);

  if (query !== prevQuery) {
    setPrevQuery(query);
    setLocalInput(query);
  }

  useEffect(() => {
    onQueryChange(debouncedInput);
  }, [debouncedInput, onQueryChange]);

  const segmentedOptions: SegmentedOption<TenderStatus | "all">[] = [
    { value: "all", label: "Semua", count: statusCounts.all },
    { value: "ingested", label: "Ingested", count: statusCounts.ingested },
    { value: "pending", label: "Pending", count: statusCounts.pending },
    { value: "failed", label: "Failed", count: statusCounts.failed },
  ];

  return (
    <div className="space-y-3 mb-4">
      {/* Top Toolbar row: Search + Segmented Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <SearchInput
            value={localInput}
            onChange={setLocalInput}
            onClear={() => {
              setLocalInput("");
              onQueryChange("");
            }}
          />
        </div>

        {/* Status Filter Segmented Control */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <SegmentedControl
            options={segmentedOptions}
            value={status}
            onChange={onStatusChange}
            ariaLabel="Filter status tender"
          />
        </div>
      </div>

      {/* Action shortcuts / meta bar */}
      <div className="flex items-center justify-between pt-1 text-xs text-neutral-500">
        <div>
          <span>Total dokumen terdaftar: </span>
          <span className="font-semibold text-neutral-900">{statusCounts.all}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-neutral-600 hover:text-neutral-900 h-7 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
            <span>Segarkan</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onResetStorage}
            className="text-neutral-500 hover:text-red-700 h-7 text-xs"
            title="Hapus cache & preferensi tersimpan di peramban"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Reset Data Lokal</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
