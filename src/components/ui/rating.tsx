import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Star rating display. Ratings in this storefront are placeholder values
 * (see `src/lib/copy.ts`) because the source catalog has no reviews yet.
 */
export function Rating({
  value,
  count,
  size = "sm",
  showCount = true,
  className,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  showCount?: boolean;
  className?: string;
}) {
  const rounded = Math.round(value * 2) / 2;
  const starSize = size === "md" ? "size-4" : "size-3.5";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rounded >= star;
          const half = !filled && rounded >= star - 0.5;
          return (
            <span key={star} className="relative inline-flex">
              <Star className={cn(starSize, "text-ink-200")} aria-hidden />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: half ? "50%" : "100%" }}
                >
                  <Star
                    className={cn(starSize, "fill-amber-400 text-amber-400")}
                    aria-hidden
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showCount && typeof count === "number" ? (
        <span className={cn("text-ink-500", size === "md" ? "text-sm" : "text-xs")}>
          {value.toFixed(1)} ({count})
        </span>
      ) : null}
    </div>
  );
}
