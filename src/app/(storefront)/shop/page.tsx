import type { Metadata } from "next";

import { PageHeader } from "@/components/shop/page-header";
import { ProductListing } from "@/components/shop/product-listing";
import {
  CATALOG_STATS,
  getAllProducts,
  getPriceBounds,
  getRootCategories,
  queryProducts,
} from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { listingToQuery, parseListingParams, type RawSearchParams } from "@/lib/listing";

export const metadata: Metadata = {
  title: "All products",
  description:
    "Browse the full TechTrendIndia catalogue — gadgets, drinkware, jewellery, soft toys, beauty, home and more.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const state = parseListingParams(params);
  const result = queryProducts(listingToQuery(state));

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
        crumbs={[{ label: "Home", href: "/" }, { label: "All products" }]}
        eyebrow="The full catalogue"
        title="Every product in one place"
        description={`${formatNumber(CATALOG_STATS.productCount)} products across ${CATALOG_STATS.categoryCount} categories, from ₹5 keepsakes to premium gifting.`}
      />
      <div className="container-page py-8 sm:py-10">
        <ProductListing
          state={state}
          result={result}
          baseHref="/shop"
          categories={categories}
          categoryHeading="Departments"
          bounds={bounds}
          saleCount={saleCount}
        />
      </div>
    </>
  );
}
