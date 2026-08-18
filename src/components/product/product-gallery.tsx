"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  productName,
  badge,
}: {
  images: ProductImage[];
  productName: string;
  badge?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = images[Math.min(active, images.length - 1)];
  const count = images.length;

  const step = useCallback(
    (delta: number) => {
      setActive((index) => (index + delta + count) % count);
    },
    [count],
  );

  // Keyboard support while the lightbox is open.
  useEffect(() => {
    if (!zoomed) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(false);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [zoomed, step]);

  return (
    <div className="lg:sticky lg:top-32">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-ink-100 bg-white">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt || productName}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-contain animate-fade-in"
        />

        {badge ? <div className="absolute top-4 left-4 flex flex-col gap-2">{badge}</div> : null}

        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="absolute right-4 bottom-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-card backdrop-blur transition hover:bg-white"
          aria-label="View larger image"
        >
          <Expand className="size-4" aria-hidden />
        </button>

        {images.length > 1 ? (
          <>
            <GalleryArrow direction="left" onClick={() => step(-1)} />
            <GalleryArrow direction="right" onClick={() => step(1)} />
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {images.map((image, index) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-current={index === active}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                className={cn(
                  "relative block size-18 shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition",
                  index === active
                    ? "border-brand-500"
                    : "border-ink-100 hover:border-ink-300",
                )}
              >
                <Image src={image.src} alt="" fill sizes="72px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {zoomed ? (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center bg-ink-900/90 p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} enlarged image`}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close image viewer"
          >
            <X className="size-5" aria-hidden />
          </button>
          <div className="relative h-full max-h-[85vh] w-full max-w-4xl">
            <Image
              src={current.src}
              alt={current.alt || productName}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
          {images.length > 1 ? (
            <>
              <GalleryArrow direction="left" onClick={() => step(-1)} variant="dark" />
              <GalleryArrow direction="right" onClick={() => step(1)} variant="dark" />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function GalleryArrow({
  direction,
  onClick,
  variant = "light",
}: {
  direction: "left" | "right";
  onClick: () => void;
  variant?: "light" | "dark";
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Previous image" : "Next image"}
      className={cn(
        "absolute top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full transition",
        direction === "left" ? "left-3" : "right-3",
        variant === "light"
          ? "bg-white/90 text-ink-700 shadow-card backdrop-blur hover:bg-white"
          : "bg-white/10 text-white hover:bg-white/20",
      )}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
