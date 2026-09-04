import { Navigate } from "react-router-dom";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SystemLicense } from "@/lib/types";
import { useLicense } from "@/features/licensing/license-provider";

const defaultLicense: SystemLicense = {
  status: "trial",
  plan: "growth",
  companyName: "JABOQUE Festas",
  issuedAt: "2026-01-01T00:00:00.000Z",
  expiresAt: "2030-12-31T00:00:00.000Z",
  seats: 25,
  fiscalName: "JABOQUE Festas LTDA",
  invoiceStatus: "paid",
  modules: [
    "Clientes",
    "Empresas",
    "Eventos",
    "Financeiro",
    "Licença & Faturação",
    "Relatórios",
  ],
};

export function getSystemLicense(): SystemLicense {
  const raw = localStorage.getItem("jaboque_license");
  if (!raw) return defaultLicense;

  try {
    const parsed = JSON.parse(raw) as Partial<SystemLicense>;
    return { ...defaultLicense, ...parsed };
  } catch {
    return defaultLicense;
  }
}

export function LicenseGate({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const syncedLicense = useLicense();
  const license = syncedLicense as SystemLicense;
  const isExpired = new Date(license.expiresAt).getTime() < Date.now();
  const isBlocked = license.status === "expired" || license.status === "blocked" || isExpired;

  if (isBlocked) {
    return (
      <div className="container py-20">
        <Card className="mx-auto max-w-2xl border-destructive/40 bg-destructive/5 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4 text-destructive">
              <ShieldAlert className="h-10 w-10" />
            </div>
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-destructive">
            Licença bloqueada
          </p>
          <h2 className="font-display text-3xl font-bold">Acesso administrativo indisponível</h2>
          <p className="mt-4 text-muted-foreground">
            O sistema está indisponível porque a licença mensal da Jaboque expirou ou foi bloqueada. Contacte o programador para reativação.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline">
              <a href="/">Voltar ao início</a>
            </Button>
            <Button asChild>
              <a href="/">Voltar ao site</a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export function LicenseStatusBadge() {
  const license = getSystemLicense();
  const isExpired = new Date(license.expiresAt).getTime() < Date.now();
  const status = isExpired ? "Expirada" : license.status === "active" ? "Ativa" : "Trial";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
      {status}
      <span className="text-foreground">{license.plan}</span>
    </div>
  );
}
