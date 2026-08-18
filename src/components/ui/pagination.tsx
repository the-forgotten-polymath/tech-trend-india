import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Compact page list: 1 … 4 5 6 … 20 */
function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((value) => pages.add(value));
  if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach((v) => pages.add(v));
  const sorted = [...pages].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  let previous = 0;
  for (const value of sorted) {
    if (previous && value - previous > 1) result.push("gap");
    result.push(value);
    previous = value;
  }
  return result;
}

export function Pagination({
  page,
  pageCount,
  hrefForPage,
  className,
}: {
  page: number;
  pageCount: number;
  hrefForPage: (page: number) => string;
  className?: string;
}) {
  if (pageCount <= 1) return null;
  const items = pageWindow(page, pageCount);
  const linkBase =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition";

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1.5", className)}>
      {page > 1 ? (
        <Link
          href={hrefForPage(page - 1)}
          rel="prev"
          aria-label="Previous page"
          className={cn(linkBase, "border border-ink-200 bg-white text-ink-700 hover:border-ink-300")}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
      ) : (
        <span
          aria-hidden
          className={cn(linkBase, "border border-ink-100 bg-ink-50/60 text-ink-300")}
        >
          <ChevronLeft className="size-4" />
        </span>
      )}

      {items.map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-ink-400">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefForPage(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              linkBase,
              item === page
                ? "bg-brand-700 text-white"
                : "border border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700",
            )}
          >
            {item}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link
          href={hrefForPage(page + 1)}
          rel="next"
          aria-label="Next page"
          className={cn(linkBase, "border border-ink-200 bg-white text-ink-700 hover:border-ink-300")}
        >
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span
          aria-hidden
          className={cn(linkBase, "border border-ink-100 bg-ink-50/60 text-ink-300")}
        >
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
