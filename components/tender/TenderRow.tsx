import React from "react";
import { Tender } from "@/types/tender";
import { formatDate } from "@/lib/format";
import { TenderStatusBadge } from "./TenderStatusBadge";
import { Button } from "@/components/ui/Button";
import { ChevronRight } from "lucide-react";

interface TenderRowProps {
  tender: Tender;
  onSelect: (tender: Tender) => void;
}

/**
 * Desktop/tablet table row (>= 640px). Must only be rendered inside <tbody>.
 */
export const TenderRow: React.FC<TenderRowProps> = ({ tender, onSelect }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(tender);
    }
  };

  return (
    <tr
      tabIndex={0}
      data-tender-code={tender.code}
      onClick={() => onSelect(tender)}
      onKeyDown={handleKeyDown}
      aria-label={`${tender.code}, ${tender.title}`}
      className="group hover:bg-neutral-50 cursor-pointer focus:bg-neutral-100 transition-colors"
    >
      <td className="py-3 px-4 whitespace-nowrap text-xs font-mono font-semibold text-neutral-900">
        {tender.code}
      </td>

      <td className="py-3 px-4 w-full max-w-0 text-sm text-neutral-900 font-medium">
        <span className="block truncate" title={tender.title}>
          {tender.title}
        </span>
      </td>

      <td className="py-3 px-4 hidden lg:table-cell text-xs text-neutral-600 max-w-56">
        <span className="block truncate" title={tender.agency}>
          {tender.agency}
        </span>
      </td>

      <td className="py-3 px-4 whitespace-nowrap text-xs">
        <TenderStatusBadge status={tender.status} />
      </td>

      <td className="py-3 px-4 whitespace-nowrap text-xs text-neutral-600 font-mono">
        <time dateTime={tender.updatedAt}>{formatDate(tender.updatedAt)}</time>
      </td>

      <td className="py-3 px-4 whitespace-nowrap text-right text-xs">
        <Button
          variant="outline"
          size="sm"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(tender);
          }}
          aria-label={`Buka detail tender ${tender.code}`}
        >
          Detail
        </Button>
      </td>
    </tr>
  );
};

export const TenderListItem: React.FC<TenderRowProps> = ({ tender, onSelect }) => {
  return (
    <li>
      <button
        type="button"
        data-tender-code={tender.code}
        onClick={() => onSelect(tender)}
        aria-label={`Buka detail tender ${tender.code}, ${tender.title}`}
        className="w-full text-left p-4 hover:bg-neutral-50 focus:bg-neutral-100 cursor-pointer transition-colors space-y-2"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold text-neutral-900">
            {tender.code}
          </span>
          <TenderStatusBadge status={tender.status} />
        </span>

        <span className="block text-sm font-medium text-neutral-900 leading-snug line-clamp-2 break-words">
          {tender.title}
        </span>

        <span className="flex items-center justify-between gap-2 text-xs">
          <time dateTime={tender.updatedAt} className="text-neutral-600 font-mono">
            {formatDate(tender.updatedAt)}
          </time>
          <span className="inline-flex items-center gap-0.5 font-medium text-neutral-900">
            Detail
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </span>
      </button>
    </li>
  );
};
