import { commerce, type Coupon } from "./site";

export type CartLine = {
  /** Stable identity for a product + selected options combination. */
  key: string;
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  regularPrice: number;
  quantity: number;
  options: Record<string, string>;
};

export type ShippingMethod = "standard" | "express";

export type CartTotals = {
  itemCount: number;
  subtotal: number;
  listTotal: number;
  productSavings: number;
  couponDiscount: number;
  shipping: number;
  shippingWaived: boolean;
  codFee: number;
  tax: number;
  total: number;
  amountToFreeShipping: number;
};

export function findCoupon(code: string | null | undefined): Coupon | undefined {
  if (!code) return undefined;
  const normalised = code.trim().toUpperCase();
  return commerce.coupons.find((coupon) => coupon.code === normalised);
}

export function couponError(coupon: Coupon, subtotal: number): string | null {
  if (subtotal < coupon.minSubtotal) {
    return `Add ₹${coupon.minSubtotal - subtotal} more to use ${coupon.code}.`;
  }
  return null;
}

export function calculateTotals(
  lines: CartLine[],
  options: {
    coupon?: Coupon | null;
    shipping?: ShippingMethod;
    paymentMethod?: "card" | "upi" | "cod";
  } = {},
): CartTotals {
  const { coupon = null, shipping = "standard", paymentMethod = "upi" } = options;

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const listTotal = lines.reduce(
    (sum, line) => sum + Math.max(line.regularPrice, line.price) * line.quantity,
    0,
  );

  const couponValid = coupon ? subtotal >= coupon.minSubtotal : false;
  let couponDiscount = 0;
  if (coupon && couponValid) {
    if (coupon.type === "percent") {
      couponDiscount = Math.min(Math.round((subtotal * coupon.value) / 100), coupon.maxDiscount);
    } else if (coupon.type === "amount") {
      couponDiscount = Math.min(coupon.value, subtotal);
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const freeByThreshold = discountedSubtotal >= commerce.freeShippingThreshold;
  const freeByCoupon = Boolean(coupon && couponValid && coupon.type === "shipping");
  const shippingWaived = shipping === "standard" && (freeByThreshold || freeByCoupon);

  let shippingCost = 0;
  if (itemCount > 0) {
    if (shipping === "express") shippingCost = commerce.expressShippingRate;
    else shippingCost = shippingWaived ? 0 : commerce.shippingFlatRate;
  }

  const codFee = paymentMethod === "cod" && itemCount > 0 ? commerce.codFee : 0;
  const tax = Math.round(discountedSubtotal * commerce.taxRate);
  const total = discountedSubtotal + shippingCost + codFee + tax;

  return {
    itemCount,
    subtotal,
    listTotal,
    productSavings: Math.max(0, listTotal - subtotal),
    couponDiscount,
    shipping: shippingCost,
    shippingWaived,
    codFee,
    tax,
    total,
    amountToFreeShipping: Math.max(0, commerce.freeShippingThreshold - discountedSubtotal),
  };
}

/** Cart line identity: product plus the exact option combination chosen. */
export function lineKey(productId: number, options: Record<string, string>): string {
  const suffix = Object.keys(options)
    .sort()
    .map((key) => `${key}=${options[key]}`)
    .join("&");
  return suffix ? `${productId}::${suffix}` : `${productId}`;
}
