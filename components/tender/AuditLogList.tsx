import React from "react";
import { AuditEntry, CheckResult } from "@/types/tender";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";

interface AuditLogListProps {
  entries: AuditEntry[];
}

export const AuditLogList: React.FC<AuditLogListProps> = ({ entries }) => {
  const summary = entries.reduce(
    (acc, entry) => {
      acc[entry.result] = (acc[entry.result] || 0) + 1;
      return acc;
    },
    { pass: 0, warning: 0, fail: 0 } as Record<CheckResult, number>
  );

  const getResultBadge = (result: CheckResult) => {
    switch (result) {
      case "pass":
        return (
          <Badge tone="success">
            <CheckCircle2 className="w-3 h-3 text-green-700" aria-hidden="true" />
            <span>Pass</span>
          </Badge>
        );
      case "warning":
        return (
          <Badge tone="warning">
            <AlertTriangle className="w-3 h-3 text-amber-700" aria-hidden="true" />
            <span>Warning</span>
          </Badge>
        );
      case "fail":
        return (
          <Badge tone="danger">
            <XCircle className="w-3 h-3 text-red-700" aria-hidden="true" />
            <span>Fail</span>
          </Badge>
        );
      default:
        return <Badge tone="neutral">{result}</Badge>;
    }
  };

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-5">
      {/* Ringkasan Hasil Audit */}
      <div className="p-3.5 bg-neutral-50 rounded-md border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-medium text-neutral-800">
          <ShieldCheck className="w-4 h-4 text-neutral-600" aria-hidden="true" />
          <span>Ringkasan Pemeriksaan Kepatuhan:</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-50 text-green-800 border border-green-200 font-medium">
            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
            {summary.pass} Lolos (Pass)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
            {summary.warning} Perhatian (Warning)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-50 text-red-800 border border-red-200 font-medium">
            <XCircle className="w-3 h-3" aria-hidden="true" />
            {summary.fail} Gagal (Fail)
          </span>
        </div>
      </div>

      {/* Log Audit List */}
      {sortedEntries.length === 0 ? (
        <div className="text-center py-8 text-neutral-500 text-sm border border-dashed border-neutral-300 rounded-md">
          Belum ada rekaman log audit kepatuhan untuk dokumen tender ini.
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-md divide-y divide-neutral-200 overflow-hidden bg-white">
          {sortedEntries.map((entry) => (
            <div key={entry.id} className="p-4 hover:bg-neutral-50/70 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  {getResultBadge(entry.result)}
                  <span className="font-semibold text-sm text-neutral-900">
                    {entry.action}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span className="font-mono">{formatDate(entry.timestamp, true)}</span>
                  <span>•</span>
                  <span className="font-medium text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    {entry.actor}
                  </span>
                </div>
              </div>
              {entry.note && (
                <p className="text-xs text-neutral-700 mt-1 pl-1 bg-neutral-50/50 p-2 rounded border border-neutral-100">
                  {entry.note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
