"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { buttonClasses } from "@/components/ui/button";
import { PRICE_BANDS, type ListingState } from "@/lib/listing";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export type FilterCategory = { slug: string; name: string; count: number };

/** Long facet lists collapse to this many rows until expanded. */
const CATEGORY_PREVIEW_COUNT = 10;

export function FilterPanel({
  state,
  categories,
  categoryHeading = "Categories",
  bounds,
  saleCount,
  onApplied,
}: {
  state: ListingState;
  categories: FilterCategory[];
  categoryHeading?: string;
  bounds: { min: number; max: number };
  saleCount: number;
  onApplied?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minInput, setMinInput] = useState(state.minPrice ? String(state.minPrice) : "");
  const [maxInput, setMaxInput] = useState(state.maxPrice ? String(state.maxPrice) : "");
  const [showAllCategories, setShowAllCategories] = useState(false);

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, CATEGORY_PREVIEW_COUNT);

  const push = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      mutate(params);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      onApplied?.();
    },
    [onApplied, pathname, router, searchParams],
  );

  const toggleFlag = (key: "sale" | "stock", active: boolean) => {
    push((params) => {
      if (active) params.delete(key);
      else params.set(key, "1");
    });
  };

  const setBand = (min?: number, max?: number) => {
    setMinInput(min ? String(min) : "");
    setMaxInput(max ? String(max) : "");
    push((params) => {
      if (min) params.set("min", String(min));
      else params.delete("min");
      if (max) params.set("max", String(max));
      else params.delete("max");
    });
  };

  const applyCustomRange = () => {
    const min = Number.parseInt(minInput, 10);
    const max = Number.parseInt(maxInput, 10);
    setBand(Number.isFinite(min) && min > 0 ? min : undefined, Number.isFinite(max) && max > 0 ? max : undefined);
  };

  const activeBand = PRICE_BANDS.find(
    (band) => band.min === state.minPrice && band.max === state.maxPrice,
  );

  return (
    <div className="space-y-7">
      {categories.length > 0 ? (
        <FilterGroup title={categoryHeading}>
          <ul className="space-y-1">
            {visibleCategories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  onClick={onApplied}
                  className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-ink-400">{category.count}</span>
                </Link>
              </li>
            ))}
          </ul>
          {categories.length > CATEGORY_PREVIEW_COUNT ? (
            <button
              type="button"
              onClick={() => setShowAllCategories((value) => !value)}
              className="mt-2 px-2 text-xs font-semibold text-brand-700 underline-offset-2 hover:underline"
            >
              {showAllCategories
                ? "Show fewer"
                : `Show all ${categories.length} categories`}
            </button>
          ) : null}
        </FilterGroup>
      ) : null}

      <FilterGroup title="Price">
        <ul className="space-y-1">
          {PRICE_BANDS.map((band) => {
            const active = activeBand?.label === band.label;
            return (
              <li key={band.label}>
                <button
                  type="button"
                  onClick={() => (active ? setBand(undefined, undefined) : setBand(band.min, band.max))}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm transition",
                    active
                      ? "bg-brand-50 font-semibold text-brand-700"
                      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                  )}
                >
                  {band.label}
                  {active ? <Check className="size-4" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 flex items-center gap-2">
          <label className="sr-only" htmlFor="filter-min">
            Minimum price
          </label>
          <input
            id="filter-min"
            type="number"
            min={0}
            inputMode="numeric"
            value={minInput}
            onChange={(event) => setMinInput(event.target.value)}
            placeholder={String(bounds.min)}
            className="h-10 w-full rounded-xl border border-ink-200 px-3 text-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
          <span className="text-ink-400">–</span>
          <label className="sr-only" htmlFor="filter-max">
            Maximum price
          </label>
          <input
            id="filter-max"
            type="number"
            min={0}
            inputMode="numeric"
            value={maxInput}
            onChange={(event) => setMaxInput(event.target.value)}
            placeholder={String(bounds.max)}
            className="h-10 w-full rounded-xl border border-ink-200 px-3 text-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
          <button
            type="button"
            onClick={applyCustomRange}
            className={buttonClasses("dark", "sm", "shrink-0")}
          >
            Go
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-400">
          Range in this view: {formatPrice(bounds.min)} – {formatPrice(bounds.max)}
        </p>
      </FilterGroup>

      <FilterGroup title="Availability">
        <div className="space-y-2">
          <CheckboxRow
            label="In stock only"
            checked={state.inStock}
            onChange={() => toggleFlag("stock", state.inStock)}
          />
          <CheckboxRow
            label={`On sale (${saleCount})`}
            checked={state.onSale}
            onChange={() => toggleFlag("sale", state.onSale)}
          />
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2.5 text-sm font-semibold text-ink-900">{title}</h3>
      {children}
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-600">
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-md border transition",
          checked ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300 bg-white",
        )}
      >
        {checked ? <Check className="size-3.5" aria-hidden /> : null}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  );
}
