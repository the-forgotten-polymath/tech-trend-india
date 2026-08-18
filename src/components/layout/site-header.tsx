"use client";

import { Heart, ShoppingBag, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CategoryMenu } from "@/components/layout/category-menu";
import { MainNav } from "@/components/layout/main-nav";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { MobileSearch } from "@/components/layout/mobile-search";
import { SearchBox, type SearchScope } from "@/components/layout/search-box";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { formatPrice } from "@/lib/format";
import type { NavData } from "@/lib/nav";
import { site } from "@/lib/site";

export function SiteHeader({ nav, scopes }: { nav: NavData; scopes: SearchScope[] }) {
  // Menus keep their own state; keying on the pathname closes them on navigation.
  const pathname = usePathname();
  const { totals, openCart, hydrated: cartHydrated } = useCart();
  const { ids: wishlistIds, hydrated: wishlistHydrated } = useWishlist();

  const cartCount = cartHydrated ? totals.itemCount : 0;
  const cartValue = cartHydrated ? totals.total : 0;
  const wishlistCount = wishlistHydrated ? wishlistIds.length : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 glass">
      {/* Row 1 — logo, search, account actions */}
      <div className="container-page">
        <div className="flex h-16 items-center gap-3 lg:h-20 lg:gap-6">
          <MobileMenu key={`menu-${pathname}`} nav={nav} />

          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-700 text-white">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <span className="font-display text-lg leading-none font-extrabold tracking-tight text-ink-900 sm:text-xl">
              {site.name}
              <span className="mt-0.5 hidden text-[10px] font-medium tracking-[0.18em] text-brand-700 uppercase sm:block">
                Cool toys, gadgets &amp; gifts
              </span>
            </span>
          </Link>

          <div className="ml-auto hidden max-w-2xl flex-1 lg:ml-8 lg:block">
            <SearchBox scopes={scopes} />
          </div>

          <div className="ml-auto flex items-center gap-1 lg:ml-0 lg:gap-2">
            <MobileSearch key={`search-${pathname}`} scopes={scopes} />

            <Link
              href="/orders"
              className="hidden items-center gap-2 rounded-lg px-2.5 py-2 text-ink-700 transition hover:bg-ink-50 lg:flex"
            >
              <User className="size-5" aria-hidden />
              <span className="text-left text-xs leading-tight">
                <span className="block font-semibold text-ink-900">Your orders</span>
                <span className="block text-ink-500">Track & manage</span>
              </span>
            </Link>

            <Link
              href="/wishlist"
              className="relative flex size-10 items-center justify-center rounded-lg text-ink-700 transition hover:bg-ink-50"
              aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} saved` : ""}`}
            >
              <Heart className="size-5" aria-hidden />
              {wishlistCount > 0 ? <CountBadge value={wishlistCount} /> : null}
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-ink-700 transition hover:bg-ink-50"
              aria-label={`Open bag${cartCount ? `, ${cartCount} items` : ""}`}
            >
              <span className="relative flex size-6 items-center justify-center">
                <ShoppingBag className="size-5" aria-hidden />
                {cartCount > 0 ? <CountBadge value={cartCount} /> : null}
              </span>
              <span className="hidden text-left text-xs leading-tight lg:block">
                <span className="block font-semibold text-ink-900">Bag</span>
                <span className="block text-ink-500">
                  {cartCount > 0 ? formatPrice(cartValue) : "Empty"}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2 — category dropdown + primary nav */}
      <div className="hidden border-t border-ink-100 bg-white/70 lg:block">
        <div className="container-page flex h-14 items-center gap-4">
          <CategoryMenu key={`cats-${pathname}`} nav={nav} />
          <MainNav />
          <p className="ml-auto text-xs font-medium text-ink-500">
            Free delivery over{" "}
            <span className="font-bold text-brand-700">{formatPrice(999)}</span>
          </p>
        </div>
      </div>
    </header>
  );
}

function CountBadge({ value }: { value: number }) {
  return (
    <span className="absolute -top-1.5 -right-2 flex min-w-4.5 items-center justify-center rounded-full bg-sale-600 px-1 text-[10px] leading-4.5 font-bold text-white">
      {value > 99 ? "99+" : value}
    </span>
  );
}
