// @ts-nocheck
"use client";

import {
  CreditCard,
  Gift,
  Lock,
  Loader2,
  Smartphone,
  Wallet,
  Globe,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingBag } from "lucide-react";
import { calculateTotals, findCoupon } from "@/lib/cart-math";
import { formatPrice } from "@/lib/format";
import { createOrderId, saveOrder } from "@/lib/orders";
import { initiatePayment, verifyPayment } from "@/lib/razorpay";
import { cn } from "@/lib/utils";

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

type Fields = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  giftNote: string;
};

const EMPTY_FIELDS: Fields = {
  name: "", email: "", phone: "", line1: "", line2: "",
  city: "", state: "", pincode: "", giftNote: "",
};

export function CheckoutView() {
  const router = useRouter();
  const { lines, couponCode, clearCart, hydrated } = useCart();

  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [giftWrap, setGiftWrap] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const totals = useMemo(
    () => calculateTotals(lines, { coupon: findCoupon(couponCode) ?? null }),
    [lines, couponCode],
  );

  const set = (key: keyof Fields) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFields((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (fields.name.trim().length < 2) next.name = "Enter the full name for delivery.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim()))
      next.email = "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(fields.phone.replace(/\D/g, "")))
      next.phone = "Enter a 10-digit Indian mobile number.";
    if (fields.line1.trim().length < 5) next.line1 = "Enter the house/flat and street.";
    if (fields.city.trim().length < 2) next.city = "Enter your city.";
    if (!fields.state) next.state = "Select your state.";
    if (!/^\d{6}$/.test(fields.pincode.trim())) next.pincode = "Enter a 6-digit PIN code.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const firstKey = Object.keys(next)[0];
      document.getElementById(`field-${firstKey}`)?.focus();
      return false;
    }
    return true;
  };

  const placeOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setPaymentError("");
    if (!validate() || lines.length === 0) return;
    setSubmitting(true);

    try {
      // 1. Initiate Razorpay payment
      const paymentResult = await initiatePayment({
        amount: totals.total,
        customerName: fields.name.trim(),
        customerEmail: fields.email.trim(),
        customerPhone: fields.phone.replace(/\D/g, ""),
        description: `TechTrendIndia Order (${totals.itemCount} items)`,
      });

      // User closed the popup
      if (!paymentResult) {
        setSubmitting(false);
        setPaymentError("Payment was cancelled. Try again when ready.");
        return;
      }

      // 2. Verify payment signature on our server
      const verified = await verifyPayment(paymentResult);
      if (!verified) {
        setSubmitting(false);
        setPaymentError("Payment verification failed. Your money is safe — contact us if you were charged.");
        return;
      }

      // 3. Create order locally (and in Supabase via server action if connected)
      const orderId = createOrderId();
      const order = {
        id: orderId,
        createdAt: new Date().toISOString(),
        lines,
        totals,
        customer: {
          name: fields.name.trim(),
          email: fields.email.trim(),
          phone: fields.phone.replace(/\D/g, ""),
        },
        address: {
          line1: fields.line1.trim(),
          line2: fields.line2.trim(),
          city: fields.city.trim(),
          state: fields.state,
          pincode: fields.pincode.trim(),
        },
        shippingNote: "Quoted separately",
        payment,
        couponCode: couponCode ?? null,
        giftWrap,
        giftNote: giftWrap ? fields.giftNote.trim() : "",
        razorpay: {
          orderId: paymentResult.razorpay_order_id,
          paymentId: paymentResult.razorpay_payment_id,
          signature: paymentResult.razorpay_signature,
        },
      };

      // Save to localStorage (and Supabase in production via the API)
      saveOrder(order);

      // Save to Supabase
      try {
        await fetch("/api/checkout/save-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });
      } catch {
        // Non-critical — order is saved locally regardless
      }

      // 4. Clear cart and redirect
      clearCart();
      router.push(`/order/${orderId}`);
    } catch (err) {
      setSubmitting(false);
      setPaymentError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  if (!hydrated) {
    return <div className="h-96 animate-pulse rounded-2xl bg-white" />;
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="There's nothing to check out yet"
        description="Add a product to your bag and this page will walk you through delivery and payment."
        action={
          <Link href="/shop" className={buttonClasses("primary", "md")}>
            Start shopping
          </Link>
        }
      />
    );
  }

  return (
    <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-10" noValidate>
      <div className="space-y-6">
        {paymentError && (
          <div className="rounded-lg bg-sale-50 px-4 py-3 text-sm font-medium text-sale-700">
            {paymentError}
          </div>
        )}

        <Card step={1} title="Contact details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="field-name" label="Full name" value={fields.name} onChange={set("name")} error={errors.name} autoComplete="name" className="sm:col-span-2" />
            <Field id="field-email" label="Email" type="email" value={fields.email} onChange={set("email")} error={errors.email} autoComplete="email" hint="Order updates sent here." />
            <Field id="field-phone" label="Mobile number" type="tel" value={fields.phone} onChange={set("phone")} error={errors.phone} autoComplete="tel" hint="For delivery calls only." />
          </div>
        </Card>

        <Card step={2} title="Delivery address">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="field-line1" label="Flat / house no., building, street" value={fields.line1} onChange={set("line1")} error={errors.line1} autoComplete="address-line1" className="sm:col-span-2" />
            <Field id="field-line2" label="Area, landmark (optional)" value={fields.line2} onChange={set("line2")} autoComplete="address-line2" className="sm:col-span-2" />
            <Field id="field-city" label="City" value={fields.city} onChange={set("city")} error={errors.city} autoComplete="address-level2" />
            <div>
              <label htmlFor="field-state" className="mb-1.5 block text-sm font-medium text-ink-700">State</label>
              <select id="field-state" value={fields.state} onChange={set("state")} autoComplete="address-level1" className={cn("input", errors.state && "border-sale-400")}>
                <option value="">Select a state</option>
                {STATES.map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
              {errors.state && <p className="mt-1 text-xs text-sale-700">{errors.state}</p>}
            </div>
            <Field id="field-pincode" label="PIN code" value={fields.pincode} onChange={set("pincode")} error={errors.pincode} autoComplete="postal-code" inputMode="numeric" />
          </div>
        </Card>

        <Card step={3} title="Extras">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-100 bg-ink-50/50 p-4">
            <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="mt-0.5 size-4 accent-brand-600" />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                <Gift className="size-4 text-brand-600" aria-hidden />
                Add free gift wrap
              </span>
              <span className="mt-0.5 block text-xs text-ink-500">Kraft paper, ribbon and a handwritten note.</span>
            </span>
          </label>
          {giftWrap && (
            <div className="mt-3">
              <label htmlFor="field-giftNote" className="mb-1.5 block text-sm font-medium text-ink-700">Gift note (optional)</label>
              <textarea id="field-giftNote" value={fields.giftNote} onChange={set("giftNote")} rows={3} maxLength={200} placeholder="Happy birthday! Hope this makes your day." className="input" />
              <p className="mt-1 text-xs text-ink-400">{fields.giftNote.length}/200</p>
            </div>
          )}

          <div className="mt-4 rounded-xl bg-brand-50 p-4">
            <p className="flex items-start gap-2 text-sm text-brand-800">
              <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                <strong className="font-semibold">Shipping will be quoted separately.</strong> After payment, we'll confirm the shipping cost based on your PIN code and contact you before dispatch.
              </span>
            </p>
          </div>
        </Card>

        <Card step={4} title="Payment method">
          <p className="mb-3 text-sm text-ink-500">Select your preferred method. You'll pay via Razorpay's secure checkout.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <PaymentOption active={payment === "upi"} onSelect={() => setPayment("upi")} icon={Smartphone} title="UPI" subtitle="GPay, PhonePe, Paytm" />
            <PaymentOption active={payment === "card"} onSelect={() => setPayment("card")} icon={CreditCard} title="Card" subtitle="Credit or debit" />
            <PaymentOption active={payment === "netbanking"} onSelect={() => setPayment("netbanking")} icon={Globe} title="Net Banking" subtitle="All major banks" />
            <PaymentOption active={payment === "wallet"} onSelect={() => setPayment("wallet")} icon={Wallet} title="Wallet" subtitle="Paytm, Mobikwik, etc." />
          </div>

          <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-ink-50 p-4 text-xs text-ink-600">
            <Lock className="mt-0.5 size-4 shrink-0 text-ink-500" aria-hidden />
            <span>
              Payment is processed securely by <strong>Razorpay</strong>. Your card/UPI details are never stored on our servers. All transactions are protected by bank-grade encryption.
            </span>
          </p>
        </Card>
      </div>

      {/* Order summary sidebar */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="text-lg font-bold">Order summary</h2>

          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-3">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                  <Image src={line.image} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-sm font-medium text-ink-900">{line.name}</span>
                  <span className="text-xs text-ink-500">
                    Qty {line.quantity}
                    {Object.entries(line.options).length > 0 ? ` · ${Object.values(line.options).join(", ")}` : ""}
                  </span>
                </span>
                <span className="text-sm font-semibold">{formatPrice(line.price * line.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 border-t border-ink-100 pt-4 text-sm">
            <SummaryRow label="Subtotal" value={formatPrice(totals.subtotal)} />
            {totals.couponDiscount > 0 && (
              <SummaryRow label={`Coupon ${couponCode}`} value={`−${formatPrice(totals.couponDiscount)}`} positive />
            )}
            {totals.productSavings > 0 && (
              <SummaryRow label="Product discounts" value={`−${formatPrice(totals.productSavings)}`} positive />
            )}
            <SummaryRow label="Shipping" value="Quoted after payment" />
            <div className="flex items-baseline justify-between border-t border-ink-100 pt-3">
              <dt className="text-base font-bold">Amount to pay</dt>
              <dd className="text-xl font-bold">{formatPrice(totals.total)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={submitting}
            className={buttonClasses("primary", "lg", "mt-5 w-full")}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Lock className="size-4" aria-hidden />
            )}
            {submitting ? "Processing payment…" : `Pay ${formatPrice(totals.total)}`}
          </button>

          <p className="mt-3 text-center text-xs text-ink-400">
            By paying you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2">terms</Link> and{" "}
            <Link href="/privacy" className="underline underline-offset-2">privacy policy</Link>.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Card({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold">
        <span className="flex size-7 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">{step}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ id, label, value, onChange, error, hint, type = "text", autoComplete, inputMode, className }: {
  id: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; hint?: string; type?: string; autoComplete?: string; inputMode?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>
      <input id={id} type={type} value={value} onChange={onChange} autoComplete={autoComplete} inputMode={inputMode as any}
        aria-invalid={Boolean(error)} className={cn("input", error && "border-sale-400")} />
      {error ? <p className="mt-1 text-xs text-sale-700">{error}</p> : hint ? <p className="mt-1 text-xs text-ink-400">{hint}</p> : null}
    </div>
  );
}

function PaymentOption({ active, onSelect, icon: Icon, title, subtitle }: {
  active: boolean; onSelect: () => void; icon: typeof Smartphone; title: string; subtitle: string;
}) {
  return (
    <label className={cn(
      "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition",
      active ? "border-brand-700 bg-brand-50 ring-1 ring-brand-700" : "border-ink-200 hover:border-ink-300",
    )}>
      <input type="radio" name="payment" checked={active} onChange={onSelect} className="sr-only" />
      <Icon className={cn("size-5", active ? "text-brand-700" : "text-ink-400")} aria-hidden />
      <span>
        <span className="block text-sm font-semibold text-ink-900">{title}</span>
        <span className="block text-xs text-ink-500">{subtitle}</span>
      </span>
    </label>
  );
}

function SummaryRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={cn("text-ink-500", positive && "text-emerald-700")}>{label}</dt>
      <dd className={cn("font-semibold text-ink-900", positive && "text-emerald-700")}>{value}</dd>
    </div>
  );
}
