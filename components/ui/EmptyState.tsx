import React from "react";
import { FolderSearch } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
}) => {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-md border border-dashed border-neutral-300 my-4"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-md bg-neutral-100 text-neutral-500 mb-3 border border-neutral-200">
        {icon || <FolderSearch className="w-6 h-6" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-600 max-w-md mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

