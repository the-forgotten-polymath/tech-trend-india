"use client";

import { Check, Loader2, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/providers/toast-provider";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CartLineInput = {
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  regularPrice: number;
  options?: Record<string, string>;
};

/**
 * Adds a line to the cart. `display="icon"` is the compact quick-add used on
 * product cards; `display="full"` is the primary button on the product page.
 */
export function AddToCartButton({
  item,
  quantity = 1,
  display = "full",
  disabled = false,
  openDrawer = false,
  className,
  label = "Add to bag",
}: {
  item: CartLineInput;
  quantity?: number;
  /** `icon` = round quick-add, `compact` = card button, `full` = product page. */
  display?: "full" | "icon" | "compact";
  disabled?: boolean;
  openDrawer?: boolean;
  className?: string;
  label?: string;
}) {
  const { addItem, openCart } = useCart();
  const { notify } = useToast();
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  const onClick = () => {
    if (disabled || state === "busy") return;
    setState("busy");
    addItem({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      image: item.image,
      price: item.price,
      regularPrice: item.regularPrice,
      options: item.options ?? {},
      quantity,
    });
    notify({
      tone: "success",
      title: "Added to your bag",
      description: `${item.name}${quantity > 1 ? ` × ${quantity}` : ""}`,
    });
    if (openDrawer) openCart();
    setState("done");
    window.setTimeout(() => setState("idle"), 1600);
  };

  if (display === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={`${label}: ${item.name}`}
        className={cn(
          "flex size-9 items-center justify-center rounded-full bg-brand-700 text-white shadow-card transition hover:bg-brand-800 disabled:bg-ink-300",
          className,
        )}
      >
        {state === "done" ? (
          <Check className="size-4" aria-hidden />
        ) : (
          <Plus className="size-4" aria-hidden />
        )}
      </button>
    );
  }

  if (display === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-bold tracking-wide whitespace-nowrap uppercase transition",
          state === "done"
            ? "bg-brand-700 text-white"
            : "border border-brand-600 bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white",
          "disabled:border-ink-200 disabled:bg-ink-50 disabled:text-ink-400",
          className,
        )}
      >
        {state === "done" ? (
          <>
            <Check className="size-3.5" aria-hidden />
            Added
          </>
        ) : (
          <>
            <ShoppingBag className="size-3 shrink-0" aria-hidden />
            {disabled ? "Sold out" : label}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses("primary", "lg", cn("w-full", className))}
    >
      {state === "busy" ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : state === "done" ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <ShoppingBag className="size-4" aria-hidden />
      )}
      {state === "done" ? "Added to bag" : label}
    </button>
  );
}
