import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type {
  Company,
  Category,
  Review,
  Favorite,
  Booking,
  Event,
  Service,
  Package,
  CompanyPhoto,
  Notification,
  Conversation,
  Message,
  Profile,
  Product,
  Coupon,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusHistory,
  AccountType,
} from "./types";
import { useAuth } from "./auth";

/* ---------- Categories ---------- */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Category[];
    },
  });
}

/* ---------- Companies ---------- */
export interface CompanyFilters {
  search?: string;
  category?: string;
  city?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: "rating" | "newest" | "price_asc" | "price_desc" | "featured";
  page?: number;
  limit?: number;
}

export function useCompanies(filters: CompanyFilters = {}) {
  return useQuery({
    queryKey: ["companies", filters],
    queryFn: async () => {
      const limit = filters.limit ?? 12;
      const page = filters.page ?? 1;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("companies")
        .select("*, category:categories(*)", { count: "exact" })
        .eq("is_active", true);

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.category) {
        query = query.eq("category_id", filters.category);
      }
      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }
      if (filters.province) {
        query = query.ilike("province", `%${filters.province}%`);
      }
      if (filters.minPrice != null) {
        query = query.gte("price_from", filters.minPrice);
      }
      if (filters.maxPrice != null) {
        query = query.lte("price_to", filters.maxPrice);
      }
      if (filters.minRating != null) {
        query = query.gte("rating", filters.minRating);
      }

      switch (filters.sort) {
        case "rating":
          query = query.order("rating", { ascending: false }).order("review_count", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "price_asc":
          query = query.order("price_from", { ascending: true, nullsFirst: false });
          break;
        case "price_desc":
          query = query.order("price_from", { ascending: false, nullsFirst: false });
          break;
        case "featured":
        default:
          query = query
            .order("is_sponsored", { ascending: false })
            .order("is_featured", { ascending: false })
            .order("rating", { ascending: false });
          break;
      }

      query = query.range(from, to);
      const { data, error, count } = await query;
      if (error) throw error;
      return {
        companies: (data as Company[]) ?? [],
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      };
    },
  });
}

export function useFeaturedCompanies(limit = 8) {
  return useQuery({
    queryKey: ["companies", "featured", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*, category:categories(*)")
        .eq("is_active", true)
        .or("is_featured.eq.true,is_sponsored.eq.true")
        .order("is_sponsored", { ascending: false })
        .order("rating", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as Company[];
    },
  });
}

export function useCompanyBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["company", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Slug required");
      const { data, error } = await supabase
        .from("companies")
        .select("*, category:categories(*), profiles:profiles!owner_id(*)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data as Company & { category: Category };
    },
    enabled: !!slug,
  });
}

export function useCompanyPhotos(companyId: string | undefined) {
  return useQuery({
    queryKey: ["company-photos", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("company_photos")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CompanyPhoto[];
    },
    enabled: !!companyId,
  });
}

export function useCompanyServices(companyId: string | undefined) {
  return useQuery({
    queryKey: ["company-services", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("price", { ascending: true });
      if (error) throw error;
      return data as Service[];
    },
    enabled: !!companyId,
  });
}

export function useCompanyPackages(companyId: string | undefined) {
  return useQuery({
    queryKey: ["company-packages", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("price", { ascending: true });
      if (error) throw error;
      return data as Package[];
    },
    enabled: !!companyId,
  });
}

export function useCompanyReviews(companyId: string | undefined) {
  return useQuery({
    queryKey: ["company-reviews", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select("*, profiles:profiles!client_id(*)")
        .eq("company_id", companyId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (Review & { profiles: { full_name: string; avatar_url: string | null } })[];
    },
    enabled: !!companyId,
  });
}

export function useCompanyByOwner(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["company-owner", ownerId],
    queryFn: async () => {
      if (!ownerId) return null;
      const { data, error } = await supabase
        .from("companies")
        .select("*, category:categories(*)")
        .eq("owner_id", ownerId)
        .maybeSingle();
      if (error) throw error;
      return data as Company & { category: Category };
    },
    enabled: !!ownerId,
  });
}

