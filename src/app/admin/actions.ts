// @ts-nocheck
"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

// ============================================================================
// HELPER: get admin supabase client + verify admin role
// ============================================================================

async function getAdminClient() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") throw new Error("Not authorized");
  return supabase;
}

// ============================================================================
// PRODUCTS
// ============================================================================

export async function createProduct(formData: FormData) {
  const supabase = await getAdminClient();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const sku = (formData.get("sku") as string) || null;
  const type = (formData.get("type") as string) || "simple";
  const description = (formData.get("description") as string) || "";
  const shortDescription = (formData.get("short_description") as string) || "";
  const price = parseFloat(formData.get("price") as string) || 0;
  const regularPrice = parseFloat(formData.get("regular_price") as string) || price;
  const inStock = formData.get("in_stock") === "true";
  const isFeatured = formData.get("is_featured") === "true";
  const categoryId = formData.get("primary_category_id") as string;
  const categorySlugs = formData.getAll("category_slugs") as string[];

  const onSale = regularPrice > price && price > 0;
  const discountPercent = onSale ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      sku,
      type,
      description,
      short_description: shortDescription,
      price,
      regular_price: regularPrice,
      on_sale: onSale,
      discount_percent: discountPercent,
      in_stock: inStock,
      is_purchasable: true,
      is_featured: isFeatured,
      primary_category_id: categoryId ? parseInt(categoryId) : null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Link categories
  if (categorySlugs.length > 0) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id")
      .in("slug", categorySlugs);

    if (cats && cats.length > 0) {
      await supabase.from("product_categories").insert(
        cats.map((c) => ({ product_id: product.id, category_id: c.id }))
      );
    }
  }

  // Handle options
  const optionsJson = formData.get("options_json") as string;
  if (optionsJson) {
    const options = JSON.parse(optionsJson) as { name: string; slug: string; values: string[] }[];
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const { data: optRow } = await supabase
        .from("product_options")
        .insert({ product_id: product.id, name: opt.name, slug: opt.slug, sort_order: i })
        .select("id")
        .single();

      if (optRow) {
        await supabase.from("option_values").insert(
          opt.values.map((v, vi) => ({ option_id: optRow.id, value: v, sort_order: vi }))
        );
      }
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { error: null, productId: product.id };
}

export async function updateProduct(productId: number, formData: FormData) {
  const supabase = await getAdminClient();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const sku = (formData.get("sku") as string) || null;
  const type = (formData.get("type") as string) || "simple";
  const description = (formData.get("description") as string) || "";
  const shortDescription = (formData.get("short_description") as string) || "";
  const price = parseFloat(formData.get("price") as string) || 0;
  const regularPrice = parseFloat(formData.get("regular_price") as string) || price;
  const inStock = formData.get("in_stock") === "true";
  const isFeatured = formData.get("is_featured") === "true";
  const categoryId = formData.get("primary_category_id") as string;

  const onSale = regularPrice > price && price > 0;
  const discountPercent = onSale ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug,
      sku,
      type,
      description,
      short_description: shortDescription,
      price,
      regular_price: regularPrice,
      on_sale: onSale,
      discount_percent: discountPercent,
      in_stock: inStock,
      is_featured: isFeatured,
      primary_category_id: categoryId ? parseInt(categoryId) : null,
    })
    .eq("id", productId);

  if (error) return { error: error.message };

  // Update options
  const optionsJson = formData.get("options_json") as string;
  if (optionsJson !== null) {
    // Clear existing options
    await supabase.from("product_options").delete().eq("product_id", productId);
    const options = JSON.parse(optionsJson || "[]") as { name: string; slug: string; values: string[] }[];
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const { data: optRow } = await supabase
        .from("product_options")
        .insert({ product_id: productId, name: opt.name, slug: opt.slug, sort_order: i })
        .select("id")
        .single();

      if (optRow) {
        await supabase.from("option_values").insert(
          opt.values.map((v, vi) => ({ option_id: optRow.id, value: v, sort_order: vi }))
        );
      }
    }
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteProduct(productId: number) {
  const supabase = await getAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { error: null };
}

