import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shop/page-header";
import { commerce, site } from "@/lib/site";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "FAQs",
  description: `Answers to common questions about ordering, delivery, returns and payments at ${site.name}.`,
};

const GROUPS = [
  {
    title: "Ordering",
    items: [
      {
        q: "Do I need an account to order?",
        a: "No. Checkout is guest-only in this store — you enter delivery details once and you're done. Your bag, wishlist and order history are kept in your browser.",
      },
      {
        q: "Can I change or cancel an order?",
        a: "Reach out within two hours of placing it and we'll amend or cancel before the parcel is packed. After dispatch, use the returns process instead.",
      },
      {
        q: "Do you take bulk or corporate orders?",
        a: "Yes — hampers, return gifts and branded sets. Send the quantity and budget through the contact page and we'll quote within a day.",
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "Orders leave the warehouse in 24–48 hours. Standard delivery lands in 3–6 working days; express usually in 2.",
      },
      {
        q: "When is delivery free?",
        a: "Shipping is quoted per order based on your location. We deliver across India only.",
      },
      {
        q: "Do you ship outside India?",
        a: "Not yet. We ship to all Indian PIN codes served by our courier partners.",
      },
    ],
  },
  {
    title: "Returns & refunds",
    items: [
      {
        q: "What's your return window?",
        a: `${commerce.returnWindowDays} days from delivery for unused items in original packaging. Personal care, press-on nails and opened beauty items can't be returned for hygiene reasons.`,
      },
      {
        q: "Something arrived damaged. What now?",
        a: "Send a photo within 48 hours and we'll ship a replacement or refund you in full — no return pickup needed for low-value items.",
      },
      {
        q: "How fast are refunds?",
        a: "Once the item is back with us, refunds are raised within two working days and reach your account in 3–7 days depending on your bank.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        q: "Which payment methods do you accept?",
        a: "UPI (GPay, PhonePe, Paytm), credit and debit cards, net banking, and wallets via Razorpay.",
      },
      {
        q: "Is this store live?",
        a: "This build is a demo storefront. Orders are simulated and stored in your browser only — no payment is processed and no card details are collected.",
      },
      {
        q: "Are prices inclusive of tax?",
        a: "Yes. Every price shown includes GST, so the total at checkout only adds delivery and any COD fee.",
      },
    ],
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    ),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQs" }]}
        eyebrow="Help centre"
        title="Frequently asked questions"
        description="Ordering, delivery, returns and payments — the short answers."
      />

      <div className="container-page py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[14rem_1fr]">
          <nav aria-label="FAQ sections" className="lg:sticky lg:top-32 lg:self-start">
            <ul className="space-y-1">
              {GROUPS.map((group) => (
                <li key={group.title}>
                  <a
                    href={`#${group.title.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
                  >
                    {group.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-10">
            {GROUPS.map((group) => (
              <section
                key={group.title}
                id={group.title.toLowerCase().replace(/[^a-z]+/g, "-")}
                className="scroll-mt-32"
              >
                <h2 className="text-xl font-bold">{group.title}</h2>
                <div className="mt-4 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white">
                  {group.items.map((item) => (
                    <details key={item.q} className="group px-5 py-4">
                      <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-ink-900 marker:content-none">
                        {item.q}
                        <span className="text-ink-400 transition group-open:rotate-45" aria-hidden>
                          +
                        </span>
                      </summary>
                      <p className="mt-2.5 text-sm leading-relaxed text-ink-600">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            <p className="rounded-2xl bg-ink-50 p-6 text-sm text-ink-600">
              Still stuck?{" "}
              <Link href="/contact" className="font-semibold text-brand-700 underline underline-offset-2">
                Message the team
              </Link>{" "}
              — we answer within a working day.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
