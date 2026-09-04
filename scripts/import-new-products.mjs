import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse } from "csv-parse/sync";

// Load .env.local manually
function loadEnv() {
  const envPath = path.join(import.meta.dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
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
const CSV_PATH = path.join(ROOT, "product_catalog.csv");

if (!fs.existsSync(CSV_PATH)) {
  console.error(`✖ ${CSV_PATH} not found.`);
  process.exit(1);
}

const csvContent = fs.readFileSync(CSV_PATH, "utf8");
const records = parse(csvContent, { columns: true, skip_empty_lines: true });

console.log(`→ Loaded ${records.length} records from CSV`);

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function run() {
  // 1. Get or create categories
  console.log("\n1. Processing Categories...");
  const categories = new Set(records.map(r => r["Category"]).filter(Boolean));
  const catIdBySlug = new Map();

  for (const catName of categories) {
    const slug = slugify(catName);
    const { data: existing, error } = await supabase.from("categories").select("id").eq("slug", slug).single();
    if (existing) {
      catIdBySlug.set(catName, existing.id);
    } else {
      const { data: newCat, error: insertError } = await supabase.from("categories")
        .insert({ slug, name: catName, is_active: true, sort_order: 0, description: "" })
        .select("id").single();
      
      if (insertError) {
        console.error("Error creating category:", insertError);
        continue;
      }
      catIdBySlug.set(catName, newCat.id);
    }
  }

  // 2. Insert Products
  console.log("\n2. Inserting Products...");
  const BATCH_SIZE = 50;
  let totalInserted = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const productRows = batch.map((row, index) => {
      const price = parseFloat(row["Price (INR)"]) || 0;
      const baseSlug = slugify(row["Product Name"] || `product-${row["Product No."]}`);
      return {
        // Appending Product No. to make slug unique
        slug: `${baseSlug}-${row["Product No."]}`,
        name: row["Product Name"] || "Unnamed Product",
        sku: row["SKU"] || null,
        type: "simple",
        description: row["Description"] || "",
        short_description: "",
        price: price,
        regular_price: price,
        on_sale: false,
        discount_percent: 0,
        in_stock: true,
        is_purchasable: true,
        // Ensure new products are sorted at top / featured
        is_featured: true, 
        sort_order: 0,
        primary_category_id: catIdBySlug.get(row["Category"]) || null,
        // Since we want them to show in new arrivals, created_at will default to now()
      };
    });

    const { data: insertedProducts, error } = await supabase.from("products").insert(productRows).select("id, slug");
    
    if (error) {
      console.error(`✖ Error inserting products (batch ${i}–${i + batch.length}):`, error.message);
      continue;
    }
    
    // Now insert images and category links
    const pcRows = [];
    const imageRows = [];
    
    for (let j = 0; j < batch.length; j++) {
      const row = batch[j];
      const insertedProduct = insertedProducts[j];
      if (!insertedProduct) continue;
      
      const categoryId = catIdBySlug.get(row["Category"]);
      if (categoryId) {
        pcRows.push({ product_id: insertedProduct.id, category_id: categoryId });
      }

      if (row["Image"]) {
        imageRows.push({
          product_id: insertedProduct.id,
          url: `/images/${row["Image"]}`,
          alt: row["Product Name"] || "Product Image",
          sort_order: 0,
        });
      }
    }

    if (pcRows.length > 0) {
      const { error: pcError } = await supabase.from("product_categories").insert(pcRows);
      if (pcError && pcError.code !== "23505") console.error("Error inserting product_categories:", pcError.message);
    }
    
    if (imageRows.length > 0) {
      const { error: imgError } = await supabase.from("product_images").insert(imageRows);
      if (imgError) console.error("Error inserting product_images:", imgError.message);
    }

    totalInserted += batch.length;
    console.log(`   Processed ${totalInserted}/${records.length} products...`);
  }

  console.log("\n✓ Migration complete!");
}

run().catch(console.error);
