import React from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (val: T) => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = "Filter status",
  disabled = false,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex items-center p-1 bg-neutral-100 rounded-md border border-neutral-200 overflow-x-auto max-w-full"
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 ${
              isSelected
                ? "bg-white text-neutral-900 border border-neutral-300 font-semibold"
                : "text-neutral-600 hover:text-neutral-900 border border-transparent"
            }`}
          >
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full border ${
                  isSelected
                    ? "bg-neutral-100 text-neutral-800 border-neutral-200 font-bold"
                    : "bg-neutral-200/60 text-neutral-600 border-neutral-300"
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

