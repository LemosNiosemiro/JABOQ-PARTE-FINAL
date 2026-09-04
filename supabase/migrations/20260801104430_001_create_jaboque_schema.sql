/*
# JABOQUE Platform — Core Schema

## Overview
Creates the complete database schema for the JABOQUE event-services marketplace.
The platform connects clients planning events (weddings, birthdays, corporate events)
with service-providing companies (decorators, DJs, photographers, caterers, etc.).

## New Tables
1. `profiles` — Extends auth.users with role, contact info, and location.
2. `categories` — Marketplace categories (Decoração, Buffet, DJ, Fotografia, etc.).
3. `companies` — Company/provider listings owned by users with role 'company'.
4. `services` — Individual services offered by a company with pricing.
5. `packages` — Bundled service packages offered by a company.
6. `company_photos` — Photo gallery images for a company.
7. `events` — Client events (a planned party/celebration with date and budget).
8. `bookings` — A request from a client to a company for a specific event/service.
9. `reviews` — Client ratings and comments on companies.
10. `favorites` — Client's saved/favorited companies.
11. `messages` — Direct messages between users (client <-> company).
12. `notifications` — User notification feed.
13. `plans` — Subscription plans for companies (Free, Premium, Pro).
14. `subscriptions` — Company's active plan subscription.

## Security
- RLS enabled on ALL tables.
- `profiles`: owner-scoped read/update; public read for basic info.
- `companies`, `services`, `packages`, `company_photos`, `reviews`, `categories`, `plans`: publicly readable.
- `companies`: owner can insert/update their own; admin can manage all.
- `services`, `packages`, `company_photos`: owner of the parent company can manage.
- `events`: client owns their events.
- `bookings`: client sees bookings for their events; company sees bookings for their company.
- `favorites`: owner-scoped.
- `messages`: participants can read; sender can insert.
- `notifications`: owner-scoped.
- All owner columns default to auth.uid() so inserts succeed without explicitly passing the owner.
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT 'Novo Usuário',
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'company', 'admin')),
  city text,
  province text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_owner_insert" ON profiles;
CREATE POLICY "profiles_owner_insert"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_owner_update" ON profiles;
CREATE POLICY "profiles_owner_update"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL DEFAULT 'Sparkles',
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read"
  ON categories FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "categories_admin_manage" ON categories;
CREATE POLICY "categories_admin_manage"
  ON categories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  cover_url text,
  phone text,
  whatsapp text,
  email text,
  website text,
  instagram text,
  facebook text,
  city text,
  province text,
  address text,
  latitude double precision,
  longitude double precision,
  price_from integer,
  price_to integer,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_sponsored boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  opening_hours jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "companies_public_read" ON companies;
CREATE POLICY "companies_public_read"
  ON companies FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "companies_owner_read" ON companies;
CREATE POLICY "companies_owner_read"
  ON companies FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "companies_owner_insert" ON companies;
CREATE POLICY "companies_owner_insert"
  ON companies FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "companies_owner_update" ON companies;
CREATE POLICY "companies_owner_update"
  ON companies FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "companies_admin_update" ON companies;
CREATE POLICY "companies_admin_update"
  ON companies FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price integer NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'serviço',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_public_read" ON services;
CREATE POLICY "services_public_read"
  ON services FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "services_owner_insert" ON services;
CREATE POLICY "services_owner_insert"
  ON services FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM companies WHERE companies.id = services.company_id AND companies.owner_id = auth.uid()));

DROP POLICY IF EXISTS "services_owner_update" ON services;
CREATE POLICY "services_owner_update"
  ON services FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = services.company_id AND companies.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM companies WHERE companies.id = services.company_id AND companies.owner_id = auth.uid()));

DROP POLICY IF EXISTS "services_owner_delete" ON services;
CREATE POLICY "services_owner_delete"
  ON services FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = services.company_id AND companies.owner_id = auth.uid()));

-- ============================================================
-- PACKAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price integer NOT NULL DEFAULT 0,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "packages_public_read" ON packages;
CREATE POLICY "packages_public_read"
  ON packages FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "packages_owner_insert" ON packages;
CREATE POLICY "packages_owner_insert"
  ON packages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM companies WHERE companies.id = packages.company_id AND companies.owner_id = auth.uid()));

DROP POLICY IF EXISTS "packages_owner_update" ON packages;
CREATE POLICY "packages_owner_update"
  ON packages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = packages.company_id AND companies.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM companies WHERE companies.id = packages.company_id AND companies.owner_id = auth.uid()));

DROP POLICY IF EXISTS "packages_owner_delete" ON packages;
CREATE POLICY "packages_owner_delete"
  ON packages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = packages.company_id AND companies.owner_id = auth.uid()));

-- ============================================================
-- COMPANY PHOTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS company_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE company_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "photos_public_read" ON company_photos;
CREATE POLICY "photos_public_read"
  ON company_photos FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "photos_owner_insert" ON company_photos;
CREATE POLICY "photos_owner_insert"
  ON company_photos FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM companies WHERE companies.id = company_photos.company_id AND companies.owner_id = auth.uid()));

DROP POLICY IF EXISTS "photos_owner_delete" ON company_photos;
CREATE POLICY "photos_owner_delete"
  ON company_photos FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = company_photos.company_id AND companies.owner_id = auth.uid()));

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  event_type text NOT NULL DEFAULT 'Outros',
  event_date date NOT NULL,
  city text,
  province text,
  guest_count integer NOT NULL DEFAULT 0,
  budget integer,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'refused')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_owner_read" ON events;
CREATE POLICY "events_owner_read"
  ON events FOR SELECT TO authenticated
  USING (client_id = auth.uid());

DROP POLICY IF EXISTS "events_owner_insert" ON events;
CREATE POLICY "events_owner_insert"
  ON events FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "events_owner_update" ON events;
CREATE POLICY "events_owner_update"
  ON events FOR UPDATE TO authenticated
  USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "events_owner_delete" ON events;
CREATE POLICY "events_owner_delete"
  ON events FOR DELETE TO authenticated
  USING (client_id = auth.uid());

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  package_id uuid REFERENCES packages(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'refused')),
  requested_date timestamptz NOT NULL DEFAULT now(),
  event_date date NOT NULL,
  price integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_client_read" ON bookings;
CREATE POLICY "bookings_client_read"
  ON bookings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = bookings.event_id AND events.client_id = auth.uid()));

DROP POLICY IF EXISTS "bookings_company_read" ON bookings;
CREATE POLICY "bookings_company_read"
  ON bookings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = bookings.company_id AND companies.owner_id = auth.uid()));

DROP POLICY IF EXISTS "bookings_client_insert" ON bookings;
CREATE POLICY "bookings_client_insert"
  ON bookings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = bookings.event_id AND events.client_id = auth.uid()));

DROP POLICY IF EXISTS "bookings_company_update" ON bookings;
CREATE POLICY "bookings_company_update"
  ON bookings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = bookings.company_id AND companies.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM companies WHERE companies.id = bookings.company_id AND companies.owner_id = auth.uid()));

DROP POLICY IF EXISTS "bookings_client_update" ON bookings;
CREATE POLICY "bookings_client_update"
  ON bookings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = bookings.event_id AND events.client_id = auth.uid()));

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read"
  ON reviews FOR SELECT TO anon, authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS "reviews_owner_insert" ON reviews;
CREATE POLICY "reviews_owner_insert"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "reviews_owner_update" ON reviews;
CREATE POLICY "reviews_owner_update"
  ON reviews FOR UPDATE TO authenticated
  USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "reviews_owner_delete" ON reviews;
CREATE POLICY "reviews_owner_delete"
  ON reviews FOR DELETE TO authenticated
  USING (client_id = auth.uid());

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, company_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_owner_read" ON favorites;
CREATE POLICY "favorites_owner_read"
  ON favorites FOR SELECT TO authenticated
  USING (client_id = auth.uid());

DROP POLICY IF EXISTS "favorites_owner_insert" ON favorites;
CREATE POLICY "favorites_owner_insert"
  ON favorites FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "favorites_owner_delete" ON favorites;
CREATE POLICY "favorites_owner_delete"
  ON favorites FOR DELETE TO authenticated
  USING (client_id = auth.uid());

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_participant_read" ON messages;
CREATE POLICY "messages_participant_read"
  ON messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "messages_sender_insert" ON messages;
CREATE POLICY "messages_sender_insert"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "messages_participant_update" ON messages;
CREATE POLICY "messages_participant_update"
  ON messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL DEFAULT 'general',
  is_read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_owner_read" ON notifications;
CREATE POLICY "notifications_owner_read"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_owner_update" ON notifications;
CREATE POLICY "notifications_owner_update"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_owner_insert" ON notifications;
CREATE POLICY "notifications_owner_insert"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_owner_delete" ON notifications;
CREATE POLICY "notifications_owner_delete"
  ON notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price integer NOT NULL DEFAULT 0,
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plans_public_read" ON plans;
CREATE POLICY "plans_public_read"
  ON plans FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "plans_admin_manage" ON plans;
CREATE POLICY "plans_admin_manage"
  ON plans FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_owner_read" ON subscriptions;
CREATE POLICY "subscriptions_owner_read"
  ON subscriptions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = subscriptions.company_id AND companies.owner_id = auth.uid()));

DROP POLICY IF EXISTS "subscriptions_owner_insert" ON subscriptions;
CREATE POLICY "subscriptions_owner_insert"
  ON subscriptions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM companies WHERE companies.id = subscriptions.company_id AND companies.owner_id = auth.uid()));

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_companies_category ON companies(category_id);
CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_featured ON companies(is_featured);
CREATE INDEX IF NOT EXISTS idx_services_company ON services(company_id);
CREATE INDEX IF NOT EXISTS idx_packages_company ON packages(company_id);
CREATE INDEX IF NOT EXISTS idx_company_photos_company ON company_photos(company_id);
CREATE INDEX IF NOT EXISTS idx_events_client ON events(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_company ON bookings(company_id);
CREATE INDEX IF NOT EXISTS idx_reviews_company ON reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_favorites_client ON favorites(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
