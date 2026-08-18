import { PackageCheck, RefreshCcw, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shop/page-header";
import { Prose } from "@/components/ui/prose";
import { formatPrice } from "@/lib/format";
import { commerce, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: `Delivery timelines, charges and the ${commerce.returnWindowDays}-day return policy at ${site.name}.`,
};

export default function ShippingReturnsPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Shipping & returns" }]}
        eyebrow="Policies"
        title="Shipping & returns"
        description="What it costs, when it arrives, and how to send something back."
      />

      <div className="container-page py-10 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          <Highlight
            icon={Truck}
            title="Free over ₹999"
            detail={`Standard delivery is ${formatPrice(commerce.shippingFlatRate)} below that.`}
          />
          <Highlight
            icon={PackageCheck}
            title="Dispatch in 24–48h"
            detail="Working days, from our Chennai warehouse."
          />
          <Highlight
            icon={RefreshCcw}
            title={`${commerce.returnWindowDays}-day returns`}
            detail="Unused items in original packaging."
          />
        </div>

        <Prose className="mt-10">
          <h2>Delivery charges</h2>
          <ul>
            <li>
              <strong>Standard</strong> — {formatPrice(commerce.shippingFlatRate)}, free on orders
              above {formatPrice(commerce.freeShippingThreshold)}. Delivered in 3–6 working days.
            </li>
            <li>
              <strong>Express</strong> — {formatPrice(commerce.expressShippingRate)} flat. Delivered
              in about 2 working days to serviceable PIN codes.
            </li>
            <li>
              <strong>Cash on delivery</strong> — adds a {formatPrice(commerce.codFee)} handling fee.
            </li>
          </ul>

          <h2>Where we ship</h2>
          <p>
            All Indian PIN codes covered by our courier partners. If your PIN code isn&apos;t
            serviceable, we&apos;ll contact you within one working day and refund in full if we
            can&apos;t deliver. We don&apos;t ship internationally yet.
          </p>

          <h2>Tracking your parcel</h2>
          <p>
            Every order gets a tracking link by email and SMS once it&apos;s packed. You can also see
            your order timeline under{" "}
            <Link href="/orders">your orders</Link>. In this demo storefront the timeline is simulated
            from your order date.
          </p>

          <h2 id="returns">Returns</h2>
          <p>
            Request a return within {commerce.returnWindowDays} days of delivery. The item needs to be
            unused, with its tags and original packaging. Reach us through the{" "}
            <Link href="/contact">contact page</Link> with your order number and we&apos;ll arrange a
            pickup where the courier supports it, or share a prepaid label.
          </p>

          <h3>What we can&apos;t take back</h3>
          <ul>
            <li>Opened beauty, makeup and personal care items</li>
            <li>Press-on nails and hair accessories once the seal is broken</li>
            <li>Innerwear-style items, food-grade straws and reusable bottles that have been used</li>
            <li>Items marked non-returnable on the product page</li>
          </ul>

          <h3>Damaged or wrong item</h3>
          <p>
            Send a photo within 48 hours of delivery. We&apos;ll replace it or refund you in full, and
            for low-value items we usually skip the return pickup entirely.
          </p>

          <h2>Refunds</h2>
          <p>
            Once the returned item reaches us and passes a quick check, the refund is raised within two
            working days. Prepaid orders go back to the original payment method in 3–7 working days;
            cash-on-delivery orders are refunded by bank transfer or UPI.
          </p>

          <h2>Cancellations</h2>
          <p>
            Orders can be cancelled free of charge until they&apos;re packed — usually within two hours
            of ordering. After dispatch, treat it as a return.
          </p>

          <p>
            Questions about a specific parcel? Email{" "}
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> or call{" "}
            {site.contact.phone} ({site.contact.hours}).
          </p>
        </Prose>
      </div>
    </>
  );
}

function Highlight({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Truck;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-3 font-semibold text-ink-900">{title}</p>
      <p className="mt-1 text-sm text-ink-500">{detail}</p>
    </div>
  );
}
