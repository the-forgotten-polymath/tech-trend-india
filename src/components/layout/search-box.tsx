"use client";

import { ArrowRight, ChevronDown, Clock, Loader2, Mic, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import type { SearchResponse } from "@/app/(storefront)/api/search/route";
import { formatPrice } from "@/lib/format";
import { searchHistoryStore } from "@/lib/stores";
import { useClientReady, useStore } from "@/lib/use-store";
import { cn } from "@/lib/utils";

const EMPTY: SearchResponse = { query: "", products: [], categories: [], total: 0 };
const POPULAR = ["Soft toys", "Steel bottle", "Fairy lights", "Earbuds", "Press-on nails", "Keychain"];

export type SearchScope = { slug: string; name: string };

/**
 * Header search: scope dropdown + typeahead panel. Voice input is offered only
 * when the browser exposes the Web Speech API.
 */
export function SearchBox({
  scopes = [],
  autoFocus = false,
  onNavigate,
  className,
}: {
  scopes?: SearchScope[];
  autoFocus?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const fieldId = useId();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("");
  const [results, setResults] = useState<SearchResponse>(EMPTY);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const history = useStore(searchHistoryStore);
  const clientReady = useClientReady();
  const containerRef = useRef<HTMLDivElement>(null);

  // Only offered where the browser supports it; evaluated after hydration so
  // the server and client markup agree.
  const voiceSupported =
    clientReady && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        setResults((await response.json()) as SearchResponse);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults(EMPTY);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const remember = useCallback((term: string) => {
    searchHistoryStore.set((current) =>
      [term, ...current.filter((entry) => entry !== term)].slice(0, 5),
    );
  }, []);

  const submit = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      remember(trimmed);
      setOpen(false);
      onNavigate?.();
      const params = new URLSearchParams({ q: trimmed });
      router.push(scope ? `/category/${scope}?${params}` : `/search?${params}`);
    },
    [onNavigate, remember, router, scope],
  );

  const startVoiceSearch = () => {
    type SpeechWindow = Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    type SpeechRecognitionLike = {
      lang: string;
      interimResults: boolean;
      start: () => void;
      stop: () => void;
      onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
    };

    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setOpen(true);
      submit(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  };

  const showSuggestions = query.trim().length >= 2;
  const hasResults = results.products.length > 0 || results.categories.length > 0;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit(query);
        }}
        className="flex h-11 w-full items-stretch overflow-hidden rounded-full border border-ink-200 bg-white focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100"
      >
        {scopes.length > 0 ? (
          <div className="relative hidden shrink-0 items-center border-r border-ink-100 pl-4 pr-2 sm:flex">
            <label htmlFor={`${fieldId}-scope`} className="sr-only">
              Search within
            </label>
            <select
              id={`${fieldId}-scope`}
              value={scope}
              onChange={(event) => setScope(event.target.value)}
              className="max-w-32 appearance-none bg-transparent pr-5 text-xs font-medium text-ink-600 focus:outline-none"
            >
              <option value="">All categories</option>
              {scopes.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-ink-400" aria-hidden />
          </div>
        ) : null}

        <label htmlFor={fieldId} className="sr-only">
          Search products
        </label>
        <input
          id={fieldId}
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search for toys, gadgets, gifts & more…"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${fieldId}-panel`}
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />

        <div className="flex shrink-0 items-center gap-1 pr-1.5">
          {loading ? <Loader2 className="size-4 animate-spin text-ink-400" aria-hidden /> : null}
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults(EMPTY);
              }}
              className="rounded-full p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
              aria-label="Clear search"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
          {voiceSupported ? (
            <button
              type="button"
              onClick={startVoiceSearch}
              aria-label="Search by voice"
              className={cn(
                "rounded-full p-1.5 transition",
                listening
                  ? "bg-sale-50 text-sale-600 animate-pulse-ring"
                  : "text-ink-400 hover:bg-ink-100 hover:text-ink-700",
              )}
            >
              <Mic className="size-4" aria-hidden />
            </button>
          ) : null}
          <button
            type="submit"
            aria-label="Search"
            className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700"
          >
            <Search className="size-4" aria-hidden />
          </button>
        </div>
      </form>

      {open ? (
        <div
          id={`${fieldId}-panel`}
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lift animate-scale-in"
        >
          {!showSuggestions ? (
            <div className="p-4">
              {history.length > 0 ? (
                <>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">
                    Recent searches
                  </p>
                  <ul className="mb-4 flex flex-wrap gap-2">
                    {history.map((term) => (
                      <li key={term}>
                        <button
                          type="button"
                          onClick={() => submit(term)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-sm text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                        >
                          <Clock className="size-3.5 text-ink-400" aria-hidden />
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              <p className="mb-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">
                Popular right now
              </p>
              <ul className="flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      onClick={() => submit(term)}
                      className="rounded-full bg-ink-50 px-3 py-1.5 text-sm text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : hasResults ? (
            <div className="max-h-[70vh] overflow-y-auto">
              {results.categories.length > 0 ? (
                <ul className="border-b border-ink-100 p-2">
                  {results.categories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/category/${category.slug}`}
                        onClick={() => {
                          setOpen(false);
                          onNavigate?.();
                        }}
                        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-brand-50"
                      >
                        <span className="font-medium text-ink-800">{category.name}</span>
                        <span className="text-xs text-ink-400">{category.count} items</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}

              <ul className="p-2">
                {results.products.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={() => {
                        setOpen(false);
                        onNavigate?.();
                      }}
                      className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-brand-50"
                    >
                      <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                        <Image src={product.image} alt="" fill sizes="48px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-900">
                          {product.name}
                        </span>
                        {product.category ? (
                          <span className="block truncate text-xs text-ink-400">
                            {product.category}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-sm font-semibold text-ink-900">
                        {formatPrice(product.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => submit(query)}
                className="flex w-full items-center justify-between gap-2 border-t border-ink-100 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                See all {results.total} results for “{results.query}”
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium text-ink-800">No matches for “{query.trim()}”</p>
              <p className="mt-1 text-sm text-ink-500">
                Try a shorter word, or browse{" "}
                <Link
                  href="/shop"
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="font-semibold text-brand-700 underline-offset-2 hover:underline"
                >
                  all products
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
