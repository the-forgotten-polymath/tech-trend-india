"use client";

import { ChevronRight, PackageSearch } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatPrice, pluralise } from "@/lib/format";
import { PAYMENT_LABELS } from "@/lib/orders";
import { ordersStore } from "@/lib/stores";
import { useClientReady, useStore } from "@/lib/use-store";

export function OrderList() {
  const orders = useStore(ordersStore);
  const ready = useClientReady();

  if (!ready) return <div className="h-48 animate-pulse rounded-2xl bg-white" />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No orders yet"
        description="Once you place an order it will appear here, along with its delivery timeline. Orders are stored in this browser only."
        action={
          <Link href="/shop" className={buttonClasses("primary", "md")}>
            Start shopping
          </Link>
        }
      />
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/order/${order.id}`}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 transition hover:border-ink-200 hover:shadow-card"
          >
            <div className="flex -space-x-3">
              {order.lines.slice(0, 3).map((line) => (
                <span
                  key={line.key}
                  className="relative size-14 overflow-hidden rounded-xl border-2 border-white bg-ink-50"
                >
                  <Image src={line.image} alt="" fill sizes="56px" className="object-cover" />
                </span>
              ))}
              {order.lines.length > 3 ? (
                <span className="flex size-14 items-center justify-center rounded-xl border-2 border-white bg-ink-100 text-xs font-semibold text-ink-600">
                  +{order.lines.length - 3}
                </span>
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink-900">{order.id}</p>
              <p className="text-sm text-ink-500">
                {formatDate(order.createdAt)} ·{" "}
                {order.totals.itemCount} {pluralise(order.totals.itemCount, "item")} ·{" "}
                {PAYMENT_LABELS[order.payment]}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">{formatPrice(order.totals.total)}</span>
              <ChevronRight className="size-4 text-ink-400" aria-hidden />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
