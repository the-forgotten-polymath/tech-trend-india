import { Flame, Gift, Package, Ticket, Truck, Zap } from "lucide-react";
import Link from "next/link";

import { DEAL_TILES, type DealTile } from "@/lib/merchandising";
import { cn } from "@/lib/utils";

const ICONS: Record<DealTile["icon"], typeof Zap> = {
  zap: Zap,
  flame: Flame,
  gift: Gift,
  ticket: Ticket,
  truck: Truck,
  package: Package,
};

const TONES: Record<DealTile["tone"], string> = {
  peach: "bg-peach-100 text-ink-900 hover:bg-peach-200",
  sale: "bg-sale-50 text-sale-700 hover:bg-sale-100",
  mint: "bg-brand-50 text-brand-800 hover:bg-brand-100",
  sand: "bg-peach-50 text-ink-900 hover:bg-peach-100",
  cream: "bg-ink-50 text-ink-900 hover:bg-ink-100",
  green: "bg-brand-800 text-white hover:bg-brand-900",
};

/** Row of offer shortcuts (daily deals, coupons, free delivery…). */
export function DealTiles() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {DEAL_TILES.map((tile) => {
        const Icon = ICONS[tile.icon];
        return (
          <li key={tile.label}>
            <Link
              href={tile.href}
              className={cn(
                "group flex h-full flex-col items-center gap-2 rounded-2xl p-4 text-center transition duration-200 hover:-translate-y-1",
                TONES[tile.tone],
              )}
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full transition group-hover:scale-110",
                  tile.tone === "green" ? "bg-white/15" : "bg-white/70",
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-xs font-bold tracking-wide uppercase">{tile.label}</span>
              <span
                className={cn(
                  "text-[11px] leading-snug",
                  tile.tone === "green" ? "text-brand-100" : "text-ink-500",
                )}
              >
                {tile.detail}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
