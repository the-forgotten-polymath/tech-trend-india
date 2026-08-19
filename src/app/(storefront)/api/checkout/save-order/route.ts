// @ts-nocheck
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/checkout/save-order
 *
 * Called after Razorpay payment is verified. Persists the order and its items
 * to Supabase so the admin panel can see and manage it.
 */
export async function POST(request: Request) {
  try {
    const order = await request.json();

    const supabase = createServiceClient();

    // Insert the order
    const { error: orderError } = await supabase.from("orders").insert({
      id: order.id,
      status: "confirmed",
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: order.customer.phone,
      address_line1: order.address.line1,
      address_line2: order.address.line2 || "",
      address_city: order.address.city,
      address_state: order.address.state,
      address_pincode: order.address.pincode,
      subtotal: order.totals.subtotal,
      discount_amount: order.totals.productSavings || 0,
      coupon_code: order.couponCode || null,
      coupon_discount: order.totals.couponDiscount || 0,
      shipping_cost: 0, // Quoted separately
      cod_fee: 0,
      total: order.totals.total,
      item_count: order.totals.itemCount,
      shipping_method: "quoted",
      payment_method: order.payment || "upi",
      payment_status: "paid",
      razorpay_order_id: order.razorpay?.orderId || null,
      razorpay_payment_id: order.razorpay?.paymentId || null,
      razorpay_signature: order.razorpay?.signature || null,
      gift_wrap: order.giftWrap || false,
      gift_note: order.giftNote || "",
    });

    if (orderError) {
      console.error("[save-order] Order insert error:", orderError.message);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Insert order items
    const items = (order.lines || []).map((line: {
      productId: number;
      name: string;
      slug: string;
      image: string;
      price: number;
      regularPrice: number;
      quantity: number;
      options: Record<string, string>;
    }) => ({
      order_id: order.id,
      product_id: line.productId,
      product_name: line.name,
      product_slug: line.slug,
      product_image: line.image,
      price: line.price,
      regular_price: line.regularPrice,
      quantity: line.quantity,
      options: line.options || {},
    }));

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) {
        console.error("[save-order] Items insert error:", itemsError.message);
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("[save-order] Error:", error);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}
