import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSystemLicense } from "@/features/licensing/LicenseGate";
import { getInvoiceSummary } from "@/features/billing/billing-service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, CreditCard, ShieldCheck, TrendingUp, CalendarClock } from "lucide-react";

export function LicenseAdminPage() {
  const license = getSystemLicense();
  const invoices = getInvoiceSummary();
  const isExpired = new Date(license.expiresAt).getTime() < Date.now();
  const paidTotal = invoices.filter((invoice) => invoice.status === "paid").reduce((sum, item) => sum + item.amount, 0);
  const pendingTotal = invoices.filter((invoice) => invoice.status === "pending").reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Licença & Faturação</p>
          <h2 className="font-display text-3xl font-bold">Gestão da licença</h2>
        </div>
        <Badge variant={isExpired ? "destructive" : "success"}>
          {isExpired ? "Expirada" : "Ativa"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Plano</p>
              <p className="font-semibold uppercase">{license.plan}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Status da fatura</p>
              <p className="font-semibold capitalize">{license.invoiceStatus}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Utilizadores</p>
              <p className="font-semibold">{license.seats}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Validade</p>
              <p className="font-semibold">{isExpired ? "Expirou" : "Em dia"}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Empresa</p>
            <h3 className="mt-1 text-xl font-semibold">{license.companyName}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{license.fiscalName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Validade</p>
            <p className="mt-1 text-lg font-semibold">{formatDate(license.issuedAt)} → {formatDate(license.expiresAt)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {license.modules.map((module) => (
            <div key={module} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>{module}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">Faturação paga</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(paidTotal)}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(pendingTotal)}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 w-full">
            <p className="text-sm font-semibold text-warning">🔒 Renovação Segura</p>
            <p className="text-sm text-muted-foreground mt-1">
              A renovação de licença deve ser feita apenas pelo programador/administrador através do backend com chave secreta.
              Contacte o suporte para solicitar renovação.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Faturação</p>
            <h3 className="text-xl font-semibold">Histórico financeiro</h3>
          </div>
          <Badge variant="outline">{invoices.length} documentos</Badge>
        </div>

        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{invoice.number}</p>
                <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Emitido: {formatDate(invoice.issuedAt)}</p>
                <p>Vencimento: {formatDate(invoice.dueAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{formatCurrency(invoice.amount)}</span>
                <Badge
                  variant={
                    invoice.status === "paid"
                      ? "success"
                      : invoice.status === "pending"
                        ? "warning"
                        : "destructive"
                  }
                >
                  {invoice.status === "paid" ? "Paga" : invoice.status === "pending" ? "Pendente" : invoice.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
