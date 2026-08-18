import { Mail, MapPin, Phone, Sparkles } from "lucide-react";
import Link from "next/link";

import { NewsletterForm } from "@/components/layout/newsletter-form";
import { getCategory } from "@/lib/catalog";
import { site } from "@/lib/site";
import { collections, departments } from "@/lib/taxonomy";

const HELP_LINKS = [
  { label: "Shipping & delivery", href: "/shipping-returns" },
  { label: "Returns & refunds", href: "/shipping-returns#returns" },
  { label: "FAQs", href: "/faq" },
  { label: "Track your order", href: "/orders" },
  { label: "Contact us", href: "/contact" },
];

const COMPANY_LINKS = [
  { label: "About us", href: "/about" },
  { label: "All products", href: "/shop" },
  { label: "Today's deals", href: "/deals" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of service", href: "/terms" },
];

const PAYMENT_METHODS = ["UPI", "Visa", "Mastercard", "RuPay", "Net banking", "Cash on delivery"];

export function SiteFooter() {
  const shopLinks = departments.slice(0, 6).map((department) => ({
    label: department.label,
    href: `/category/${department.slug}`,
    count: getCategory(department.slug)?.totalCount ?? 0,
  }));

  return (
    <footer className="mt-16 bg-brand-900 text-brand-100">
      <div className="container-page py-12 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white">
                <Sparkles className="size-5" aria-hidden />
              </span>
              <span className="font-display text-xl font-extrabold text-white">{site.name}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-200">{site.description}</p>

            <ul className="mt-6 space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-300" aria-hidden />
                {site.contact.address}
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-brand-300" aria-hidden />
                <a
                  href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                  className="transition hover:text-white"
                >
                  {site.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-brand-300" aria-hidden />
                <a href={`mailto:${site.contact.email}`} className="transition hover:text-white">
                  {site.contact.email}
                </a>
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              {site.social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-5">
            <FooterColumn title="Shop" links={shopLinks} />
            <FooterColumn title="Customer care" links={HELP_LINKS} />
            <FooterColumn title="Company" links={COMPANY_LINKS} />
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold tracking-wide text-white uppercase">
              Get the good stuff first
            </h3>
            <p className="mt-2 text-sm text-brand-200">
              New arrivals, restocks and members-only offers. One email a week, no spam.
            </p>
            <NewsletterForm className="mt-4" tone="dark" />

            <p className="mt-6 text-xs font-bold tracking-wide text-brand-300 uppercase">
              Gift guides
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {collections.map((collection) => (
                <li key={collection.slug}>
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="inline-flex rounded-full border border-white/15 px-3 py-1.5 text-xs transition hover:border-white/40 hover:text-white"
                  >
                    {collection.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => (
              <li
                key={method}
                className="rounded-md border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-brand-200"
              >
                {method}
              </li>
            ))}
          </ul>
          <p className="text-xs text-brand-300">
            Prices in INR, inclusive of taxes. {site.contact.hours}.
          </p>
        </div>

        <p className="mt-6 text-xs text-brand-300">
          © {new Date().getFullYear()} {site.name}. Demo storefront — orders are simulated, no
          payments are processed, and ratings and testimonials are placeholder content.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; count?: number }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-bold tracking-wide text-white uppercase">{title}</h3>
      <ul className="mt-3.5 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex items-baseline gap-1.5 text-sm text-brand-200 transition hover:text-white"
            >
              {link.label}
              {typeof link.count === "number" ? (
                <span className="text-[11px] text-brand-400">{link.count}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
