/**
 * Database type definitions for Supabase.
 *
 * In production you'd generate these with:
 *   npx supabase gen types typescript --project-id YOUR_ID > src/lib/supabase/types.ts
 *
 * This hand-written version covers the schema we designed. Replace it with the
 * generated version once the Supabase project is live.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string;
          role: "customer" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          phone?: string;
          role?: "customer" | "admin";
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      categories: {
        Row: {
          id: number;
          slug: string;
          name: string;
          description: string;
          parent_id: number | null;
          image_url: string | null;
          image_alt: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          name: string;
          description?: string;
          parent_id?: number | null;
          image_url?: string | null;
          image_alt?: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      products: {
        Row: {
          id: number;
          slug: string;
          name: string;
          sku: string | null;
          type: "simple" | "variable";
          description: string;
          short_description: string;
          price: number;
          regular_price: number;
          on_sale: boolean;
          discount_percent: number;
          in_stock: boolean;
          stock_quantity: number | null;
          is_purchasable: boolean;
          is_featured: boolean;
          sort_order: number;
          primary_category_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          name: string;
          sku?: string | null;
          type?: "simple" | "variable";
          description?: string;
          short_description?: string;
          price?: number;
          regular_price?: number;
          on_sale?: boolean;
          discount_percent?: number;
          in_stock?: boolean;
          stock_quantity?: number | null;
          is_purchasable?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          primary_category_id?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      product_categories: {
        Row: {
          product_id: number;
          category_id: number;
        };
        Insert: {
          product_id: number;
          category_id: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_categories"]["Insert"]>;
      };
      product_images: {
        Row: {
          id: number;
          product_id: number;
          url: string;
          alt: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          product_id: number;
          url: string;
          alt?: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
      };
      product_options: {
        Row: {
          id: number;
          product_id: number;
          name: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          product_id: number;
          name: string;
          slug: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_options"]["Insert"]>;
      };
      option_values: {
        Row: {
          id: number;
          option_id: number;
          value: string;
          sort_order: number;
        };
        Insert: {
          option_id: number;
          value: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["option_values"]["Insert"]>;
      };
      coupons: {
        Row: {
          id: number;
          code: string;
          label: string;
          type: "percent" | "amount" | "shipping";
          value: number;
          min_subtotal: number;
          max_discount: number;
          usage_limit: number | null;
          used_count: number;
          is_active: boolean;
          starts_at: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          code: string;
          label?: string;
          type: "percent" | "amount" | "shipping";
          value?: number;
          min_subtotal?: number;
          max_discount?: number;
          usage_limit?: number | null;
          is_active?: boolean;
          starts_at?: string | null;
          expires_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["coupons"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          status: "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled" | "refunded";
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          address_line1: string;
          address_line2: string;
          address_city: string;
          address_state: string;
          address_pincode: string;
          subtotal: number;
          discount_amount: number;
          coupon_code: string | null;
          coupon_discount: number;
          shipping_cost: number;
          cod_fee: number;
          total: number;
          item_count: number;
          shipping_method: string;
          tracking_id: string | null;
          tracking_url: string | null;
          tracking_slip_url: string | null;
          payment_method: "upi" | "card" | "netbanking" | "wallet" | "cod";
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          payment_status: "pending" | "paid" | "failed" | "refunded";
          gift_wrap: boolean;
          gift_note: string;
          admin_notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id?: string | null;
          status?: "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled" | "refunded";
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          address_line1: string;
          address_line2?: string;
          address_city: string;
          address_state: string;
          address_pincode: string;
          subtotal: number;
          discount_amount?: number;
          coupon_code?: string | null;
          coupon_discount?: number;
          shipping_cost?: number;
          cod_fee?: number;
          total: number;
          item_count: number;
          shipping_method?: string;
          payment_method: "upi" | "card" | "netbanking" | "wallet" | "cod";
          gift_wrap?: boolean;
          gift_note?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]> & {
          tracking_id?: string | null;
          tracking_url?: string | null;
          tracking_slip_url?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          payment_status?: "pending" | "paid" | "failed" | "refunded";
          admin_notes?: string;
        };
      };
      order_items: {
        Row: {
          id: number;
          order_id: string;
          product_id: number;
          product_name: string;
          product_slug: string;
          product_image: string;
          price: number;
          regular_price: number;
          quantity: number;
          options: Record<string, string>;
          created_at: string;
        };
        Insert: {
          order_id: string;
          product_id: number;
          product_name: string;
          product_slug: string;
          product_image?: string;
          price: number;
          regular_price: number;
          quantity: number;
          options?: Record<string, string>;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      store_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
        };
        Update: {
          value?: Json;
        };
      };
    };
    Views: {
      products_with_image: {
        Row: Database["public"]["Tables"]["products"]["Row"] & {
          category_slug: string | null;
          category_name: string | null;
          image_url: string | null;
          image_alt: string | null;
        };
      };
      categories_with_count: {
        Row: Database["public"]["Tables"]["categories"]["Row"] & {
          product_count: number;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      order_status: "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled" | "refunded";
      payment_method: "upi" | "card" | "netbanking" | "wallet" | "cod";
    };
  };
}
