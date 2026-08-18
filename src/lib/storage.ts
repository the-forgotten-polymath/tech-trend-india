/** Tiny typed wrapper around localStorage that never throws. */
export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or privacy-mode failures are non-fatal for the storefront.
  }
}

export const STORAGE_KEYS = {
  cart: "techtrendindia.cart.v1",
  wishlist: "techtrendindia.wishlist.v1",
  orders: "techtrendindia.orders.v1",
  recentlyViewed: "techtrendindia.recently-viewed.v1",
  searchHistory: "techtrendindia.search-history.v1",
} as const;
