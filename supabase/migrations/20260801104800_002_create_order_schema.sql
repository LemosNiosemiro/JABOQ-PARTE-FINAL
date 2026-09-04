-- ============================================================
-- JABOQUE Orders Backend Schema
-- ============================================================

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price integer NOT NULL DEFAULT 0,
  prep_time text,
  available_quantity integer NOT NULL DEFAULT 0,
  popularity integer NOT NULL DEFAULT 0,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read"
  ON products FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "products_admin_manage" ON products;
CREATE POLICY "products_admin_manage"
  ON products FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_percent integer NOT NULL DEFAULT 0,
  min_order_value integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupons_public_read" ON coupons;
CREATE POLICY "coupons_public_read"
  ON coupons FOR SELECT TO anon, authenticated
  USING (active = true AND (expires_at IS NULL OR expires_at > now()));

DROP POLICY IF EXISTS "coupons_admin_manage" ON coupons;
CREATE POLICY "coupons_admin_manage"
  ON coupons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'confirmed', 'preparing', 'packed', 'delivering', 'delivered', 'cancelled')),
  payment_method text NOT NULL CHECK (payment_method IN ('delivery', 'banco', 'cartao', 'multicaixa', 'carteira')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  coupon_id uuid REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_code text,
  delivery_fee integer NOT NULL DEFAULT 0,
  discount integer NOT NULL DEFAULT 0,
  tax integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  distance_meters integer,
  estimated_arrival text,
  notes text,
  event_date date NOT NULL,
  event_time text NOT NULL,
  province text NOT NULL,
  municipality text NOT NULL,
  district text NOT NULL,
  street text NOT NULL,
  number text NOT NULL,
  reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_client_read" ON orders;
CREATE POLICY "orders_client_read"
  ON orders FOR SELECT TO authenticated
  USING (client_id = auth.uid());

DROP POLICY IF EXISTS "orders_admin_read" ON orders;
CREATE POLICY "orders_admin_read"
  ON orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "orders_public_insert" ON orders;
CREATE POLICY "orders_public_insert"
  ON orders FOR INSERT TO anon, authenticated
  WITH CHECK (client_id = auth.uid() OR client_id IS NULL);

DROP POLICY IF EXISTS "orders_client_update" ON orders;
CREATE POLICY "orders_client_update"
  ON orders FOR UPDATE TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_admin_update"
  ON orders FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  unit_price integer NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  subtotal integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_client_read" ON order_items;
CREATE POLICY "order_items_client_read"
  ON order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.client_id = auth.uid()));

DROP POLICY IF EXISTS "order_items_admin_read" ON order_items;
CREATE POLICY "order_items_admin_read"
  ON order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "order_items_client_insert" ON order_items;
CREATE POLICY "order_items_client_insert"
  ON order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.client_id = auth.uid()));

DROP POLICY IF EXISTS "order_items_admin_insert" ON order_items;
CREATE POLICY "order_items_admin_insert"
  ON order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================================
-- ORDER STATUS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS order_status_histories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('received', 'confirmed', 'preparing', 'packed', 'delivering', 'delivered', 'cancelled')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE order_status_histories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_status_histories_client_read" ON order_status_histories;
CREATE POLICY "order_status_histories_client_read"
  ON order_status_histories FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_histories.order_id AND orders.client_id = auth.uid()));

DROP POLICY IF EXISTS "order_status_histories_admin_read" ON order_status_histories;
CREATE POLICY "order_status_histories_admin_read"
  ON order_status_histories FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_histories_order ON order_status_histories(order_id);
