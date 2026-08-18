import catalogJson from "@/data/catalog.json";

import type {
  Catalog,
  Category,
  Product,
  ProductQuery,
  ProductQueryResult,
  SortKey,
} from "./types";

const catalog = catalogJson as Catalog;

export const CATALOG_STATS = catalog.stats;
export const CATALOG_GENERATED_AT = catalog.generatedAt;
export const CURRENCY = catalog.currency;

const productsById = new Map<number, Product>();
const productsBySlug = new Map<string, Product>();
const categoriesBySlug = new Map<string, Category>();

for (const product of catalog.products) {
  productsById.set(product.id, product);
  productsBySlug.set(product.slug, product);
}
for (const category of catalog.categories) {
  categoriesBySlug.set(category.slug, category);
}

/** Products keyed by category slug, including products of descendant categories. */
const productsByCategory = new Map<string, Product[]>();

function descendantSlugs(slug: string, acc = new Set<string>()): Set<string> {
  if (acc.has(slug)) return acc;
  acc.add(slug);
  const category = categoriesBySlug.get(slug);
  for (const child of category?.childSlugs ?? []) descendantSlugs(child, acc);
  return acc;
}

for (const category of catalog.categories) {
  const slugs = descendantSlugs(category.slug);
  const items = catalog.products.filter((product) =>
    product.categorySlugs.some((slug) => slugs.has(slug)),
  );
  productsByCategory.set(category.slug, items);
}

/* --------------------------------------------------------------- categories */

export function getAllCategories(): Category[] {
  return catalog.categories;
}

export function getCategory(slug: string): Category | undefined {
  return categoriesBySlug.get(slug);
}

export function getRootCategories(): Category[] {
  return catalog.categories
    .filter((category) => !category.parentSlug)
    .sort((a, b) => b.totalCount - a.totalCount);
}

export function getChildCategories(slug: string): Category[] {
  const category = categoriesBySlug.get(slug);
  if (!category) return [];
  return category.childSlugs
    .map((child) => categoriesBySlug.get(child))
    .filter((child): child is Category => Boolean(child))
    .sort((a, b) => b.totalCount - a.totalCount);
}

/** Ancestors of a category, outermost first (excludes the category itself). */
export function getCategoryAncestors(slug: string): Category[] {
  const category = categoriesBySlug.get(slug);
  if (!category) return [];
  return category.path
    .slice(0, -1)
    .map((ancestor) => categoriesBySlug.get(ancestor))
    .filter((ancestor): ancestor is Category => Boolean(ancestor));
}

/** Leaf categories that actually hold products, biggest first. */
export function getLeafCategories(): Category[] {
  return catalog.categories
    .filter((category) => category.directCount > 0)
    .sort((a, b) => b.directCount - a.directCount);
}

/* ----------------------------------------------------------------- products */

export function getAllProducts(): Product[] {
  return catalog.products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return productsBySlug.get(slug);
}

export function getProductById(id: number): Product | undefined {
  return productsById.get(id);
}

export function getProductsByIds(ids: number[]): Product[] {
  return ids
    .map((id) => productsById.get(id))
    .filter((product): product is Product => Boolean(product));
}

export function getProductsInCategory(slug: string): Product[] {
  return productsByCategory.get(slug) ?? [];
}

export function getPrimaryCategory(product: Product): Category | undefined {
  for (const slug of product.categorySlugs) {
    const category = categoriesBySlug.get(slug);
    if (category) return category;
  }
  return undefined;
}

/* ------------------------------------------------------------------ queries */

const SORTERS: Record<SortKey, (a: Product, b: Product) => number> = {
  featured: (a, b) =>
    Number(b.inStock) - Number(a.inStock) ||
    b.discountPercent - a.discountPercent ||
    a.seed - b.seed,
  newest: (a, b) => b.id - a.id,
  "price-asc": (a, b) => a.price - b.price || a.name.localeCompare(b.name),
  "price-desc": (a, b) => b.price - a.price || a.name.localeCompare(b.name),
  discount: (a, b) => b.discountPercent - a.discountPercent || a.seed - b.seed,
  "name-asc": (a, b) => a.name.localeCompare(b.name),
};

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "New arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "discount", label: "Biggest discount" },
  { value: "name-asc", label: "Name: A to Z" },
];

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Searchable text per product, built once. */
const searchIndex = new Map<number, string>();
for (const product of catalog.products) {
  const categoryNames = product.categorySlugs
    .map((slug) => categoriesBySlug.get(slug)?.name ?? slug)
    .join(" ");
  searchIndex.set(
    product.id,
    normalise(`${product.name} ${product.sku ?? ""} ${categoryNames} ${product.shortDescription}`),
  );
}

function scoreProduct(product: Product, tokens: string[]): number {
  const haystack = searchIndex.get(product.id) ?? "";
  const name = normalise(product.name);
  let score = 0;
  for (const token of tokens) {
    if (!haystack.includes(token)) return 0;
    if (name.startsWith(token)) score += 6;
    else if (name.includes(` ${token}`)) score += 4;
    else if (name.includes(token)) score += 3;
    else score += 1;
  }
  if (name === tokens.join(" ")) score += 20;
  if (product.inStock) score += 1;
  return score;
}

