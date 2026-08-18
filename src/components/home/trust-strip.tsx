import { Headphones, RefreshCcw, ShieldCheck, Truck } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { commerce } from "@/lib/site";

const ITEMS = [
  {
    icon: Truck,
    title: "Free shipping",
    detail: `On orders over ${formatPrice(commerce.freeShippingThreshold)}`,
  },
  {
    icon: RefreshCcw,
    title: "Easy returns",
    detail: `${commerce.returnWindowDays}-day return policy`,
  },
  { icon: ShieldCheck, title: "Secure payment", detail: "100% protected checkout" },
  { icon: Headphones, title: "24/7 support", detail: "Real people, fast replies" },
];

/** Four promise tiles that sit directly under the hero. */
export function TrustStrip() {
  return (
    <ul className="grid grid-cols-2 divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white sm:grid-cols-4 sm:divide-x">
      {ITEMS.map((item) => (
        <li key={item.title} className="flex items-center gap-3 border-ink-100 p-4 not-last:border-b sm:border-b-0">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <item.icon className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-ink-900">{item.title}</span>
            <span className="block text-xs leading-snug text-ink-500">{item.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
