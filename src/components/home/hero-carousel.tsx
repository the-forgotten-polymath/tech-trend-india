"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonClasses } from "@/components/ui/button";
import type { HeroSlideView } from "@/lib/merchandising";
import { cn } from "@/lib/utils";

const TONES: Record<HeroSlideView["tone"], string> = {
  peach: "from-peach-100 via-peach-50 to-brand-50",
  mint: "from-brand-100 via-brand-50 to-peach-50",
  sand: "from-peach-50 via-white to-brand-50",
};

const ROTATE_MS = 7000;

/** Auto-rotating hero banner. Pauses on hover/focus, dots for manual control. */
export function HeroCarousel({ slides }: { slides: HeroSlideView[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const slide = slides[index];
  const go = (delta: number) =>
    setIndex((current) => (current + delta + slides.length) % slides.length);

  return (
    <section
      aria-label="Featured promotions"
      className="container-page pt-4 sm:pt-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-linear-to-br p-6 sm:rounded-3xl sm:p-10 lg:p-12",
          TONES[slide.tone],
        )}
      >
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div key={slide.id} className="animate-fade-in">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-brand-800 uppercase">
              <Sparkles className="size-3.5" aria-hidden />
              {slide.eyebrow}
            </p>

            <h1 className="mt-4 text-3xl leading-[1.1] font-extrabold sm:text-4xl lg:text-5xl">
              {slide.title}{" "}
              <span className="text-brand-700">{slide.highlight}</span>
            </h1>

            <p className="mt-4 max-w-md text-sm text-ink-600 sm:text-base">{slide.body}</p>

            <div className="mt-7 flex items-center gap-3">
              <Link
                href={slide.primary.href}
                className={buttonClasses("primary", "lg", "min-w-0 flex-1 px-4 sm:flex-none sm:px-6")}
              >
                <span className="truncate">{slide.primary.label}</span>
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Link>
              <Link
                href={slide.secondary.href}
                className={buttonClasses("outline", "lg", "min-w-0 flex-1 px-4 sm:flex-none sm:px-6")}
              >
                <span className="sm:hidden">{slide.secondary.short}</span>
                <span className="hidden sm:inline">{slide.secondary.label}</span>
              </Link>
            </div>
          </div>

          {/* Collage built from real product photography, height-capped so the
              banner stays a banner on every breakpoint. */}
          <div
            key={`${slide.id}-art`}
            className="grid h-56 grid-cols-3 grid-rows-2 gap-3 animate-scale-in sm:h-72 lg:h-80"
          >
            {slide.images.slice(0, 3).map((image, imageIndex) => (
              <span
                key={image.src}
                className={cn(
                  "relative block overflow-hidden rounded-2xl bg-white shadow-card",
                  imageIndex === 0 && "col-span-2 row-span-2",
                )}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index === 0 && imageIndex === 0}
                  sizes={imageIndex === 0 ? "(min-width: 1024px) 30vw, 60vw" : "(min-width: 1024px) 15vw, 30vw"}
                  className="object-cover"
                />
              </span>
            ))}
          </div>
        </div>

        {slides.length > 1 ? (
          <>
            <div className="mt-8 flex items-center justify-center gap-2 lg:justify-start">
              {slides.map((item, dotIndex) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(dotIndex)}
                  aria-label={`Show promotion ${dotIndex + 1}`}
                  aria-current={dotIndex === index}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    dotIndex === index ? "w-7 bg-brand-700" : "w-2 bg-brand-700/30 hover:bg-brand-700/50",
                  )}
                />
              ))}
            </div>

            <div className="absolute inset-y-0 right-3 hidden flex-col justify-center gap-2 lg:flex">
              <NavButton direction="left" onClick={() => go(-1)} />
              <NavButton direction="right" onClick={() => go(1)} />
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function NavButton({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Previous promotion" : "Next promotion"}
      className="flex size-9 items-center justify-center rounded-full bg-white/80 text-brand-800 shadow-card transition hover:bg-white"
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
