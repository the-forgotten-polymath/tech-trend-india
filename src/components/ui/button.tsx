import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "dark" | "sale";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white shadow-card hover:bg-brand-800 active:bg-brand-900 disabled:bg-brand-200 disabled:text-white/70",
  secondary: "bg-brand-50 text-brand-800 hover:bg-brand-100 disabled:text-brand-300",
  ghost: "text-ink-700 hover:bg-ink-100/80 disabled:text-ink-300",
  outline: "border border-ink-200 bg-white text-ink-800 hover:border-brand-300 hover:text-brand-700",
  dark: "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-900 disabled:bg-ink-300",
  sale: "bg-sale-600 text-white hover:bg-sale-700 disabled:bg-sale-100",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3.5 text-xs font-bold tracking-wide uppercase",
  md: "h-11 gap-2 rounded-lg px-5 text-sm",
  lg: "h-12 gap-2 rounded-lg px-6 text-sm sm:h-13 sm:text-base",
  icon: "size-10 rounded-lg",
};

const BASE =
  "inline-flex shrink-0 items-center justify-center font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:shadow-none";

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
};

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
