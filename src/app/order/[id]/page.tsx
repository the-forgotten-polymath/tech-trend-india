import type { Metadata } from "next";

import { OrderConfirmation } from "@/components/checkout/order-confirmation";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="container-page py-10 sm:py-14">
      <OrderConfirmation orderId={id} />
    </div>
  );
}
