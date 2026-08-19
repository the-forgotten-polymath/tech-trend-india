import { createServiceClient } from "./server";
import type { Database } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Supabase query layer.
 *
 * NOTE: Some calls use `as any` casts because the Supabase client infers types
 * from the Database generic, and complex insert/update shapes don't always
 * align at compile time without a live `supabase gen types` output. At runtime,
 * the data is validated by Postgres constraints and RLS policies.
 */

type Product = Database["public"]["Tables"]["products"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
type ProductOption = Database["public"]["Tables"]["product_options"]["Row"];
type OptionValue = Database["public"]["Tables"]["option_values"]["Row"];

// ============================================================================
// TYPES used across the app (re-exported for convenience)
// ============================================================================

export type ProductWithDetails = Product & {
  images: Pick<ProductImage, "url" | "alt" | "sort_order">[];
  categories: Pick<Category, "id" | "slug" | "name">[];
  options: (Pick<ProductOption, "id" | "name" | "slug"> & { values: string[] })[];
  category_slug: string | null;
  category_name: string | null;
};

export type CategoryWithCount = Category & {
  product_count: number;
  children?: CategoryWithCount[];
};

// ============================================================================
// QUERY CONFIG
// ============================================================================

const USE_SUPABASE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

/**
 * Returns the service client for server-side data fetching.
 * If Supabase is not configured, returns null — the caller should fall back
 * to the static catalog.
 */
function getClient() {
  if (!USE_SUPABASE) return null;
  return createServiceClient();
}

// ============================================================================
// CATEGORY QUERIES
// ============================================================================

export async function fetchAllCategories(): Promise<CategoryWithCount[] | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from("categories_with_count")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[supabase] fetchAllCategories:", error.message);
    return null;
  }
  return data as CategoryWithCount[];
}

export async function fetchCategory(slug: string): Promise<CategoryWithCount | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from("categories_with_count")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as CategoryWithCount;
}

