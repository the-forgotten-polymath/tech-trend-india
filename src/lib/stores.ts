import type { CartLine } from "./cart-math";
import { createLocalStore } from "./local-store";
import type { Order } from "./orders";
import { STORAGE_KEYS } from "./storage";

export type PersistedCart = {
  lines: CartLine[];
  couponCode: string | null;
};

const EMPTY_CART: PersistedCart = { lines: [], couponCode: null };

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Partial<CartLine>;
  return (
    typeof line.key === "string" &&
    typeof line.productId === "number" &&
    typeof line.slug === "string" &&
    typeof line.name === "string" &&
    typeof line.price === "number" &&
    typeof line.quantity === "number"
  );
}

/** Stored values are user-editable, so everything is validated on read. */
export const cartStore = createLocalStore<PersistedCart>(STORAGE_KEYS.cart, EMPTY_CART, (value) => {
  if (!value || typeof value !== "object") return EMPTY_CART;
  const raw = value as Partial<PersistedCart>;
  const lines = Array.isArray(raw.lines) ? raw.lines.filter(isCartLine) : [];
  return {
    lines: lines.map((line) => ({
      ...line,
      quantity: Math.min(20, Math.max(1, Math.round(line.quantity))),
      options: line.options && typeof line.options === "object" ? line.options : {},
      regularPrice: typeof line.regularPrice === "number" ? line.regularPrice : line.price,
      image: typeof line.image === "string" ? line.image : "/placeholder-product.svg",
    })),
    couponCode: typeof raw.couponCode === "string" ? raw.couponCode : null,
  };
});

export const wishlistStore = createLocalStore<number[]>(STORAGE_KEYS.wishlist, [], (value) =>
  Array.isArray(value) ? value.filter((id): id is number => Number.isInteger(id)) : [],
);

export const ordersStore = createLocalStore<Order[]>(STORAGE_KEYS.orders, [], (value) =>
  Array.isArray(value)
    ? (value as Order[]).filter((order) => order && typeof order.id === "string")
    : [],
);

export const recentlyViewedStore = createLocalStore<number[]>(
  STORAGE_KEYS.recentlyViewed,
  [],
  (value) => (Array.isArray(value) ? value.filter((id): id is number => Number.isInteger(id)) : []),
);

export const searchHistoryStore = createLocalStore<string[]>(
  STORAGE_KEYS.searchHistory,
  [],
  (value) =>
    Array.isArray(value)
      ? value.filter((term): term is string => typeof term === "string").slice(0, 5)
      : [],
);
