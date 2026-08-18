"use client";

import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";

import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/providers/toast-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { SummaryCard } from "@/components/product/summary-card";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useProductSummaries } from "@/lib/use-product-summaries";

export function WishlistView() {
  const { ids, hydrated, remove, clear } = useWishlist();
  const { addItem, openCart } = useCart();
  const { notify } = useToast();
  const { products, loading } = useProductSummaries(ids);

  const addAll = () => {
    const available = products.filter(
      (product) => product.inStock && product.purchasable && !product.hasOptions,
    );
    for (const product of available) {
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: product.price,
        regularPrice: product.regularPrice,
        options: {},
      });
    }
    notify({
      tone: "success",
      title: `${available.length} added to your bag`,
      description: "Items needing an option choice were skipped.",
    });
    openCart();
  };

  if (!hydrated || loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="aspect-3/4 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Nothing saved yet"
        description="Tap the heart on any product to keep it here while you decide."
        action={
          <Link href="/shop" className={buttonClasses("primary", "md")}>
            Find something to love
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          {products.length} saved {products.length === 1 ? "item" : "items"}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addAll}>
            <ShoppingBag className="size-4" aria-hidden />
            Add available to bag
          </Button>
          <Button variant="ghost" size="sm" onClick={clear}>
            <Trash2 className="size-4" aria-hidden />
            Clear list
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <SummaryCard
            key={product.id}
            product={product}
            onRemove={() => {
              remove(product.id);
              notify({ tone: "info", title: "Removed from wishlist", description: product.name });
            }}
          />
        ))}
      </div>
    </div>
  );
}
