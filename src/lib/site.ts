/**
 * Single place to change store identity, contact details and commerce rules.
 */
export const site = {
  name: "TechTrendIndia",
  tagline: "Cool toys, gadgets, gifts & more",
  description:
    "TechTrendIndia is a modern gifting store: over 1,000 hand-picked gadgets, drinkware, jewellery, soft toys, beauty and home finds, ready to ship across India.",
  url: "https://techtrendindia.com",
  locale: "en-IN",
  currency: "INR",
  contact: {
    email: "hello@techtrendindia.com",
    phone: "+91 75056 63374",
    whatsapp: "+91 75056 63374",
    address: "14 Anna Salai, Chennai, Tamil Nadu 600002",
    hours: "Mon–Sat, 10am–7pm IST",
  },
  social: [
    { label: "WhatsApp", href: "https://chat.whatsapp.com/BqjsVtz4jjkA6R32KSPJJa" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Facebook", href: "https://facebook.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
} as const;

/** Commerce rules used by the cart and checkout. */
export const commerce = {
  /** Shipping is quoted per order — no fixed flat rate. */
  shippingNote: "Shipping calculated after order confirmation",
  taxRate: 0, // Listed prices are inclusive of GST.
  returnWindowDays: 7,
  /** Demo coupons. Percentage discounts are capped by `maxDiscount`. */
  coupons: [
    {
      code: "GIFT10",
      label: "10% off orders above ₹999",
      type: "percent" as const,
      value: 10,
      minSubtotal: 999,
      maxDiscount: 500,
    },
    {
      code: "FIRST100",
      label: "₹100 off your first order above ₹699",
      type: "amount" as const,
      value: 100,
      minSubtotal: 699,
      maxDiscount: 100,
    },
    {
      code: "FREESHIP",
      label: "Free shipping on your order",
      type: "percent" as const,
      value: 0,
      minSubtotal: 0,
      maxDiscount: 0,
    },
  ],
} as const;

export type Coupon = (typeof commerce.coupons)[number];
