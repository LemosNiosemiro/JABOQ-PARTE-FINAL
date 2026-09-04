import { Routes, Route, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  CalendarDays,
  Users2,
  ClipboardList,
  Truck,
  MessageSquare,
  CreditCard,
  SlidersHorizontal,
  ShieldCheck,
  Settings,
  FileSearch,
  TrendingUp,
  User,
  Loader2,
} from "lucide-react";

import {
  DashboardShell,
  type NavItem,
} from "@/components/layout/dashboard-shell";

import { useAuth } from "@/lib/auth";

import { AdminOverview } from "./admin/overview";
import { AdminCompanies } from "./admin/companies";
import { AdminUsers } from "./admin/users";
import { AdminCategories } from "./admin/categories";
import { AdminReports } from "./admin/reports";
import { LicenseAdminPage } from "./admin/license";
import { OperationalAdminPage } from "./admin/operational";
import { PermissionsAdminPage } from "./admin/permissions";

export default function AdminDashboard() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Navigate
        to="/entrar?redirect=/admin"
        replace
      />
    );
  }

  if (profile.role !== "admin") {
    return <Navigate to="/painel" replace />;
  }

  const navItems: NavItem[] = [
    {
      to: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/admin/eventos",
      label: "Eventos",
      icon: CalendarDays,
    },
    {
      to: "/admin/equipa",
      label: "Equipa",
      icon: Users2,
    },
    {
      to: "/admin/orcamentos",
      label: "Orçamentos",
      icon: ClipboardList,
    },
    {
      to: "/admin/operacional",
      label: "Operacional",
      icon: Building2,
    },
    {
      to: "/admin/logistica",
      label: "Logística",
      icon: Truck,
    },
    {
      to: "/admin/whatsapp",
      label: "WhatsApp",
      icon: MessageSquare,
    },
    {
      to: "/admin/pagamentos",
      label: "Pagamentos",
      icon: CreditCard,
    },
    {
      to: "/admin/licenca",
      label: "Licença & Faturação",
      icon: ShieldCheck,
    },
    {
      to: "/admin/relatorios",
      label: "Relatórios",
      icon: BarChart3,
    },
    {
      to: "/admin/financeiro",
      label: "Financeiro",
      icon: TrendingUp,
    },
    {
      to: "/admin/configuracoes",
      label: "Configurações",
      icon: Settings,
    },
    {
      to: "/admin/perfil",
      label: "Perfil",
      icon: User,
    },
    {
      to: "/admin/utilizadores",
      label: "Utilizadores",
      icon: Users,
    },
    {
      to: "/admin/permissoes",
      label: "Permissões",
      icon: ShieldCheck,
    },
    {
      to: "/admin/preferencias",
      label: "Preferências",
      icon: SlidersHorizontal,
    },
    {
      to: "/admin/auditoria",
      label: "Auditoria",
      icon: FileSearch,
    },
  ];

  return (
    <DashboardShell
      navItems={navItems}
      title="Painel Administrativo"
      role="Admin"
    >
      <Routes>
        <Route
          index
          element={<AdminOverview />}
        />

        <Route
          path="empresas"
          element={<AdminCompanies />}
        />

        <Route
          path="utilizadores"
          element={<AdminUsers />}
        />

        <Route
          path="categorias"
          element={<AdminCategories />}
        />

        <Route
          path="licenca"
          element={<LicenseAdminPage />}
        />

        <Route
          path="relatorios"
          element={<AdminReports />}
        />

        <Route
          path="operacional"
          element={<OperationalAdminPage />}
        />

        <Route
          path="permissoes"
          element={<PermissionsAdminPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/admin" replace />}
        />
      </Routes>
    </DashboardShell>
  );
}