import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, KeyRound, LockKeyhole, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import type { LicenseSnapshot } from "@/core/types";

interface CompanyLicense {
  companyId: string;
  companyName: string;
  status: LicenseSnapshot["status"];
  plan: LicenseSnapshot["plan"];
  issuedAt: string;
  expiresAt: string;
  invoiceStatus: LicenseSnapshot["invoiceStatus"];
  isExpired?: boolean;
  isBlocked?: boolean;
}

interface LicensePayload {
  platformLicense: LicenseSnapshot & { isExpired?: boolean; isBlocked?: boolean };
  licenses: CompanyLicense[];
}

const API_URL = import.meta.env.VITE_API_URL || "/api";

function daysUntil(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function statusLabel(status: LicenseSnapshot["status"], isExpired: boolean) {
  if (isExpired || status === "expired") return "Expirada";
  if (status === "blocked") return "Bloqueada";
  if (status === "trial") return "Trial";
  return "Ativa";
}

export default function ProgrammerPage() {
  const [key, setKey] = useState(() => sessionStorage.getItem("jaboque_programmer_key") ?? "");
  const [draftKey, setDraftKey] = useState(key);
  const [data, setData] = useState<LicensePayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<LicenseSnapshot["plan"]>("growth");
  const [days, setDays] = useState("365");
  const [actionId, setActionId] = useState("");

  const loadLicenses = async (accessKey = key) => {
    if (!accessKey) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/programmer/licenses`, { headers: { Authorization: `Bearer ${accessKey}` } });
      if (!response.ok) throw new Error(response.status === 401 ? "Chave do programador inválida." : "Não foi possível carregar as licenças.");
      const payload = await response.json() as { licenses: LicensePayload };
      setData(payload.licenses);
      sessionStorage.setItem("jaboque_programmer_key", accessKey);
      setKey(accessKey);
    } catch (requestError) {
      setError(requestError instanceof Error && requestError.message === "Failed to fetch"
        ? "Não foi possível ligar ao backend. Confirme se o servidor está ativo e se VITE_API_URL está correto."
        : requestError instanceof Error ? requestError.message : "Falha de ligação ao servidor.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (key) void loadLicenses(key);
    // A chave fica apenas na sessão do navegador para não ser persistida no código ou em localStorage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const platformDays = useMemo(() => data ? daysUntil(data.platformLicense.expiresAt) : null, [data]);

  const request = async (url: string, options?: RequestInit) => {
    setActionId(url);
    setError("");
    try {
      const response = await fetch(`${API_URL}${url.replace(/^\/api/, "")}`, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, ...(options?.headers ?? {}) } });
      if (!response.ok) throw new Error("A operação não foi autorizada ou falhou.");
      await loadLicenses(key);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha de ligação ao servidor.");
    } finally {
      setActionId("");
    }
  };

  const renewPlatform = () => request("/api/programmer/license/renew", { method: "POST", body: JSON.stringify({ plan, days: Number(days) }) });

  if (!data) {
    return (
      <div className="container py-16">
        <Card className="mx-auto max-w-lg p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><KeyRound className="h-6 w-6" /></div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Área reservada</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Perfil do programador</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Use a chave definida no backend para consultar e renovar as licenças JABOQUE. Ela nunca é gravada no projeto.</p>
          <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); void loadLicenses(draftKey); }}>
            <div className="space-y-2"><Label htmlFor="programmer-key">Chave do programador</Label><Input id="programmer-key" type="password" value={draftKey} onChange={(event) => setDraftKey(event.target.value)} placeholder="PROGRAMMER_KEY" required /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}><LockKeyhole className="h-4 w-4" />{loading ? "A validar..." : "Entrar no controle de licenças"}</Button>
          </form>
        </Card>
      </div>
    );
  }

  const platform = data.platformLicense;
  const platformExpired = platformDays !== null && platformDays <= 0;
  const platformStatus = statusLabel(platform.status, platformExpired);

  return (
    <div className="container space-y-8 py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-wider text-primary">Controle privado</p><h1 className="mt-1 font-display text-3xl font-bold">Licenças JABOQUE</h1><p className="mt-2 text-muted-foreground">Acompanhe pagamentos, validade e acesso ao sistema.</p></div>
        <Button variant="outline" onClick={() => void loadLicenses()} disabled={loading}><RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Atualizar</Button>
      </div>
      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}

      <Card className="overflow-hidden border-primary/30">
        <div className="flex flex-col gap-5 border-b border-border bg-primary/5 p-6 md:flex-row md:items-start md:justify-between">
          <div><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><h2 className="font-display text-xl font-bold">Licença da plataforma</h2></div><p className="mt-2 text-sm text-muted-foreground">{platform.companyName} · {platform.fiscalName}</p></div>
          <Badge variant={platformExpired || platform.status === "blocked" ? "destructive" : platform.invoiceStatus === "paid" ? "success" : "warning"}>{platformStatus} · {platform.invoiceStatus === "paid" ? "Paga" : platform.invoiceStatus}</Badge>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Plano</p><p className="mt-1 font-semibold uppercase">{platform.plan}</p></div><div><p className="text-xs text-muted-foreground">Expira em</p><p className="mt-1 font-semibold">{formatDate(platform.expiresAt)}</p></div><div><p className="text-xs text-muted-foreground">Tempo restante</p><p className={`mt-1 font-semibold ${platformDays !== null && platformDays <= 30 ? "text-warning" : "text-success"}`}>{platformDays !== null && platformDays > 0 ? `${platformDays} dias` : "Encerrada"}</p></div></div>
        <div className="flex flex-col gap-3 border-t border-border p-6 md:flex-row md:items-end"><div className="space-y-2"><Label>Plano da renovação</Label><Select value={plan} onValueChange={(value) => setPlan(value as LicenseSnapshot["plan"])}><SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="starter">Starter</SelectItem><SelectItem value="growth">Growth</SelectItem><SelectItem value="premium">Premium</SelectItem><SelectItem value="enterprise">Enterprise</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="license-days">Dias</Label><Input id="license-days" type="number" min="1" max="3660" value={days} onChange={(event) => setDays(event.target.value)} className="w-full md:w-28" /></div><Button onClick={renewPlatform} disabled={!!actionId}><CheckCircle2 className="h-4 w-4" /> Confirmar renovação paga</Button></div>
      </Card>

      <div><div className="mb-4 flex items-center justify-between"><div><h2 className="font-display text-2xl font-bold">Licenças institucionais</h2><p className="mt-1 text-sm text-muted-foreground">Empresas e clientes com acesso contratado.</p></div><Badge variant="outline">{data.licenses.length} registos</Badge></div><div className="grid gap-4 lg:grid-cols-2">{data.licenses.map((license) => { const remaining = daysUntil(license.expiresAt); const expired = remaining <= 0 || license.isExpired; return <Card key={license.companyId} className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{license.companyName}</h3><p className="mt-1 text-xs text-muted-foreground">Plano {license.plan} · {license.invoiceStatus === "paid" ? "Pagamento confirmado" : `Pagamento ${license.invoiceStatus}`}</p></div><Badge variant={expired || license.status === "blocked" ? "destructive" : remaining <= 30 ? "warning" : "success"}>{expired ? "Expirada" : `${remaining} dias`}</Badge></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-muted-foreground">Emissão</p><p className="mt-1 font-medium">{formatDate(license.issuedAt)}</p></div><div><p className="text-xs text-muted-foreground">Expiração</p><p className="mt-1 font-medium">{formatDate(license.expiresAt)}</p></div></div><Button className="mt-4 w-full" variant="outline" onClick={() => request(`/api/company-licenses/${license.companyId}/renew`, { method: "POST", body: JSON.stringify({ plan: license.plan, days: 30 }) })} disabled={!!actionId}><Clock3 className="h-4 w-4" /> Renovar por 30 dias</Button></Card>; })}</div></div>
    </div>
  );
}