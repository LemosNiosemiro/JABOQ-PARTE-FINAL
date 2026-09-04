import { Routes, Route, Navigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Wrench, Package, ShoppingBag,
  Star, Settings,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth";
import { useCompanyByOwner, useCompanyBookings } from "@/lib/queries";
import { CompanyOverview } from "./company/overview";
import { CompanyProfile } from "./company/profile";
import { CompanyServices } from "./company/services";
import { CompanyPackages } from "./company/packages";
import { CompanyBookings } from "./company/bookings";
import { CompanyReviews } from "./company/reviews";
import { CompanySettings } from "./company/settings";
import { CompanyRegister } from "./company/register";
import { Loader2 } from "lucide-react";

export default function CompanyDashboard() {
  const { profile, loading } = useAuth();
  const { data: company, isLoading: companyLoading } = useCompanyByOwner(profile?.id);
  const { data: bookings } = useCompanyBookings(company?.id);

  if (loading || companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return <Navigate to="/entrar?redirect=/empresa" replace />;
  if (profile.role === "client") return <Navigate to="/painel" replace />;
  if (profile.role === "admin") return <Navigate to="/admin" replace />;

  if (!company) {
    return <CompanyRegister />;
  }

  const pendingBookings = bookings?.filter((b) => b.status === "pending").length ?? 0;

  const navItems: NavItem[] = [
    { to: "/empresa", label: "Visão geral", icon: LayoutDashboard },
    { to: "/empresa/perfil", label: "Perfil da empresa", icon: Building2 },
    { to: "/empresa/servicos", label: "Serviços", icon: Wrench },
    { to: "/empresa/pacotes", label: "Pacotes", icon: Package },
    { to: "/empresa/pedidos", label: "Reservas", icon: ShoppingBag, badge: pendingBookings },
    { to: "/empresa/avaliacoes", label: "Avaliações", icon: Star },
    { to: "/empresa/configuracoes", label: "Configurações", icon: Settings },
  ];

  return (
    <DashboardShell navItems={navItems} title={company.name} role="Empresa">
      <Routes>
        <Route index element={<CompanyOverview />} />
        <Route path="perfil" element={<CompanyProfile />} />
        <Route path="servicos" element={<CompanyServices />} />
        <Route path="pacotes" element={<CompanyPackages />} />
        <Route path="pedidos" element={<CompanyBookings />} />
        <Route path="avaliacoes" element={<CompanyReviews />} />
        <Route path="configuracoes" element={<CompanySettings />} />
        <Route path="*" element={<Navigate to="/empresa" replace />} />
      </Routes>
    </DashboardShell>
  );
}
