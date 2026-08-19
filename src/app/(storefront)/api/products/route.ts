import { NextResponse } from "next/server";

import { getPrimaryCategory, getProductsByIds } from "@/lib/data";

export type ProductSummary = {
  id: number;
  name: string;
  slug: string;
  image: string;
  imageAlt: string;
  price: number;
  regularPrice: number;
  onSale: boolean;
  discountPercent: number;
  inStock: boolean;
  purchasable: boolean;
  hasOptions: boolean;
  category: string | null;
  seed: number;
};

const MAX_IDS = 60;

/**
 * Hydrates client-stored id lists (wishlist, recently viewed) into card data,
 * so the full catalog never has to ship to the browser. Read-only and public.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const ids = (url.searchParams.get("ids") ?? "")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isFinite(value))
    .slice(0, MAX_IDS);

  const products = getProductsByIds(ids).map<ProductSummary>((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: product.images[0]?.src ?? "/placeholder-product.svg",
    imageAlt: product.images[0]?.alt ?? product.name,
    price: product.price,
    regularPrice: product.regularPrice,
    onSale: product.onSale,
    discountPercent: product.discountPercent,
    inStock: product.inStock,
    purchasable: product.purchasable,
    hasOptions: product.options.length > 0,
    category: getPrimaryCategory(product)?.name ?? null,
    seed: product.seed,
  }));

  return NextResponse.json({ products });
}
