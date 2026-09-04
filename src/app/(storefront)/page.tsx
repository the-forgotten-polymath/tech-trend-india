import { Clock, Flame, Gift } from "lucide-react";
import Link from "next/link";

import { BrandStrip } from "@/components/home/brand-strip";
import { CategoryCircles } from "@/components/home/category-circles";
import { Countdown } from "@/components/home/countdown";
import { DealTiles } from "@/components/home/deal-tiles";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { PickedForYou, type PickTabView } from "@/components/home/picked-for-you";
import { SocialProof } from "@/components/home/social-proof";
import { TrustStrip } from "@/components/home/trust-strip";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { CategoryCard } from "@/components/category/category-card";
import { ProductCard } from "@/components/product/product-card";
import { buttonClasses } from "@/components/ui/button";
import { Carousel } from "@/components/ui/carousel";
import { Section, SectionHeading } from "@/components/ui/section";
import {
  CATALOG_STATS,
  fetchBestDealsLive,
  fetchFeaturedProductsLive,
  fetchNewArrivalsLive,
  fetchTrendingCategoriesLive,
} from "@/lib/data";
import { formatNumber } from "@/lib/format";
import {
  getBrandStripLive,
  getCategoryCirclesLive,
  getHeroSlidesLive,
  getPickTabsLive,
} from "@/lib/merchandising";

const TAB_LINKS: Record<string, string> = {
  recommended: "/shop",
  trending: "/shop?sort=featured",
  deals: "/deals",
  new: "/new-arrivals",
  budget: "/collections/under-299",
  premium: "/collections/premium-picks",
};

export default async function HomePage() {
  const [slides, circles, deals, newArrivals, featured, trending, brands, pickTabsRaw] = await Promise.all([
    getHeroSlidesLive(),
    getCategoryCirclesLive(),
    fetchBestDealsLive(12),
    fetchNewArrivalsLive(210),
    fetchFeaturedProductsLive(10),
    fetchTrendingCategoriesLive(6),
    getBrandStripLive(),
    getPickTabsLive(),
  ]);

  const pickTabs: PickTabView[] = pickTabsRaw.map((tab) => ({
    id: tab.id,
    label: tab.label,
    note: tab.note,
    href: TAB_LINKS[tab.id] ?? "/shop",
    items: tab.products.slice(0, 10).map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.src || "/placeholder-product.svg",
      alt: product.images[0]?.alt || product.name,
      price: product.price,
      discountPercent: product.discountPercent,
    })),
  }));

  const biggestDiscount = deals[0]?.discountPercent ?? 0;

  return (
    <>
      <HeroCarousel slides={slides} />

      <div className="container-page">
        <Section className="py-6 sm:py-8">
          <TrustStrip />
        </Section>

        {/* Featured categories */}
        <Section className="pt-2">
          <SectionHeading
            eyebrow="Browse the aisles"
            title="Featured categories"
            description={`${CATALOG_STATS.categoryCount} categories, all photographed from real stock.`}
          />
          <div className="mt-9">
            <CategoryCircles categories={circles} />
          </div>
        </Section>

        {/* Flash sale */}
        <Section>
          <div className="rounded-2xl border border-sale-100 bg-linear-to-b from-sale-50 to-white p-5 sm:rounded-3xl sm:p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sale-600 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-white uppercase">
                <Flame className="size-3.5" aria-hidden />
                Flash sale
              </span>
              <h2 className="text-xl font-extrabold uppercase sm:text-2xl">
                {formatNumber(CATALOG_STATS.onSaleCount)} products on offer
              </h2>
              <p className="flex items-center gap-1.5 text-sm text-ink-500">
                <Clock className="size-4 text-sale-600" aria-hidden />
                Hurry — this week&apos;s sale ends in
              </p>
              <Countdown />
            </div>

            <div className="mt-8">
              <Carousel
                ariaLabel="Flash sale products"
                itemClassName="w-[46%] sm:w-56 lg:w-60"
              >
                {deals.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="deal"
                    sizes="(min-width: 1024px) 15rem, (min-width: 640px) 14rem, 46vw"
                  />
                ))}
              </Carousel>
            </div>

            <div className="mt-6 text-center">
              <Link href="/deals" className={buttonClasses("primary", "md")}>
                <Flame className="size-4" aria-hidden />
                Shop all deals — up to {biggestDiscount}% off
              </Link>
            </div>
          </div>
        </Section>

        {/* New arrivals grid -> carousel */}
        <Section>
          <SectionHeading
            eyebrow="Just landed"
            title="New arrivals"
            description="The latest additions to the catalogue, straight from this week's restock."
            action={{ label: "See all new arrivals", href: "/new-arrivals" }}
          />
          <div className="mt-8">
            <Carousel ariaLabel="New arrivals products" itemClassName="w-[46%] sm:w-56 lg:w-60">
              {newArrivals.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 4}
                  sizes="(min-width: 1024px) 15rem, (min-width: 640px) 14rem, 46vw"
                />
              ))}
            </Carousel>
          </div>
        </Section>

        {/* Picked for you */}
        <Section>
          <PickedForYou tabs={pickTabs} />
        </Section>

        {/* Offers */}
        <Section>
          <SectionHeading eyebrow="Ways to save" title="Deals & offers" />
          <div className="mt-8">
            <DealTiles />
          </div>
        </Section>

        {/* Trending categories + featured products */}
        <Section>
          <SectionHeading
            eyebrow="Most stocked"
            title="Trending categories"
            action={{ label: "Browse everything", href: "/shop" }}
          />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {trending.map((category) => (
              <CategoryCard key={category.slug} category={category} size="sm" />
            ))}
          </div>
        </Section>

        <Section className="pt-0">
          <SectionHeading eyebrow="Picked by our team" title="Featured products" />
          <div className="mt-8">
            <Carousel ariaLabel="Featured products" itemClassName="w-[46%] sm:w-56 lg:w-60">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  sizes="(min-width: 1024px) 15rem, (min-width: 640px) 14rem, 46vw"
                />
              ))}
            </Carousel>
          </div>
        </Section>

        {/* Brands & characters */}
        <Section>
          <SectionHeading
            eyebrow="Shop by name"
            title="Brands & characters"
            description="Search shortcuts for the labels and characters we actually stock."
          />
          <div className="mt-8">
            <BrandStrip brands={brands} />
          </div>
        </Section>

        {/* Social proof */}
        <Section>
          <SectionHeading eyebrow="Why shoppers stay" title="Trusted gifting" />
          <div className="mt-8">
            <SocialProof
              products={featured}
              stats={{
                products: CATALOG_STATS.productCount,
                categories: CATALOG_STATS.categoryCount,
              }}
            />
          </div>
        </Section>

        {/* Newsletter */}
        <Section>
          <div className="grid gap-8 rounded-2xl bg-peach-100 p-6 sm:rounded-3xl sm:p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-brand-800 uppercase">
                <Gift className="size-3.5" aria-hidden />
                Members save first
              </p>
              <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">
                Get restock alerts before they sell out
              </h2>
              <p className="mt-3 max-w-lg text-sm text-ink-600">
                One weekly email with new arrivals, price drops and a members-only coupon.
                Unsubscribe any time.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6">
              <h3 className="text-lg font-bold">Join the list</h3>
              <p className="mt-1 text-sm text-ink-500">
                We&apos;ll send the good stuff — nothing else.
              </p>
              <NewsletterForm className="mt-4" />
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
