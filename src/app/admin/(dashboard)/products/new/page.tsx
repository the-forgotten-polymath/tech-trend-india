// @ts-nocheck
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ProductForm } from "@/components/admin/product-form";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Add product" };

export default async function AdminNewProductPage() {
  const supabase = await createServerSupabase();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name, parent_id")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/products" className="flex size-9 items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Add product</h1>
          <p className="text-sm text-ink-500">Create a new product and upload images</p>
        </div>
      </div>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
