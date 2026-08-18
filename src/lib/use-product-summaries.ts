"use client";

import { useEffect, useMemo, useState } from "react";

import type { ProductSummary } from "@/app/api/products/route";

type Fetched = { key: string; products: ProductSummary[] };

/**
 * Turns a list of product ids (from the wishlist or recently-viewed store) into
 * card data via the read-only /api/products endpoint, preserving the given
 * order. Keeping the full catalog on the server keeps the client bundle small.
 */
export function useProductSummaries(ids: number[]): {
  products: ProductSummary[];
  loading: boolean;
} {
  const key = ids.join(",");
  const [fetched, setFetched] = useState<Fetched>({ key: "", products: [] });

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();

    fetch(`/api/products?ids=${key}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { products: [] }))
      .then((data: { products: ProductSummary[] }) =>
        setFetched({ key, products: data.products ?? [] }),
      )
      .catch((error: unknown) => {
        if ((error as Error)?.name === "AbortError") return;
        setFetched({ key, products: [] });
      });

    return () => controller.abort();
  }, [key]);

  const resolved = key.length > 0 && fetched.key === key;

  const products = useMemo(() => {
    if (!resolved) return [];
    const order = new Map(ids.map((id, index) => [id, index]));
    return [...fetched.products].sort(
      (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
    );
  }, [resolved, fetched.products, ids]);

  return { products, loading: key.length > 0 && !resolved };
}
