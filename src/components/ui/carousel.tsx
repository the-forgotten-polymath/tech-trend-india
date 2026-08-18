"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Horizontal scroll rail with arrow buttons. Uses native scrolling (so touch,
 * trackpad and keyboard all work) and only shows arrows when there is overflow.
 */
export function Carousel({
  children,
  className,
  itemClassName,
  ariaLabel,
}: {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  ariaLabel: string;
}) {
  const railRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setAtStart(rail.scrollLeft <= 4);
    setAtEnd(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    sync();
    rail.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(rail);
    return () => {
      rail.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [sync]);

  const scrollBy = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(280, rail.clientWidth * 0.8), behavior: "smooth" });
  };

  const hasOverflow = !atStart || !atEnd;

  return (
    <div className={cn("relative", className)}>
      <ul
        ref={railRef}
        aria-label={ariaLabel}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 scrollbar-none"
      >
        {children.map((child, index) => (
          <li key={index} className={cn("shrink-0 snap-start", itemClassName)}>
            {child}
          </li>
        ))}
      </ul>

      {hasOverflow ? (
        <>
          <ArrowButton
            direction="left"
            disabled={atStart}
            onClick={() => scrollBy(-1)}
            className="-left-3 lg:-left-5"
          />
          <ArrowButton
            direction="right"
            disabled={atEnd}
            onClick={() => scrollBy(1)}
            className="-right-3 lg:-right-5"
          />
        </>
      ) : null}
    </div>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
  className,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  className?: string;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
      className={cn(
        "absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-700 shadow-card transition hover:border-brand-200 hover:text-brand-700 disabled:pointer-events-none disabled:opacity-0 sm:flex",
        className,
      )}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
