"use client";

import { SlidersHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { ProductSummary } from "@/app/(storefront)/api/products/route";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { SHOW_DEMO_REVIEWS } from "@/lib/copy";
import { cn } from "@/lib/utils";

/** Client-side product card used where data is fetched from /api/products. */
export function SummaryCard({
  product,
  onRemove,
  className,
}: {
  product: ProductSummary;
  onRemove?: () => void;
  className?: string;
}) {
  const href = `/product/${product.slug}`;
  const rating = Math.min(5, Math.round((3.9 + product.seed * 1.1) * 10) / 10);
  const reviewCount = 11 + Math.floor(product.seed * 180);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-ink-50">
        <Link href={href}>
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            sizes="(min-width: 1024px) 22vw, 45vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        {product.onSale && product.discountPercent > 0 ? (
          <div className="absolute top-3 left-3">
            <Badge tone="brand">{product.discountPercent}% off</Badge>
          </div>
        ) : null}
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${product.name}`}
            className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-ink-500 shadow-card backdrop-blur transition hover:text-brand-700"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category ? (
          <p className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
            {product.category}
          </p>
        ) : null}
        <h3 className="text-sm leading-snug font-semibold">
          <Link href={href} className="line-clamp-2 transition hover:text-brand-700">
            {product.name}
          </Link>
        </h3>
        {SHOW_DEMO_REVIEWS ? <Rating value={rating} count={reviewCount} /> : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Price value={product.price} compareAt={product.regularPrice} />
          {product.hasOptions ? (
            <Link
              href={href}
              className="flex size-9 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition hover:border-ink-400"
              aria-label={`Choose options for ${product.name}`}
            >
              <SlidersHorizontal className="size-4" aria-hidden />
            </Link>
          ) : (
            <AddToCartButton
              display="icon"
              disabled={!product.inStock || !product.purchasable}
              item={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.image,
                price: product.price,
                regularPrice: product.regularPrice,
              }}
            />
          )}
        </div>
      </div>
    </article>
  );
}
