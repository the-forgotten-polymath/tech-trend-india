import Link from "next/link";

import type { BrandChip } from "@/lib/merchandising";

/**
 * Brands and licensed characters that actually appear in the catalogue. Counts
 * come from a live search, so nothing here is advertised without stock.
 */
export function BrandStrip({ brands }: { brands: BrandChip[] }) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-3">
      {brands.map((brand) => (
        <li key={brand.label}>
          <Link
            href={brand.href}
            className="group flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
          >
            <span className="font-display text-sm font-extrabold tracking-tight text-ink-800 transition group-hover:text-brand-700">
              {brand.label}
            </span>
            <span className="rounded-full bg-ink-50 px-2 py-0.5 text-[10px] font-bold text-ink-500">
              {brand.count}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