/* ---------- Favorites ---------- */
export function useFavorites() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["favorites", session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("*, company:companies(*, category:categories(*))")
        .eq("client_id", session.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (Favorite & { company: Company & { category: Category } })[];
    },
    enabled: !!session?.user,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("popularity", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useCoupon(code?: string) {
  return useQuery({
    queryKey: ["coupon", code],
    queryFn: async () => {
      if (!code) return null;
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase())
        .maybeSingle();
      if (error) throw error;
      return data as Coupon | null;
    },
    enabled: !!code,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      order: Omit<Order, "id" | "created_at" | "status" | "payment_status">;
      items: Array<
        Omit<OrderItem, "id" | "created_at" | "order_id"> & { product_id?: string | null }
      >;
    }) => {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          ...payload.order,
          status: "received",
          payment_status: payload.order.payment_method === "delivery" ? "pending" : "pending",
        })
        .select()
        .maybeSingle();
      if (orderError) throw orderError;
      if (!orderData) throw new Error("Não foi possível criar a encomenda.");

      const items = payload.items.map((item) => ({
        ...item,
        order_id: orderData.id,
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) {
        await supabase.from("orders").delete().eq("id", orderData.id);
        throw itemsError;
      }

      const { error: historyError } = await supabase.from("order_status_histories").insert({
        order_id: orderData.id,
        status: "received",
        note: "Pedido recebido e aguardando processamento.",
      });
      if (historyError) {
        console.warn("Falha ao registar histórico de encomenda", historyError.message);
      }

      return orderData as Order;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order-items"] });
    },
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("orderId is required");
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw error;
      return data as Order | null;
    },
    enabled: !!orderId,
  });
}

