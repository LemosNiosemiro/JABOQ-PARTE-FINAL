export type BillingStatus = "pending" | "paid" | "overdue" | "draft";

export interface InvoiceSummary {
  id: string;
  number: string;
  clientName: string;
  amount: number;
  status: BillingStatus;
  issuedAt: string;
  dueAt: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  pendingRevenue: number;
  paidRevenue: number;
  overdueCount: number;
  invoices: InvoiceSummary[];
}

export const invoiceSeed: InvoiceSummary[] = [
  {
    id: "inv-001",
    number: "JBF-2026-001",
    clientName: "Clube do Evento",
    amount: 54000,
    status: "paid",
    issuedAt: "2026-08-10",
    dueAt: "2026-08-25",
  },
  {
    id: "inv-002",
    number: "JBF-2026-002",
    clientName: "Salão Aurora",
    amount: 92000,
    status: "pending",
    issuedAt: "2026-08-14",
    dueAt: "2026-08-30",
  },
  {
    id: "inv-003",
    number: "JBF-2026-003",
    clientName: "Casa de Eventos",
    amount: 118000,
    status: "overdue",
    issuedAt: "2026-07-22",
    dueAt: "2026-08-08",
  },
  {
    id: "inv-004",
    number: "JBF-2026-004",
    clientName: "Marina Fest",
    amount: 76000,
    status: "paid",
    issuedAt: "2026-08-18",
    dueAt: "2026-09-02",
  },
];

export async function fetchFinancialSummary(): Promise<FinancialSummary> {
  try {
    const response = await fetch("http://localhost:4000/api/financial");
    if (!response.ok) return getFinancialSummary();

    const payload = (await response.json()) as { financial?: Partial<FinancialSummary> };
    return {
      totalRevenue: payload.financial?.totalRevenue ?? getFinancialSummary().totalRevenue,
      pendingRevenue: payload.financial?.pendingRevenue ?? getFinancialSummary().pendingRevenue,
      paidRevenue: payload.financial?.paidRevenue ?? getFinancialSummary().paidRevenue,
      overdueCount: payload.financial?.overdueCount ?? getFinancialSummary().overdueCount,
      invoices: payload.financial?.invoices ?? getFinancialSummary().invoices,
    };
  } catch {
    return getFinancialSummary();
  }
}

export function getInvoiceSummary(): InvoiceSummary[] {
  return invoiceSeed;
}

export function getFinancialSummary(): FinancialSummary {
  const invoices = getInvoiceSummary();
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidRevenue = invoices.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingRevenue = invoices.filter((invoice) => invoice.status === "pending").reduce((sum, invoice) => sum + invoice.amount, 0);

  return {
    totalRevenue,
    paidRevenue,
    pendingRevenue,
    overdueCount: invoices.filter((invoice) => invoice.status === "overdue").length,
    invoices,
  };
}

export async function updateInvoiceStatus(id: string, status: BillingStatus) {
  try {
    const response = await fetch(`http://localhost:4000/api/invoices/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      const payload = (await response.json()) as { financial?: FinancialSummary };
      return payload.financial?.invoices ?? getInvoiceSummary();
    }
  } catch {
    // fallback local update if backend not available
  }

  const invoices = getInvoiceSummary();
  const index = invoices.findIndex((invoice) => invoice.id === id);

  if (index < 0) return invoices;

  invoices[index].status = status;
  return invoices;
}
