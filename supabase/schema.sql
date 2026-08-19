-- ============================================================================
-- TechTrendIndia — Supabase Database Schema
-- ============================================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query → paste → Run)
-- or via the Supabase CLI: supabase db push
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES (extends Supabase Auth users)
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. CATEGORIES
-- ============================================================================

CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  parent_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  image_alt TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);
CREATE INDEX idx_categories_active ON public.categories(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 3. PRODUCTS
-- ============================================================================

CREATE TABLE public.products (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sku TEXT,
  type TEXT NOT NULL DEFAULT 'simple' CHECK (type IN ('simple', 'variable')),
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  regular_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  on_sale BOOLEAN NOT NULL DEFAULT FALSE,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  stock_quantity INTEGER,
  is_purchasable BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- Denormalized primary category for fast queries
  primary_category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_sku ON public.products(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_products_primary_category ON public.products(primary_category_id);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_on_sale ON public.products(on_sale) WHERE on_sale = TRUE;
CREATE INDEX idx_products_in_stock ON public.products(in_stock);
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_created ON public.products(created_at DESC);
-- Full-text search index
CREATE INDEX idx_products_search ON public.products
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(sku, '') || ' ' || COALESCE(short_description, '')));

-- ============================================================================
-- 4. PRODUCT ↔ CATEGORY (many-to-many)
-- ============================================================================

CREATE TABLE public.product_categories (
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX idx_product_categories_category ON public.product_categories(category_id);

-- ============================================================================
-- 5. PRODUCT IMAGES
-- ============================================================================

CREATE TABLE public.product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON public.product_images(product_id, sort_order);

-- ============================================================================
-- 6. PRODUCT OPTIONS & VALUES (for variable products)
-- ============================================================================

CREATE TABLE public.product_options (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,       -- e.g. "Color", "Size"
  slug TEXT NOT NULL,       -- e.g. "color", "size"
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_options_product ON public.product_options(product_id);

CREATE TABLE public.option_values (
  id SERIAL PRIMARY KEY,
  option_id INTEGER NOT NULL REFERENCES public.product_options(id) ON DELETE CASCADE,
  value TEXT NOT NULL,      -- e.g. "Red", "Blue", "Large"
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_option_values_option ON public.option_values(option_id);

-- ============================================================================
-- 7. COUPONS
-- ============================================================================

CREATE TABLE public.coupons (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('percent', 'amount', 'shipping')),
  value NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 8. ORDERS
-- ============================================================================

CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TYPE payment_method AS ENUM ('upi', 'card', 'netbanking', 'wallet', 'cod');

CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,  -- e.g. "TT-260819-1234"
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending',

  -- Customer details (stored with order so it's immutable even if profile changes)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,

  -- Address
  address_line1 TEXT NOT NULL,
  address_line2 TEXT DEFAULT '',
  address_city TEXT NOT NULL,
  address_state TEXT NOT NULL,
  address_pincode TEXT NOT NULL,

  -- Totals
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  coupon_discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  cod_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_count INTEGER NOT NULL DEFAULT 0,

  -- Shipping
  shipping_method TEXT NOT NULL DEFAULT 'standard',
  tracking_id TEXT,
  tracking_url TEXT,
  tracking_slip_url TEXT,

  -- Payment
  payment_method payment_method NOT NULL DEFAULT 'upi',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),

  -- Extras
  gift_wrap BOOLEAN NOT NULL DEFAULT FALSE,
  gift_note TEXT DEFAULT '',
  admin_notes TEXT DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

-- ============================================================================
-- 9. ORDER ITEMS
-- ============================================================================

CREATE TABLE public.order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  product_image TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  regular_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  options JSONB DEFAULT '{}',  -- {"Color": "Red", "Size": "L"}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

-- ============================================================================
-- 10. STORE SETTINGS (key-value for admin-configurable values)
-- ============================================================================

CREATE TABLE public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings
INSERT INTO public.store_settings (key, value) VALUES
  ('store_name', '"TechTrendIndia"'),
  ('store_tagline', '"Cool toys, gadgets, gifts & more"'),
  ('store_email', '"hello@techtrendindia.com"'),
  ('store_phone', '"+91 90000 00000"'),
  ('store_whatsapp', '"+91 90000 00000"'),
  ('store_address', '"14 Anna Salai, Chennai, Tamil Nadu 600002"'),
  ('free_shipping_threshold', '999'),
  ('shipping_flat_rate', '79'),
  ('express_shipping_rate', '149'),
  ('cod_fee', '29'),
  ('return_window_days', '7'),
  ('hero_banners', '[]'),
  ('announcement_text', '"Free shipping on orders over ₹999"');

-- ============================================================================
-- 11. UPDATED_AT TRIGGER (auto-update timestamp on row changes)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- ---- PUBLIC READ (anonymous + authenticated users can browse) ----

CREATE POLICY "Public can read active categories"
  ON public.categories FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Public can read purchasable products"
  ON public.products FOR SELECT
  USING (TRUE);  -- Even out-of-stock products are visible (shown as "sold out")

CREATE POLICY "Public can read product categories"
  ON public.product_categories FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can read product images"
  ON public.product_images FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can read product options"
  ON public.product_options FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can read option values"
  ON public.option_values FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can read active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Public can read store settings"
  ON public.store_settings FOR SELECT
  USING (TRUE);

-- ---- USER OWN DATA ----

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can read own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (TRUE);  -- Validated by the API route, not RLS

-- ---- ADMIN FULL ACCESS ----
-- Admins are identified by profiles.role = 'admin'

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Admin can do everything on all tables
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to categories"
  ON public.categories FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to products"
  ON public.products FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to product_categories"
  ON public.product_categories FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to product_images"
  ON public.product_images FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to product_options"
  ON public.product_options FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to option_values"
  ON public.option_values FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to coupons"
  ON public.coupons FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to orders"
  ON public.orders FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to order_items"
  ON public.order_items FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to store_settings"
  ON public.store_settings FOR ALL USING (public.is_admin());

-- ---- SERVICE ROLE (used by API routes via SUPABASE_SERVICE_ROLE_KEY) ----
-- Service role bypasses RLS entirely, so no policies needed.
-- API routes that create orders for guest users use the service role.

-- ============================================================================
-- 13. STORAGE BUCKET (for product images uploaded via admin)
-- ============================================================================
-- Run this separately or via Dashboard → Storage → New bucket

-- Note: This SQL only works if you have the storage schema enabled.
-- If running manually, create the bucket from Dashboard → Storage instead.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  TRUE,
  5242880,  -- 5 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product images
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Only admins can upload/delete
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

-- ============================================================================
-- 14. HELPER VIEWS (used by the storefront for efficient queries)
-- ============================================================================

-- Products with their primary image (avoids N+1 in listings)
CREATE VIEW public.products_with_image AS
SELECT
  p.*,
  c.slug AS category_slug,
  c.name AS category_name,
  pi.url AS image_url,
  pi.alt AS image_alt
FROM public.products p
LEFT JOIN public.categories c ON c.id = p.primary_category_id
LEFT JOIN LATERAL (
  SELECT url, alt FROM public.product_images
  WHERE product_id = p.id
  ORDER BY sort_order ASC
  LIMIT 1
) pi ON TRUE;

-- Category with product count
CREATE VIEW public.categories_with_count AS
SELECT
  c.*,
  COALESCE(cnt.product_count, 0) AS product_count
FROM public.categories c
LEFT JOIN (
  SELECT category_id, COUNT(*) AS product_count
  FROM public.product_categories
  GROUP BY category_id
) cnt ON cnt.category_id = c.id;

-- ============================================================================
-- Done! After running this, create your admin user:
--
-- 1. Sign up via Supabase Auth (Dashboard → Authentication → Users → Add user)
-- 2. Then run:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ============================================================================
