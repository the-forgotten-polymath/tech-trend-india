import { Compass } from "lucide-react";
import Link from "next/link";

import { CategoryCard } from "@/components/category/category-card";
import { buttonClasses } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section";
import { getTrendingCategories } from "@/lib/catalog";

export default function NotFound() {
  const categories = getTrendingCategories(6);

  return (
    <div className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Compass className="size-6" aria-hidden />
        </span>
        <p className="mt-6 text-sm font-semibold tracking-[0.18em] text-brand-600 uppercase">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">This page has wandered off</h1>
        <p className="mt-3 text-ink-500">
          The link may be old or the product may have sold out. Try a search, or start from one of the
          popular aisles below.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className={buttonClasses("primary", "md")}>
            Browse all products
          </Link>
          <Link href="/" className={buttonClasses("outline", "md")}>
            Back to home
          </Link>
        </div>
      </div>

      <section className="mt-16">
        <SectionHeading align="center" eyebrow="Popular aisles" title="Pick up the trail here" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} size="sm" />
          ))}
        </div>
      </section>
    </div>
  );
}
