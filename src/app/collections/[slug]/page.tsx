import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shop/page-header";
import { ProductListing } from "@/components/shop/product-listing";
import { getPriceBounds, getRootCategories, queryProducts } from "@/lib/catalog";
import { formatNumber } from "@/lib/format";
import { listingToQuery, parseListingParams, type RawSearchParams } from "@/lib/listing";
import { collections, getCollection } from "@/lib/taxonomy";
import type { SortKey } from "@/lib/types";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.title,
    description: collection.subtitle,
    alternates: { canonical: `/collections/${collection.slug}` },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<RawSearchParams>;
}) {
  const [{ slug }, rawSearchParams] = await Promise.all([params, searchParams]);
  const collection = getCollection(slug);
  if (!collection) notFound();

  const parsed = parseListingParams(rawSearchParams);
  // The collection's own price window wins; shoppers can still sort and filter.
  const state = {
    ...parsed,
    minPrice: collection.query.minPrice,
    maxPrice: collection.query.maxPrice,
    onSale: parsed.onSale || Boolean(collection.query.onSale),
    sort:
      parsed.sort === "featured" && collection.query.sort
        ? (collection.query.sort as SortKey)
        : parsed.sort,
  };

  const result = queryProducts(listingToQuery(state));
  const scope = queryProducts({ ...listingToQuery(state), page: 1, perPage: 10_000 }).items;
  const bounds = getPriceBounds(scope);
  const saleCount = scope.filter((product) => product.onSale).length;

  const categories = getRootCategories().map((category) => ({
    slug: category.slug,
    name: category.name,
    count: category.totalCount,
  }));

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Gift guides", href: "/shop" },
          { label: collection.title },
        ]}
        eyebrow="Gift guide"
        title={collection.title}
        description={`${collection.subtitle} ${formatNumber(result.total)} products in this guide.`}
        meta={
          <ul className="flex flex-wrap gap-2">
            {collections
              .filter((item) => item.slug !== collection.slug)
              .map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/collections/${item.slug}`}
                    className="inline-flex rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-sm font-medium text-ink-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
          </ul>
        }
      />
      <div className="container-page py-8 sm:py-10">
        <ProductListing
          state={state}
          result={result}
          baseHref={`/collections/${collection.slug}`}
          categories={categories}
          categoryHeading="Departments"
          bounds={bounds}
          saleCount={saleCount}
        />
      </div>
    </>
  );
}
