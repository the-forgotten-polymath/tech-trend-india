import { PackageSearch } from "lucide-react";
import Link from "next/link";

import { ProductGrid } from "@/components/product/product-grid";
import { FilterPanel, type FilterCategory } from "@/components/shop/filter-panel";
import { ListingToolbar } from "@/components/shop/listing-toolbar";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { buildListingHref, type ListingState } from "@/lib/listing";
import type { ProductQueryResult } from "@/lib/types";

/**
 * Shared listing shell used by /shop, /category/[slug], /search, /deals and
 * /collections/[slug]. Filtering happens on the server; the client components
 * only rewrite the URL.
 */
export function ProductListing({
  state,
  result,
  baseHref,
  categories,
  categoryHeading,
  bounds,
  saleCount,
}: {
  state: ListingState;
  result: ProductQueryResult;
  baseHref: string;
  categories: FilterCategory[];
  categoryHeading?: string;
  bounds: { min: number; max: number };
  saleCount: number;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
      <aside className="hidden lg:block">
        {/* Scrolls internally so long facet lists stay reachable when the
            sidebar is taller than the viewport. */}
        <div className="sticky top-32 max-h-[calc(100dvh-10rem)] overflow-y-auto rounded-2xl border border-ink-100 bg-white p-5">
          <FilterPanel
            state={state}
            categories={categories}
            categoryHeading={categoryHeading}
            bounds={bounds}
            saleCount={saleCount}
          />
        </div>
      </aside>

      <div>
        <ListingToolbar
          state={state}
          total={result.total}
          categories={categories}
          categoryHeading={categoryHeading}
          bounds={bounds}
          saleCount={saleCount}
        />

        {result.items.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon={PackageSearch}
            title="No products match those filters"
            description="Try widening the price range or clearing a filter — there are over a thousand products waiting."
            action={
              <Link
                href={buildListingHref(baseHref, { q: state.q })}
                className={buttonClasses("primary", "md")}
              >
                Clear filters
              </Link>
            }
          />
        ) : (
          <>
            <div className="mt-6">
              <ProductGrid products={result.items} columns={4} priorityCount={4} />
            </div>
            <Pagination
              className="mt-10"
              page={result.page}
              pageCount={result.pageCount}
              hrefForPage={(page) => buildListingHref(baseHref, { ...state, page })}
            />
            <p className="mt-4 text-center text-sm text-ink-400">
              Page {result.page} of {result.pageCount}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
