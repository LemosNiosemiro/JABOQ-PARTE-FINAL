import express, { type Request, type Response, type NextFunction } from "express";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

try {
  const envFile = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
} catch {
  // Environment variables may be supplied by the hosting platform.
}

const app = express();
const port = Number(process.env.PORT || 4000);
const ADMIN_KEY = process.env.ADMIN_KEY || "jaboque-admin-secret-key-change-me";
const JABOQUE_KEY = process.env.JABOQUE_KEY || "jaboque-client-key-change-me";
const PROGRAMMER_KEY = process.env.PROGRAMMER_KEY || JABOQUE_KEY;

// Middlewares
app.use(express.json());
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Types
type LicenseStatus = "active" | "trial" | "expired" | "blocked";
type LicensePlan = "starter" | "growth" | "premium" | "enterprise";

interface License {
  status: LicenseStatus;
  plan: LicensePlan;
  companyName: string;
  issuedAt: string;
  expiresAt: string;
  seats: number;
  fiscalName: string;
  invoiceStatus: "pending" | "paid" | "overdue";
  modules: string[];
}

interface CompanyLicense {
  companyId: string;
  companyName: string;
  status: LicenseStatus;
  plan: LicensePlan;
  issuedAt: string;
  expiresAt: string;
  invoiceStatus: "pending" | "paid" | "overdue";
}

// ============ STATE ============

// Sistema seguro de licença - apenas admin pode renovar
let platformLicense: License = {
  status: "active",
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
    "Operacional",
    "Permissões",
  ],
};

const companyLicenses: CompanyLicense[] = [
  {
    companyId: "company-clube-evento",
    companyName: "Clube do Evento",
    status: "active",
    plan: "starter",
    issuedAt: "2026-08-01T00:00:00.000Z",
    expiresAt: "2026-10-01T00:00:00.000Z",
    invoiceStatus: "paid",
  },
  {
    companyId: "company-salao-aurora",
    companyName: "Salão Aurora",
    status: "active",
    plan: "growth",
    issuedAt: "2026-08-01T00:00:00.000Z",
    expiresAt: "2026-09-15T00:00:00.000Z",
    invoiceStatus: "pending",
  },
];

const invoiceSeed = [
  {
    id: "inv-001",
    number: "JBF-2026-001",
    clientName: "Clube do Evento",
    amount: 54000,
    status: "paid" as const,
    issuedAt: "2026-08-10",
    dueAt: "2026-08-25",
  },
  {
    id: "inv-002",
    number: "JBF-2026-002",
    clientName: "Salão Aurora",
    amount: 92000,
    status: "pending" as const,
    issuedAt: "2026-08-14",
    dueAt: "2026-08-30",
  },
  {
    id: "inv-003",
    number: "JBF-2026-003",
    clientName: "Casa de Eventos",
    amount: 118000,
    status: "overdue" as const,
    issuedAt: "2026-07-22",
    dueAt: "2026-08-08",
  },
  {
    id: "inv-004",
    number: "JBF-2026-004",
    clientName: "Marina Fest",
    amount: 76000,
    status: "paid" as const,
    issuedAt: "2026-08-18",
    dueAt: "2026-09-02",
  },
];

const operations = [
  {
    id: "ops-1",
    title: "Revisar calendário de eventos da próxima semana",
    owner: "Operações",
    priority: "alta" as const,
    deadline: "2026-09-04",
    status: "em andamento" as const,
  },
  {
    id: "ops-2",
    title: "Confirmar fornecedores para festas corporativas",
    owner: "Comercial",
    priority: "media" as const,
    deadline: "2026-09-05",
    status: "pendente" as const,
  },
  {
    id: "ops-3",
    title: "Validar entrega de materiais de decoração",
    owner: "Logística",
    priority: "alta" as const,
    deadline: "2026-09-06",
    status: "pendente" as const,
  },
];

// ============ AUTH MIDDLEWARE ============

function getBearerToken(req: Request): string | undefined {
  const authorization = req.headers.authorization;
  return authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
}

function requireAdminKey(req: Request, res: Response, next: NextFunction): void {
  const adminKey = getBearerToken(req);

  if (!adminKey || adminKey !== ADMIN_KEY) {
    res.status(401).json({
      ok: false,
      error: "UNAUTHORIZED",
      message: "Chave de administrador inválida ou ausente",
    });
    return;
  }

  next();
}

function requireJaboqueKey(req: Request, res: Response, next: NextFunction): void {
  if (getBearerToken(req) !== JABOQUE_KEY) {
    res.status(401).json({
      ok: false,
      error: "UNAUTHORIZED",
      message: "Chave de gestão da Jaboque inválida ou ausente",
    });
    return;
  }

  next();
}

