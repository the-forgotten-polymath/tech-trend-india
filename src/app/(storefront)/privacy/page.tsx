import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shop/page-header";
import { Prose } from "@/components/ui/prose";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${site.name} handles the information you share while shopping.`,
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Privacy policy" }]}
        eyebrow="Legal"
        title="Privacy policy"
        description={`Last updated ${formatDate(new Date())}`}
      />

      <div className="container-page py-10 sm:py-14">
        <Prose>
          <p>
            This page explains what happens to your information when you use this storefront. It is
            written for a demo build, so it also flags where a live store would differ.
          </p>

          <h2>What stays in your browser</h2>
          <p>
            Your bag, wishlist, recently viewed products, search history and order records are stored
            in your browser&apos;s local storage. They never leave your device in this build, are not
            shared with us or anyone else, and disappear if you clear site data.
          </p>

          <h2>What we would collect on a live store</h2>
          <ul>
            <li>
              <strong>Contact and delivery details</strong> — name, email, phone number and address,
              used only to fulfil and support your order.
            </li>
            <li>
              <strong>Order details</strong> — the items, amounts and payment status of your purchase.
            </li>
            <li>
              <strong>Basic analytics</strong> — aggregate page views to understand what people browse.
            </li>
          </ul>

          <h2>Payments</h2>
          <p>
            No payment is processed here and no card details are ever collected by this application. A
            live store would hand you to a PCI-compliant payment provider, who would receive your card
            or UPI details directly — we would only see the outcome of the transaction.
          </p>

          <h2>Cookies</h2>
          <p>
            This build sets no advertising or tracking cookies. A production deployment would typically
            use a small number of functional cookies (session, cart) and, with your consent, analytics
            cookies.
          </p>

          <h2>Sharing</h2>
          <p>
            On a live store your address would be shared with the courier delivering your parcel, and
            your email with the service that sends order notifications. Nothing is sold to third
            parties.
          </p>

          <h2>Your choices</h2>
          <ul>
            <li>Clear your bag, wishlist and order history at any time by clearing site data.</li>
            <li>
              Ask us to delete data held about you by writing to{" "}
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
            </li>
            <li>Unsubscribe from newsletters using the link in any email.</li>
          </ul>

          <h2>Children</h2>
          <p>
            The store is intended for adults. We don&apos;t knowingly collect information from children
            under 13.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about privacy? Email{" "}
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> or use the{" "}
            <Link href="/contact">contact page</Link>. Our registered address is {site.contact.address}
            .
          </p>
        </Prose>
      </div>
    </>
  );
}
