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
  AlertTriangle,
} from "lucide-react";

import {
  DashboardShell,
  type NavItem,
} from "@/components/layout/dashboard-shell";

import { useAuth } from "@/lib/auth";
import { useLicense } from "@/features/licensing/license-provider";
import { Link } from "react-router-dom";

import { AdminOverview } from "./admin/overview";
import { AdminCompanies } from "./admin/companies";
import { AdminUsers } from "./admin/users";
import { AdminCategories } from "./admin/categories";
import { AdminReports } from "./admin/reports";
import { LicenseAdminPage } from "./admin/license";
import { OperationalAdminPage } from "./admin/operational";
import { PermissionsAdminPage } from "./admin/permissions";
import { AdminTeam } from "./admin/team";

export default function AdminDashboard() {
  const { profile, loading } = useAuth();
  const license = useLicense();
  const licenseDays = Math.ceil((new Date(license.expiresAt).getTime() - Date.now()) / 86400000);
  const licenseNeedsAttention = licenseDays <= 30 || license.status === "blocked" || license.invoiceStatus !== "paid";

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
      {licenseNeedsAttention && (
        <div className={`mb-4 flex flex-col gap-3 rounded-xl border p-4 text-sm md:flex-row md:items-center md:justify-between ${licenseDays <= 0 || license.status === "blocked" ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"}`}>
          <div className="flex items-start gap-3"><AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${licenseDays <= 0 || license.status === "blocked" ? "text-destructive" : "text-warning"}`} /><div><p className="font-semibold">{licenseDays <= 0 || license.status === "blocked" ? "A licença do sistema está encerrada." : `A licença do sistema termina em ${licenseDays} dias.`}</p><p className="mt-1 text-muted-foreground">Confirme o pagamento com o programador para evitar a suspensão do acesso.</p></div></div>
          <Link to="/admin/licenca" className="shrink-0 font-semibold text-primary hover:underline">Ver estado da licença</Link>
        </div>
      )}
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
          path="equipa"
          element={<AdminTeam />}
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