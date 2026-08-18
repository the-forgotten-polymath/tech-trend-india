import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { CartDrawer } from "@/components/layout/cart-drawer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { UtilityBar } from "@/components/layout/utility-bar";
import { AppProviders } from "@/components/providers/app-providers";
import { getRootCategories } from "@/lib/catalog";
import { getNavData } from "@/lib/nav";
import { site } from "@/lib/site";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "gifts",
    "gift shop india",
    "soft toys",
    "water bottles",
    "jewellery",
    "gadgets",
    "birthday gifts",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0c3a24",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = getNavData();
  const scopes = getRootCategories()
    .slice(0, 12)
    .map((category) => ({ slug: category.slug, name: category.name }));

  return (
    <html lang="en-IN" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-dvh pb-14 antialiased lg:pb-0">
        <AppProviders>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-200 focus:rounded-full focus:bg-brand-800 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to content
          </a>
          <UtilityBar />
          <SiteHeader nav={nav} scopes={scopes} />
          <main id="main">{children}</main>
          <SiteFooter />
          <CartDrawer />
          <MobileBottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
