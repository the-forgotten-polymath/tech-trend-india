// @ts-nocheck
"use client";

import { Loader2, MapPin, MessageCircle, Package, Send, Truck, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { updateOrderStatus, uploadTrackingSlip, addOrderNote } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "refunded"];
const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  packed: "bg-violet-100 text-violet-800",
  shipped: "bg-brand-100 text-brand-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-sale-100 text-sale-800",
  refunded: "bg-ink-100 text-ink-700",
};

export function OrderDetail({ order }: { order: any }) {
  const [status, setStatus] = useState(order.status);
  const [trackingId, setTrackingId] = useState(order.tracking_id || "");
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || "");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [message, setMessage] = useState("");
  const slipInputRef = useRef<HTMLInputElement>(null);

  const handleStatusUpdate = async () => {
    setSaving(true);
    setMessage("");
    const result = await updateOrderStatus(order.id, status, trackingId || undefined, trackingUrl || undefined);
    if (result.error) setMessage(`Error: ${result.error}`);
    else setMessage(`Status updated to "${status}"${status === "shipped" ? " — WhatsApp notification sent!" : ""}`);
    setSaving(false);
  };

  const handleSlipUpload = async (files: FileList | null) => {
    if (!files?.[0]) return;
    setUploadingSlip(true);
    const formData = new FormData();
    formData.set("file", files[0]);
    const result = await uploadTrackingSlip(order.id, formData);
    if (result.error) setMessage(`Upload error: ${result.error}`);
    else setMessage("Tracking slip uploaded");
    setUploadingSlip(false);
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    await addOrderNote(order.id, note.trim());
    setNote("");
    setMessage("Note added");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Status + Tracking */}
        <div className="rounded-xl border border-ink-100 bg-white p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
            <Package className="size-4 text-brand-700" />
            Order status
          </h2>

          {message && (
            <div className={cn("mb-4 rounded-lg px-3 py-2 text-sm font-medium",
              message.includes("Error") ? "bg-sale-50 text-sale-700" : "bg-emerald-50 text-emerald-700"
            )}>
              {message}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input capitalize"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Current status</label>
              <span className={cn("inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize", STATUS_COLORS[order.status] || "bg-ink-100")}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Tracking ID</label>
              <input
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g. DTDC12345678"
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Tracking URL</label>
              <input
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://track.delhivery.com/..."
                className="input"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleStatusUpdate}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:bg-brand-300"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Truck className="size-4" />}
              Update status
            </button>

            {status === "shipped" && (
              <p className="flex items-center gap-1.5 text-xs text-brand-700">
                <MessageCircle className="size-3.5" />
                WhatsApp notification will be sent automatically
              </p>
            )}
          </div>

          {/* Tracking slip upload */}
          <div className="mt-5 border-t border-ink-100 pt-4">
            <label className="mb-2 block text-sm font-medium text-ink-700">Tracking slip</label>
            {order.tracking_slip_url ? (
              <a href={order.tracking_slip_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-700 hover:underline">
                View uploaded slip →
              </a>
            ) : null}
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => slipInputRef.current?.click()}
                disabled={uploadingSlip}
                className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                {uploadingSlip ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {uploadingSlip ? "Uploading…" : "Upload slip"}
              </button>
              <input
                ref={slipInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => handleSlipUpload(e.target.files)}
              />
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="rounded-xl border border-ink-100 bg-white p-5">
          <h2 className="mb-4 text-base font-bold">Items ({order.item_count})</h2>
          <div className="divide-y divide-ink-50">
            {(order.order_items || []).map((item: any) => (
              <div key={item.id} className="flex gap-3 py-3">
                {item.product_image && (
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                    <Image src={item.product_image} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/products/${item.product_id}`} className="text-sm font-semibold text-ink-900 hover:text-brand-700">
                    {item.product_name}
                  </Link>
                  <p className="text-xs text-ink-500">
                    Qty: {item.quantity} · ₹{item.price} each
                    {item.options && Object.keys(item.options).length > 0 && (
                      <> · {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(", ")}</>
                    )}
                  </p>
                </div>
                <span className="text-sm font-bold">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin notes */}
        <div className="rounded-xl border border-ink-100 bg-white p-5">
          <h2 className="mb-4 text-base font-bold">Internal notes</h2>
          {order.admin_notes && (
            <pre className="mb-4 whitespace-pre-wrap rounded-lg bg-ink-50 p-3 text-xs text-ink-600">
              {order.admin_notes}
            </pre>
          )}
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note…"
              className="input flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
            />
            <button onClick={handleAddNote} className="rounded-lg bg-ink-900 px-3 py-2 text-white hover:bg-ink-800">
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="rounded-xl border border-ink-100 bg-white p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
            <MapPin className="size-4 text-brand-700" />
            Customer
          </h2>
          <dl className="space-y-2 text-sm">
            <dt className="font-semibold text-ink-900">{order.customer_name}</dt>
            <dd className="text-ink-600">{order.customer_email}</dd>
            <dd className="text-ink-600">{order.customer_phone}</dd>
            <dd className="mt-3 border-t border-ink-100 pt-3 text-ink-600">
              {order.address_line1}<br />
              {order.address_line2 && <>{order.address_line2}<br /></>}
              {order.address_city}, {order.address_state} {order.address_pincode}
            </dd>
          </dl>
        </div>

        <div className="rounded-xl border border-ink-100 bg-white p-5">
          <h2 className="mb-3 text-base font-bold">Payment</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Method</dt>
              <dd className="font-medium capitalize">{order.payment_method}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Status</dt>
              <dd className={cn("font-semibold", order.payment_status === "paid" ? "text-emerald-700" : "text-amber-700")}>
                {order.payment_status}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd>₹{order.subtotal}</dd>
            </div>
            {order.coupon_discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>Coupon ({order.coupon_code})</dt>
                <dd>-₹{order.coupon_discount}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink-500">Shipping</dt>
              <dd>{order.shipping_cost === 0 ? "Free" : `₹${order.shipping_cost}`}</dd>
            </div>
            {order.cod_fee > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-500">COD fee</dt>
                <dd>₹{order.cod_fee}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-ink-100 pt-2">
              <dt className="font-bold text-ink-900">Total</dt>
              <dd className="text-lg font-bold text-ink-900">₹{order.total}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-ink-100 bg-white p-5">
          <h2 className="mb-3 text-base font-bold">Extras</h2>
          <dl className="space-y-2 text-sm text-ink-600">
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd className="capitalize">{order.shipping_method}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Gift wrap</dt>
              <dd>{order.gift_wrap ? "Yes" : "No"}</dd>
            </div>
            {order.gift_note && (
              <div>
                <dt className="font-medium text-ink-900">Gift note</dt>
                <dd className="mt-1 italic">"{order.gift_note}"</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
