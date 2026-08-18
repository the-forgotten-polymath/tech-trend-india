import { ProductCard } from "@/components/product/product-card";
import { Carousel } from "@/components/ui/carousel";
import type { Product } from "@/lib/types";

/** Horizontal product row with arrow controls, used on product and cart pages. */
export function ProductRail({
  products,
  ariaLabel = "Products",
  variant = "grid",
}: {
  products: Product[];
  ariaLabel?: string;
  variant?: "grid" | "deal";
}) {
  if (products.length === 0) return null;

  return (
    <Carousel ariaLabel={ariaLabel} itemClassName="w-[46%] sm:w-56 lg:w-60">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          sizes="(min-width: 1024px) 15rem, (min-width: 640px) 14rem, 46vw"
        />
      ))}
    </Carousel>
  );
}
