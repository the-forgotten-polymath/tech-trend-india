"use client";

import { SummaryCard } from "@/components/product/summary-card";
import { SectionHeading } from "@/components/ui/section";
import { recentlyViewedStore } from "@/lib/stores";
import { useProductSummaries } from "@/lib/use-product-summaries";
import { useStore } from "@/lib/use-store";

export function RecentlyViewed({ excludeId }: { excludeId?: number }) {
  const viewed = useStore(recentlyViewedStore);
  const ids = viewed.filter((id) => id !== excludeId).slice(0, 8);
  const { products } = useProductSummaries(ids);

  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-ink-100 pt-10">
      <SectionHeading eyebrow="Pick up where you left off" title="Recently viewed" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <SummaryCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
