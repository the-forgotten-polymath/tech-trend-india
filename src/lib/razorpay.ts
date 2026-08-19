/**
 * Razorpay client-side helpers.
 *
 * The Razorpay checkout script is loaded dynamically when a customer clicks
 * "Pay now". This avoids loading it on every page.
 */

export type RazorpayPaymentResult = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

/**
 * Load the Razorpay checkout script if not already loaded.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as unknown as { Razorpay: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Create a Razorpay order via our API route, then open the checkout popup.
 * Returns the payment result if successful, null if cancelled/failed.
 */
export async function initiatePayment(options: {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description?: string;
  orderId?: string;
}): Promise<RazorpayPaymentResult | null> {
  // 1. Create Razorpay order on our server
  const response = await fetch("/api/checkout/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: options.amount,
      currency: "INR",
      receipt: options.orderId || `rcpt_${Date.now()}`,
      notes: {
        customer_name: options.customerName,
        customer_email: options.customerEmail,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create payment order");
  }

  const { orderId: razorpayOrderId } = await response.json();

  // 2. Load Razorpay script
  const loaded = await loadRazorpayScript();
  if (!loaded) throw new Error("Failed to load payment gateway");

  // 3. Open the checkout popup
  return new Promise((resolve) => {
    const rzp = new (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(options.amount * 100),
      currency: "INR",
      name: "TechTrendIndia",
      description: options.description || "Order payment",
      order_id: razorpayOrderId,
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      theme: {
        color: "#1f7a47", // brand-600
      },
      handler: (response: RazorpayPaymentResult) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => resolve(null),
      },
    });
    rzp.open();
  });
}

/**
 * Verify a payment with our backend.
 */
export async function verifyPayment(payment: RazorpayPaymentResult): Promise<boolean> {
  const response = await fetch("/api/checkout/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payment),
  });

  if (!response.ok) return false;
  const data = await response.json();
  return data.verified === true;
}
