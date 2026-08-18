import { NextResponse } from "next/server";

import { getAllCategories, getPrimaryCategory, searchProducts } from "@/lib/catalog";

export type SearchSuggestion = {
  id: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  regularPrice: number;
  category: string | null;
};

export type SearchResponse = {
  query: string;
  products: SearchSuggestion[];
  categories: { slug: string; name: string; count: number }[];
  total: number;
};

/**
 * Read-only typeahead over the bundled catalog. No user data is accepted or
 * stored, so no authentication is required; the query is length-capped to keep
 * the work bounded.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").slice(0, 80).trim();

  if (query.length < 2) {
    return NextResponse.json<SearchResponse>({ query, products: [], categories: [], total: 0 });
  }

  const matches = searchProducts(query);
  const needle = query.toLowerCase();
  const categories = getAllCategories()
    .filter((category) => category.totalCount > 0 && category.name.toLowerCase().includes(needle))
    .slice(0, 4)
    .map((category) => ({ slug: category.slug, name: category.name, count: category.totalCount }));

  return NextResponse.json<SearchResponse>({
    query,
    total: matches.length,
    categories,
    products: matches.slice(0, 6).map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.src ?? "/placeholder-product.svg",
      price: product.price,
      regularPrice: product.regularPrice,
      category: getPrimaryCategory(product)?.name ?? null,
    })),
  });
}
