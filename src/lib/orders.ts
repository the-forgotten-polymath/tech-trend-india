import type { CartLine, CartTotals } from "./cart-math";
import { ordersStore } from "./stores";

export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

export type OrderCustomer = {
  name: string;
  email: string;
  phone: string;
};

export type OrderAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

export type Order = {
  id: string;
  createdAt: string;
  lines: CartLine[];
  totals: CartTotals;
  customer: OrderCustomer;
  address: OrderAddress;
  
  payment: PaymentMethod;
  shippingNote: string;
  couponCode: string | null;
  giftWrap: boolean;
  giftNote: string;
};
export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
  wallet: "Wallet",
};

/**
 * Orders live in localStorage only — this storefront has no backend, so nothing
 * is transmitted or charged. Swap these helpers for API calls when you add one.
 */
export function createOrderId(now = new Date()): string {
  const stamp = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `GFT-${stamp}-${random}`;
}

export function saveOrder(order: Order): void {
  ordersStore.set((current) => [order, ...current].slice(0, 25));
}

export function findOrder(orders: Order[], id: string): Order | undefined {
  return orders.find((order) => order.id === id);
}

/** Simple simulated fulfilment timeline based on the order date. */
export function orderTimeline(order: Order) {
  const placed = new Date(order.createdAt);
  const day = 24 * 60 * 60 * 1000;
  const transitDays = 4;
  return [
    { label: "Order confirmed", date: placed, done: true },
    { label: "Packed", date: new Date(placed.getTime() + day), done: false },
    { label: "Out for delivery", date: new Date(placed.getTime() + transitDays * day), done: false },
    {
      label: "Delivered",
      date: new Date(placed.getTime() + (transitDays + 1) * day),
      done: false,
    },
  ];
}
