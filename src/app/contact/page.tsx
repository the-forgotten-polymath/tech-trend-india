import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/layout/contact-form";
import { PageHeader } from "@/components/shop/page-header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Reach the ${site.name} team by email, phone or WhatsApp. We reply within a few hours on working days.`,
};

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: site.contact.email,
    href: `mailto:${site.contact.email}`,
    detail: "Best for order questions — replies within one working day.",
  },
  {
    icon: Phone,
    label: "Phone",
    value: site.contact.phone,
    href: `tel:${site.contact.phone.replace(/\s/g, "")}`,
    detail: site.contact.hours,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: site.contact.whatsapp,
    href: `https://wa.me/${site.contact.whatsapp.replace(/\D/g, "")}`,
    detail: "Send a photo if something arrived damaged.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        eyebrow="We're listening"
        title="Talk to a human"
        description="Questions about an order, a bulk enquiry, or help picking a gift — pick whichever channel suits you."
      />

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_20rem] sm:py-14">
        <ContactForm />

        <aside className="space-y-4">
          {CHANNELS.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel={channel.href.startsWith("http") ? "noreferrer noopener" : undefined}
              className="block rounded-2xl border border-ink-100 bg-white p-5 transition hover:border-ink-200 hover:shadow-card"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <channel.icon className="size-5" aria-hidden />
              </span>
              <p className="mt-3 text-xs font-semibold tracking-wide text-ink-400 uppercase">
                {channel.label}
              </p>
              <p className="mt-0.5 font-semibold text-ink-900">{channel.value}</p>
              <p className="mt-1 text-sm text-ink-500">{channel.detail}</p>
            </a>
          ))}

          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <MapPin className="size-4 text-brand-600" aria-hidden />
              Warehouse & pickup
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{site.contact.address}</p>
            <p className="mt-3 flex items-center gap-2 text-sm text-ink-500">
              <Clock className="size-4 text-ink-400" aria-hidden />
              {site.contact.hours}
            </p>
          </div>

          <p className="rounded-2xl bg-ink-50 p-5 text-sm text-ink-600">
            Looking for delivery timelines or return rules? They&apos;re all on the{" "}
            <Link href="/shipping-returns" className="font-semibold text-brand-700 underline underline-offset-2">
              shipping & returns
            </Link>{" "}
            page.
          </p>
        </aside>
      </div>
    </>
  );
}
