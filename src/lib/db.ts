/**
 * Live database layer for the storefront.
 *
 * Every function here queries Supabase directly and returns data in the same
 * shape as the static catalog. If Supabase fails for any reason, the function
 * falls back to the static catalog silently — the page never blanks out.
 *
 * This file replaces the old data.ts approach. Pages import from here.
 */
import { createClient } from "@supabase/supabase-js";

import * as staticCatalog from "./catalog";
import type { Category, Product, ProductQuery, ProductQueryResult } from "./types";

// ============================================================================
// Supabase client (service role — server only, bypasses RLS)
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ============================================================================
// PRODUCTS
// ============================================================================

export async function getProducts(query: ProductQuery = {}): Promise<ProductQueryResult> {
  const supabase = getSupabase();
  if (!supabase) return staticCatalog.queryProducts(query);

  try {
    const {
      categorySlug,
      search,
      minPrice,
      maxPrice,
      onSale,
      inStock,
      sort = "featured",
      page = 1,
      perPage = 24,
    } = query;

    let q = supabase
      .from("products")
      .select(`
        id, slug, name, sku, type, description, short_description,
        price, regular_price, on_sale, discount_percent,
        in_stock, is_purchasable, is_featured,
        primary_category_id,
        product_images(url, alt, sort_order),
        product_options(name, slug, sort_order, option_values(value, sort_order))
      `, { count: "exact" });

    // Category filter
    if (categorySlug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();

      if (cat) {
        // Get category + its children
        const { data: catIds } = await supabase
          .from("categories")
          .select("id")
          .or(`id.eq.${cat.id},parent_id.eq.${cat.id}`);

        const ids = catIds?.map((c: { id: number }) => c.id) ?? [cat.id];

        // Filter by category via junction table
        const { data: productIds } = await supabase
          .from("product_categories")
          .select("product_id")
          .in("category_id", ids);

        if (productIds && productIds.length > 0) {
          q = q.in("id", productIds.map((p: { product_id: number }) => p.product_id));
        } else {
          return { items: [], total: 0, page, perPage, pageCount: 0 };
        }
      }
    }

    // Search
    if (search && search.trim().length >= 2) {
      q = q.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    // Filters
    if (typeof minPrice === "number") q = q.gte("price", minPrice);
    if (typeof maxPrice === "number") q = q.lte("price", maxPrice);
    if (onSale) q = q.eq("on_sale", true);
    if (inStock) q = q.eq("in_stock", true);

    // Sort
    switch (sort) {
      case "newest": q = q.order("id", { ascending: false }); break;
      case "price-asc": q = q.order("price", { ascending: true }); break;
      case "price-desc": q = q.order("price", { ascending: false }); break;
      case "discount": q = q.order("discount_percent", { ascending: false }); break;
      case "name-asc": q = q.order("name", { ascending: true }); break;
      default: q = q.order("is_featured", { ascending: false }).order("id", { ascending: false }); break;
    }

    // Pagination
    const from = (page - 1) * perPage;
    q = q.range(from, from + perPage - 1);

    const { data, count, error } = await q;

    if (error || !data) {
      console.error("[db] getProducts error:", error?.message);
      return staticCatalog.queryProducts(query);
    }

    const total = count ?? 0;
    const items = data.map(mapProduct);

    return {
      items,
      total,
      page,
      perPage,
      pageCount: Math.max(1, Math.ceil(total / perPage)),
    };
  } catch (err) {
    console.error("[db] getProducts exception:", (err as Error).message);
    return staticCatalog.queryProducts(query);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = getSupabase();
  if (!supabase) return staticCatalog.getProductBySlug(slug);

  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id, slug, name, sku, type, description, short_description,
        price, regular_price, on_sale, discount_percent,
        in_stock, is_purchasable, is_featured,
        primary_category_id,
        product_images(url, alt, sort_order),
        product_options(name, slug, sort_order, option_values(value, sort_order))
      `)
      .eq("slug", slug)
      .single();

    if (error || !data) return staticCatalog.getProductBySlug(slug);
    return mapProduct(data);
  } catch {
    return staticCatalog.getProductBySlug(slug);
  }
}

export async function searchProducts(query: string, limit = 6): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase || query.trim().length < 2) return staticCatalog.searchProducts(query, limit);

  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id, slug, name, sku, type, price, regular_price, on_sale, discount_percent,
        in_stock, is_purchasable, is_featured, primary_category_id,
        product_images(url, alt, sort_order),
        product_options(name, slug, sort_order, option_values(value, sort_order))
      `)
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
      .order("is_featured", { ascending: false })
      .limit(limit);

    if (error || !data) return staticCatalog.searchProducts(query, limit);
    return data.map(mapProduct);
  } catch {
    return staticCatalog.searchProducts(query, limit);
  }
}

// ============================================================================
// CATEGORIES
// ============================================================================

