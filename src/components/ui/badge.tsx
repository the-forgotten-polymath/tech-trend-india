import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "brand" | "neutral" | "success" | "amber" | "dark" | "sale";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-700 text-white",
  neutral: "bg-white/90 text-ink-700 ring-1 ring-ink-200",
  success: "bg-brand-600 text-white",
  amber: "bg-amber-400 text-amber-950",
  dark: "bg-ink-900/90 text-white",
  sale: "bg-sale-600 text-white",
};

export function Badge({
  tone = "brand",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
