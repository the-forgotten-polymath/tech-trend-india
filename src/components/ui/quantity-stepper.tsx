"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  size = "md",
  label = "Quantity",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const buttonSize = size === "sm" ? "size-8" : "size-10";
  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-ink-200 bg-white",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className={cn(
          buttonSize,
          "flex items-center justify-center rounded-full text-ink-600 transition hover:bg-ink-50 disabled:text-ink-300 disabled:hover:bg-transparent",
        )}
      >
        <Minus className={iconSize} aria-hidden />
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        aria-label={label}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next)));
        }}
        className={cn(
          "w-10 border-0 bg-transparent text-center font-semibold text-ink-900 focus:outline-none",
          size === "sm" ? "text-sm" : "text-base",
        )}
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className={cn(
          buttonSize,
          "flex items-center justify-center rounded-full text-ink-600 transition hover:bg-ink-50 disabled:text-ink-300 disabled:hover:bg-transparent",
        )}
      >
        <Plus className={iconSize} aria-hidden />
      </button>
    </div>
  );
}