export async function getAllCategories(): Promise<Category[]> {
  const supabase = getSupabase();
  if (!supabase) return staticCatalog.getAllCategories();

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, parent_id, image_url, image_alt, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order");

    if (error || !data) return staticCatalog.getAllCategories();

    // Get product counts
    const { data: counts } = await supabase
      .from("product_categories")
      .select("category_id");

    const countMap = new Map<number, number>();
    (counts ?? []).forEach((row: { category_id: number }) => {
      countMap.set(row.category_id, (countMap.get(row.category_id) ?? 0) + 1);
    });

    return data.map((row: any) => mapCategory(row, countMap));
  } catch {
    return staticCatalog.getAllCategories();
  }
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const supabase = getSupabase();
  if (!supabase) return staticCatalog.getCategory(slug);

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, parent_id, image_url, image_alt, sort_order, is_active")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) return staticCatalog.getCategory(slug);

    const { data: counts } = await supabase
      .from("product_categories")
      .select("category_id")
      .eq("category_id", data.id);

    const countMap = new Map<number, number>();
    countMap.set(data.id, counts?.length ?? 0);

    // Also get child counts
    const { data: children } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", data.id);

    if (children) {
      const childIds = children.map((c: { id: number }) => c.id);
      if (childIds.length > 0) {
        const { data: childCounts } = await supabase
          .from("product_categories")
          .select("category_id")
          .in("category_id", childIds);
        (childCounts ?? []).forEach((row: { category_id: number }) => {
          countMap.set(row.category_id, (countMap.get(row.category_id) ?? 0) + 1);
        });
      }
    }

    const totalCount = [...countMap.values()].reduce((sum, n) => sum + n, 0);
    const cat = mapCategory(data, countMap);
    cat.totalCount = totalCount;
    return cat;
  } catch {
    return staticCatalog.getCategory(slug);
  }
}

// ============================================================================
// RE-EXPORTS (things that work fine from static catalog, no DB needed)
// ============================================================================

export const CATALOG_STATS = staticCatalog.CATALOG_STATS;
export const SORT_OPTIONS = staticCatalog.SORT_OPTIONS;
export const DEFAULT_PER_PAGE = staticCatalog.DEFAULT_PER_PAGE;
export const getAllProducts = staticCatalog.getAllProducts;
export const getRootCategories = staticCatalog.getRootCategories;
export const getChildCategories = staticCatalog.getChildCategories;
export const getCategoryAncestors = staticCatalog.getCategoryAncestors;
export const getProductsInCategory = staticCatalog.getProductsInCategory;
export const getPriceBounds = staticCatalog.getPriceBounds;
export const getPrimaryCategory = staticCatalog.getPrimaryCategory;
export const getRelatedProducts = staticCatalog.getRelatedProducts;
export const isNewArrival = staticCatalog.isNewArrival;
export const getFeaturedProducts = staticCatalog.getFeaturedProducts;
export const getNewArrivals = staticCatalog.getNewArrivals;
export const getBestDeals = staticCatalog.getBestDeals;
export const getGiftsUnder = staticCatalog.getGiftsUnder;
export const getTrendingCategories = staticCatalog.getTrendingCategories;
export const getProductsByIds = staticCatalog.getProductsByIds;

// ============================================================================
// MAPPERS
// ============================================================================

function mapProduct(row: any): Product {
  const images = (row.product_images ?? [])
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((img: any) => ({ src: img.url, alt: img.alt || row.name }));

  const options = (row.product_options ?? [])
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((opt: any) => ({
      name: opt.name,
      slug: opt.slug,
      values: (opt.option_values ?? [])
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((v: any) => v.value),
    }));

  const price = Number(row.price) || 0;
  const regularPrice = Number(row.regular_price) || price;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku || null,
    type: row.type || "simple",
    price,
    regularPrice,
    onSale: Boolean(row.on_sale),
    discountPercent: row.discount_percent || 0,
    inStock: Boolean(row.in_stock),
    purchasable: Boolean(row.is_purchasable),
    description: row.description || "",
    shortDescription: row.short_description || "",
    images: images.length > 0 ? images : [{ src: "/placeholder-product.svg", alt: row.name }],
    categorySlugs: [],
    categorySource: "source",
    primaryCategory: null,
    options,
    variationCount: options.reduce((acc: number, opt: any) => acc + opt.values.length, 0),
    seed: ((row.id * 2654435761) >>> 0) / 0xffffffff,
  };
}

function mapCategory(row: any, countMap: Map<number, number>): Category {
  const directCount = countMap.get(row.id) ?? 0;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sourceName: row.name,
    path: [row.slug],
    parentSlug: null,
    depth: row.parent_id ? 1 : 0,
    childSlugs: [],
    directCount,
    totalCount: directCount,
    image: row.image_url,
    imageAlt: row.image_alt || "",
  };
}
