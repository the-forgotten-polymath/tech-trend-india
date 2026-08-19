import type { Metadata } from "next";

import { OrderList } from "@/components/checkout/order-list";
import { PageHeader } from "@/components/shop/page-header";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Your orders" }]}
        title="Your orders"
        description="Every order you place in this browser, with its simulated delivery timeline."
      />
      <div className="container-page py-8 sm:py-10">
        <OrderList />
      </div>
    </>
  );
}
