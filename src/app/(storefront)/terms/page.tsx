import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shop/page-header";
import { Prose } from "@/components/ui/prose";
import { formatDate } from "@/lib/format";
import { commerce, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: `The terms that apply when you shop with ${site.name}.`,
};

export default function TermsPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Terms of service" }]}
        eyebrow="Legal"
        title="Terms of service"
        description={`Last updated ${formatDate(new Date())}`}
      />

      <div className="container-page py-10 sm:py-14">
        <Prose>
          <p>
            By browsing or ordering from {site.name} you accept these terms. This build is a
            demonstration storefront: orders are simulated, no payment is taken and no goods are
            dispatched.
          </p>

          <h2>Products and pricing</h2>
          <ul>
            <li>All prices are in Indian Rupees and include applicable GST.</li>
            <li>
              Product photos are supplied by our vendors. Colours and finishes can vary slightly
              between production batches.
            </li>
            <li>
              We correct pricing or stock errors as soon as we spot them. If an error affects an order
              you placed, we&apos;ll contact you before shipping and refund in full if you&apos;d rather
              cancel.
            </li>
            <li>Offers run while stocks last and can be withdrawn without notice.</li>
          </ul>

          <h2>Orders</h2>
          <p>
            An order is an offer to buy. It becomes a contract when we confirm dispatch. We may decline
            an order where the item is out of stock, the delivery address isn&apos;t serviceable, or we
            suspect fraudulent use of a payment method.
          </p>

          <h2>Coupons</h2>
          <p>
            Coupon codes apply to product subtotals only, cannot be combined, and are subject to the
            minimum spend shown with each code. Current demo codes are{" "}
            {commerce.coupons.map((coupon) => coupon.code).join(", ")}.
          </p>

          <h2>Delivery, returns and refunds</h2>
          <p>
            Delivery timelines, charges and the {commerce.returnWindowDays}-day return window are set
            out on the <Link href="/shipping-returns">shipping & returns</Link> page, which forms part
            of these terms.
          </p>

          <h2>Acceptable use</h2>
          <ul>
            <li>Don&apos;t scrape, resell or republish our catalogue, photography or copy.</li>
            <li>Don&apos;t attempt to disrupt the site or access other shoppers&apos; data.</li>
            <li>Bulk resale requires a written agreement with us first.</li>
          </ul>

          <h2>Liability</h2>
          <p>
            We stand behind what we ship: if an item is faulty or not as described, we&apos;ll replace
            or refund it. Beyond that, our liability is limited to the value of the order. Nothing here
            limits rights you have under Indian consumer law.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these terms as the store evolves. The version on this page at the time you
            order is the one that applies.
          </p>

          <h2>Contact</h2>
          <p>
            Reach us at <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> or{" "}
            {site.contact.phone}, {site.contact.hours}.
          </p>
        </Prose>
      </div>
    </>
  );
}
