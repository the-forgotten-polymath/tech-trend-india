"use client";

import { Heart, Home, LayoutGrid, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { cn } from "@/lib/utils";

/** App-style bottom navigation, mobile only. */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { totals, openCart, hydrated } = useCart();
  const { ids, hydrated: wishlistHydrated } = useWishlist();

  const cartCount = hydrated ? totals.itemCount : 0;
  const wishlistCount = wishlistHydrated ? ids.length : 0;

  const items = [
    { label: "Home", href: "/", icon: Home },
    { label: "Categories", href: "/shop", icon: LayoutGrid },
    { label: "Search", href: "/search", icon: Search },
    { label: "Wishlist", href: "/wishlist", icon: Heart, badge: wishlistCount },
  ];

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 glass pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
                  active ? "text-brand-700" : "text-ink-500",
                )}
              >
                <span className="relative">
                  <item.icon className="size-5" aria-hidden />
                  {item.badge ? (
                    <span className="absolute -top-1.5 -right-2 flex min-w-4 items-center justify-center rounded-full bg-sale-600 px-1 text-[9px] leading-4 font-bold text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  ) : null}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={openCart}
            className="flex w-full flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-ink-500 transition"
          >
            <span className="relative">
              <ShoppingBag className="size-5" aria-hidden />
              {cartCount > 0 ? (
                <span className="absolute -top-1.5 -right-2 flex min-w-4 items-center justify-center rounded-full bg-sale-600 px-1 text-[9px] leading-4 font-bold text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              ) : null}
            </span>
            Bag
          </button>
        </li>
      </ul>
    </nav>
  );
}
