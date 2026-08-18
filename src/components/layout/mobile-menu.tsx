"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { NavData } from "@/lib/nav";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { label: "Today's deals", href: "/deals", accent: true },
  { label: "All products", href: "/shop" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Your orders", href: "/orders" },
  { label: "Help & contact", href: "/contact" },
];

/** Hamburger trigger plus the slide-in category drawer (mobile / tablet). */
export function MobileMenu({ nav }: { nav: NavData }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="-ml-2 flex size-10 items-center justify-center rounded-full text-ink-700 transition hover:bg-ink-100 lg:hidden"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-100 lg:hidden" role="dialog" aria-modal="true" aria-label="Browse categories">
          <button
            type="button"
            className="absolute inset-0 bg-ink-900/40 animate-fade-in"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-4">
              <span className="font-display text-lg font-bold">Browse</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-full text-ink-600 transition hover:bg-ink-100"
                aria-label="Close menu"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3">
              <ul>
                {nav.departments.map((department) => {
                  const isExpanded = expanded === department.slug;
                  return (
                    <li key={department.slug} className="border-b border-ink-50">
                      <div className="flex items-center">
                        <Link
                          href={`/category/${department.slug}`}
                          className="flex-1 px-3 py-3 text-sm font-semibold text-ink-900"
                        >
                          {department.label}
                          <span className="ml-2 text-xs font-normal text-ink-400">
                            {department.count}
                          </span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setExpanded(isExpanded ? null : department.slug)}
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${department.label}`}
                          className="flex size-9 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-100"
                        >
                          <ChevronDown
                            className={cn("size-4 transition-transform", isExpanded && "rotate-180")}
                            aria-hidden
                          />
                        </button>
                      </div>
                      {isExpanded ? (
                        <ul className="pb-3 pl-3">
                          {department.columns
                            .flatMap((column) => column.items)
                            .map((item) => (
                              <li key={item.slug}>
                                <Link
                                  href={`/category/${item.slug}`}
                                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-ink-600 transition hover:bg-ink-50"
                                >
                                  {item.name}
                                  <span className="text-xs text-ink-300">{item.count}</span>
                                </Link>
                              </li>
                            ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 px-3">
                <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
                  Gift guides
                </p>
                {nav.collections.map((collection) => (
                  <Link
                    key={collection.slug}
                    href={`/collections/${collection.slug}`}
                    className="block py-2 text-sm text-ink-700"
                  >
                    {collection.title}
                  </Link>
                ))}
              </div>

              <div className="mt-4 border-t border-ink-100 px-3 pt-4">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block py-2 text-sm",
                      link.accent ? "font-semibold text-brand-700" : "text-ink-700",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
