export type TenderStatus = "ingested" | "pending" | "failed";
export type CheckResult = "pass" | "warning" | "fail";

export interface Tender {
  id: string;
  code: string;
  title: string;
  agency: string;
  status: TenderStatus;
  updatedAt: string;
}

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  result: CheckResult;
  note?: string;
}

export interface TenderDetail extends Tender {
  document: {
    fileName: string;
    sizeBytes: number;
    pageCount: number;
    ingestedAt: string | null;
  };
  extraction: {
    summary: string;
    fields: ExtractedField[];
  } | null;
  failureReason?: string;
  auditLog: AuditEntry[];
}

export interface UiPrefs {
  query: string;
  status: TenderStatus | "all";
  sort: { key: "code" | "title" | "updatedAt"; dir: "asc" | "desc" } | null;
  pageSize: number;
}

export interface CachedTenders {
  version: string;
  timestamp: string;
  data: Tender[];
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
