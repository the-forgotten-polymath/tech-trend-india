import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  value,
  compareAt,
  size = "md",
  className,
}: {
  value: number;
  compareAt?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const showCompare = typeof compareAt === "number" && compareAt > value;
  const sizes = {
    sm: { price: "text-sm font-semibold", compare: "text-xs" },
    md: { price: "text-base font-bold", compare: "text-sm" },
    lg: { price: "text-3xl font-bold", compare: "text-base" },
  }[size];

  if (value <= 0) {
    return <span className={cn(sizes.price, "text-ink-600", className)}>Price on request</span>;
  }

  return (
    <span className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn(sizes.price, "text-ink-900")}>{formatPrice(value)}</span>
      {showCompare ? (
        <span className={cn(sizes.compare, "text-ink-400 line-through")}>
          {formatPrice(compareAt)}
        </span>
      ) : null}
    </span>
  );
}
