// @ts-nocheck
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderDetail } from "@/components/admin/order-detail";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Order detail" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/orders" className="flex size-9 items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Order {order.id}</h1>
          <p className="text-sm text-ink-500">
            Placed {new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      </div>
      <OrderDetail order={order} />
    </div>
  );
}
