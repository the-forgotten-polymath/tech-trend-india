// @ts-nocheck
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Edit product" };

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: product } = await supabase
    .from("products")
    .select("*, product_images(id, url, alt, sort_order), product_options(id, name, slug, sort_order, option_values(id, value, sort_order))")
    .eq("id", parseInt(id))
    .single();

  if (!product) notFound();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name, parent_id")
    .eq("is_active", true)
    .order("sort_order");

  const formProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku || "",
    type: product.type,
    description: product.description || "",
    short_description: product.short_description || "",
    price: product.price,
    regular_price: product.regular_price,
    in_stock: product.in_stock,
    is_featured: product.is_featured,
    primary_category_id: product.primary_category_id,
    images: (product.product_images || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({ id: img.id, url: img.url, alt: img.alt, sort_order: img.sort_order })),
    options: (product.product_options || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((opt) => ({
        name: opt.name,
        slug: opt.slug,
        values: (opt.option_values || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((v) => v.value),
      })),
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="flex size-9 items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-ink-900">Edit product</h1>
            <p className="text-sm text-ink-500">ID: {product.id} · /{product.slug}</p>
          </div>
        </div>
        <Link
          href={`/product/${product.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
        >
          <ExternalLink className="size-3.5" />
          View on store
        </Link>
      </div>
      <ProductForm product={formProduct} categories={categories ?? []} isEdit />
    </div>
  );
}
