import type { Metadata } from "next";

import { PageHeader } from "@/components/shop/page-header";
import { ProductListing } from "@/components/shop/product-listing";
import { Badge } from "@/components/ui/badge";
import { getAllProducts, getPriceBounds, getRootCategories } from "@/lib/db";
import { getProducts } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import { listingToQuery, parseListingParams, type RawSearchParams } from "@/lib/listing";

export const metadata: Metadata = {
  title: "New arrivals",
  description:
    "The newest products at TechTrendIndia — this week's restock across gadgets, drinkware, jewellery, toys and home.",
};

export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const parsed = parseListingParams(params);
  const state = { ...parsed, sort: parsed.sort === "featured" ? ("newest" as const) : parsed.sort };
  const result = await getProducts(listingToQuery(state));

  const all = getAllProducts();
  const bounds = getPriceBounds(all);
  const saleCount = all.filter((product) => product.onSale).length;
  const categories = getRootCategories().map((category) => ({
    slug: category.slug,
    name: category.name,
    count: category.totalCount,
  }));

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "New arrivals" }]}
        eyebrow="Just landed"
        title="New arrivals"
        description={`${formatNumber(all.length)} products in the catalogue, newest first. Restocks land every week.`}
        meta={
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">Fresh stock</Badge>
            <Badge tone="neutral">Shipping quoted per order</Badge>
          </div>
        }
      />
      <div className="container-page py-8 sm:py-10">
        <ProductListing
          state={state}
          result={result}
          baseHref="/new-arrivals"
          categories={categories}
          categoryHeading="Departments"
          bounds={bounds}
          saleCount={saleCount}
        />
      </div>
    </>
  );
}
