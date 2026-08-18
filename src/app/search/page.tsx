import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shop/page-header";
import { ProductListing } from "@/components/shop/product-listing";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAllProducts, getPriceBounds, getRootCategories, queryProducts, searchProducts } from "@/lib/catalog";
import { formatNumber } from "@/lib/format";
import { listingToQuery, parseListingParams, type RawSearchParams } from "@/lib/listing";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

const SUGGESTIONS = [
  "soft toy",
  "steel bottle",
  "fairy lights",
  "earbuds",
  "keychain",
  "press on nails",
  "coffee mug",
  "drone",
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const state = parseListingParams(params);
  const query = state.q ?? "";

  if (!query) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={SearchX}
          title="What are you looking for?"
          description="Search by product name, category or SKU — for example “bottle”, “plush” or “LE-59”."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <Link
                  key={suggestion}
                  href={`/search?q=${encodeURIComponent(suggestion)}`}
                  className="rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-sm text-ink-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                >
                  {suggestion}
                </Link>
              ))}
            </div>
          }
        />
      </div>
    );
  }

  const result = queryProducts(listingToQuery(state));
  const matches = searchProducts(query);
  const bounds = getPriceBounds(matches.length > 0 ? matches : getAllProducts());
  const saleCount = matches.filter((product) => product.onSale).length;
  const categories = getRootCategories().map((category) => ({
    slug: category.slug,
    name: category.name,
    count: category.totalCount,
  }));

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: `Search: ${query}` }]}
        eyebrow="Search results"
        title={`“${query}”`}
        description={
          matches.length > 0
            ? `${formatNumber(matches.length)} products match your search.`
            : "No products matched that search."
        }
      />

      <div className="container-page py-8 sm:py-10">
        {matches.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={`Nothing found for “${query}”`}
            description="Check the spelling, try a single keyword, or browse the full catalogue instead."
            action={
              <Link href="/shop" className={buttonClasses("primary", "md")}>
                Browse all products
              </Link>
            }
          />
        ) : (
          <ProductListing
            state={state}
            result={result}
            baseHref="/search"
            categories={categories}
            categoryHeading="Jump to a department"
            bounds={bounds}
            saleCount={saleCount}
          />
        )}
      </div>
    </>
  );
}
