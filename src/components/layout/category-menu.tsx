"use client";

import { ChevronDown, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { NavData } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** The green "Shop by category" pill and its full-width dropdown panel. */
export function CategoryMenu({ nav }: { nav: NavData }) {
  const [open, setOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState(nav.departments[0]?.slug ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  const active = nav.departments.find((department) => department.slug === activeSlug);

  return (
    <div ref={containerRef} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setOpen(true)}
        aria-expanded={open}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-bold tracking-wide text-white uppercase transition",
          open ? "bg-brand-800" : "bg-brand-700 hover:bg-brand-800",
        )}
      >
        <LayoutGrid className="size-4" aria-hidden />
        Shop by category
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-40 border-t border-ink-100 bg-white shadow-lift animate-fade-in">
          <div className="container-page grid grid-cols-12 gap-6 py-6">
            {/* Department rail */}
            <ul className="col-span-3 border-r border-ink-100 pr-4">
              {nav.departments.map((department) => (
                <li key={department.slug}>
                  <Link
                    href={`/category/${department.slug}`}
                    onMouseEnter={() => setActiveSlug(department.slug)}
                    onFocus={() => setActiveSlug(department.slug)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                      activeSlug === department.slug
                        ? "bg-brand-50 text-brand-800"
                        : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                    )}
                  >
                    {department.label}
                    <span className="text-xs text-ink-400">{department.count}</span>
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t border-ink-100 pt-2">
                <Link
                  href="/shop"
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  View all products →
                </Link>
              </li>
            </ul>

            {/* Active department detail */}
            {active ? (
              <div className="col-span-9 grid grid-cols-12 gap-6">
                <div className="col-span-8 grid grid-cols-3 gap-x-6 gap-y-5">
                  {active.columns.map((column) => (
                    <div key={column.heading}>
                      <p className="text-xs font-bold tracking-wide text-ink-900 uppercase">
                        {column.heading}
                      </p>
                      <ul className="mt-3 space-y-2">
                        {column.items.map((item) => (
                          <li key={item.slug}>
                            <Link
                              href={`/category/${item.slug}`}
                              className="flex items-baseline gap-2 text-sm text-ink-600 transition hover:text-brand-700"
                            >
                              {item.name}
                              <span className="text-[11px] text-ink-300">{item.count}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="col-span-4 space-y-3">
                  {active.spotlight.slice(0, 2).map((item) => (
                    <Link
                      key={item.slug}
                      href={`/category/${item.slug}`}
                      className="group flex items-center gap-3 overflow-hidden rounded-xl bg-peach-50 p-2.5 transition hover:bg-peach-100"
                    >
                      <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-white">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : null}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-ink-900">{item.name}</span>
                        <span className="block text-xs text-ink-500">{item.count} products</span>
                      </span>
                    </Link>
                  ))}
                  <p className="rounded-xl bg-brand-900 p-4 text-xs leading-relaxed text-brand-100">
                    <span className="block font-semibold text-white">{active.label}</span>
                    {active.blurb}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
