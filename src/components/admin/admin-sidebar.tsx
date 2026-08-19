"use client";

import {
  BarChart3,
  Box,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Sparkles,
  Tags,
  Ticket,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Box },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Orders", href: "/admin/orders", icon: Package },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-brand-800 px-5 py-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{site.name}</p>
          <p className="text-[11px] text-brand-300">Admin panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              isActive(item.href)
                ? "bg-white/10 text-white"
                : "text-brand-200 hover:bg-white/5 hover:text-white",
            )}
          >
            <item.icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-brand-800 px-3 py-4">
        <div className="mb-3 px-3">
          <p className="truncate text-sm font-medium text-white">{userName}</p>
          <p className="text-[11px] text-brand-300">Administrator</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-200 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
        <Link
          href="/"
          target="_blank"
          className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-200 transition hover:bg-white/5 hover:text-white"
        >
          <BarChart3 className="size-4" aria-hidden />
          View storefront
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-brand-900 lg:block">
        {sidebar}
      </aside>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 flex size-10 items-center justify-center rounded-lg bg-brand-900 text-white shadow-card lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {/* Mobile overlay */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink-900/50"
            aria-label="Close menu"
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-brand-900 shadow-lift">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-brand-200 hover:text-white"
              aria-label="Close menu"
            >
              <X className="size-5" aria-hidden />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}
    </>
  );
}
