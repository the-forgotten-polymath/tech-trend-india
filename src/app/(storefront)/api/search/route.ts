import { NextResponse } from "next/server";

import { fetchAllCategoriesLive, fetchCategoryLive, queryProductsLive } from "@/lib/data";

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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").slice(0, 80).trim();

  if (query.length < 2) {
    return NextResponse.json<SearchResponse>({ query, products: [], categories: [], total: 0 });
  }

  const matchesResult = await queryProductsLive({ search: query, perPage: 6 });
  const needle = query.toLowerCase();
  
  const allCats = await fetchAllCategoriesLive();
  const categories = allCats
    .filter((category) => category.totalCount > 0 && category.name.toLowerCase().includes(needle))
    .slice(0, 4)
    .map((category) => ({ slug: category.slug, name: category.name, count: category.totalCount }));

  const products = await Promise.all(matchesResult.items.map(async (product) => {
    const primaryCategory = product.primaryCategory ? await fetchCategoryLive(product.primaryCategory) : null;
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.src ?? "/placeholder-product.svg",
      price: product.price,
      regularPrice: product.regularPrice,
      category: primaryCategory?.name ?? null,
    };
  }));

  return NextResponse.json<SearchResponse>({
    query,
    total: matchesResult.total,
    categories,
    products,
  });
}
