import crypto from "node:crypto";
import { NextResponse } from "next/server";

/**
 * POST /api/checkout/verify-payment
 *
 * Verifies the Razorpay payment signature (HMAC SHA256). If valid, the
 * frontend proceeds to create the order in Supabase. If invalid, the payment
 * is fraudulent and the order should not be created.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // Generate expected signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    // Verify
    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.error("[Razorpay] Signature verification failed");
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    return NextResponse.json({
      verified: true,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
  } catch (error) {
    console.error("[Razorpay] Verify error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 },
    );
  }
}
