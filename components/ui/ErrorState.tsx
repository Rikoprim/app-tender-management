import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Terjadi Kesalahan",
  message,
  code,
  onRetry,
  className = "",
}) => {
  return (
    <div
      role="alert"
      className={`p-5 rounded-md border border-red-200 bg-red-50 text-red-900 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5 text-red-700">
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-950">{title}</h3>
          <p className="mt-1 text-sm text-red-800">{message}</p>
          {code && (
            <p className="mt-1 font-mono text-xs text-red-700">
              Kode Error: {code}
            </p>
          )}
          {onRetry && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-red-300 text-red-900 bg-white hover:bg-red-100"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Coba lagi</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