function requireProgrammerKey(req: Request, res: Response, next: NextFunction): void {
  if (getBearerToken(req) !== PROGRAMMER_KEY) {
    res.status(401).json({ ok: false, error: "UNAUTHORIZED", message: "Chave do programador inválida ou ausente" });
    return;
  }
  next();
}

// ============ HELPERS ============

const getLicenseState = () => {
  const isExpired = new Date(platformLicense.expiresAt).getTime() <= Date.now();
  return {
    ...platformLicense,
    isExpired,
    isBlocked: platformLicense.status === "expired" || platformLicense.status === "blocked" || isExpired,
  };
};

const getCompanyLicenseState = (license: CompanyLicense) => {
  const isExpired = new Date(license.expiresAt).getTime() <= Date.now();
  return {
    ...license,
    isExpired,
    isBlocked: license.status === "expired" || license.status === "blocked" || isExpired || getLicenseState().isBlocked,
    platformBlocked: getLicenseState().isBlocked,
  };
};

function requireActivePlatform(req: Request, res: Response, next: NextFunction): void {
  if (getLicenseState().isBlocked) {
    res.status(423).json({
      ok: false,
      error: "PLATFORM_LICENSE_BLOCKED",
      message: "O sistema está indisponível porque a licença mensal da Jaboque expirou ou foi bloqueada",
    });
    return;
  }

  next();
}

const getFinancialSummary = () => {
  const totalRevenue = invoiceSeed.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidRevenue = invoiceSeed.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingRevenue = invoiceSeed.filter((invoice) => invoice.status === "pending").reduce((sum, invoice) => sum + invoice.amount, 0);

  return {
    totalRevenue,
    paidRevenue,
    pendingRevenue,
    overdueCount: invoiceSeed.filter((invoice) => invoice.status === "overdue").length,
    invoices: invoiceSeed,
  };
};

const buildPermissionResponse = (role: "admin" | "company" | "client") => ({
  role,
  modules:
    role === "admin"
      ? ["admin", "clients", "companies", "bookings", "finance", "licensing", "reports", "operations"]
      : role === "company"
        ? ["companies", "bookings", "finance"]
        : ["clients", "bookings"],
  canAccessAdmin: role === "admin" && !getLicenseState().isBlocked,
  canAccessFinance: role === "company" || role === "admin",
});

// ============ PUBLIC ENDPOINTS ============

// Health check - sem autenticação
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: "jaboque-backend",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// GET Licença - público (clientes podem ler seu status)
app.get("/api/license", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    license: getLicenseState(),
  });
});

// GET Licenças das empresas - gestão exclusiva do programador
app.get("/api/company-licenses", requireProgrammerKey, (_req: Request, res: Response) => {
  res.json({
    ok: true,
    platformLicense: getLicenseState(),
    licenses: companyLicenses.map(getCompanyLicenseState),
  });
});

app.get("/api/programmer/licenses", requireProgrammerKey, (_req: Request, res: Response) => {
  res.json({ ok: true, licenses: { platformLicense: getLicenseState(), licenses: companyLicenses.map(getCompanyLicenseState) } });
});

// GET Resumo Financeiro - público
app.get("/api/financial", requireActivePlatform, (_req: Request, res: Response) => {
  res.json({
    ok: true,
    financial: getFinancialSummary(),
  });
});

// GET Permissões por Perfil - público
app.get("/api/permissions/:role", requireActivePlatform, (req: Request, res: Response) => {
  const role = String(req.params.role).toLowerCase();
  const allowedRoles = ["client", "company", "admin"] as const;

  if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
    res.status(400).json({ ok: false, error: "INVALID_ROLE", message: "Perfil inválido" });
    return;
  }

  res.json({
    ok: true,
    permissions: buildPermissionResponse(role as "admin" | "company" | "client"),
  });
});

// GET Tarefas Operacionais - público
app.get("/api/operations", requireActivePlatform, (_req: Request, res: Response) => {
  res.json({
    ok: true,
    tasks: operations,
  });
});

// ============ ADMIN-ONLY ENDPOINTS ============

