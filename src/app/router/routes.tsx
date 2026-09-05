import type { ReactNode } from "react";
import type { RouteObject } from "react-router-dom";

export type AppRoute = RouteObject & {
  meta?: {
    public?: boolean;
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
    requiresCompany?: boolean;
  };
};

const publicRoutes: AppRoute[] = [
  { path: "/", element: null, meta: { public: true } },
  { path: "/explore", element: null, meta: { public: true } },
  { path: "/galeria", element: null, meta: { public: true } },
  { path: "/empresa/:slug", element: null, meta: { public: true } },
  { path: "/entrar", element: null, meta: { public: true } },
  { path: "/registar", element: null, meta: { public: true } },
  { path: "/planos", element: null, meta: { public: true } },
  { path: "/programador", element: null, meta: { public: true } },
];

const clientRoutes: AppRoute[] = [
  { path: "/painel", element: null, meta: { requiresAuth: true } },
  { path: "/painel/eventos", element: null, meta: { requiresAuth: true } },
  { path: "/painel/pedidos", element: null, meta: { requiresAuth: true } },
];

const companyRoutes: AppRoute[] = [
  { path: "/empresa", element: null, meta: { requiresAuth: true, requiresCompany: true } },
  { path: "/empresa/perfil", element: null, meta: { requiresAuth: true, requiresCompany: true } },
  { path: "/empresa/reservas", element: null, meta: { requiresAuth: true, requiresCompany: true } },
];

const adminRoutes: AppRoute[] = [
  { path: "/admin", element: null, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: "/admin/licenca", element: null, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: "/admin/relatorios", element: null, meta: { requiresAuth: true, requiresAdmin: true } },
];

export const appRoutes: AppRoute[] = [...publicRoutes, ...clientRoutes, ...companyRoutes, ...adminRoutes];

export function RouterGuard({ children, route }: { children: ReactNode; route?: AppRoute }) {
  if (!route) return <>{children}</>;

  if (route.meta?.public) return <>{children}</>;

  return <>{children}</>;
}
