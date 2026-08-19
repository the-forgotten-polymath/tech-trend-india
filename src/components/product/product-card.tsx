import { ShieldCheck, SlidersHorizontal, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { WishlistButton } from "@/components/product/wishlist-button";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { getPrimaryCategory, isNewArrival } from "@/lib/catalog";
import { demoReviewSummary, SHOW_DEMO_REVIEWS } from "@/lib/copy";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Product card. `variant="deal"` is the flash-sale styling (urgency badge and a
 * dark "Grab deal" button); `variant="grid"` is the standard catalogue card.
 */
export function ProductCard({
  product,
  variant = "grid",
  priority = false,
  className,
  sizes = "(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
}: {
  product: Product;
  variant?: "grid" | "deal";
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const category = getPrimaryCategory(product);
  const image = product.images[0];
  const reviews = demoReviewSummary(product);
  const hasOptions = product.options.length > 0;
  const href = `/product/${product.slug}`;
  const soldOut = !product.inStock || !product.purchasable;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-white p-3">
        <Link href={href} tabIndex={-1} aria-hidden className="relative block h-full w-full">
          <Image
            src={image.src}
            alt={image.alt || product.name}
            fill
            sizes={sizes}
            priority={priority}
            className="rounded-xl object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {product.onSale && product.discountPercent > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-sale-600 px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
              {variant === "deal" ? <Zap className="size-3" aria-hidden /> : null}
              {product.discountPercent}% off
            </span>
          ) : null}
          {isNewArrival(product) ? (
            <span className="rounded-md bg-brand-700 px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
              New
            </span>
          ) : null}
          {soldOut ? (
            <span className="rounded-md bg-ink-900/85 px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
              Sold out
            </span>
          ) : null}
        </div>

        {variant === "deal" ? (
          <div className="absolute top-3 right-3">
            <WishlistButton productId={product.id} productName={product.name} />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-3.5 pt-1 pb-3.5">
        {category ? (
          <Link
            href={`/category/${category.slug}`}
            className="text-[10px] font-bold tracking-[0.14em] text-ink-400 uppercase transition hover:text-brand-700"
          >
            {category.name}
          </Link>
        ) : null}

        <h3 className="text-sm leading-snug font-semibold text-ink-900">
          <Link href={href} className="line-clamp-2 transition hover:text-brand-700">
            {product.name}
          </Link>
        </h3>

        {SHOW_DEMO_REVIEWS && variant === "grid" ? (
          <Rating value={reviews.rating} count={reviews.count} />
        ) : null}

        <div className="mt-auto pt-1.5">
          <Price value={product.price} compareAt={product.regularPrice} />

          {variant === "grid" ? (
            <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-emerald-600">
              <ShieldCheck className="size-3" aria-hidden />
              Secure checkout · Quality checked
            </p>
          ) : null}

          <div className="mt-2.5 flex items-center gap-2">
            {variant === "grid" ? (
              <WishlistButton
                variant="square"
                productId={product.id}
                productName={product.name}
                className="order-2"
              />
            ) : null}
            {hasOptions ? (
              <Link
                href={href}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-brand-600 bg-brand-50 px-2 text-[10px] font-bold tracking-wide whitespace-nowrap text-brand-700 uppercase transition hover:bg-brand-600 hover:text-white"
              >
                <SlidersHorizontal className="size-3 shrink-0" aria-hidden />
                <span className="hidden sm:inline">Choose </span>Options
              </Link>
            ) : variant === "deal" ? (
              <AddToCartButton
                display="compact"
                label="Grab deal"
                disabled={soldOut}
                className="border-ink-900 bg-ink-900 text-white hover:bg-brand-700"
                item={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  image: image.src,
                  price: product.price,
                  regularPrice: product.regularPrice,
                }}
              />
            ) : (
              <AddToCartButton
                display="compact"
                label="Add to cart"
                disabled={soldOut}
                item={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  image: image.src,
                  price: product.price,
                  regularPrice: product.regularPrice,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
