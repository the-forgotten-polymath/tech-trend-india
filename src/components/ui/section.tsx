import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Centred section heading with the small uppercase eyebrow and underline rule
 * used across the storefront, plus an optional right-aligned action link.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  align?: "start" | "center";
  className?: string;
}) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {eyebrow ? (
          <p className="text-[11px] font-bold tracking-[0.22em] text-brand-700 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-xl font-extrabold tracking-tight uppercase sm:text-2xl">{title}</h2>
        {centered ? (
          <span className="mx-auto mt-3 block h-0.5 w-16 rounded-full bg-brand-600" aria-hidden />
        ) : null}
        {description ? (
          <p className={cn("mt-3 text-sm text-ink-500", centered && "mx-auto max-w-xl")}>
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className={cn(
            "group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-800",
            centered ? "mx-auto" : "self-start sm:self-auto",
          )}
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

export function Section({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & Omit<
  React.ComponentPropsWithoutRef<"section">,
  "className" | "children"
>) {
  return (
    <section className={cn("py-10 sm:py-14", className)} {...rest}>
      {children}
    </section>
  );
}