export function searchProducts(query: string, limit?: number): Product[] {
  const tokens = normalise(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return [];
  const scored: { product: Product; score: number }[] = [];
  for (const product of catalog.products) {
    const score = scoreProduct(product, tokens);
    if (score > 0) scored.push({ product, score });
  }
  scored.sort((a, b) => b.score - a.score || a.product.seed - b.product.seed);
  const items = scored.map((entry) => entry.product);
  return typeof limit === "number" ? items.slice(0, limit) : items;
}

export const DEFAULT_PER_PAGE = 24;

export function queryProducts(query: ProductQuery = {}): ProductQueryResult {
  const {
    categorySlug,
    search,
    minPrice,
    maxPrice,
    onSale,
    inStock,
    sort = "featured",
    page = 1,
    perPage = DEFAULT_PER_PAGE,
  } = query;

  const pool = search?.trim()
    ? searchProducts(search)
    : categorySlug
      ? getProductsInCategory(categorySlug)
      : catalog.products;

  const filtered = pool.filter((product) => {
    if (categorySlug && search?.trim()) {
      const slugs = descendantSlugs(categorySlug);
      if (!product.categorySlugs.some((slug) => slugs.has(slug))) return false;
    }
    if (typeof minPrice === "number" && product.price < minPrice) return false;
    if (typeof maxPrice === "number" && product.price > maxPrice) return false;
    if (onSale && !product.onSale) return false;
    if (inStock && !product.inStock) return false;
    return true;
  });

  // A relevance-ordered search result keeps its order unless a sort is chosen.
  const isRelevanceOrder = Boolean(search?.trim()) && sort === "featured";
  const items = isRelevanceOrder ? filtered : [...filtered].sort(SORTERS[sort]);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const start = (currentPage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    total,
    page: currentPage,
    perPage,
    pageCount,
  };
}

/** Price bounds for a set of products, used to seed price filters. */
export function getPriceBounds(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: catalog.stats.minPrice, max: catalog.stats.maxPrice };
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  for (const product of products) {
    if (product.price <= 0) continue;
    if (product.price < min) min = product.price;
    if (product.price > max) max = product.price;
  }
  if (!Number.isFinite(min)) min = 0;
  return { min: Math.floor(min), max: Math.ceil(max) };
}

/* --------------------------------------------------------------- merchandising */

/** Deterministic pick so server and client render the same rails. */
function pickStable(products: Product[], count: number, offset = 0): Product[] {
  const sorted = [...products].sort((a, b) => a.seed - b.seed);
  if (sorted.length <= count) return sorted;
  const start = offset % sorted.length;
  const picked = [];
  for (let i = 0; i < count; i += 1) picked.push(sorted[(start + i) % sorted.length]);
  return picked;
}

/** The most recently added products, used for the "New" badge. */
const NEW_ARRIVAL_IDS = new Set(catalog.products.slice(0, 60).map((product) => product.id));

export function isNewArrival(product: Product): boolean {
  return NEW_ARRIVAL_IDS.has(product.id);
}

export function getFeaturedProducts(count = 8): Product[] {
  const pool = catalog.products.filter(
    (product) => product.inStock && product.purchasable && product.images.length > 0,
  );
  return pickStable(pool, count, 3);
}

export function getNewArrivals(count = 8): Product[] {
  return catalog.products
    .filter((product) => product.inStock && product.purchasable)
    .slice(0, count);
}

export function getBestDeals(count = 8): Product[] {
  return catalog.products
    .filter((product) => product.onSale && product.inStock && product.discountPercent > 0)
    .sort((a, b) => b.discountPercent - a.discountPercent || a.seed - b.seed)
    .slice(0, count);
}

export function getGiftsUnder(maxPrice: number, count = 8): Product[] {
  const pool = catalog.products.filter(
    (product) => product.purchasable && product.inStock && product.price > 0 && product.price <= maxPrice,
  );
  return pickStable(pool, count, 11);
}

export function getTrendingCategories(count = 8): Category[] {
  return getLeafCategories()
    .filter((category) => Boolean(category.image))
    .slice(0, count);
}

/** Same-category products first, then price-adjacent picks from the parent. */
export function getRelatedProducts(product: Product, count = 8): Product[] {
  const seen = new Set<number>([product.id]);
  const result: Product[] = [];

  const pushFrom = (pool: Product[]) => {
    for (const candidate of pool) {
      if (result.length >= count) return;
      if (seen.has(candidate.id)) continue;
      seen.add(candidate.id);
      result.push(candidate);
    }
  };

  const primary = getPrimaryCategory(product);
  if (primary) {
    const siblings = getProductsInCategory(primary.slug)
      .filter((candidate) => candidate.inStock)
      .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price));
    pushFrom(siblings);

    if (result.length < count && primary.parentSlug) {
      pushFrom(
        getProductsInCategory(primary.parentSlug)
          .filter((candidate) => candidate.inStock)
          .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price)),
      );
    }
  }

  if (result.length < count) pushFrom(getFeaturedProducts(count * 2));
  return result.slice(0, count);
}