// POST Renovar Licença - APENAS ADMIN COM CHAVE SECRETA
app.post("/api/license/renew", requireAdminKey, (req: Request, res: Response) => {
  const { plan = "growth", days = 365 } = req.body ?? {};

  if (!["starter", "growth", "premium", "enterprise"].includes(plan)) {
    res.status(400).json({ ok: false, error: "INVALID_PLAN", message: "Plano de licença inválido" });
    return;
  }

  if (!Number.isInteger(days) || days < 1 || days > 3660) {
    res.status(400).json({ ok: false, error: "INVALID_DAYS", message: "A duração deve estar entre 1 e 3660 dias" });
    return;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

  platformLicense = {
    ...platformLicense,
    status: "active",
    plan,
    issuedAt: now.toISOString(),
    expiresAt,
    invoiceStatus: "paid",
  };

  res.json({
    ok: true,
    message: "Licença renovada com sucesso pelo administrador",
    license: getLicenseState(),
  });
});

app.post("/api/programmer/license/renew", requireProgrammerKey, (req: Request, res: Response) => {
  const { plan = "growth", days = 365 } = req.body ?? {};
  if (!["starter", "growth", "premium", "enterprise"].includes(plan) || !Number.isInteger(days) || days < 1 || days > 3660) {
    res.status(400).json({ ok: false, error: "INVALID_LICENSE", message: "Plano ou duração de licença inválidos" });
    return;
  }
  const now = new Date();
  platformLicense = { ...platformLicense, status: "active", plan, issuedAt: now.toISOString(), expiresAt: new Date(now.getTime() + days * 86400000).toISOString(), invoiceStatus: "paid" };
  res.json({ ok: true, message: "Licença da plataforma renovada", license: getLicenseState() });
});

// PATCH Bloquear Licença - APENAS ADMIN COM CHAVE SECRETA
app.patch("/api/license/block", requireAdminKey, (req: Request, res: Response) => {
  platformLicense.status = "blocked";
  res.json({
    ok: true,
    message: "Licença bloqueada",
    license: getLicenseState(),
  });
});

// Renovar licença de empresa - APENAS A JABOQUE
app.post("/api/company-licenses/:companyId/renew", requireProgrammerKey, (req: Request, res: Response) => {
  const license = companyLicenses.find((item) => item.companyId === req.params.companyId);
  const { plan = license?.plan || "starter", days = 30 } = req.body ?? {};

  if (!license) {
    res.status(404).json({ ok: false, error: "NOT_FOUND", message: "Empresa não encontrada" });
    return;
  }
  if (! ["starter", "growth", "premium", "enterprise"].includes(plan) || !Number.isInteger(days) || days < 1 || days > 3660) {
    res.status(400).json({ ok: false, error: "INVALID_LICENSE", message: "Plano ou duração de licença inválidos" });
    return;
  }

  const now = new Date();
  license.status = "active";
  license.plan = plan;
  license.issuedAt = now.toISOString();
  license.expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
  license.invoiceStatus = "paid";

  res.json({ ok: true, message: "Licença da empresa renovada pela Jaboque", license: getCompanyLicenseState(license) });
});

// Bloquear licença de empresa - APENAS A JABOQUE
app.patch("/api/company-licenses/:companyId/block", requireJaboqueKey, (req: Request, res: Response) => {
  const license = companyLicenses.find((item) => item.companyId === req.params.companyId);

  if (!license) {
    res.status(404).json({ ok: false, error: "NOT_FOUND", message: "Empresa não encontrada" });
    return;
  }

  license.status = "blocked";
  res.json({ ok: true, message: "Licença da empresa bloqueada pela Jaboque", license: getCompanyLicenseState(license) });
});

// PATCH Atualizar Status de Fatura - APENAS ADMIN
app.patch("/api/invoices/:id/status", requireAdminKey, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body ?? {};
  const invoice = invoiceSeed.find((item) => item.id === id);

  if (!invoice) {
    res.status(404).json({ ok: false, error: "NOT_FOUND", message: "Fatura não encontrada" });
    return;
  }

  if (!["paid", "pending", "overdue", "draft"].includes(status)) {
    res.status(400).json({ ok: false, error: "INVALID_STATUS", message: "Status de fatura inválido" });
    return;
  }

  invoice.status = status;

  res.json({
    ok: true,
    message: "Status de fatura atualizado",
    invoice,
    financial: getFinancialSummary(),
  });
});

// ============ ERROR HANDLING ============

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    ok: false,
    error: "NOT_FOUND",
    message: "Endpoint não encontrado",
  });
});

// ============ START SERVER ============

app.listen(port, () => {
  console.log(`✅ JABOQUE Backend rodando em http://localhost:${port}`);
  console.log(`📝 Chave admin: ${ADMIN_KEY}`);
  console.log(`🔒 Use header 'Authorization: Bearer <chave>' para endpoints protegidos`);
});
