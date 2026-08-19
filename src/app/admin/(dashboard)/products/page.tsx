// @ts-nocheck
"use client";

import { Box, Check, Loader2, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { bulkUpdateProducts } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Number(searchParams.get("page")) || 1;
  const searchParam = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState(searchParam);

  const perPage = 25;
  const page = pageParam;
  const pageCount = Math.ceil(total / perPage);

  const fetchProducts = async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("products")
      .select("id, slug, name, sku, price, regular_price, on_sale, in_stock, is_featured, created_at, primary_category_id, categories!products_primary_category_id_fkey(name)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (searchParam) query = query.ilike("name", `%${searchParam}%`);

    const from = (page - 1) * perPage;
    const { data, count } = await query.range(from, from + perPage - 1);
    setProducts(data || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [page, searchParam]);

  const toggleAll = () => {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  };

  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const executeBulk = async () => {
    if (!bulkAction || selected.size === 0) return;
    if (bulkAction === "delete" && !confirm(`Delete ${selected.size} products permanently?`)) return;
    setBulkLoading(true);
    const result = await bulkUpdateProducts([...selected], bulkAction);
    if (result.error) setMessage(`Error: ${result.error}`);
    else {
      setMessage(`${bulkAction.replace(/_/g, " ")} applied to ${selected.size} products`);
      setSelected(new Set());
      await fetchProducts();
      setTimeout(() => setMessage(""), 3000);
    }
    setBulkLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    router.push(`/admin/products${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Products</h1>
          <p className="mt-1 text-sm text-ink-500">{total} products in the database</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
          <Plus className="size-4" /> Add product
        </Link>
      </div>

      {message && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">{message}</div>}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input h-10 w-full pl-10"
          />
        </form>

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-ink-600">{selected.size} selected</span>
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="input h-9 text-xs">
              <option value="">Bulk action…</option>
              <option value="mark_out_of_stock">Mark out of stock</option>
              <option value="mark_in_stock">Mark in stock</option>
              <option value="toggle_featured">Toggle featured</option>
              <option value="delete">Delete selected</option>
            </select>
            <button
              onClick={executeBulk}
              disabled={!bulkAction || bulkLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-2 text-xs font-semibold text-white hover:bg-ink-800 disabled:bg-ink-300"
            >
              {bulkLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              Apply
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {loading ? (
          <div className="flex h-48 items-center justify-center"><Loader2 className="size-6 animate-spin text-ink-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50 text-left text-xs font-semibold text-ink-500 uppercase">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.size === products.length && products.length > 0} onChange={toggleAll} className="size-4 accent-brand-700" />
                  </th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {products.map((product) => (
                  <tr key={product.id} className={cn("hover:bg-ink-50/50", selected.has(product.id) && "bg-brand-50/30")}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(product.id)} onChange={() => toggleOne(product.id)} className="size-4 accent-brand-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-ink-100">
                          <Box className="size-4 text-ink-400" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink-900">{product.name}</p>
                          <p className="truncate text-xs text-ink-400">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{product.sku || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">₹{product.price}</span>
                      {product.on_sale && product.regular_price > product.price && (
                        <span className="ml-1.5 text-xs text-ink-400 line-through">₹{product.regular_price}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-500">{product.categories?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", product.in_stock ? "bg-emerald-50 text-emerald-700" : "bg-sale-50 text-sale-700")}>
                        {product.in_stock ? "In stock" : "Out"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${product.id}`} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3">
            <p className="text-sm text-ink-500">Page {page} of {pageCount} ({total} products)</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={`/admin/products?page=${page - 1}${searchParam ? `&q=${searchParam}` : ""}`} className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium hover:bg-ink-50">Previous</Link>}
              {page < pageCount && <Link href={`/admin/products?page=${page + 1}${searchParam ? `&q=${searchParam}` : ""}`} className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium hover:bg-ink-50">Next</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
