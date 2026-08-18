import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryCard({
  category,
  size = "md",
  className,
}: {
  category: Category;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const aspect = size === "lg" ? "aspect-4/5" : "aspect-square";

  return (
    <Link
      href={`/category/${category.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift",
        className,
      )}
    >
      <span className={cn("relative block overflow-hidden bg-peach-50", aspect)}>
        {category.image ? (
          <Image
            src={category.image}
            alt={category.imageAlt ?? category.name}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
      </span>
      <span className="flex flex-1 items-center justify-between gap-2 px-3.5 py-3">
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-ink-900 transition group-hover:text-brand-700">
            {category.name}
          </span>
          <span className="block text-[11px] text-ink-400">{category.totalCount} products</span>
        </span>
        <ArrowUpRight
          className="size-4 shrink-0 text-ink-300 transition group-hover:text-brand-700"
          aria-hidden
        />
      </span>
    </Link>
  );
}
