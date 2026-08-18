import { BadgeCheck, Quote, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Rating } from "@/components/ui/rating";
import { formatNumber } from "@/lib/format";
import { TESTIMONIALS } from "@/lib/merchandising";
import type { Product } from "@/lib/types";

/**
 * Store-level social proof. The quotes are clearly-labelled samples — the
 * product export ships no customer reviews yet.
 */
export function SocialProof({
  products,
  stats,
}: {
  products: Product[];
  stats: { products: number; categories: number };
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl bg-brand-900 p-6 text-white">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="size-4 fill-amber-400 text-amber-400" aria-hidden />
          ))}
        </div>
        <p className="mt-4 font-display text-2xl font-extrabold text-white">
          Built for gifting, not guesswork
        </p>
        <p className="mt-2 text-sm text-brand-100">
          {formatNumber(stats.products)} products across {stats.categories} categories, each one
          photographed and quality-checked before it goes on sale.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-sm">
          <div>
            <dt className="text-brand-200">Dispatch</dt>
            <dd className="mt-0.5 text-lg font-bold text-white">24–48 hrs</dd>
          </div>
          <div>
            <dt className="text-brand-200">Returns</dt>
            <dd className="mt-0.5 text-lg font-bold text-white">7 days</dd>
          </div>
        </dl>
        <p className="mt-5 flex items-center gap-1.5 text-xs text-brand-200">
          <BadgeCheck className="size-3.5" aria-hidden />
          Sample testimonials shown — real reviews land once the store is live.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <li
            key={testimonial.quote}
            className="flex flex-col rounded-2xl border border-ink-100 bg-white p-5"
          >
            <Quote className="size-6 text-peach-300" aria-hidden />
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">{testimonial.quote}</p>
            <div className="mt-4 border-t border-ink-100 pt-3">
              <Rating value={testimonial.rating} showCount={false} />
              <p className="mt-1.5 text-xs font-semibold text-ink-900">{testimonial.name}</p>
              <p className="text-xs text-ink-400">{testimonial.meta}</p>
            </div>
          </li>
        ))}

        <li className="rounded-2xl border border-ink-100 bg-white p-5 sm:col-span-2 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-ink-900">Straight from the catalogue</p>
              <p className="mt-0.5 text-xs text-ink-500">
                Every photo on this site is the actual product shot from our warehouse.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold tracking-wide text-brand-700 uppercase transition hover:text-brand-800"
            >
              Browse all →
            </Link>
          </div>
          <ul className="mt-4 flex gap-3 overflow-x-auto scrollbar-none">
            {products.slice(0, 8).map((product) => (
              <li key={product.id} className="shrink-0">
                <Link
                  href={`/product/${product.slug}`}
                  className="relative block size-20 overflow-hidden rounded-xl bg-ink-50 transition hover:opacity-90 sm:size-24"
                >
                  <Image
                    src={product.images[0].src}
                    alt={product.images[0].alt}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
}