export async function bulkUpdateProducts(ids: number[], action: string, value?: string) {
  const supabase = await getAdminClient();
  let error = null;

  if (action === "mark_out_of_stock") {
    const { error: e } = await supabase.from("products").update({ in_stock: false }).in("id", ids);
    error = e?.message;
  } else if (action === "mark_in_stock") {
    const { error: e } = await supabase.from("products").update({ in_stock: true }).in("id", ids);
    error = e?.message;
  } else if (action === "delete") {
    const { error: e } = await supabase.from("products").delete().in("id", ids);
    error = e?.message;
  } else if (action === "change_category" && value) {
    const { error: e } = await supabase
      .from("products")
      .update({ primary_category_id: parseInt(value) })
      .in("id", ids);
    error = e?.message;
  } else if (action === "toggle_featured") {
    // Fetch current states and toggle
    const { data: products } = await supabase.from("products").select("id, is_featured").in("id", ids);
    if (products) {
      for (const p of products) {
        await supabase.from("products").update({ is_featured: !p.is_featured }).eq("id", p.id);
      }
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { error };
}

// ============================================================================
// PRODUCT IMAGES
// ============================================================================

export async function uploadProductImage(productId: number, formData: FormData) {
  const supabase = await getAdminClient();
  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpeg";
  const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);

  // Get current max sort_order
  const { data: existing } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { error: dbError } = await supabase.from("product_images").insert({
    product_id: productId,
    url: urlData.publicUrl,
    alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
    sort_order: nextOrder,
  });

  if (dbError) return { error: dbError.message };

  revalidatePath(`/admin/products/${productId}`);
  return { error: null, url: urlData.publicUrl };
}

export async function deleteProductImage(imageId: number, productId: number) {
  const supabase = await getAdminClient();

  // Get the URL to delete from storage
  const { data: img } = await supabase
    .from("product_images")
    .select("url")
    .eq("id", imageId)
    .single();

  if (img?.url?.includes("supabase.co/storage")) {
    const path = img.url.split("/product-images/")[1];
    if (path) await supabase.storage.from("product-images").remove([path]);
  }

  await supabase.from("product_images").delete().eq("id", imageId);
  revalidatePath(`/admin/products/${productId}`);
  return { error: null };
}

export async function reorderProductImages(productId: number, imageIds: number[]) {
  const supabase = await getAdminClient();
  for (let i = 0; i < imageIds.length; i++) {
    await supabase.from("product_images").update({ sort_order: i }).eq("id", imageIds[i]);
  }
  revalidatePath(`/admin/products/${productId}`);
  return { error: null };
}

// ============================================================================
// CATEGORIES
// ============================================================================

export async function updateCategory(categoryId: number, data: {
  name?: string;
  slug?: string;
  description?: string;
  parent_id?: number | null;
  is_active?: boolean;
  image_url?: string | null;
  sort_order?: number;
}) {
  const supabase = await getAdminClient();
  const { error } = await supabase.from("categories").update(data).eq("id", categoryId);
  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { error: null };
}

export async function createCategory(formData: FormData) {
  const supabase = await getAdminClient();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || "";
  const parentId = formData.get("parent_id") as string;

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    description,
    parent_id: parentId ? parseInt(parentId) : null,
    is_active: true,
    sort_order: 0,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteCategory(categoryId: number) {
  const supabase = await getAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { error: null };
}

// ============================================================================
// ORDERS
// ============================================================================

export async function updateOrderStatus(orderId: string, status: string, trackingId?: string, trackingUrl?: string) {
  const supabase = await getAdminClient();

  const updates: any = { status };
  if (trackingId) updates.tracking_id = trackingId;
  if (trackingUrl) updates.tracking_url = trackingUrl;

  const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
  if (error) return { error: error.message };

  // WhatsApp automation: send tracking message when shipped
  if (status === "shipped" && trackingId) {
    const { data: order } = await supabase
      .from("orders")
      .select("customer_phone, customer_name, id")
      .eq("id", orderId)
      .single();

    if (order) {
      await sendWhatsAppTracking(order.customer_phone, order.customer_name, orderId, trackingId, trackingUrl || "");
    }
  }

  // Send confirmation when order is confirmed
  if (status === "confirmed") {
    const { data: order } = await supabase
      .from("orders")
      .select("customer_phone, customer_name")
      .eq("id", orderId)
      .single();

    if (order) {
      await sendWhatsAppMessage(order.customer_phone, 
        `Hi ${order.customer_name}! ✅ Your order ${orderId} is confirmed and being prepared. We'll notify you once it ships.`
      );
    }
  }

  // Send delivery message
  if (status === "delivered") {
    const { data: order } = await supabase
      .from("orders")
      .select("customer_phone, customer_name")
      .eq("id", orderId)
      .single();

    if (order) {
      await sendWhatsAppMessage(order.customer_phone,
        `Hi ${order.customer_name}! 🎉 Your order ${orderId} has been delivered. Enjoy your purchase! If you have any issues, reply to this message.`
      );
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { error: null };
}

export async function uploadTrackingSlip(orderId: string, formData: FormData) {
  const supabase = await getAdminClient();
  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpeg";
  const fileName = `tracking-slips/${orderId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);

  await supabase.from("orders").update({ tracking_slip_url: urlData.publicUrl }).eq("id", orderId);
  revalidatePath(`/admin/orders/${orderId}`);
  return { error: null, url: urlData.publicUrl };
}

export async function addOrderNote(orderId: string, note: string) {
  const supabase = await getAdminClient();
  const { data: order } = await supabase.from("orders").select("admin_notes").eq("id", orderId).single();
  const existing = order?.admin_notes || "";
  const timestamp = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
  const updated = `${existing}\n[${timestamp}] ${note}`.trim();

  await supabase.from("orders").update({ admin_notes: updated }).eq("id", orderId);
  revalidatePath(`/admin/orders/${orderId}`);
  return { error: null };
}

// ============================================================================
// COUPONS
// ============================================================================

export async function createCoupon(formData: FormData) {
  const supabase = await getAdminClient();

  const { error } = await supabase.from("coupons").insert({
    code: (formData.get("code") as string).toUpperCase(),
    label: formData.get("label") as string,
    type: formData.get("type") as string,
    value: parseFloat(formData.get("value") as string) || 0,
    min_subtotal: parseFloat(formData.get("min_subtotal") as string) || 0,
    max_discount: parseFloat(formData.get("max_discount") as string) || 0,
    is_active: formData.get("is_active") === "true",
    usage_limit: formData.get("usage_limit") ? parseInt(formData.get("usage_limit") as string) : null,
    expires_at: formData.get("expires_at") || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/coupons");
  return { error: null };
}

export async function updateCoupon(couponId: number, formData: FormData) {
  const supabase = await getAdminClient();

  const { error } = await supabase.from("coupons").update({
    code: (formData.get("code") as string).toUpperCase(),
    label: formData.get("label") as string,
    type: formData.get("type") as string,
    value: parseFloat(formData.get("value") as string) || 0,
    min_subtotal: parseFloat(formData.get("min_subtotal") as string) || 0,
    max_discount: parseFloat(formData.get("max_discount") as string) || 0,
    is_active: formData.get("is_active") === "true",
    usage_limit: formData.get("usage_limit") ? parseInt(formData.get("usage_limit") as string) : null,
    expires_at: formData.get("expires_at") || null,
  }).eq("id", couponId);

  if (error) return { error: error.message };
  revalidatePath("/admin/coupons");
  return { error: null };
}

export async function deleteCoupon(couponId: number) {
  const supabase = await getAdminClient();
  const { error } = await supabase.from("coupons").delete().eq("id", couponId);
  if (error) return { error: error.message };
  revalidatePath("/admin/coupons");
  return { error: null };
}

export async function toggleCoupon(couponId: number, isActive: boolean) {
  const supabase = await getAdminClient();
  await supabase.from("coupons").update({ is_active: isActive }).eq("id", couponId);
  revalidatePath("/admin/coupons");
  return { error: null };
}

// ============================================================================
// SETTINGS
// ============================================================================

export async function updateSettings(entries: { key: string; value: any }[]) {
  const supabase = await getAdminClient();

  for (const entry of entries) {
    await supabase
      .from("store_settings")
      .upsert({ key: entry.key, value: entry.value }, { onConflict: "key" });
  }

  revalidatePath("/admin/settings");
  return { error: null };
}

// ============================================================================
// WHATSAPP HELPER
// ============================================================================

async function sendWhatsAppTracking(phone: string, name: string, orderId: string, trackingId: string, trackingUrl: string) {
  const message = `Hi ${name}! 🚚 Your order ${orderId} has been shipped!\n\nTracking ID: ${trackingId}${trackingUrl ? `\nTrack here: ${trackingUrl}` : ""}\n\nYou'll receive it soon. Reply if you need help!`;
  return sendWhatsAppMessage(phone, message);
}

async function sendWhatsAppMessage(phone: string, message: string) {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;

  if (!apiUrl || !apiKey) {
    console.log("[WhatsApp] Not configured. Message:", message.slice(0, 80));
    return;
  }

  // Clean phone number (remove +91, spaces, etc. and add country code)
  const cleanPhone = phone.replace(/\D/g, "").replace(/^0+/, "");
  const fullPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify({
        countryCode: "+91",
        phoneNumber: fullPhone,
        type: "Text",
        data: { message },
      }),
    });

    if (!response.ok) {
      console.error("[WhatsApp] Failed:", response.status, await response.text());
    } else {
      console.log("[WhatsApp] Sent to", fullPhone);
    }
  } catch (err) {
    console.error("[WhatsApp] Error:", (err as Error).message);
  }
}
