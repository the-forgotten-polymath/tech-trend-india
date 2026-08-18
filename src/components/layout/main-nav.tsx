"use client";

import { Flame } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "New arrivals", href: "/new-arrivals" },
  { label: "Deals", href: "/deals", hot: true },
  { label: "Gift guides", href: "/collections/under-299" },
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function MainNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/collections")) return pathname.startsWith("/collections");
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <ul className="flex items-center gap-1">
      {LINKS.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
              isActive(link.href)
                ? "bg-brand-50 font-semibold text-brand-700"
                : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
            )}
          >
            {link.label}
            {link.hot ? <Flame className="size-3.5 text-sale-600" aria-hidden /> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
