import type { Metadata } from "next";

import { CheckoutView } from "@/components/checkout/checkout-view";
import { PageHeader } from "@/components/shop/page-header";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Your bag", href: "/cart" },
          { label: "Checkout" },
        ]}
        title="Checkout"
        description="Four short steps. Delivery details, speed, payment, done."
      />
      <div className="container-page py-8 sm:py-10">
        <CheckoutView />
      </div>
    </>
  );
}