export async function fetchChildCategories(parentId: number): Promise<CategoryWithCount[]> {
  const client = getClient();
  if (!client) return [];

  const { data, error } = await client
    .from("categories_with_count")
    .select("*")
    .eq("parent_id", parentId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return [];
  return data as CategoryWithCount[];
}

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

export type ProductQueryOptions = {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  inStock?: boolean;
  isFeatured?: boolean;
  sort?: "newest" | "price-asc" | "price-desc" | "discount" | "name-asc" | "featured";
  page?: number;
  perPage?: number;
};

export type ProductQueryResult = {
  products: ProductWithDetails[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

export async function fetchProducts(options: ProductQueryOptions = {}): Promise<ProductQueryResult | null> {
  const client = getClient();
  if (!client) return null;

  const {
    categorySlug,
    search,
    minPrice,
    maxPrice,
    onSale,
    inStock,
    isFeatured,
    sort = "featured",
    page = 1,
    perPage = 24,
  } = options;

  // Start with a base query on the products table
  let query = client.from("products").select(
    `
      *,
      product_images(url, alt, sort_order),
      product_categories!inner(category_id, categories!inner(id, slug, name)),
      product_options(id, name, slug, sort_order, option_values(value, sort_order)),
      primary_category:categories!products_primary_category_id_fkey(slug, name)
    `,
    { count: "exact" },
  );

  // Filter by category (including child categories)
  if (categorySlug) {
    // Get the category and its descendants
    const { data: catData } = await client
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (catData) {
      // Get all descendant category IDs
      const { data: descendants } = await client
        .from("categories")
        .select("id")
        .or(`id.eq.${(catData as any).id},parent_id.eq.${(catData as any).id}`);

      const catIds = (descendants as any[])?.map((d: { id: number }) => d.id) ?? [(catData as any).id];
      query = query.in("product_categories.category_id", catIds);
    }
  }

  // Full-text search
  if (search && search.trim().length >= 2) {
    const terms = search.trim().split(/\s+/).join(" & ");
    query = query.textSearch("name", terms, { type: "websearch", config: "english" });
  }

  // Filters
  if (typeof minPrice === "number") query = query.gte("price", minPrice);
  if (typeof maxPrice === "number") query = query.lte("price", maxPrice);
  if (onSale) query = query.eq("on_sale", true);
  if (inStock) query = query.eq("in_stock", true);
  if (isFeatured) query = query.eq("is_featured", true);

  // Sorting
  switch (sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "discount":
      query = query.order("discount_percent", { ascending: false });
      break;
    case "name-asc":
      query = query.order("name", { ascending: true });
      break;
    case "featured":
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("in_stock", { ascending: false })
        .order("created_at", { ascending: false });
      break;
  }

  // Pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("[supabase] fetchProducts:", error.message);
    return null;
  }

  const total = count ?? 0;
  const products = (data ?? []).map(normalizeProduct);

  return {
    products,
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function fetchProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from("products")
    .select(
      `
      *,
      product_images(url, alt, sort_order),
      product_categories(category_id, categories(id, slug, name)),
      product_options(id, name, slug, sort_order, option_values(value, sort_order)),
      primary_category:categories!products_primary_category_id_fkey(slug, name)
    `,
    )
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return normalizeProduct(data);
}

export async function fetchProductsByIds(ids: number[]): Promise<ProductWithDetails[]> {
  const client = getClient();
  if (!client || ids.length === 0) return [];

  const { data, error } = await client
    .from("products")
    .select(
      `
      *,
      product_images(url, alt, sort_order),
      product_categories(category_id, categories(id, slug, name)),
      product_options(id, name, slug, sort_order, option_values(value, sort_order)),
      primary_category:categories!products_primary_category_id_fkey(slug, name)
    `,
    )
    .in("id", ids);

  if (error) return [];
  return (data ?? []).map(normalizeProduct);
}

export async function fetchProductSlugs(): Promise<string[]> {
  const client = getClient();
  if (!client) return [];

  const { data } = await client.from("products").select("slug");
  return data?.map((p: { slug: string }) => p.slug) ?? [];
}

export async function fetchCategorySlugs(): Promise<string[]> {
  const client = getClient();
  if (!client) return [];

  const { data } = await client.from("categories").select("slug").eq("is_active", true);
  return data?.map((c: { slug: string }) => c.slug) ?? [];
}

// ============================================================================
// COUPON QUERIES
// ============================================================================

export async function fetchCoupon(code: string) {
  const client = getClient();
  if (!client) return null;

  const { data } = await client
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  return data;
}

// ============================================================================
// ORDER QUERIES (for admin and user)
// ============================================================================

export async function insertOrder(
  order: Database["public"]["Tables"]["orders"]["Insert"],
  items: Database["public"]["Tables"]["order_items"]["Insert"][],
) {
  const client = getClient();
  if (!client) return { error: "Supabase not configured" };

  const { error: orderError } = await client.from("orders").insert(order as any);
  if (orderError) return { error: orderError.message };

  const { error: itemsError } = await client.from("order_items").insert(items as any);
  if (itemsError) return { error: itemsError.message };

  return { error: null, orderId: order.id };
}

export async function updateOrderStatus(
  orderId: string,
  updates: Database["public"]["Tables"]["orders"]["Update"],
) {
  const client = getClient();
  if (!client) return { error: "Supabase not configured" };

  // @ts-expect-error — Supabase update inference issue without live gen types
  const { error } = await client.from("orders").update(updates).eq("id", orderId);
  return { error: error?.message ?? null };
}

export async function fetchOrders(options: { status?: string; page?: number; perPage?: number } = {}) {
  const client = getClient();
  if (!client) return null;

  const { status, page = 1, perPage = 20 } = options;
  let query = client
    .from("orders")
    .select("*, order_items(*)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data, error, count } = await query;
  if (error) return null;

  return { orders: data ?? [], total: count ?? 0, page, perPage };
}

export async function fetchOrderById(id: string) {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// ============================================================================
// STORE SETTINGS
// ============================================================================

export async function fetchSetting(key: string) {
  const client = getClient();
  if (!client) return null;

  const { data } = await client.from("store_settings").select("value").eq("key", key).single();
  return (data as any)?.value ?? null;
}

export async function updateSetting(key: string, value: unknown) {
  const client = getClient();
  if (!client) return;

  await client.from("store_settings").upsert({ key, value } as any);
}

// ============================================================================
// HELPERS
// ============================================================================

 
function normalizeProduct(raw: any): ProductWithDetails {
  const images = (raw.product_images ?? [])
    .sort((a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order)
    .map((img: ProductImage) => ({ url: img.url, alt: img.alt, sort_order: img.sort_order }));

  const categories = (raw.product_categories ?? [])
    .map((pc: { categories: Pick<Category, "id" | "slug" | "name"> }) => pc.categories)
    .filter(Boolean);

  const options = (raw.product_options ?? [])
    .sort((a: ProductOption, b: ProductOption) => a.sort_order - b.sort_order)
    .map((opt: ProductOption & { option_values?: OptionValue[] }) => ({
      id: opt.id,
      name: opt.name,
      slug: opt.slug,
      values: (opt.option_values ?? [])
        .sort((a: OptionValue, b: OptionValue) => a.sort_order - b.sort_order)
        .map((v: OptionValue) => v.value),
    }));

  const primaryCat = raw.primary_category;

  return {
    ...raw,
    images,
    categories,
    options,
    category_slug: primaryCat?.slug ?? categories[0]?.slug ?? null,
    category_name: primaryCat?.name ?? categories[0]?.name ?? null,
    // Remove nested relations from the top-level object
    product_images: undefined,
    product_categories: undefined,
    product_options: undefined,
    primary_category: undefined,
  };
}

// ============================================================================
// UTILITY: Check if Supabase is configured
// ============================================================================

export function isSupabaseConfigured(): boolean {
  return USE_SUPABASE;
}
