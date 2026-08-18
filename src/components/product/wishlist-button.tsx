"use client";

import { Heart } from "lucide-react";

import { useToast } from "@/components/providers/toast-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  productName,
  variant = "overlay",
  className,
}: {
  productId: number;
  productName: string;
  variant?: "overlay" | "inline" | "square";
  className?: string;
}) {
  const { has, toggle, hydrated } = useWishlist();
  const { notify } = useToast();
  const saved = hydrated && has(productId);

  const onClick = () => {
    const nowSaved = toggle(productId);
    notify({
      tone: "saved",
      title: nowSaved ? "Saved to wishlist" : "Removed from wishlist",
      description: productName,
    });
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-lg border px-5 text-sm font-semibold transition",
          saved
            ? "border-sale-200 bg-sale-50 text-sale-700"
            : "border-ink-200 bg-white text-ink-700 hover:border-ink-300",
          className,
        )}
      >
        <Heart className={cn("size-4", saved && "fill-sale-600 text-sale-600")} aria-hidden />
        {saved ? "Saved" : "Save for later"}
      </button>
    );
  }

  if (variant === "square") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg border transition",
          saved
            ? "border-sale-200 bg-sale-50 text-sale-600"
            : "border-ink-200 bg-white text-ink-500 hover:border-sale-200 hover:text-sale-600",
          className,
        )}
      >
        <Heart className={cn("size-4", saved && "fill-sale-600")} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-white/90 text-ink-500 shadow-card backdrop-blur transition hover:bg-white hover:text-sale-600",
        saved && "text-sale-600",
        className,
      )}
    >
      <Heart className={cn("size-4", saved && "fill-sale-600")} aria-hidden />
    </button>
  );
}
