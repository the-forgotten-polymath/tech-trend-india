"use client";

import { CreditCard, ShoppingBag, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/providers/toast-provider";
import { ShareButton } from "@/components/product/share-button";
import { WishlistButton } from "@/components/product/wishlist-button";
import { buttonClasses } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { formatDeliveryDate, formatPrice } from "@/lib/format";
import { commerce, site } from "@/lib/site";
import { recentlyViewedStore } from "@/lib/stores";
import type { Product } from "@/lib/types";
import { useClientReady } from "@/lib/use-store";
import { cn } from "@/lib/utils";

export function PurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { notify } = useToast();
  const ready = useClientReady();

  const [quantity, setQuantity] = useState(1);
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    // Pre-select single-value options so simple products need no interaction.
    Object.fromEntries(
      product.options
        .filter((option) => option.values.length === 1)
        .map((option) => [option.name, option.values[0]]),
    ),
  );
  const [missing, setMissing] = useState<string[]>([]);

  // Remember what has been viewed for the "recently viewed" rail.
  useEffect(() => {
    recentlyViewedStore.set((current) =>
      [product.id, ...current.filter((id) => id !== product.id)].slice(0, 12),
    );
  }, [product.id]);

  const unselected = product.options.filter((option) => !selection[option.name]);
  const buyable = product.inStock && product.purchasable;

  const commit = (thenGoToCheckout: boolean) => {
    if (!buyable) return;
    if (unselected.length > 0) {
      setMissing(unselected.map((option) => option.name));
      notify({
        tone: "info",
        title: `Choose a ${unselected[0].name.toLowerCase()}`,
        description: "Pick an option before adding this to your bag.",
      });
      return;
    }
    setMissing([]);
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0].src,
      price: product.price,
      regularPrice: product.regularPrice,
      options: selection,
      quantity,
    });
    if (thenGoToCheckout) {
      router.push("/checkout");
      return;
    }
    notify({
      tone: "success",
      title: "Added to your bag",
      description: `${product.name}${quantity > 1 ? ` × ${quantity}` : ""}`,
    });
    openCart();
  };

  const savings = Math.max(0, product.regularPrice - product.price) * quantity;

  return (
    <div className="space-y-6">
      {product.options.map((option) => (
        <fieldset key={option.name}>
          <legend className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            {option.name}
            {selection[option.name] ? (
              <span className="font-normal text-ink-500">{selection[option.name]}</span>
            ) : (
              <span
                className={cn(
                  "font-normal",
                  missing.includes(option.name) ? "text-brand-700" : "text-ink-400",
                )}
              >
                — select one
              </span>
            )}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {option.values.map((value) => {
              const active = selection[option.name] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setSelection((current) => ({ ...current, [option.name]: value }));
                    setMissing((current) => current.filter((name) => name !== option.name));
                  }}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition",
                    active
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-ink-200 bg-white text-ink-700 hover:border-ink-400",
                    missing.includes(option.name) && !active && "border-brand-300",
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <span className="mb-2 block text-sm font-semibold text-ink-900">Quantity</span>
          <QuantityStepper value={quantity} onChange={setQuantity} max={20} />
        </div>
        {savings > 0 ? (
          <p className="self-end text-sm font-medium text-emerald-700">
            You save {formatPrice(savings)}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => commit(false)}
            disabled={!buyable}
            className={buttonClasses("primary", "lg", "flex-1")}
          >
            <ShoppingBag className="size-4" aria-hidden />
            {buyable ? "Add to bag" : "Currently unavailable"}
          </button>
          <button
            type="button"
            onClick={() => commit(true)}
            disabled={!buyable}
            className={buttonClasses("dark", "lg", "flex-1")}
          >
            <CreditCard className="size-4" aria-hidden />
            Buy it now
          </button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <WishlistButton
            variant="inline"
            productId={product.id}
            productName={product.name}
            className="flex-1 justify-center"
          />
          <ShareButton
            title={product.name}
            text={`Found this on ${site.name}: ${product.name}`}
            className="flex-1 justify-center"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-4">
        <p className="flex items-start gap-2.5 text-sm text-ink-700">
          <Truck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
          <span>
            Order today for delivery{" "}
            {/* Dated estimate waits for hydration: this page is prerendered, so a
                build-time date would be both stale and a hydration mismatch. */}
            <strong className="font-semibold text-ink-900">
              {ready ? `by ${formatDeliveryDate(4)}` : "in 3–6 working days"}
            </strong>
            . Shipping will be quoted separately based on your location.
          </span>
        </p>
      </div>

      {/* Sticky bar keeps the primary action reachable on long mobile pages.
          Sits just above the app-style bottom navigation. */}
      <div className="fixed inset-x-0 bottom-14 z-40 border-t border-ink-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink-500">{product.name}</p>
            <p className="text-base font-bold text-ink-900">
              {product.price > 0 ? formatPrice(product.price * quantity) : "Price on request"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => commit(false)}
            disabled={!buyable}
            className={buttonClasses("primary", "md")}
          >
            <ShoppingBag className="size-4" aria-hidden />
            {buyable ? "Add to bag" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}
