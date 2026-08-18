import type { Metadata } from "next";

import { PageHeader } from "@/components/shop/page-header";
import { ProductListing } from "@/components/shop/product-listing";
import { Badge } from "@/components/ui/badge";
import { getAllProducts, getPriceBounds, getRootCategories, queryProducts } from "@/lib/catalog";
import { formatNumber } from "@/lib/format";
import { listingToQuery, parseListingParams, type RawSearchParams } from "@/lib/listing";

export const metadata: Metadata = {
  title: "Today's deals",
  description:
    "Every discounted product at TechTrendIndia, sorted by the biggest savings. Deals refresh as stock moves.",
};

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const parsed = parseListingParams(params);
  // Deals always force the on-sale filter, whatever else is in the URL.
  const state = { ...parsed, onSale: true, sort: parsed.sort === "featured" ? "discount" as const : parsed.sort };
  const result = queryProducts(listingToQuery(state));

  const onSale = getAllProducts().filter((product) => product.onSale);
  const bounds = getPriceBounds(onSale);
  const biggest = onSale.reduce((max, product) => Math.max(max, product.discountPercent), 0);

  const categories = getRootCategories().map((category) => ({
    slug: category.slug,
    name: category.name,
    count: category.totalCount,
  }));

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Deals" }]}
        eyebrow="Limited time"
        title="Today's deals"
        description={`${formatNumber(onSale.length)} products are discounted right now — up to ${biggest}% off.`}
        meta={
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">Up to {biggest}% off</Badge>
            <Badge tone="neutral">Free delivery over ₹999</Badge>
            <Badge tone="neutral">Extra 10% with GIFT10</Badge>
          </div>
        }
      />
      <div className="container-page py-8 sm:py-10">
        <ProductListing
          state={state}
          result={result}
          baseHref="/deals"
          categories={categories}
          categoryHeading="Departments"
          bounds={bounds}
          saleCount={onSale.length}
        />
      </div>
    </>
  );
}
