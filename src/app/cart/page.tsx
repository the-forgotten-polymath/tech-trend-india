import type { Metadata } from "next";

import { CartView } from "@/components/cart/cart-view";
import { ProductRail } from "@/components/product/product-rail";
import { PageHeader } from "@/components/shop/page-header";
import { SectionHeading } from "@/components/ui/section";
import { getFeaturedProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  const suggestions = getFeaturedProducts(10);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Your bag" }]}
        title="Your bag"
        description="Review your items, apply a coupon and head to checkout."
      />
      <div className="container-page py-8 sm:py-10">
        <CartView
          suggestions={
            <section>
              <SectionHeading
                eyebrow="Before you go"
                title="Add one more little thing"
                action={{ label: "Browse everything", href: "/shop" }}
              />
              <div className="mt-6">
                <ProductRail products={suggestions} />
              </div>
            </section>
          }
        />
      </div>
    </>
  );
}
