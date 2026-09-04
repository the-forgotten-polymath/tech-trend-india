import {
  getBestDeals,
  getCategory,
  getFeaturedProducts,
  getGiftsUnder,
  getNewArrivals,
  getProductsInCategory,
  searchProducts,
} from "./catalog";
import {
  fetchBestDealsLive,
  fetchCategoryLive,
  fetchFeaturedProductsLive,
  fetchNewArrivalsLive,
  fetchProductsInCategoryLive,
  queryProductsLive,
} from "./data";
import type { Category, Product } from "./types";

/* ------------------------------------------------------------- hero banners */

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  highlight: string;
  body: string;
  primary: { label: string; href: string };
  /** `short` is used on narrow screens so the CTA never truncates. */
  secondary: { label: string; short: string; href: string };
  tone: "peach" | "mint" | "sand";
  /** Categories the collage images are pulled from. */
  collage: string[];
};

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "premium",
    eyebrow: "New collection",
    title: "Elevate your lifestyle with",
    highlight: "premium products",
    body: "Carefully curated gadgets, drinkware, jewellery and soft toys — chosen for quality, style and everyday comfort.",
    primary: { label: "Shop now", href: "/shop" },
    secondary: { label: "Explore collections", short: "Collections", href: "/collections/under-599" },
    tone: "peach",
    collage: ["plushies", "earbuds-airpods", "tumblers", "jewelry"],
  },
  {
    id: "deals",
    eyebrow: "Flash sale live",
    title: "Up to 95% off on",
    highlight: "this week's deals",
    body: "Hundreds of products discounted right now, from ₹15 desk finds to premium gifting. Stock moves fast.",
    primary: { label: "Grab the deals", href: "/deals" },
    secondary: { label: "See what's new", short: "What's new", href: "/new-arrivals" },
    tone: "mint",
    collage: ["light-items", "smart-watch", "makeup", "bag-charms"],
  },
  {
    id: "gifting",
    eyebrow: "Gifting made easy",
    title: "Thoughtful gifts under",
    highlight: "₹299",
    body: "Little surprises that still feel special — free gift wrap, a handwritten note and delivery across India.",
    primary: { label: "Shop gifts under ₹299", href: "/collections/under-299" },
    secondary: { label: "Browse all gifts", short: "All gifts", href: "/shop" },
    tone: "sand",
    collage: ["keychains", "stationery-items", "crochet", "mugs"],
  },
];

export type HeroSlideView = HeroSlide & {
  images: { src: string; alt: string }[];
};

export function getHeroSlides(): HeroSlideView[] {
  return HERO_SLIDES.map((slide) => ({
    ...slide,
    images: slide.collage
      .map((slug) => {
        const products = getProductsInCategory(slug);
        const product = products.find((item) => item.inStock && item.images.length > 0);
        const image = product?.images[0];
        return image ? { src: image.src, alt: image.alt } : null;
      })
      .filter((image): image is { src: string; alt: string } => Boolean(image)),
  }));
}

export async function getHeroSlidesLive(): Promise<HeroSlideView[]> {
  const slides = await Promise.all(
    HERO_SLIDES.map(async (slide) => {
      const images = (
        await Promise.all(
          slide.collage.map(async (slug) => {
            const products = await fetchProductsInCategoryLive(slug);
            const product = products.find((item) => item.inStock && item.images.length > 0);
            const image = product?.images[0];
            return image ? { src: image.src, alt: image.alt } : null;
          })
        )
      ).filter((image): image is { src: string; alt: string } => Boolean(image));
      return { ...slide, images };
    })
  );
  return slides;
}

/* ------------------------------------------------- featured category circles */

/** The round category tiles under the hero, in display order. */
const CATEGORY_CIRCLES = [
  "plushies",
  "keychains",
  "bags",
  "smart-watch",
  "tumblers",
  "accessories",
  "jewelry",
  "makeup",
  "other-toys",
  "stationery-items",
  "home-decor",
  "phone-accessories",
  "wallets-accessories-2",
  "our-collection",
  "drinkware",
  "bags-accessories",
  "audio",
  "stationery",
  "electronics",
];

export function getCategoryCircles(): Category[] {
  return CATEGORY_CIRCLES.map((slug) => getCategory(slug)).filter(
    (category): category is Category => Boolean(category),
  );
}

export async function getCategoryCirclesLive(): Promise<Category[]> {
  const categories = await Promise.all(CATEGORY_CIRCLES.map((slug) => fetchCategoryLive(slug)));
  return categories.filter((category): category is Category => Boolean(category));
}

/* ------------------------------------------------------------- offer tiles */

export type DealTile = {
  label: string;
  detail: string;
  href: string;
  icon: "zap" | "flame" | "gift" | "ticket" | "truck" | "package";
  tone: "peach" | "sale" | "mint" | "sand" | "cream" | "green";
};

export const DEAL_TILES: DealTile[] = [
  {
    label: "Daily deals",
    detail: "Fresh discounts every day",
    href: "/deals",
    icon: "zap",
    tone: "peach",
  },
  {
    label: "Mega sale",
    detail: "Biggest markdowns first",
    href: "/deals?sort=discount",
    icon: "flame",
    tone: "sale",
  },
  {
    label: "Gifts under ₹299",
    detail: "Small budget, big smile",
    href: "/collections/under-299",
    icon: "gift",
    tone: "mint",
  },
  {
    label: "Coupon GIFT10",
    detail: "10% off above ₹999",
    href: "/cart",
    icon: "ticket",
    tone: "sand",
  },
  {
    label: "India delivery",
    detail: "Shipping quoted per order",
    href: "/shipping-returns",
    icon: "truck",
    tone: "cream",
  },
  {
    label: "Premium picks",
    detail: "Statement gifts from ₹1,000",
    href: "/collections/premium-picks",
    icon: "package",
    tone: "green",
  },
];

