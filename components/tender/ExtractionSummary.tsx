import React from "react";
import { TenderDetail } from "@/types/tender";
import { formatDate, formatFileSize, formatConfidence } from "@/lib/format";
import { ReviewNotes } from "./ReviewNotes";
import { Clock, AlertCircle, FileText, CheckCircle2 } from "lucide-react";

interface ExtractionSummaryProps {
  tender: TenderDetail;
}

export const ExtractionSummary: React.FC<ExtractionSummaryProps> = ({ tender }) => {
  const { document, status, extraction, failureReason, code } = tender;

  return (
    <div className="space-y-6">
      {/* Metadata Dokumen */}
      <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          Metadata Dokumen Sumber
        </h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <dt className="text-neutral-500 mb-0.5">Nama Berkas</dt>
            <dd className="font-medium text-neutral-900 break-all flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" aria-hidden="true" />
              <span>{document.fileName}</span>
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500 mb-0.5">Ukuran Berkas</dt>
            <dd className="font-medium text-neutral-900">
              {formatFileSize(document.sizeBytes)}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500 mb-0.5">Jumlah Halaman</dt>
            <dd className="font-medium text-neutral-900">
              {document.pageCount > 0 ? `${document.pageCount} halaman` : "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500 mb-0.5">Waktu Ingestion</dt>
            <dd className="font-medium text-neutral-900">
              {formatDate(document.ingestedAt)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Conditional Content based on status */}
      {status === "pending" && (
        <div className="p-5 rounded-md border border-amber-200 bg-amber-50 text-amber-900">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h4 className="text-sm font-semibold text-amber-950">
                Dokumen masih dalam antrean
              </h4>
              <p className="mt-1 text-sm text-amber-800 leading-relaxed">
                Berkas dokumen tender sedang diproses dalam pipeline ekstraksi OCR. Hasil ringkasan dan data terstruktur akan otomatis muncul setelah proses analisis selesai.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div className="p-5 rounded-md border border-red-200 bg-red-50 text-red-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-red-950">
                Ekstraksi Dokumen Gagal
              </h4>
              <p className="text-sm text-red-800 leading-relaxed">
                <span className="font-medium">Alasan Kegagalan:</span>{" "}
                {failureReason || "Format berkas tidak sesuai standar atau rusak."}
              </p>
              <div className="pt-2 border-t border-red-200 text-xs text-red-800">
                <span className="font-semibold">Saran Tindakan:</span> Periksa kembali integritas file PDF, pastikan berkas tidak terkunci password enkripsi, serta gunakan hasil pindai beresolusi minimal 150-300 DPI lalu lakukan ingestion ulang.
              </div>
            </div>
          </div>
        </div>
      )}

      {status === "ingested" && extraction && (
        <div className="space-y-6">
          {/* Ringkasan Ekstraksi */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Ringkasan Ekstraksi Dokumen
            </h4>
            <div className="p-4 rounded-md border border-neutral-200 bg-neutral-50/60 text-sm leading-relaxed text-neutral-800">
              {extraction.summary}
            </div>
          </div>

          {/* Bidang Terstruktur & Confidence Score */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Bidang Data Terstruktur & Tingkat Kepercayaan
              </h4>
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-700" aria-hidden="true" />
                OCR Confidence Score
              </span>
            </div>

            <div className="border border-neutral-200 rounded-md divide-y divide-neutral-200 overflow-hidden bg-white">
              {extraction.fields.map((field) => (
                <div key={field.key} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50 transition-colors">
                  <div className="sm:w-1/2">
                    <span className="block text-xs font-medium text-neutral-500 mb-0.5">
                      {field.label}
                    </span>
                    <span className="text-sm font-semibold text-neutral-900">
                      {field.value}
                    </span>
                  </div>

                  {/* Confidence Bar */}
                  <div className="sm:w-48 flex items-center gap-2.5">
                    <div className="flex-1 bg-neutral-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          field.confidence >= 0.95
                            ? "bg-green-600"
                            : field.confidence >= 0.85
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.round(field.confidence * 100)}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="font-mono text-xs font-medium text-neutral-700 w-10 text-right">
                      {formatConfidence(field.confidence)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Notes (F11) */}
      <ReviewNotes code={code} />
    </div>
  );
};

