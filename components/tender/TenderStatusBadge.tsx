import React from "react";
import { TenderStatus } from "@/types/tender";
import { Badge, BadgeTone } from "@/components/ui/Badge";

interface TenderStatusBadgeProps {
  status: TenderStatus;
  className?: string;
}

export const TenderStatusBadge: React.FC<TenderStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const config: Record<
    TenderStatus,
    { label: string; tone: BadgeTone; dotColor: string }
  > = {
    ingested: {
      label: "Ingested",
      tone: "success",
      dotColor: "bg-green-600",
    },
    pending: {
      label: "Pending",
      tone: "warning",
      dotColor: "bg-amber-600",
    },
    failed: {
      label: "Failed",
      tone: "danger",
      dotColor: "bg-red-600",
    },
  };

  const { label, tone, dotColor } = config[status] || {
    label: status,
    tone: "neutral",
    dotColor: "bg-neutral-600",
  };

  return (
    <Badge tone={tone} className={className}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{label}</span>
    </Badge>
  );
};

