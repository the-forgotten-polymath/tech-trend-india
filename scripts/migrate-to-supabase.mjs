/**
 * Migrate catalog.json → Supabase tables.
 *
 * Usage:
 *   1. Create your Supabase project and run supabase/schema.sql
 *   2. Copy .env.example to .env.local and fill in your keys
 *   3. Run: node scripts/migrate-to-supabase.mjs
 *
 * This script uses the SERVICE_ROLE_KEY to bypass RLS.
 * It's idempotent — running it again will upsert (update existing, insert new).
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// Load .env.local manually (no dotenv dependency required)
function loadEnv() {
  const envPath = path.join(import.meta.dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("✖ .env.local not found. Copy .env.example and fill in your Supabase keys.");
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("✖ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ROOT = path.resolve(import.meta.dirname, "..");
const CATALOG_PATH = path.join(ROOT, "src", "data", "catalog.json");

if (!fs.existsSync(CATALOG_PATH)) {
  console.error("✖ src/data/catalog.json not found. Run `npm run prepare:data` first.");
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
console.log(`→ Loaded catalog: ${catalog.products.length} products, ${catalog.categories.length} categories`);

const BATCH_SIZE = 100;

async function upsertBatch(table, rows, conflictKey = "id") {
  if (rows.length === 0) return;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict: conflictKey, ignoreDuplicates: false });
    if (error) {
      console.error(`✖ Error upserting into ${table} (batch ${i}–${i + batch.length}):`, error.message);
      // Log first failing row for debugging
      console.error("  First row:", JSON.stringify(batch[0]).slice(0, 200));
      process.exit(1);
    }
  }
}

async function insertBatch(table, rows) {
  if (rows.length === 0) return;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).insert(batch);
    if (error) {
      // Ignore duplicate key errors for junction tables
      if (error.code === "23505") continue;
      console.error(`✖ Error inserting into ${table} (batch ${i}–${i + batch.length}):`, error.message);
      process.exit(1);
    }
  }
}

// ============================================================================
// 1. CATEGORIES
// ============================================================================

console.log("\n1. Migrating categories…");

// First pass: insert all categories without parent_id (to avoid FK issues)
const categoryRows = catalog.categories.map((cat, index) => ({
  slug: cat.slug,
  name: cat.name,
  description: cat.sourceName ? `Originally: ${cat.sourceName}` : "",
  parent_id: null, // Set in second pass
  image_url: cat.image,
  image_alt: cat.imageAlt || "",
  sort_order: index,
  is_active: true,
}));

await upsertBatch("categories", categoryRows, "slug");

// Fetch back the IDs so we can set parent_id and reference them for products
const { data: dbCategories } = await supabase.from("categories").select("id, slug");
const catIdBySlug = new Map(dbCategories.map((c) => [c.slug, c.id]));

// Second pass: set parent_id
const parentUpdates = catalog.categories
  .filter((cat) => cat.parentSlug && catIdBySlug.has(cat.parentSlug))
  .map((cat) => ({
    slug: cat.slug,
    parent_id: catIdBySlug.get(cat.parentSlug),
  }));

for (const update of parentUpdates) {
  await supabase.from("categories").update({ parent_id: update.parent_id }).eq("slug", update.slug);
}

console.log(`   ✓ ${categoryRows.length} categories upserted, ${parentUpdates.length} parents linked`);

// ============================================================================
// 2. PRODUCTS
// ============================================================================

console.log("\n2. Migrating products…");

const productRows = catalog.products.map((prod, index) => ({
  slug: prod.slug,
  name: prod.name,
  sku: prod.sku || null,
  type: prod.type,
  description: prod.description || "",
  short_description: prod.shortDescription || "",
  price: prod.price,
  regular_price: prod.regularPrice,
  on_sale: prod.onSale,
  discount_percent: prod.discountPercent,
  in_stock: prod.inStock,
  stock_quantity: null,
  is_purchasable: prod.purchasable,
  is_featured: index < 60, // First 60 products (newest) are featured
  sort_order: index,
  primary_category_id: prod.primaryCategory ? catIdBySlug.get(prod.primaryCategory) || null : null,
}));

await upsertBatch("products", productRows, "slug");

// Fetch back product IDs
const { data: dbProducts } = await supabase.from("products").select("id, slug");
const prodIdBySlug = new Map(dbProducts.map((p) => [p.slug, p.id]));

console.log(`   ✓ ${productRows.length} products upserted`);

// ============================================================================
// 3. PRODUCT ↔ CATEGORY JUNCTION
// ============================================================================

console.log("\n3. Migrating product-category links…");

// Clear existing links first (to handle re-runs cleanly)
await supabase.from("product_categories").delete().neq("product_id", 0);

const pcRows = [];
for (const prod of catalog.products) {
  const productId = prodIdBySlug.get(prod.slug);
  if (!productId) continue;
  for (const catSlug of prod.categorySlugs) {
    const categoryId = catIdBySlug.get(catSlug);
    if (categoryId) pcRows.push({ product_id: productId, category_id: categoryId });
  }
}

await insertBatch("product_categories", pcRows);
console.log(`   ✓ ${pcRows.length} product-category links inserted`);

// ============================================================================
// 4. PRODUCT IMAGES
// ============================================================================

console.log("\n4. Migrating product images…");

// Clear existing images (for clean re-run)
await supabase.from("product_images").delete().neq("id", 0);

const imageRows = [];
for (const prod of catalog.products) {
  const productId = prodIdBySlug.get(prod.slug);
  if (!productId) continue;
  for (let i = 0; i < prod.images.length; i++) {
    const img = prod.images[i];
    imageRows.push({
      product_id: productId,
      url: img.src,
      alt: img.alt || prod.name,
      sort_order: i,
    });
  }
}

await insertBatch("product_images", imageRows);
console.log(`   ✓ ${imageRows.length} product images inserted`);

// ============================================================================
// 5. PRODUCT OPTIONS & VALUES
// ============================================================================

console.log("\n5. Migrating product options…");

// Clear existing options
await supabase.from("option_values").delete().neq("id", 0);
await supabase.from("product_options").delete().neq("id", 0);

let optionCount = 0;
let valueCount = 0;

for (const prod of catalog.products) {
  if (prod.options.length === 0) continue;
  const productId = prodIdBySlug.get(prod.slug);
  if (!productId) continue;

  for (let oi = 0; oi < prod.options.length; oi++) {
    const option = prod.options[oi];

    const { data: optRow, error: optError } = await supabase
      .from("product_options")
      .insert({ product_id: productId, name: option.name, slug: option.slug, sort_order: oi })
      .select("id")
      .single();

    if (optError) {
      console.error(`   ✖ Error inserting option for ${prod.slug}:`, optError.message);
      continue;
    }
    optionCount++;

    const valueRows = option.values.map((val, vi) => ({
      option_id: optRow.id,
      value: val,
      sort_order: vi,
    }));

    const { error: valError } = await supabase.from("option_values").insert(valueRows);
    if (valError) {
      console.error(`   ✖ Error inserting values for ${prod.slug}/${option.name}:`, valError.message);
    }
    valueCount += valueRows.length;
  }
}

console.log(`   ✓ ${optionCount} options, ${valueCount} values inserted`);

// ============================================================================
// 6. COUPONS (seed the default ones from site.ts)
// ============================================================================

console.log("\n6. Seeding coupons…");

const coupons = [
  {
    code: "GIFT10",
    label: "10% off orders above ₹999",
    type: "percent",
    value: 10,
    min_subtotal: 999,
    max_discount: 500,
    is_active: true,
  },
  {
    code: "FIRST100",
    label: "₹100 off your first order above ₹699",
    type: "amount",
    value: 100,
    min_subtotal: 699,
    max_discount: 100,
    is_active: true,
  },
  {
    code: "FREESHIP",
    label: "Free standard shipping",
    type: "shipping",
    value: 0,
    min_subtotal: 499,
    max_discount: 0,
    is_active: true,
  },
];

await upsertBatch("coupons", coupons, "code");
console.log(`   ✓ ${coupons.length} coupons seeded`);

// ============================================================================
// DONE
// ============================================================================

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("✓ Migration complete!");
console.log(`  • ${categoryRows.length} categories`);
console.log(`  • ${productRows.length} products`);
console.log(`  • ${pcRows.length} product-category links`);
console.log(`  • ${imageRows.length} images`);
console.log(`  • ${optionCount} options with ${valueCount} values`);
console.log(`  • ${coupons.length} coupons`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("\nNext steps:");
console.log("  1. Create your admin user in Supabase Dashboard → Authentication → Users");
console.log('  2. Run: UPDATE profiles SET role = \'admin\' WHERE email = \'your@email.com\';');
console.log("  3. Verify data in Supabase Dashboard → Table Editor");
console.log("  4. Start the app: npm run dev");
