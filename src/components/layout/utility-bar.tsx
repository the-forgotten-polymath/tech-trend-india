import { Headphones, PackageSearch, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

import { formatPrice } from "@/lib/format";
import { commerce } from "@/lib/site";

const MESSAGES = [
  { icon: Truck, text: `Free shipping on orders over ${formatPrice(commerce.freeShippingThreshold)}` },
  { icon: RefreshCcw, text: `Easy returns — ${commerce.returnWindowDays}-day return policy` },
  { icon: ShieldCheck, text: "100% secure checkout" },
];

/** Thin dark bar above the header with delivery promises and support links. */
export function UtilityBar() {
  return (
    <div className="bg-brand-900 text-white">
      <div className="container-page flex h-9 items-center justify-center gap-6 text-[11px] sm:justify-between sm:text-xs">
        <ul className="flex min-w-0 items-center gap-6">
          {MESSAGES.map((message, index) => (
            <li
              key={message.text}
              className={
                index === 0
                  ? "flex items-center gap-1.5"
                  : "hidden items-center gap-1.5 md:flex"
              }
            >
              <message.icon className="size-3.5 shrink-0 text-brand-300" aria-hidden />
              <span>{message.text}</span>
            </li>
          ))}
        </ul>

        <div className="hidden shrink-0 items-center gap-5 sm:flex">
          <Link href="/orders" className="flex items-center gap-1.5 transition hover:text-brand-200">
            <PackageSearch className="size-3.5" aria-hidden />
            Track order
          </Link>
          <Link href="/contact" className="flex items-center gap-1.5 transition hover:text-brand-200">
            <Headphones className="size-3.5" aria-hidden />
            Help &amp; support
          </Link>
        </div>
      </div>
    </div>
  );
}
