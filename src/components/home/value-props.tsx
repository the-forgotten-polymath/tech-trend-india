import { Gift, Headphones, RefreshCcw, ShieldCheck, Truck } from "lucide-react";

import { commerce } from "@/lib/site";
import { formatPrice } from "@/lib/format";

const PROPS = [
  {
    icon: Truck,
    title: "Fast dispatch",
    description: "Orders leave our warehouse in 24–48 hours. Shipping quoted per order.",
  },
  {
    icon: RefreshCcw,
    title: `${commerce.returnWindowDays}-day returns`,
    description: "Changed your mind? Send it back unused for a full refund.",
  },
  {
    icon: ShieldCheck,
    title: "Checked before shipping",
    description: "Every item is inspected and packed so it arrives gift-ready.",
  },
  {
    icon: Gift,
    title: "Free gift wrap",
    description: "Add a ribbon and a handwritten note at checkout, on us.",
  },
  {
    icon: Headphones,
    title: "Real humans",
    description: "WhatsApp or call us — we answer within a few hours.",
  },
];

export function ValueProps({ compact = false }: { compact?: boolean }) {
  const items = compact ? PROPS.slice(0, 4) : PROPS;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <li
          key={item.title}
          className="flex gap-3 rounded-2xl border border-ink-100 bg-white p-4"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <item.icon className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-ink-900">{item.title}</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">
              {item.description}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
