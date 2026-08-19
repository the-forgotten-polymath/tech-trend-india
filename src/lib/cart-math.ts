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

export type CartTotals = {
  itemCount: number;
  subtotal: number;
  listTotal: number;
  productSavings: number;
  couponDiscount: number;
  /** Shipping is quoted separately — not included in total. */
  shippingNote: string;
  tax: number;
  total: number;
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
  options: { coupon?: Coupon | null } = {},
): CartTotals {
  const { coupon = null } = options;

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
  const tax = Math.round(discountedSubtotal * commerce.taxRate);
  const total = discountedSubtotal + tax;

  return {
    itemCount,
    subtotal,
    listTotal,
    productSavings: Math.max(0, listTotal - subtotal),
    couponDiscount,
    shippingNote: commerce.shippingNote,
    tax,
    total,
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