export function useOrderHistory(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order-history", orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase
        .from("order_status_histories")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as OrderStatusHistory[];
    },
    enabled: !!orderId,
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  const { session } = useAuth();
  return useMutation({
    mutationFn: async (companyId: string) => {
      if (!session?.user) throw new Error("Not authenticated");
      const { data: existing } = await supabase
        .from("favorites")
        .select("id")
        .eq("client_id", session.user.id)
        .eq("company_id", companyId)
        .maybeSingle();
      if (existing) {
        await supabase.from("favorites").delete().eq("id", existing.id);
        return { favorited: false };
      }
      await supabase.from("favorites").insert({ client_id: session.user.id, company_id: companyId });
      return { favorited: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useIsFavorited(companyId: string | undefined) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["is-favorited", session?.user?.id, companyId],
    queryFn: async () => {
      if (!session?.user || !companyId) return false;
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("client_id", session.user.id)
        .eq("company_id", companyId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!session?.user && !!companyId,
  });
}

/* ---------- Events ---------- */
export function useClientEvents() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["events", session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return [];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("client_id", session.user.id)
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!session?.user,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: Omit<Event, "id" | "created_at" | "status" | "client_id">) => {
      const { data, error } = await supabase
        .from("events")
        .insert({ ...event, status: "pending" })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

/* ---------- Bookings ---------- */
export function useClientBookings() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["bookings", "client", session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return [];
      const eventResponse = await supabase.from("events").select("id").eq("client_id", session.user.id);
      const eventIds = (eventResponse.data as Array<{ id: string }> | null)?.map((e) => e.id) ?? [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*, company:companies(*, category:categories(*)), event:events(*), service:services(*), package:packages(*)")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!session?.user,
  });
}

export function useCompanyBookings(companyId: string | undefined) {
  return useQuery({
    queryKey: ["bookings", "company", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*, company:companies(*), event:events(*), service:services(*), package:packages(*)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!companyId,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (booking: {
      event_id: string;
      company_id: string;
      service_id?: string | null;
      package_id?: string | null;
      event_date: string;
      price: number;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert({ ...booking, status: "pending", requested_date: new Date().toISOString() })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as Booking;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: Booking["status"] }) => {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as Booking;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

/* ---------- Reviews ---------- */
export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: {
      company_id: string;
      rating: number;
      comment: string;
    }) => {
      const { session } = useAuthSafe();
      if (!session?.user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("reviews")
        .insert({ ...review, client_id: session.user.id, is_published: true })
        .select()
        .maybeSingle();
      if (error) throw error;
      // Update company rating
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("company_id", review.company_id)
        .eq("is_published", true);
      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length;
        await supabase
          .from("companies")
          .update({ rating: Math.round(avg * 10) / 10, review_count: reviews.length })
          .eq("id", review.company_id);
      }
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["company-reviews", variables.company_id] });
      qc.invalidateQueries({ queryKey: ["company"] });
      qc.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

function useAuthSafe() {
  return useAuth();
}

/* ---------- Messages ---------- */
export function useConversations() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["conversations", session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*), company:companies(*)")
        .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const allMessages = data as (Message & {
        sender: { id: string; full_name: string; avatar_url: string | null };
        receiver: { id: string; full_name: string; avatar_url: string | null };
        company: Company | null;
      })[];
      const map = new Map<string, Conversation>();
      for (const msg of allMessages) {
        const otherId = msg.sender_id === session.user.id ? msg.receiver_id : msg.sender_id;
        const otherUser = msg.sender_id === session.user.id ? msg.receiver : msg.sender;
        if (!map.has(otherId)) {
          map.set(otherId, {
            otherUser: otherUser as any,
            company: msg.company ?? undefined,
            lastMessage: msg,
            unreadCount: 0,
          });
        }
        if (msg.receiver_id === session.user.id && !msg.is_read) {
          map.get(otherId)!.unreadCount++;
        }
      }
      return Array.from(map.values());
    },
    enabled: !!session?.user,
  });
}

export function useMessages(otherUserId: string | undefined) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["messages", session?.user?.id, otherUserId],
    queryFn: async () => {
      if (!session?.user || !otherUserId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${session.user.id})`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!session?.user && !!otherUserId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  const { session } = useAuth();
  return useMutation({
    mutationFn: async ({
      receiverId,
      content,
      companyId,
    }: {
      receiverId: string;
      content: string;
      companyId?: string;
    }) => {
      if (!session?.user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: session.user.id,
          receiver_id: receiverId,
          content,
          company_id: companyId ?? null,
          is_read: false,
        })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as Message;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/* ---------- Notifications ---------- */
export function useNotifications() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["notifications", session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!session?.user,
  });
}

/* ---------- Company management ---------- */
export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (company: Partial<Company> & { name: string; owner_id: string; slug?: string }) => {
      const { data, error } = await supabase
        .from("companies")
        .insert({
          ...company,
          slug: company.slug ?? company.name.toLowerCase().replace(/\s+/g, "-"),
          rating: 0,
          review_count: 0,
          is_active: true,
        })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as Company;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["company-owner"] });
    },
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Company> }) => {
      const { data, error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as Company;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["company"] });
      qc.invalidateQueries({ queryKey: ["company-owner"] });
    },
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (service: Omit<Service, "id" | "created_at">) => {
      const { data, error } = await supabase.from("services").insert(service).select().maybeSingle();
      if (error) throw error;
      return data as Service;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["company-services", variables.company_id] });
    },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (service: Service) => {
      const { error } = await supabase.from("services").delete().eq("id", service.id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["company-services", variables.company_id] });
    },
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pkg: Omit<Package, "id" | "created_at">) => {
      const { data, error } = await supabase.from("packages").insert(pkg).select().maybeSingle();
      if (error) throw error;
      return data as Package;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["company-packages", variables.company_id] });
    },
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pkg: Package) => {
      const { error } = await supabase.from("packages").delete().eq("id", pkg.id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["company-packages", variables.company_id] });
    },
  });
}

/* ---------- Admin ---------- */
export function useAdminCompanies() {
  return useQuery({
    queryKey: ["admin", "companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*, category:categories(*), profiles:profiles!owner_id(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (Company & { category: Category; profiles: { full_name: string; email: string } })[];
    },
  });
}

export function useAdminProfiles() {
  return useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useUpdateAdminProfileType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, account_type }: { id: string; account_type: AccountType }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ account_type })
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "profiles"] });
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [companies, profiles, bookings, reviews, categories] = await Promise.all([
        supabase.from("companies").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
      ]);
      return {
        totalCompanies: companies.count ?? 0,
        totalProfiles: profiles.count ?? 0,
        totalBookings: bookings.count ?? 0,
        totalReviews: reviews.count ?? 0,
        totalCategories: categories.count ?? 0,
      };
    },
  });
}
