import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryCard } from "@/components/category/category-card";
import { PageHeader } from "@/components/shop/page-header";
import { ProductListing } from "@/components/shop/product-listing";
import { SectionHeading } from "@/components/ui/section";
import {
  getAllCategories,
  getCategory,
  getCategoryAncestors,
  getChildCategories,
  getPriceBounds,
  getProductsInCategory,
  getRootCategories,
  queryProducts,
} from "@/lib/data";
import { categoryCopy } from "@/lib/copy";
import { formatNumber } from "@/lib/format";
import { listingToQuery, parseListingParams, type RawSearchParams } from "@/lib/listing";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Category not found" };

  const copy = categoryCopy(category);
  return {
    title: `${category.name} — ${copy.tagline}`,
    description: `${copy.blurb} Shop ${category.totalCount} ${category.name.toLowerCase()} products at TechTrendIndia.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<RawSearchParams>;
}) {
  const [{ slug }, rawSearchParams] = await Promise.all([params, searchParams]);
  const category = getCategory(slug);
  if (!category) notFound();

  const state = parseListingParams(rawSearchParams);
  const result = queryProducts(listingToQuery(state, { categorySlug: category.slug }));

  const inCategory = getProductsInCategory(category.slug);
  const bounds = getPriceBounds(inCategory);
  const saleCount = inCategory.filter((product) => product.onSale).length;

  const children = getChildCategories(category.slug);
  const ancestors = getCategoryAncestors(category.slug);
  const siblings = category.parentSlug
    ? getChildCategories(category.parentSlug).filter((item) => item.slug !== category.slug)
    : [];

  const facetSource =
    children.length > 0
      ? children
      : siblings.length > 0
        ? siblings
        : getRootCategories().filter((item) => item.slug !== category.slug);

  const facetCategories = facetSource.map((item) => ({
    slug: item.slug,
    name: item.name,
    count: item.totalCount,
  }));

  const facetHeading =
    children.length > 0 ? "Subcategories" : siblings.length > 0 ? "Related categories" : "Departments";

  const copy = categoryCopy(category);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...ancestors.map((ancestor) => ({
            label: ancestor.name,
            href: `/category/${ancestor.slug}`,
          })),
          { label: category.name },
        ]}
        eyebrow={copy.tagline}
        title={category.name}
        description={`${copy.blurb} ${formatNumber(category.totalCount)} products in stock.`}
        meta={
          children.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {children.map((child) => (
                <li key={child.slug}>
                  <Link
                    href={`/category/${child.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-sm font-medium text-ink-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {child.name}
                    <span className="text-xs text-ink-400">{child.totalCount}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null
        }
      />

      <div className="container-page py-8 sm:py-10">
        <ProductListing
          state={state}
          result={result}
          baseHref={`/category/${category.slug}`}
          categories={facetCategories}
          categoryHeading={facetHeading}
          bounds={bounds}
          saleCount={saleCount}
        />

        {siblings.length > 0 ? (
          <section className="mt-16 border-t border-ink-100 pt-10">
            <SectionHeading
              eyebrow="Keep browsing"
              title="Shoppers also look at"
            />
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {siblings.slice(0, 6).map((sibling) => (
                <CategoryCard key={sibling.slug} category={sibling} size="sm" />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
