import { Check, PackageCheck, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/product/product-gallery";
import { ProductRail } from "@/components/product/product-rail";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { SectionHeading } from "@/components/ui/section";
import {
  getAllProducts,
  getCategoryAncestors,
  getProductsInCategory,
  getRelatedProducts,
  getPrimaryCategory,
} from "@/lib/data";
import { getProductBySlug } from "@/lib/db";
import {
  categoryCopy,
  demoReviewSummary,
  productDescription,
  productHighlights,
  SHOW_DEMO_REVIEWS,
} from "@/lib/copy";
import { formatPrice, truncate } from "@/lib/format";
import { commerce, site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const category = getPrimaryCategory(product);
  const description = truncate(
    product.shortDescription || `${product.name} — ${categoryCopy(category).blurb}`,
    160,
  );

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: product.images.slice(0, 1).map((image) => ({ url: image.src, alt: image.alt })),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = getPrimaryCategory(product);
  const ancestors = category ? getCategoryAncestors(category.slug) : [];
  const copy = categoryCopy(category);
  const paragraphs = productDescription(product, category);
  const highlights = productHighlights(product, category);
  const reviews = demoReviewSummary(product);
  const related = getRelatedProducts(product, 10);
  const sameCategory = category
    ? getProductsInCategory(category.slug)
        .filter((item) => item.id !== product.id)
        .slice(0, 10)
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((image) => `${site.url}${image.src}`),
    description: paragraphs.join(" "),
    sku: product.sku ?? String(product.id),
    category: category?.name,
    offers: {
      "@type": "Offer",
      priceCurrency: site.currency,
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${site.url}/product/${product.slug}`,
    },
  };

  return (
    <div className="pb-24 lg:pb-0" data-product-page>
      <script
        type="application/ld+json"
        // Product structured data for search engines.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-page pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            ...ancestors.map((ancestor) => ({
              label: ancestor.name,
              href: `/category/${ancestor.slug}`,
            })),
            ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
            { label: product.name },
          ]}
        />
      </div>

      <div className="container-page grid gap-10 py-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery
          images={product.images}
          productName={product.name}
          badge={
            <>
              {product.onSale && product.discountPercent > 0 ? (
                <Badge tone="brand">{product.discountPercent}% off</Badge>
              ) : null}
              {!product.inStock ? <Badge tone="neutral">Sold out</Badge> : null}
            </>
          }
        />

        <div>
          {category ? (
            <Link
              href={`/category/${category.slug}`}
              className="text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase transition hover:text-brand-700"
            >
              {category.name}
            </Link>
          ) : null}

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-500">
            {SHOW_DEMO_REVIEWS ? (
              <Rating value={reviews.rating} count={reviews.count} size="md" />
            ) : null}
            {product.sku ? <span>SKU {product.sku}</span> : null}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-medium",
                product.inStock ? "text-emerald-700" : "text-sale-700",
              )}
            >
              <span className={cn("size-2 rounded-full", product.inStock ? "bg-emerald-500" : "bg-sale-500")} />
              {product.inStock ? "In stock — ready to ship" : "Currently out of stock"}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <Price value={product.price} compareAt={product.regularPrice} size="lg" />
            {product.onSale && product.discountPercent > 0 ? (
              <Badge tone="success">Save {product.discountPercent}%</Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-ink-400">Inclusive of all taxes</p>

          <div className="mt-8 border-t border-ink-100 pt-8">
            <PurchasePanel product={product} />
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2.5 text-sm text-ink-700">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                {highlight}
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Assurance
              icon={Truck}
              title="Fast dispatch"
              detail="Delivered in 3–6 working days"
            />
            <Assurance
              icon={RefreshCcw}
              title={`${commerce.returnWindowDays}-day returns`}
              detail="Unused items, full refund"
            />
            <Assurance icon={ShieldCheck} title="Quality checked" detail="Inspected before packing" />
          </div>
        </div>
      </div>

      <div className="container-page">
        <section className="grid gap-10 border-t border-ink-100 py-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold">Product details</h2>
            <div className="mt-4 space-y-4 text-ink-600">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <h3 className="mt-8 text-lg font-semibold">What&apos;s good about it</h3>
            <ul className="mt-3 space-y-2">
              {copy.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2.5 text-sm text-ink-600">
                  <PackageCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-2xl border border-ink-100 bg-white p-6">
            <h3 className="text-base font-semibold">At a glance</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <SpecRow label="Category" value={category?.name ?? "—"} />
              <SpecRow label="Price" value={product.price > 0 ? formatPrice(product.price) : "On request"} />
              {product.regularPrice > product.price ? (
                <SpecRow label="MRP" value={formatPrice(product.regularPrice)} />
              ) : null}
              <SpecRow label="SKU" value={product.sku ?? `TT-${product.id}`} />
              {product.options.map((option) => (
                <SpecRow
                  key={option.name}
                  label={option.name}
                  value={option.values.join(", ")}
                />
              ))}
              <SpecRow label="Availability" value={product.inStock ? "In stock" : "Out of stock"} />
              <SpecRow label="Delivery" value="Standard, 3–6 working days" />
              <SpecRow label="Returns" value={`${commerce.returnWindowDays} days`} />
            </dl>
            <p className="mt-5 text-xs text-ink-400">
              Specifications come from our supplier listing. Colours may vary slightly between
              batches.
            </p>
          </aside>
        </section>

        {related.length > 0 ? (
          <section className="border-t border-ink-100 py-12">
            <SectionHeading
              eyebrow="You might also like"
              title="Similar picks"
              description="Comparable products at a similar price point."
            />
            <div className="mt-8">
              <ProductRail products={related} />
            </div>
          </section>
        ) : null}

        {category && sameCategory.length > 0 ? (
          <section className="border-t border-ink-100 py-12">
            <SectionHeading
              eyebrow={category.name}
              title={`More from ${category.name}`}
              action={{ label: `All ${category.totalCount} products`, href: `/category/${category.slug}` }}
            />
            <div className="mt-8">
              <ProductRail products={sameCategory} />
            </div>
          </section>
        ) : null}

        <RecentlyViewed excludeId={product.id} />
      </div>
    </div>
  );
}

function Assurance({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Truck;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-3.5">
      <Icon className="size-4 text-brand-600" aria-hidden />
      <p className="mt-2 text-sm font-semibold text-ink-900">{title}</p>
      <p className="text-xs text-ink-500">{detail}</p>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-50 pb-3 last:border-0 last:pb-0">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-right font-medium text-ink-900">{value}</dd>
    </div>
  );
}
