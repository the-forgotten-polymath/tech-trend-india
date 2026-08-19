// @ts-nocheck
// -nocheck
import { Package } from "lucide-react";
import Link from "next/link";

import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Orders" };

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  packed: "bg-violet-50 text-violet-700",
  shipped: "bg-brand-50 text-brand-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-sale-50 text-sale-700",
  refunded: "bg-ink-100 text-ink-600",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = params.status || "";
  const perPage = 20;

  const supabase = await createServerSupabase();

  let query = supabase
    .from("orders")
    .select("id, customer_name, customer_email, total, item_count, status, payment_method, payment_status, shipping_method, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data: orders, count } = await query;
  const total = count ?? 0;
  const pageCount = Math.ceil(total / perPage);

  const statuses = ["", "pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-900">Orders</h1>
        <p className="mt-1 text-sm text-ink-500">{total} orders total</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s || "all"}
            href={`/admin/orders${s ? `?status=${s}` : ""}`}
            className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
              status === s
                ? "bg-brand-700 text-white"
                : "border border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
            }`}
          >
            {s || "All"}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {!orders || orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Package className="size-8 text-ink-300" aria-hidden />
            <p className="text-sm font-medium text-ink-500">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50 text-left text-xs font-semibold text-ink-500 uppercase">
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-semibold text-brand-700 hover:underline">
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{order.customer_name}</p>
                      <p className="text-xs text-ink-400">{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{order.item_count}</td>
                    <td className="px-4 py-3 font-semibold">₹{order.total}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-ink-600">{order.payment_method}</span>
                      <span className={`ml-1.5 text-xs ${order.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                        ({order.payment_status})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[order.status] ?? "bg-ink-100 text-ink-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pageCount > 1 ? (
          <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3">
            <p className="text-sm text-ink-500">Page {page} of {pageCount}</p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link href={`/admin/orders?page=${page - 1}${status ? `&status=${status}` : ""}`} className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium hover:bg-ink-50">
                  Previous
                </Link>
              ) : null}
              {page < pageCount ? (
                <Link href={`/admin/orders?page=${page + 1}${status ? `&status=${status}` : ""}`} className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium hover:bg-ink-50">
                  Next
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}