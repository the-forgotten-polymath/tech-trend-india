import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  columns = 4,
  priorityCount = 4,
  className,
}: {
  products: Product[];
  columns?: 3 | 4 | 5;
  priorityCount?: number;
  className?: string;
}) {
  const columnClass = {
    3: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  }[columns];

  return (
    <div className={cn("grid gap-4 sm:gap-5", columnClass, className)}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  );
}
