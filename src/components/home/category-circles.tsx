import Image from "next/image";
import Link from "next/link";

import type { Category } from "@/lib/types";

/** Round category tiles — the primary browse entry point on the home page. */
export function CategoryCircles({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-5 lg:grid-cols-7">
      {categories.map((category) => (
        <li key={category.slug}>
          <Link href={`/category/${category.slug}`} className="group flex flex-col items-center gap-2.5">
            <span className="relative block aspect-square w-full max-w-24 overflow-hidden rounded-full border-2 border-peach-100 bg-peach-50 p-1 transition duration-200 group-hover:-translate-y-1 group-hover:border-brand-300 group-hover:shadow-card">
              <span className="relative block h-full w-full overflow-hidden rounded-full">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.imageAlt ?? category.name}
                    fill
                    sizes="96px"
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                ) : null}
              </span>
            </span>
            <span className="text-center">
              <span className="block text-xs font-semibold text-ink-800 transition group-hover:text-brand-700 sm:text-sm">
                {category.name}
              </span>
              <span className="block text-[11px] text-ink-400">{category.totalCount}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