/* -------------------------------------------------------------- brand strip */

/**
 * Brands and characters that genuinely appear in the catalogue. Counts come
 * from a live search, so the strip never advertises something we don't stock.
 */
const BRAND_TERMS = [
  "Stitch",
  "Tommy Hilfiger",
  "Hello Kitty",
  "Coach",
  "boAt",
  "Apple",
  "OnePlus",
  "Samsung",
  "JBL",
  "Harry Potter",
  "Labubu",
  "Zootopia",
];

export type BrandChip = { label: string; href: string; count: number };

export function getBrandStrip(): BrandChip[] {
  return BRAND_TERMS.map((label) => ({
    label,
    href: `/search?q=${encodeURIComponent(label)}`,
    count: searchProducts(label).length,
  }))
    .filter((chip) => chip.count > 0)
    .sort((a, b) => b.count - a.count);
}

export async function getBrandStripLive(): Promise<BrandChip[]> {
  const chips = await Promise.all(
    BRAND_TERMS.map(async (label) => {
      const result = await queryProductsLive({ search: label, perPage: 100 });
      return {
        label,
        href: `/search?q=${encodeURIComponent(label)}`,
        count: result.total,
      };
    })
  );
  return chips.filter((chip) => chip.count > 0).sort((a, b) => b.count - a.count);
}

/* ------------------------------------------------------- personalised rails */

export type PickTab = {
  id: string;
  label: string;
  note: string;
  products: Product[];
};

/**
 * Tabs for the "picked for you" panel. Everything here is rule-based on the
 * catalogue (price, discount, recency, category weight) — no tracking involved.
 */
export function getPickTabs(): PickTab[] {
  return [
    {
      id: "recommended",
      label: "Recommended",
      note: "A rotating mix from across the store",
      products: getFeaturedProducts(12),
    },
    {
      id: "trending",
      label: "Trending now",
      note: "From our busiest aisles this week",
      products: [
        ...getProductsInCategory("plushies").slice(0, 4),
        ...getProductsInCategory("tumblers").slice(0, 4),
        ...getProductsInCategory("light-items").slice(0, 4),
      ],
    },
    {
      id: "deals",
      label: "Best discounts",
      note: "Sorted by how much you save",
      products: getBestDeals(12),
    },
    {
      id: "new",
      label: "New arrivals",
      note: "Latest additions to the catalogue",
      products: getNewArrivals(12),
    },
    {
      id: "budget",
      label: "Under ₹299",
      note: "Pocket-money gifting",
      products: getGiftsUnder(299, 12),
    },
    {
      id: "premium",
      label: "Premium",
      note: "Our most giftable splurges",
      products: [...getFeaturedProducts(40)]
        .filter((product) => product.price >= 1000)
        .slice(0, 12),
    },
  ];
}

export async function getPickTabsLive(): Promise<PickTab[]> {
  const [recommended, trendingPlushies, trendingTumblers, trendingLights, deals, newArrivals, budgetResult, premiumPool] = await Promise.all([
    fetchFeaturedProductsLive(12),
    fetchProductsInCategoryLive("plushies"),
    fetchProductsInCategoryLive("tumblers"),
    fetchProductsInCategoryLive("light-items"),
    fetchBestDealsLive(12),
    fetchNewArrivalsLive(12),
    queryProductsLive({ maxPrice: 299, perPage: 12 }),
    fetchFeaturedProductsLive(40),
  ]);

  return [
    {
      id: "recommended",
      label: "Recommended",
      note: "A rotating mix from across the store",
      products: recommended,
    },
    {
      id: "trending",
      label: "Trending now",
      note: "From our busiest aisles this week",
      products: [
        ...trendingPlushies.slice(0, 4),
        ...trendingTumblers.slice(0, 4),
        ...trendingLights.slice(0, 4),
      ],
    },
    {
      id: "deals",
      label: "Best discounts",
      note: "Sorted by how much you save",
      products: deals,
    },
    {
      id: "new",
      label: "New arrivals",
      note: "Latest additions to the catalogue",
      products: newArrivals,
    },
    {
      id: "budget",
      label: "Under ₹299",
      note: "Pocket-money gifting",
      products: budgetResult.items,
    },
    {
      id: "premium",
      label: "Premium",
      note: "Our most giftable splurges",
      products: premiumPool.filter((product) => product.price >= 1000).slice(0, 12),
    },
  ];
}

/* ------------------------------------------------------------ social proof */

/**
 * Placeholder testimonials. The product export contains no reviews, so these
 * are sample quotes about the store experience — swap them for real, attributed
 * feedback before launch (and see SHOW_DEMO_REVIEWS in copy.ts).
 */
export const TESTIMONIALS = [
  {
    quote:
      "Ordered a plush and a bottle for my niece's birthday. Packed neatly, arrived in three days, and the gift note was handwritten.",
    name: "Sample review",
    meta: "Soft toys & drinkware",
    rating: 5,
  },
  {
    quote:
      "The fairy lights came with a working controller and spare hooks — small thing, but nobody else bothers.",
    name: "Sample review",
    meta: "Lights",
    rating: 5,
  },
  {
    quote:
      "Return was painless. Raised it on WhatsApp, courier picked it up next day, refund in four.",
    name: "Sample review",
    meta: "Returns experience",
    rating: 4,
  },
];
