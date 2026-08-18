import { getCategory } from "./catalog";
import type { Category } from "./types";

/**
 * Storefront navigation. The data tree in catalog.json stays faithful to the
 * source export; this file decides how those categories are *presented* —
 * which departments appear in the header, and how they are grouped.
 */
export type NavColumn = {
  heading: string;
  /** Category slugs, rendered in order. */
  items: string[];
};

export type Department = {
  /** Category slug the department header links to. */
  slug: string;
  label: string;
  blurb: string;
  columns: NavColumn[];
  /** Slugs used for the visual tiles inside the mega menu. */
  spotlight: string[];
};

export const departments: Department[] = [
  {
    slug: "electronics",
    label: "Electronics",
    blurb: "Audio, wearables, lighting and everyday tech.",
    columns: [
      {
        heading: "Audio & wearables",
        items: ["earbuds-airpods", "speakers", "smart-watch"],
      },
      {
        heading: "Power & cables",
        items: ["charger-adapter", "data-cable-usb", "phone-accessories", "others"],
      },
      {
        heading: "Light & comfort",
        items: ["light-items", "mini-fans", "messger-items", "aroma-humidifier"],
      },
    ],
    spotlight: ["light-items", "earbuds-airpods", "smart-watch"],
  },
  {
    slug: "tumblers",
    label: "Drinkware",
    blurb: "Bottles, sippers and mugs for every desk and bag.",
    columns: [
      { heading: "Bottles", items: ["tumblers", "sippers"] },
      { heading: "Mugs & tumblers", items: ["tumblers-tumblers", "mugs", "coffee-mugs"] },
    ],
    spotlight: ["sippers", "tumblers-tumblers", "mugs"],
  },
  {
    slug: "jewelry",
    label: "Jewellery & Bags",
    blurb: "Everyday sparkle, charms and carry-alls.",
    columns: [
      { heading: "Jewellery", items: ["jewelry", "bracelets"] },
      { heading: "Bags & wallets", items: ["bags", "wallets-accessories-2"] },
      { heading: "Charms", items: ["bag-charms", "keychains"] },
    ],
    spotlight: ["jewelry", "bag-charms", "bags"],
  },
  {
    slug: "beauty-care",
    label: "Beauty",
    blurb: "Makeup, nails and self-care picks.",
    columns: [
      { heading: "Makeup & nails", items: ["makeup", "press-on-nails-beauty-care"] },
      { heading: "Care & styling", items: ["personal-care", "accessories", "bath-essentials"] },
    ],
    spotlight: ["makeup", "press-on-nails-beauty-care", "personal-care"],
  },
  {
    slug: "toys-games",
    label: "Toys & Games",
    blurb: "Plushies, RC cars, drones and handmade finds.",
    columns: [
      { heading: "Soft & handmade", items: ["plushies", "crochet", "other-toys"] },
      { heading: "Remote control", items: ["car-games", "drone", "truck-games"] },
    ],
    spotlight: ["plushies", "drone", "car-games"],
  },
  {
    slug: "home-living",
    label: "Home & Living",
    blurb: "Kitchen, cleaning, decor and storage upgrades.",
    columns: [
      { heading: "Kitchen & appliances", items: ["home-kitchen", "home-appliances"] },
      { heading: "Clean & organise", items: ["home-cleaning", "home-storage", "shoe-care"] },
      { heading: "Decor & comfort", items: ["home-decor", "clocks", "mats-rugs", "door-mat"] },
    ],
    spotlight: ["home-kitchen", "home-cleaning", "clocks"],
  },
  {
    slug: "stationery-items",
    label: "Stationery",
    blurb: "Desk supplies, notebooks and cute extras.",
    columns: [
      { heading: "Desk & study", items: ["stationery-items"] },
      { heading: "Gifting", items: ["gift-items", "our-collection", "party-festive"] },
    ],
    spotlight: ["stationery-items", "gift-items", "party-festive"],
  },
  {
    slug: "auto-accessories",
    label: "Outdoor & Utility",
    blurb: "Car, bike, rain gear and handy tools.",
    columns: [
      { heading: "Car & bike", items: ["auto-accessories"] },
      { heading: "Rain & tools", items: ["umbrellas-rainwear", "tools-hardware"] },
    ],
    spotlight: ["auto-accessories", "umbrellas-rainwear", "tools-hardware"],
  },
];

/** Resolve the categories referenced by a nav column, dropping unknown slugs. */
export function resolveCategories(slugs: string[]): Category[] {
  return slugs
    .map((slug) => getCategory(slug))
    .filter((category): category is Category => Boolean(category));
}

/* -------------------------------------------------------------- collections */

export type Collection = {
  slug: string;
  title: string;
  subtitle: string;
  /** Filters applied on the listing page. */
  query: { maxPrice?: number; minPrice?: number; onSale?: boolean; sort?: string };
  accent: "rose" | "amber" | "violet" | "emerald";
};

export const collections: Collection[] = [
  {
    slug: "under-299",
    title: "Gifts under ₹299",
    subtitle: "Little surprises that still feel special.",
    query: { maxPrice: 299, sort: "featured" },
    accent: "rose",
  },
  {
    slug: "under-599",
    title: "Gifts under ₹599",
    subtitle: "The sweet spot for birthdays and thank-yous.",
    query: { minPrice: 300, maxPrice: 599, sort: "featured" },
    accent: "amber",
  },
  {
    slug: "under-999",
    title: "Gifts under ₹999",
    subtitle: "Generous picks without going overboard.",
    query: { minPrice: 600, maxPrice: 999, sort: "featured" },
    accent: "violet",
  },
  {
    slug: "premium-picks",
    title: "Premium picks",
    subtitle: "Statement gifts from ₹1,000 upwards.",
    query: { minPrice: 1000, sort: "price-desc" },
    accent: "emerald",
  },
];

export function getCollection(slug: string): Collection | undefined {
  return collections.find((collection) => collection.slug === slug);
}
