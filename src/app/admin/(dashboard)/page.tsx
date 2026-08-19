// @ts-nocheck
import { ArrowUpRight, Box, DollarSign, Package, ShoppingBag, TrendingUp } from "lucide-react";
import Link from "next/link";

import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase();

  const [productsRes, ordersRes, categoriesRes, couponsRes] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("coupons").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);

  // Revenue stats
  const { data: allOrders } = await supabase
    .from("orders")
    .select("total, status, created_at")
    .in("status", ["confirmed", "packed", "shipped", "delivered"]);

  const totalRevenue = (allOrders || []).reduce((sum, o) => sum + Number(o.total), 0);
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayOrders = (allOrders || []).filter((o) => new Date(o.created_at) >= todayStart);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);

  // Top products by orders
  const { data: topItems } = await supabase
    .from("order_items")
    .select("product_name, product_slug, quantity")
    .order("quantity", { ascending: false })
    .limit(5);

  // Recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, customer_name, total, status, payment_method, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  // Pending count
  const { count: pendingCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const stats = [
    { label: "Products", value: productsRes.count ?? 0, icon: Box, href: "/admin/products", color: "bg-brand-50 text-brand-700" },
    { label: "Total orders", value: ordersRes.count ?? 0, icon: Package, href: "/admin/orders", color: "bg-amber-50 text-amber-700" },
    { label: "Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: DollarSign, href: "/admin/orders", color: "bg-emerald-50 text-emerald-700" },
    { label: "Today", value: `₹${todayRevenue.toLocaleString("en-IN")}`, sub: `${todayOrders.length} orders`, icon: TrendingUp, href: "/admin/orders", color: "bg-violet-50 text-violet-700" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">
            {pendingCount > 0 ? `${pendingCount} orders need attention · ` : ""}
            Welcome back.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-800">
            <Box className="size-3.5" /> Add product
          </Link>
          <Link href="/admin/orders?status=pending" className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100">
            <Package className="size-3.5" /> Pending ({pendingCount ?? 0})
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group flex items-center gap-4 rounded-xl border border-ink-100 bg-white p-5 transition hover:border-brand-200 hover:shadow-card">
            <span className={`flex size-11 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-ink-900">{stat.value}</p>
              <p className="text-sm text-ink-500">{stat.label}</p>
              {stat.sub && <p className="text-xs text-ink-400">{stat.sub}</p>}
            </div>
            <ArrowUpRight className="ml-auto size-4 text-ink-300 group-hover:text-brand-700" />
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="rounded-xl border border-ink-100 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-brand-700 hover:text-brand-800">View all →</Link>
          </div>
          {!recentOrders || recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-xs font-semibold text-ink-400 uppercase">
                    <th className="pb-2 pr-4">Order</th>
                    <th className="pb-2 pr-4">Customer</th>
                    <th className="pb-2 pr-4">Total</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-ink-50">
                      <td className="py-2.5 pr-4"><Link href={`/admin/orders/${order.id}`} className="font-semibold text-brand-700 hover:underline">{order.id}</Link></td>
                      <td className="py-2.5 pr-4 text-ink-700">{order.customer_name}</td>
                      <td className="py-2.5 pr-4 font-medium">₹{order.total}</td>
                      <td className="py-2.5 pr-4"><span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold capitalize">{order.status}</span></td>
                      <td className="py-2.5 text-ink-500">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="rounded-xl border border-ink-100 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold text-ink-900">Top products</h2>
          {!topItems || topItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">No sales yet</p>
          ) : (
            <ul className="space-y-3">
              {topItems.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{item.product_name}</p>
                    <p className="text-xs text-ink-400">/{item.product_slug}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                    {item.quantity} sold
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <QuickAction title="Add a product" description="Upload images, set pricing and publish" href="/admin/products/new" icon={Box} />
        <QuickAction title="Manage orders" description="Update status and upload tracking" href="/admin/orders" icon={Package} />
        <QuickAction title="Create a coupon" description="Percentage, flat or free shipping" href="/admin/coupons" icon={DollarSign} />
      </div>
    </div>
  );
}

function QuickAction({ title, description, href, icon: Icon }) {
  return (
    <Link href={href} className="group flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-4 transition hover:border-brand-200 hover:shadow-card">
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-900 group-hover:text-brand-700">{title}</p>
        <p className="mt-0.5 text-xs text-ink-500">{description}</p>
      </div>
    </Link>
  );
}
