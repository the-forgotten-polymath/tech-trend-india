import { CartDrawer } from "@/components/layout/cart-drawer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { UtilityBar } from "@/components/layout/utility-bar";
import { AppProviders } from "@/components/providers/app-providers";
import { getRootCategories } from "@/lib/data";
import { getNavData } from "@/lib/nav";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const nav = getNavData();
  const scopes = getRootCategories()
    .slice(0, 12)
    .map((category) => ({ slug: category.slug, name: category.name }));

  return (
    <AppProviders>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-200 focus:rounded-full focus:bg-brand-800 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <UtilityBar />
      <SiteHeader nav={nav} scopes={scopes} />
      <main id="main" className="pb-14 lg:pb-0">{children}</main>
      <SiteFooter />
      <CartDrawer />
      <MobileBottomNav />
    </AppProviders>
  );
}
