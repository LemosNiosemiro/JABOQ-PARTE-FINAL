import { Routes, Route, Navigate } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Heart, MessageCircle, User, Settings,
  ShoppingBag, Clock,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth";
import { useClientBookings, useFavorites } from "@/lib/queries";
import { ClientOverview } from "./client/overview";
import { ClientEvents } from "./client/events";
import { ClientHistory } from "./client/history";
import { ClientFavorites } from "./client/favorites";
import { ClientBookings } from "./client/bookings";
import { ClientMessages } from "./client/messages";
import { ClientProfile } from "./client/profile";
import { ClientSettings } from "./client/settings";
import { Loader2 } from "lucide-react";

export default function ClientDashboard() {
  const { profile, loading } = useAuth();
  const { data: bookings } = useClientBookings();
  const { data: favorites } = useFavorites();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return <Navigate to="/entrar?redirect=/painel" replace />;
  if (profile.role === "company") return <Navigate to="/empresa" replace />;
  if (profile.role === "admin") return <Navigate to="/admin" replace />;

  const pendingBookings = bookings?.filter((b) => b.status === "pending").length ?? 0;

  const navItems: NavItem[] = [
    { to: "/painel", label: "Visão geral", icon: LayoutDashboard },
    { to: "/painel/eventos", label: "Meus eventos", icon: Calendar },
    { to: "/painel/historico", label: "Histórico", icon: Clock },
    { to: "/painel/pedidos", label: "Orçamentos", icon: ShoppingBag, badge: pendingBookings },
    { to: "/painel/favoritos", label: "Favoritos", icon: Heart, badge: favorites?.length },
    { to: "/painel/mensagens", label: "Mensagens", icon: MessageCircle },
    { to: "/painel/perfil", label: "Perfil", icon: User },
    { to: "/painel/configuracoes", label: "Configurações", icon: Settings },
  ];

  return (
    <DashboardShell navItems={navItems} title={profile.full_name} role="Cliente">
      <Routes>
        <Route index element={<ClientOverview />} />
        <Route path="eventos" element={<ClientEvents />} />
        <Route path="historico" element={<ClientHistory />} />
        <Route path="pedidos" element={<ClientBookings />} />
        <Route path="favoritos" element={<ClientFavorites />} />
        <Route path="mensagens" element={<ClientMessages />} />
        <Route path="perfil" element={<ClientProfile />} />
        <Route path="configuracoes" element={<ClientSettings />} />
        <Route path="*" element={<Navigate to="/painel" replace />} />
      </Routes>
    </DashboardShell>
  );
}
