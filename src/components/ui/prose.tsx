import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Readable text block for editorial and legal pages. Styles are applied to
 * descendants so page content can stay plain JSX.
 */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-3xl text-ink-600",
        "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink-900",
        "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink-900",
        "[&_p]:mt-3 [&_p]:leading-relaxed",
        "[&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc",
        "[&_ol]:mt-3 [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:list-decimal",
        "[&_li]:leading-relaxed",
        "[&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline [&_a]:underline-offset-2",
        "[&_strong]:font-semibold [&_strong]:text-ink-900",
        className,
      )}
    >
      {children}
    </div>
  );
}
