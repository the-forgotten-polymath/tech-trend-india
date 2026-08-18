"use client";

import { CheckCircle2, Gift, MapPin, PackageSearch, Printer, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatPrice } from "@/lib/format";
import { findOrder, orderTimeline, PAYMENT_LABELS } from "@/lib/orders";
import { site } from "@/lib/site";
import { ordersStore } from "@/lib/stores";
import { useClientReady, useStore } from "@/lib/use-store";
import { cn } from "@/lib/utils";

export function OrderConfirmation({ orderId }: { orderId: string }) {
  const orders = useStore(ordersStore);
  const ready = useClientReady();
  const order = findOrder(orders, orderId) ?? null;

  if (!ready) {
    return <div className="h-72 animate-pulse rounded-2xl bg-white" />;
  }

  if (!order) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="We couldn't find that order"
        description="Orders in this demo are stored in your browser, so they aren't visible on other devices or after clearing site data."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/orders" className={buttonClasses("outline", "md")}>
              Your orders
            </Link>
            <Link href="/shop" className={buttonClasses("primary", "md")}>
              Continue shopping
            </Link>
          </div>
        }
      />
    );
  }

  const timeline = orderTimeline(order);
  const arrival = timeline[timeline.length - 1].date;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-full bg-emerald-600 text-white">
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-emerald-950 sm:text-3xl">
          Thanks {order.customer.name.split(" ")[0]}, your order is confirmed
        </h1>
        <p className="mt-2 text-emerald-900">
          Order <strong>{order.id}</strong> placed on {formatDate(order.createdAt)}. A confirmation
          has been sent to {order.customer.email}.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/orders" className={buttonClasses("dark", "md")}>
            View all orders
          </Link>
          <Link href="/shop" className={buttonClasses("outline", "md")}>
            Keep shopping
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className={buttonClasses("ghost", "md")}
          >
            <Printer className="size-4" aria-hidden />
            Print receipt
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Truck className="size-5 text-brand-600" aria-hidden />
              Delivery status
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Estimated arrival {formatDate(arrival)} · {order.shipping === "express" ? "Express" : "Standard"} delivery
            </p>

            <ol className="mt-5 space-y-4">
              {timeline.map((step, index) => (
                <li key={step.label} className="flex gap-3">
                  <span className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                        step.done
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-ink-200 bg-white text-ink-400",
                      )}
                    >
                      {index + 1}
                    </span>
                    {index < timeline.length - 1 ? (
                      <span className="mt-1 h-8 w-px bg-ink-200" />
                    ) : null}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink-900">{step.label}</span>
                    <span className="block text-xs text-ink-500">{formatDate(step.date)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold">Items in this order</h2>
            <ul className="mt-4 divide-y divide-ink-100">
              {order.lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <Link
                    href={`/product/${line.slug}`}
                    className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-ink-50"
                  >
                    <Image src={line.image} alt="" fill sizes="64px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${line.slug}`}
                      className="line-clamp-2 text-sm font-semibold text-ink-900 hover:text-brand-700"
                    >
                      {line.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink-500">
                      Qty {line.quantity}
                      {Object.entries(line.options).length > 0
                        ? ` · ${Object.values(line.options).join(", ")}`
                        : ""}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(line.price * line.quantity)}</p>
                </li>
              ))}
            </ul>

            {order.giftWrap ? (
              <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
                <Gift className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  Gift wrap included.
                  {order.giftNote ? <> Note: “{order.giftNote}”</> : null}
                </span>
              </p>
            ) : null}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-ink-100 bg-white p-5">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <MapPin className="size-4 text-brand-600" aria-hidden />
              Shipping to
            </h2>
            <address className="mt-3 text-sm leading-relaxed text-ink-600 not-italic">
              <strong className="block font-semibold text-ink-900">{order.customer.name}</strong>
              {order.address.line1}
              <br />
              {order.address.line2 ? (
                <>
                  {order.address.line2}
                  <br />
                </>
              ) : null}
              {order.address.city}, {order.address.state} {order.address.pincode}
              <br />
              {order.customer.phone}
            </address>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5">
            <h2 className="text-base font-bold">Payment summary</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(order.totals.subtotal)} />
              {order.totals.couponDiscount > 0 ? (
                <Row
                  label={`Coupon ${order.couponCode ?? ""}`}
                  value={`−${formatPrice(order.totals.couponDiscount)}`}
                />
              ) : null}
              <Row
                label="Delivery"
                value={order.totals.shipping === 0 ? "Free" : formatPrice(order.totals.shipping)}
              />
              {order.totals.codFee > 0 ? (
                <Row label="COD handling" value={formatPrice(order.totals.codFee)} />
              ) : null}
              <div className="flex justify-between border-t border-ink-100 pt-2.5">
                <dt className="font-bold text-ink-900">Total</dt>
                <dd className="font-bold text-ink-900">{formatPrice(order.totals.total)}</dd>
              </div>
              <Row label="Method" value={PAYMENT_LABELS[order.payment]} />
            </dl>
            <p className="mt-4 text-xs text-ink-400">
              Simulated order — no payment was processed. Questions? {site.contact.email}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  );
}
