"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export type PickItem = {
  id: number;
  name: string;
  slug: string;
  image: string;
  alt: string;
  price: number;
  discountPercent: number;
};

export type PickTabView = {
  id: string;
  label: string;
  note: string;
  href: string;
  items: PickItem[];
};

/**
 * Tabbed recommendation panel. Selections are rule-based on the catalogue
 * (price, discount, recency, category weight) — no tracking or profiling.
 */
export function PickedForYou({ tabs }: { tabs: PickTabView[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div className="overflow-hidden rounded-2xl bg-brand-900 p-5 sm:rounded-3xl sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-brand-300 uppercase">
            <Sparkles className="size-3.5" aria-hidden />
            Picked for you
          </p>
          <h2 className="mt-2 text-xl font-extrabold text-white sm:text-2xl">
            Smart picks from across the store
          </h2>
          <p className="mt-1.5 text-sm text-brand-100">{active?.note}</p>
        </div>

        {active ? (
          <Link
            href={active.href}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2.5 text-xs font-bold tracking-wide text-white uppercase transition hover:bg-white/20"
          >
            View all
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>

      <div role="tablist" aria-label="Recommendation groups" className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeId}
            onClick={() => setActiveId(tab.id)}
            className={cn(
              "shrink-0 rounded-lg px-3.5 py-2 text-[11px] font-bold tracking-wide uppercase transition",
              tab.id === activeId
                ? "bg-white text-brand-900"
                : "bg-white/10 text-brand-100 hover:bg-white/20",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active ? (
        <ul className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-none sm:gap-4">
          {active.items.map((item) => (
            <li key={item.id} className="w-28 shrink-0 sm:w-32">
              <Link href={`/product/${item.slug}`} className="group block text-center">
                <span className="relative block aspect-square overflow-hidden rounded-xl bg-white/95">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="128px"
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                  {item.discountPercent > 0 ? (
                    <span className="absolute top-1.5 left-1.5 rounded bg-sale-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      {item.discountPercent}%
                    </span>
                  ) : null}
                </span>
                <span className="mt-2 block truncate text-xs font-medium text-white">{item.name}</span>
                <span className="block text-xs font-bold text-brand-200">
                  {item.price > 0 ? formatPrice(item.price) : "On request"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
