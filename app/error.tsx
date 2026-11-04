"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard caught route error:", error);
  }, [error]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <ErrorState
        title="Terjadi Masalah pada Dasbor"
        message={error.message || "Aplikasi mengalami kegagalan saat merender komponen."}
        code={error.digest || "APP_CRASH"}
        onRetry={reset}
      />
    </div>
  );
}

