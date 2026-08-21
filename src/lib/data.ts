/**
 * Unified data layer.
 *
 * This module is the single entry point for fetching products and categories
 * throughout the storefront. It checks whether Supabase is configured:
 *
 * - If YES → queries live from the database (SSR, always fresh)
 * - If NO  → falls back to the static catalog.json (the current behaviour)
 *
 * All functions have two variants:
 * - Sync (e.g. `getAllCategories()`) — uses static catalog, works everywhere
 * - Async (e.g. `fetchAllCategoriesLive()`) — tries Supabase first, falls back
 *
 * Pages that need live data should `await` the async variants.
 * Components that only need display logic use the sync ones (which are fast,
 * deterministic, and never hit the network).
 */
import * as staticCatalog from "./catalog";
import {
  fetchAllCategories,
  fetchCategory,
  fetchChildCategories,
  fetchProducts,
  fetchProductBySlug,
  fetchProductsByIds,
  fetchProductSlugs,
  fetchCategorySlugs,
  isSupabaseConfigured,
  type ProductQueryOptions,
  type ProductWithDetails,
  type CategoryWithCount,
} from "./supabase/queries";
import type { Category, Product, ProductQueryResult, SortKey } from "./types";

// ============================================================================
// Whether we're using live data or the static fallback
// ============================================================================

export const LIVE_MODE = isSupabaseConfigured();

// ============================================================================
// SYNC EXPORTS — same interface as catalog.ts (no breaking change for pages)
// These always work, even without Supabase configured.
// ============================================================================

export const getAllCategories = staticCatalog.getAllCategories;
export const getCategory = staticCatalog.getCategory;
export const getChildCategories = staticCatalog.getChildCategories;
export const getCategoryAncestors = staticCatalog.getCategoryAncestors;
export const getRootCategories = staticCatalog.getRootCategories;
export const getLeafCategories = staticCatalog.getLeafCategories;

export const getAllProducts = staticCatalog.getAllProducts;
export const getProductBySlug = staticCatalog.getProductBySlug;
export const getProductById = staticCatalog.getProductById;
export const getProductsByIds = staticCatalog.getProductsByIds;
export const getProductsInCategory = staticCatalog.getProductsInCategory;
export const getPrimaryCategory = staticCatalog.getPrimaryCategory;
export const isNewArrival = staticCatalog.isNewArrival;

export const queryProducts = staticCatalog.queryProducts;
export const searchProducts = staticCatalog.searchProducts;

export const getFeaturedProducts = staticCatalog.getFeaturedProducts;
export const getNewArrivals = staticCatalog.getNewArrivals;
export const getBestDeals = staticCatalog.getBestDeals;
export const getGiftsUnder = staticCatalog.getGiftsUnder;
export const getTrendingCategories = staticCatalog.getTrendingCategories;
export const getRelatedProducts = staticCatalog.getRelatedProducts;
export const getPriceBounds = staticCatalog.getPriceBounds;

export const CATALOG_STATS = staticCatalog.CATALOG_STATS;
export const SORT_OPTIONS = staticCatalog.SORT_OPTIONS;
export const DEFAULT_PER_PAGE = staticCatalog.DEFAULT_PER_PAGE;

// ============================================================================
// ASYNC EXPORTS — these try Supabase first, fall back to static.
// Use these in pages/routes that should read live data when Supabase is up.
// ============================================================================

export async function fetchCategoryLive(slug: string): Promise<Category | undefined> {
  if (LIVE_MODE) {
    const category = await fetchCategory(slug);
    if (category) return mapCategory(category);
  }
  return staticCatalog.getCategory(slug);
}

export async function fetchAllCategoriesLive(): Promise<Category[]> {
  if (LIVE_MODE) {
    const categories = await fetchAllCategories();
    if (categories) return categories.map(mapCategory);
  }
  return staticCatalog.getAllCategories();
}

export async function fetchChildCategoriesLive(slug: string): Promise<Category[]> {
  if (LIVE_MODE) {
    const parent = await fetchCategory(slug);
    if (parent) {
      const children = await fetchChildCategories(parent.id);
      return children.map(mapCategory);
    }
  }
  return staticCatalog.getChildCategories(slug);
}

export async function fetchCategoryAncestorsLive(slug: string): Promise<Category[]> {
  if (LIVE_MODE) {
    const all = await fetchAllCategories();
    if (all) {
      const allMapped = all.map(mapCategory);
      const bySlug = new Map(allMapped.map(c => [c.slug, c]));
      const ancestors: Category[] = [];
      let current = bySlug.get(slug);
      while (current && current.parentSlug) {
        const parent = bySlug.get(current.parentSlug);
        if (parent) {
          ancestors.unshift(parent);
          current = parent;
        } else {
          break;
        }
      }
      return ancestors;
    }
  }
  return staticCatalog.getCategoryAncestors(slug);
}

export async function fetchProductBySlugLive(slug: string): Promise<Product | undefined> {
  if (LIVE_MODE) {
    const product = await fetchProductBySlug(slug);
    if (product) return mapProduct(product);
  }
  return staticCatalog.getProductBySlug(slug);
}

export async function fetchProductsByIdsLive(ids: number[]): Promise<Product[]> {
  if (LIVE_MODE) {
    const products = await fetchProductsByIds(ids);
    if (products.length > 0) return products.map(mapProduct);
  }
  return staticCatalog.getProductsByIds(ids);
}

