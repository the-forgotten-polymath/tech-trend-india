"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import { SearchBox, type SearchScope } from "@/components/layout/search-box";

/** Search icon that reveals a full-width search field under the header. */
export function MobileSearch({ scopes = [] }: { scopes?: SearchScope[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex size-10 items-center justify-center rounded-lg text-ink-700 transition hover:bg-ink-50 lg:hidden"
        aria-label={open ? "Close search" : "Search products"}
        aria-expanded={open}
      >
        {open ? <X className="size-5" aria-hidden /> : <Search className="size-5" aria-hidden />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full border-b border-ink-100 bg-white px-4 py-3 shadow-card lg:hidden">
          <SearchBox scopes={scopes} autoFocus onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </>
  );
}
