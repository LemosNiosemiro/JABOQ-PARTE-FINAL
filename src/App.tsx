import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AIAssistant } from "@/components/ai-assistant";
import { Skeleton } from "@/components/ui/skeleton";
import { LicenseGate } from "@/features/licensing/LicenseGate";

const LandingPage = lazy(() => import("@/pages/landing"));
const ExplorePage = lazy(() => import("@/pages/explore"));
const CategoriesPage = lazy(() => import("@/pages/categories"));
const CompanyDetailPage = lazy(() => import("@/pages/company-detail"));
const HowItWorksPage = lazy(() => import("@/pages/how-it-works"));
const PlansPage = lazy(() => import("@/pages/plans"));
const SignInPage = lazy(() => import("@/pages/sign-in"));
const SignUpPage = lazy(() => import("@/pages/sign-up"));
const ClientDashboard = lazy(() => import("@/pages/dashboard/client"));
const CompanyDashboard = lazy(() => import("@/pages/dashboard/company"));
const AdminDashboard = lazy(() => import("@/pages/dashboard/admin"));
const OrdersPage = lazy(() => import("@/pages/encomendas"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return (
    <div className="container py-12 space-y-4">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-6 w-full max-w-2xl" />
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-72 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/entrar" || location.pathname === "/registar";
  const isDashboard = location.pathname.startsWith("/painel") ||
    location.pathname.startsWith("/empresa") || location.pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && <Header />}
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/empresa/:slug" element={<CompanyDetailPage />} />
            <Route path="/como-funciona" element={<HowItWorksPage />} />
            <Route path="/planos" element={<PlansPage />} />
            <Route path="/entrar" element={<SignInPage />} />
            <Route path="/registar" element={<SignUpPage />} />
            <Route path="/encomendas" element={<OrdersPage />} />
            <Route path="/painel/*" element={<LicenseGate><ClientDashboard /></LicenseGate>} />
            <Route path="/empresa/*" element={<LicenseGate><CompanyDashboard /></LicenseGate>} />
            <Route
              path="/admin/*"
              element={
                <LicenseGate requireAdmin>
                  <AdminDashboard />
                </LicenseGate>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      {!isAuthPage && !isDashboard && <Footer />}
      <AIAssistant />
    </div>
  );
}