export async function queryProductsLive(options: {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  inStock?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}): Promise<ProductQueryResult> {
  if (LIVE_MODE) {
    const result = await fetchProducts({
      ...options,
      sort: options.sort as ProductQueryOptions["sort"],
    });
    if (result) {
      return {
        items: result.products.map(mapProduct),
        total: result.total,
        page: result.page,
        perPage: result.perPage,
        pageCount: result.pageCount,
      };
    }
  }
  return staticCatalog.queryProducts(options);
}

export async function searchProductsLive(query: string, limit?: number): Promise<Product[]> {
  if (LIVE_MODE) {
    const result = await fetchProducts({ search: query, perPage: limit ?? 50 });
    if (result) return result.products.map(mapProduct);
  }
  return staticCatalog.searchProducts(query, limit);
}

export async function fetchProductSlugsForParams(): Promise<string[]> {
  if (LIVE_MODE) {
    const slugs = await fetchProductSlugs();
    if (slugs.length > 0) return slugs;
  }
  return staticCatalog.getAllProducts().map((p) => p.slug);
}

export async function fetchProductsInCategoryLive(slug: string): Promise<Product[]> {
  if (LIVE_MODE) {
    const result = await fetchProducts({ categorySlug: slug, perPage: 100 });
    if (result) return result.products.map(mapProduct);
  }
  return staticCatalog.getProductsInCategory(slug);
}

export async function fetchFeaturedProductsLive(count = 8): Promise<Product[]> {
  if (LIVE_MODE) {
    const result = await fetchProducts({ isFeatured: true, inStock: true, perPage: count });
    if (result) return result.products.map(mapProduct);
  }
  return staticCatalog.getFeaturedProducts(count);
}

export async function fetchNewArrivalsLive(count = 8): Promise<Product[]> {
  if (LIVE_MODE) {
    const result = await fetchProducts({ sort: "newest", inStock: true, perPage: count });
    if (result) return result.products.map(mapProduct);
  }
  return staticCatalog.getNewArrivals(count);
}

export async function fetchBestDealsLive(count = 8): Promise<Product[]> {
  if (LIVE_MODE) {
    const result = await fetchProducts({ sort: "discount", onSale: true, inStock: true, perPage: count });
    if (result) return result.products.map(mapProduct);
  }
  return staticCatalog.getBestDeals(count);
}

export async function fetchRelatedProductsLive(product: Product, count = 8): Promise<Product[]> {
  if (LIVE_MODE) {
    // Basic approximation of related: same primary category + featured
    const pool: Product[] = [];
    if (product.primaryCategory) {
      const sameCat = await fetchProducts({ categorySlug: product.primaryCategory, inStock: true, perPage: 20 });
      if (sameCat) pool.push(...sameCat.products.map(mapProduct));
    }
    const featured = await fetchProducts({ isFeatured: true, inStock: true, perPage: count * 2 });
    if (featured) pool.push(...featured.products.map(mapProduct));

    const seen = new Set<number>([product.id]);
    const result: Product[] = [];
    for (const candidate of pool) {
      if (result.length >= count) break;
      if (!seen.has(candidate.id)) {
        seen.add(candidate.id);
        result.push(candidate);
      }
    }
    return result;
  }
  return staticCatalog.getRelatedProducts(product, count);
}

export async function fetchTrendingCategoriesLive(count = 8): Promise<Category[]> {
  if (LIVE_MODE) {
    const all = await fetchAllCategories();
    if (all) {
      return all
        .filter(c => c.image_url) // leaf roughly translates to having products and an image
        .slice(0, count)
        .map(mapCategory);
    }
  }
  return staticCatalog.getTrendingCategories(count);
}

export async function fetchCategorySlugsForParams(): Promise<string[]> {
  if (LIVE_MODE) {
    const slugs = await fetchCategorySlugs();
    if (slugs.length > 0) return slugs;
  }
  return staticCatalog.getAllCategories().map((c) => c.slug);
}

// ============================================================================
// MAPPERS (Supabase row → app Product/Category type)
// ============================================================================

function mapProduct(row: ProductWithDetails): Product {
  const staticProd = staticCatalog.getProductById(row.id);
  
  let images: { src: string; alt: string }[] = [];
  if (staticProd && staticProd.images.length > 0 && staticProd.images[0].src !== "/placeholder-product.svg") {
    images = staticProd.images;
  } else if (row.images.length > 0) {
    images = row.images.map((img) => ({ src: img.url, alt: img.alt }));
  } else {
    images = [{ src: "/placeholder-product.svg", alt: row.name }];
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    type: row.type as "simple" | "variable",
    price: Number(row.price),
    regularPrice: Number(row.regular_price),
    onSale: row.on_sale,
    discountPercent: row.discount_percent,
    inStock: row.in_stock,
    purchasable: row.is_purchasable,
    description: row.description,
    shortDescription: row.short_description,
    images,
    categorySlugs: row.categories.map((c) => c.slug),
    categorySource: "source",
    primaryCategory: row.category_slug,
    options: row.options.map((opt) => ({
      name: opt.name,
      slug: opt.slug,
      values: opt.values,
    })),
    variationCount: row.options.reduce((acc, opt) => acc + opt.values.length, 0),
    seed: (row.id * 2654435761 >>> 0) / 0xffffffff,
  };
}

function mapCategory(row: CategoryWithCount): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sourceName: row.name,
    path: [row.slug],
    parentSlug: null,
    depth: row.parent_id ? 1 : 0,
    childSlugs: [],
    directCount: row.product_count ?? 0,
    totalCount: row.product_count ?? 0,
    image: row.image_url,
    imageAlt: row.image_alt,
  };
}
