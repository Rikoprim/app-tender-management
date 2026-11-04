import React from "react";

export type BadgeTone = "success" | "warning" | "danger" | "neutral" | "info";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  tone = "neutral",
  children,
  className = "",
  ...props
}) => {
  const toneClasses = {
    success: "bg-green-50 text-green-800 border-green-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-red-50 text-red-800 border-red-200",
    neutral: "bg-neutral-100 text-neutral-800 border-neutral-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  }[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-md border ${toneClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
