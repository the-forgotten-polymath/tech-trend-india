import { Boxes, HeartHandshake, PackageCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ValueProps } from "@/components/home/value-props";
import { PageHeader } from "@/components/shop/page-header";
import { buttonClasses } from "@/components/ui/button";
import { Prose } from "@/components/ui/prose";
import { SectionHeading } from "@/components/ui/section";
import { CATALOG_STATS } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About us",
  description: `${site.name} is a modern gifting store with over a thousand hand-picked products across gadgets, drinkware, jewellery, toys, beauty and home.`,
};

const PILLARS = [
  {
    icon: Boxes,
    title: "One catalogue, many occasions",
    body: "Birthdays, farewells, festivals, return gifts and the odd treat-yourself buy — organised into departments so you can shop by need, not by guesswork.",
  },
  {
    icon: PackageCheck,
    title: "Checked, then packed",
    body: "Every item is inspected before it goes into a box. If something looks off, it doesn't ship.",
  },
  {
    icon: HeartHandshake,
    title: "Fair prices, plainly shown",
    body: "Prices include tax. Discounts are shown against the real regular price, never an inflated one.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        eyebrow="Our story"
        title={`Gifting, minus the guesswork`}
        description={`${site.name} started as a small counter of gadgets and giftables. Today it's ${formatNumber(CATALOG_STATS.productCount)} products across ${CATALOG_STATS.categoryCount} categories — still picked one by one.`}
      />

      <div className="container-page py-10 sm:py-14">
        <Prose>
          <p>
            We built {site.name} because gift shopping online is oddly hard. Marketplaces bury good
            products under thousands of near-identical listings, and boutique stores rarely stock the
            practical stuff people actually keep using — a bottle that survives a school bag, earbuds
            that pair on the first try, fairy lights that come with a working controller.
          </p>
          <p>
            So we do the narrowing down. Our team reviews supplier samples, keeps what holds up and
            photographs each product as it really looks. What you see on the page is what turns up in
            the box.
          </p>

          <h2>What we care about</h2>
          <p>
            Three things guide what makes it into the catalogue: it has to be useful, it has to feel
            like a gift, and it has to survive the first month of real use.
          </p>
        </Prose>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <li key={pillar.title} className="rounded-2xl border border-ink-100 bg-white p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <pillar.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{pillar.body}</p>
            </li>
          ))}
        </ul>

        <section className="mt-14">
          <SectionHeading
            eyebrow="By the numbers"
            title="A catalogue you can actually browse"
            description="Numbers pulled straight from our live product data."
          />
          <dl className="mt-8 grid gap-4 sm:grid-cols-4">
            <Stat label="Products" value={formatNumber(CATALOG_STATS.productCount)} />
            <Stat label="Categories" value={formatNumber(CATALOG_STATS.categoryCount)} />
            <Stat label="Product photos" value={formatNumber(CATALOG_STATS.imageCount)} />
            <Stat label="On offer today" value={formatNumber(CATALOG_STATS.onSaleCount)} />
          </dl>
        </section>

        <section className="mt-14">
          <SectionHeading eyebrow="How we ship" title="What you can expect" />
          <div className="mt-8">
            <ValueProps />
          </div>
        </section>

        <section className="mt-14 flex flex-col items-start gap-5 rounded-2xl-KEEP bg-ink-900 p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
              <Sparkles className="size-5 text-brand-300" aria-hidden />
              Need a hand choosing?
            </h2>
            <p className="mt-2 max-w-xl text-ink-200">
              Tell us the occasion and budget — we&apos;ll send back three options within a few hours.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className={buttonClasses("primary", "md")}>
              Talk to us
            </Link>
            <Link href="/shop" className={buttonClasses("outline", "md")}>
              Browse products
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="mt-1 text-3xl font-bold text-ink-900">{value}</dd>
    </div>
  );
}
