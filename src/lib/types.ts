export type UserRole = "client" | "company" | "admin";

export type LicenseStatus = "active" | "trial" | "expired" | "blocked";
export type LicensePlan = "starter" | "growth" | "premium" | "enterprise";

export interface SystemLicense {
  status: LicenseStatus;
  plan: LicensePlan;
  companyName: string;
  issuedAt: string;
  expiresAt: string;
  seats: number;
  fiscalName: string;
  invoiceStatus: "pending" | "paid" | "overdue";
  modules: string[];
}

export type EventType =
  | "Casamentos"
  | "Aniversários"
  | "Batizados"
  | "Eventos Corporativos"
  | "Formaturas"
  | "Shows"
  | "Outros";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "refused";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  city: string | null;
  province: string | null;
  bio: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  owner_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  city: string | null;
  province: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price_from: number | null;
  price_to: number | null;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_sponsored: boolean;
  is_verified: boolean;
  is_active: boolean;
  opening_hours: Record<string, string> | null;
  created_at: string;
  category?: Category;
  profiles?: Profile;
}

export interface Service {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  is_active: boolean;
  created_at: string;
}

export interface Package {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  price: number;
  items: string[];
  is_active: boolean;
  created_at: string;
}

export interface CompanyPhoto {
  id: string;
  company_id: string;
  url: string;
  caption: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  client_id: string;
  title: string;
  event_type: EventType;
  event_date: string;
  city: string | null;
  province: string | null;
  guest_count: number;
  budget: number | null;
  description: string | null;
  status: BookingStatus;
  created_at: string;
}

export interface Booking {
  id: string;
  event_id: string;
  company_id: string;
  service_id: string | null;
  package_id: string | null;
  status: BookingStatus;
  requested_date: string;
  event_date: string;
  price: number;
  notes: string | null;
  created_at: string;
  company?: Company;
  event?: Event;
  service?: Service;
  package?: Package;
}

export interface Review {
  id: string;
  company_id: string;
  client_id: string;
  rating: number;
  comment: string;
  is_published: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface Favorite {
  id: string;
  client_id: string;
  company_id: string;
  created_at: string;
  company?: Company;
}

export type OrderStatus =
  | "received"
  | "confirmed"
  | "preparing"
  | "packed"
  | "delivering"
  | "delivered"
  | "cancelled";

export type PaymentMethod =
  | "delivery"
  | "banco"
  | "cartao"
  | "multicaixa"
  | "carteira";

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  prep_time: string | null;
  available_quantity: number;
  popularity: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_percent: number;
  min_order_value: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  client_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: string;
  coupon_id: string | null;
  coupon_code: string | null;
  delivery_fee: number;
  discount: number;
  tax: number;
  total: number;
  distance_meters: number | null;
  estimated_arrival: string | null;
  notes: string | null;
  event_date: string;
  event_time: string;
  province: string;
  municipality: string;
  district: string;
  street: string;
  number: string;
  reference: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  description: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  company_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  otherUser: Profile;
  company?: Company;
  lastMessage: Message;
  unreadCount: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  features: string[];
  is_featured: boolean;
  is_active: boolean;
}

export interface CompanyWithCategory extends Company {
  category: Category;
}

export interface SearchResult {
  companies: Company[];
  total: number;
}
