import { SORT_OPTIONS } from "./catalog";
import type { ProductQuery, SortKey } from "./types";
import { toInt, toOptionalInt, toStr } from "./utils";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type ListingState = {
  page: number;
  sort: SortKey;
  minPrice?: number;
  maxPrice?: number;
  onSale: boolean;
  inStock: boolean;
  q?: string;
};

const SORT_KEYS = new Set(SORT_OPTIONS.map((option) => option.value));

export function parseListingParams(params: RawSearchParams): ListingState {
  const sortParam = toStr(params.sort);
  const sort = sortParam && SORT_KEYS.has(sortParam as SortKey) ? (sortParam as SortKey) : "featured";
  const min = toOptionalInt(params.min);
  const max = toOptionalInt(params.max);

  return {
    page: Math.max(1, toInt(params.page, 1)),
    sort,
    minPrice: typeof min === "number" && min > 0 ? min : undefined,
    maxPrice: typeof max === "number" && max > 0 ? max : undefined,
    onSale: toStr(params.sale) === "1",
    inStock: toStr(params.stock) === "1",
    q: toStr(params.q),
  };
}

export function listingToQuery(
  state: ListingState,
  extra: { categorySlug?: string; perPage?: number } = {},
): ProductQuery {
  return {
    categorySlug: extra.categorySlug,
    search: state.q,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    onSale: state.onSale || undefined,
    inStock: state.inStock || undefined,
    sort: state.sort,
    page: state.page,
    perPage: extra.perPage,
  };
}

/** Serialise listing state back into a query string, keeping URLs tidy. */
export function listingToSearchParams(state: Partial<ListingState>): URLSearchParams {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.sort && state.sort !== "featured") params.set("sort", state.sort);
  if (state.minPrice) params.set("min", String(state.minPrice));
  if (state.maxPrice) params.set("max", String(state.maxPrice));
  if (state.onSale) params.set("sale", "1");
  if (state.inStock) params.set("stock", "1");
  if (state.page && state.page > 1) params.set("page", String(state.page));
  return params;
}

export function buildListingHref(base: string, state: Partial<ListingState>): string {
  const params = listingToSearchParams(state);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export const PRICE_BANDS = [
  { label: "Under ₹199", min: undefined, max: 199 },
  { label: "₹200 – ₹499", min: 200, max: 499 },
  { label: "₹500 – ₹999", min: 500, max: 999 },
  { label: "₹1,000 – ₹1,999", min: 1000, max: 1999 },
  { label: "₹2,000 & above", min: 2000, max: undefined },
] as const;
