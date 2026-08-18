"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { FilterPanel, type FilterCategory } from "@/components/shop/filter-panel";
import { SORT_OPTIONS } from "@/lib/catalog";
import { formatNumber, formatPrice } from "@/lib/format";
import type { ListingState } from "@/lib/listing";
import type { SortKey } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ListingToolbar({
  state,
  total,
  categories,
  categoryHeading,
  bounds,
  saleCount,
}: {
  state: ListingState;
  total: number;
  categories: FilterCategory[];
  categoryHeading?: string;
  bounds: { min: number; max: number };
  saleCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    mutate(params);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const chips: { label: string; onRemove: () => void }[] = [];
  if (state.minPrice || state.maxPrice) {
    chips.push({
      label:
        state.minPrice && state.maxPrice
          ? `${formatPrice(state.minPrice)} – ${formatPrice(state.maxPrice)}`
          : state.maxPrice
            ? `Under ${formatPrice(state.maxPrice)}`
            : `${formatPrice(state.minPrice ?? 0)} & above`,
      onRemove: () =>
        update((params) => {
          params.delete("min");
          params.delete("max");
        }),
    });
  }
  if (state.onSale) {
    chips.push({ label: "On sale", onRemove: () => update((params) => params.delete("sale")) });
  }
  if (state.inStock) {
    chips.push({ label: "In stock", onRemove: () => update((params) => params.delete("stock")) });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          <span className="font-semibold text-ink-900">{formatNumber(total)}</span>{" "}
          {total === 1 ? "product" : "products"}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-ink-200 bg-white px-4 text-sm font-medium lg:hidden"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters
            {chips.length > 0 ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                {chips.length}
              </span>
            ) : null}
          </button>

          <label className="flex items-center gap-2 text-sm">
            <span className="hidden text-ink-500 sm:inline">Sort</span>
            <select
              value={state.sort}
              onChange={(event) =>
                update((params) => {
                  const value = event.target.value as SortKey;
                  if (value === "featured") params.delete("sort");
                  else params.set("sort", value);
                })
              }
              className="h-10 rounded-full border border-ink-200 bg-white px-3.5 pr-8 text-sm font-medium focus:border-brand-300 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {chips.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <li key={chip.label}>
              <button
                type="button"
                onClick={chip.onRemove}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-ink-200"
              >
                {chip.label}
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() =>
                update((params) => {
                  params.delete("min");
                  params.delete("max");
                  params.delete("sale");
                  params.delete("stock");
                })
              }
              className="text-xs font-semibold text-brand-700 underline-offset-2 hover:underline"
            >
              Clear all
            </button>
          </li>
        </ul>
      ) : null}

      {mobileOpen ? (
        <div className="fixed inset-0 z-100 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink-900/40 animate-fade-in"
          />
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-lift animate-slide-up",
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex size-9 items-center justify-center rounded-full text-ink-600 transition hover:bg-ink-100"
                aria-label="Close filters"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <FilterPanel
              state={state}
              categories={categories}
              categoryHeading={categoryHeading}
              bounds={bounds}
              saleCount={saleCount}
              onApplied={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
