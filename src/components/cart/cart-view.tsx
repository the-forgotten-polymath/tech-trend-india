"use client";

import { ArrowRight, Heart, ShoppingBag, Tag, Trash2, Truck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/providers/toast-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { couponError, findCoupon } from "@/lib/cart-math";
import { formatPrice } from "@/lib/format";
import { commerce } from "@/lib/site";
import { cn } from "@/lib/utils";

export function CartView({ suggestions }: { suggestions: ReactNode }) {
  const { lines, totals, setQuantity, removeItem, couponCode, applyCoupon, hydrated } = useCart();
  const { add: addToWishlist } = useWishlist();
  const { notify } = useToast();
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const appliedCoupon = findCoupon(couponCode);

  const submitCoupon = (event: React.FormEvent) => {
    event.preventDefault();
    const coupon = findCoupon(codeInput);
    if (!coupon) {
      setCodeError("That code isn't valid.");
      return;
    }
    const error = couponError(coupon, totals.subtotal);
    if (error) {
      setCodeError(error);
      return;
    }
    setCodeError(null);
    setCodeInput("");
    applyCoupon(coupon.code);
    notify({ tone: "success", title: `${coupon.code} applied`, description: coupon.label });
  };

  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <>
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Browse the catalogue and add something you love — or start with a gift guide."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/shop" className={buttonClasses("primary", "md")}>
                Shop all products
              </Link>
              <Link href="/collections/under-299" className={buttonClasses("outline", "md")}>
                Gifts under ₹299
              </Link>
            </div>
          }
        />
        <div className="mt-14">{suggestions}</div>
      </>
    );
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-10">
        <div>
          {totals.amountToFreeShipping > 0 ? (
            <p className="mb-5 flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
              <Truck className="size-4 shrink-0" aria-hidden />
              You&apos;re {formatPrice(totals.amountToFreeShipping)} away from free delivery.
            </p>
          ) : (
            <p className="mb-5 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <Truck className="size-4 shrink-0" aria-hidden />
              Free standard delivery applied.
            </p>
          )}

          <ul className="space-y-4">
            {lines.map((line) => (
              <li
                key={line.key}
                className="flex gap-4 rounded-2xl border border-ink-100 bg-white p-4"
              >
                <Link
                  href={`/product/${line.slug}`}
                  className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-ink-50 sm:size-28"
                >
                  <Image src={line.image} alt="" fill sizes="112px" className="object-cover" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${line.slug}`}
                        className="line-clamp-2 font-semibold text-ink-900 transition hover:text-brand-700"
                      >
                        {line.name}
                      </Link>
                      {Object.entries(line.options).length > 0 ? (
                        <p className="mt-1 text-sm text-ink-500">
                          {Object.entries(line.options)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(" · ")}
                        </p>
                      ) : null}
                      {line.regularPrice > line.price ? (
                        <p className="mt-1 text-xs font-medium text-emerald-700">
                          Saving {formatPrice((line.regularPrice - line.price) * line.quantity)}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(line.key)}
                      aria-label={`Remove ${line.name}`}
                      className="rounded-full p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-brand-700"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <QuantityStepper
                      value={line.quantity}
                      onChange={(quantity) => setQuantity(line.key, quantity)}
                    />
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          addToWishlist(line.productId);
                          removeItem(line.key);
                          notify({
                            tone: "saved",
                            title: "Moved to wishlist",
                            description: line.name,
                          });
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition hover:text-brand-700"
                      >
                        <Heart className="size-3.5" aria-hidden />
                        Save for later
                      </button>
                      <span className="text-base font-bold text-ink-900">
                        {formatPrice(line.price * line.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-700 transition hover:text-brand-700"
            >
              Continue shopping
            </Link>
          </div>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <h2 className="text-lg font-bold">Order summary</h2>

            <form onSubmit={submitCoupon} className="mt-4">
              <label htmlFor="coupon" className="text-sm font-medium text-ink-700">
                Have a coupon?
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="coupon"
                  value={codeInput}
                  onChange={(event) => {
                    setCodeInput(event.target.value.toUpperCase());
                    setCodeError(null);
                  }}
                  placeholder="GIFT10"
                  className="h-10 min-w-0 flex-1 rounded-xl border border-ink-200 px-3 text-sm uppercase focus:border-brand-300 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                />
                <button type="submit" className={buttonClasses("dark", "sm")}>
                  Apply
                </button>
              </div>
              {codeError ? <p className="mt-1.5 text-xs text-brand-700">{codeError}</p> : null}
              {appliedCoupon ? (
                <p className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Tag className="size-3.5" aria-hidden />
                    {appliedCoupon.code} · {appliedCoupon.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => applyCoupon(null)}
                    className="rounded-full p-1 transition hover:bg-emerald-100"
                    aria-label="Remove coupon"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </p>
              ) : (
                <p className="mt-2 text-xs text-ink-400">
                  Try {commerce.coupons.map((coupon) => coupon.code).join(", ")}
                </p>
              )}
            </form>

            <dl className="mt-5 space-y-2.5 border-t border-ink-100 pt-5 text-sm">
              <Row label={`Subtotal (${totals.itemCount} items)`} value={formatPrice(totals.subtotal)} />
              {totals.productSavings > 0 ? (
                <Row
                  label="Product discounts"
                  value={`−${formatPrice(totals.productSavings)}`}
                  tone="positive"
                />
              ) : null}
              {totals.couponDiscount > 0 ? (
                <Row
                  label={`Coupon ${couponCode}`}
                  value={`−${formatPrice(totals.couponDiscount)}`}
                  tone="positive"
                />
              ) : null}
              <Row
                label="Delivery"
                value={totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
              />
              <div className="flex items-baseline justify-between border-t border-ink-100 pt-3">
                <dt className="text-base font-bold text-ink-900">Total</dt>
                <dd className="text-xl font-bold text-ink-900">{formatPrice(totals.total)}</dd>
              </div>
            </dl>

            <Link href="/checkout" className={buttonClasses("primary", "lg", "mt-5 w-full")}>
              Checkout securely
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <p className="mt-3 text-center text-xs text-ink-400">
              Demo checkout — no payment is processed and no card details are collected.
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-16">{suggestions}</div>
    </>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive";
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={cn("text-ink-500", tone === "positive" && "text-emerald-700")}>{label}</dt>
      <dd
        className={cn(
          "font-semibold text-ink-900",
          tone === "positive" && "text-emerald-700",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
