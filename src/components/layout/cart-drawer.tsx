"use client";

import { ArrowRight, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { buttonClasses } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const { isOpen, closeCart, lines, totals, setQuantity, removeItem } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <button
        type="button"
        onClick={closeCart}
        aria-label="Close bag"
        className="absolute inset-0 bg-ink-900/40 animate-fade-in"
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-lift">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBag className="size-5 text-brand-600" aria-hidden />
            Your bag
            <span className="text-sm font-medium text-ink-400">({totals.itemCount})</span>
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="flex size-9 items-center justify-center rounded-full text-ink-600 transition hover:bg-ink-100"
            aria-label="Close bag"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <ShoppingBag className="size-6" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-ink-900">Your bag is empty</p>
              <p className="mt-1 text-sm text-ink-500">
                Add something you love — browse our collections.
              </p>
            </div>
            <Link
              href="/shop"
              onClick={closeCart}
              className={buttonClasses("primary", "md")}
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-ink-100 bg-brand-50/60 px-5 py-3">
              <p className="flex items-center gap-2 text-sm text-brand-800">
                <Truck className="size-4 shrink-0" aria-hidden />
                Shipping quoted after order confirmation · India only
              </p>
            </div>

            <ul className="flex-1 divide-y divide-ink-100 overflow-y-auto px-5">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-3 py-4">
                  <Link
                    href={`/product/${line.slug}`}
                    onClick={closeCart}
                    className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-ink-50"
                  >
                    <Image src={line.image} alt="" fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${line.slug}`}
                      onClick={closeCart}
                      className="line-clamp-2 text-sm font-semibold text-ink-900 transition hover:text-brand-700"
                    >
                      {line.name}
                    </Link>
                    {Object.entries(line.options).length > 0 ? (
                      <p className="mt-0.5 text-xs text-ink-500">
                        {Object.entries(line.options)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(" · ")}
                      </p>
                    ) : null}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <QuantityStepper
                        size="sm"
                        value={line.quantity}
                        onChange={(quantity) => setQuantity(line.key, quantity)}
                      />
                      <span className="text-sm font-bold text-ink-900">
                        {formatPrice(line.price * line.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(line.key)}
                    className="self-start rounded-full p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-brand-700"
                    aria-label={`Remove ${line.name} from bag`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t border-ink-100 px-5 py-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-500">Subtotal</dt>
                  <dd className="font-semibold text-ink-900">{formatPrice(totals.subtotal)}</dd>
                </div>
                {totals.productSavings > 0 ? (
                  <div className="flex justify-between text-emerald-700">
                    <dt>You save</dt>
                    <dd className="font-semibold">−{formatPrice(totals.productSavings)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-ink-500">Shipping</dt>
                  <dd className="text-xs text-ink-500">Quoted after confirmation</dd>
                </div>
              </dl>

              <div className="mt-4 flex gap-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className={buttonClasses("outline", "md", "flex-1")}
                >
                  View bag
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className={buttonClasses("primary", "md", "flex-1")}
                >
                  Checkout
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
              <p className="mt-3 text-center text-xs text-ink-400">
                Prices include GST. Shipping calculated after order.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
