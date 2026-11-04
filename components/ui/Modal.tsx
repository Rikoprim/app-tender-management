import React, { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  ariaLabel?: string;
}

const emptySubscribe = () => () => {};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = "lg",
  ariaLabel = "Detail Dokumen",
}) => {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const containerRef = useFocusTrap<HTMLDivElement>({
    active: open,
    onEscape: onClose,
  });

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!isMounted || !open) return null;

  const sizeClasses = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  }[size];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      {/* Flat backdrop without blur */}
      <div
        className="fixed inset-0 bg-neutral-900/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content: Full screen on mobile, bounded on sm+ */}
      <div
        ref={containerRef}
        className={`relative z-10 w-full h-full sm:h-auto sm:max-h-[90vh] bg-white border border-neutral-300 rounded-none sm:rounded-lg flex flex-col overflow-hidden text-neutral-900 ${sizeClasses}`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50/50">
          <div id="modal-title" className="flex-1 mr-4">
            {title || <span className="sr-only">{ariaLabel}</span>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela modal"
            className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 border border-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
