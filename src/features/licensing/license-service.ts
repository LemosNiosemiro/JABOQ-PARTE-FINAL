import type { LicenseSnapshot } from "@/core/types";

export const defaultLicense: LicenseSnapshot = {
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
    "Operacional",
    "Permissões",
  ],
};

export async function fetchLicenseFromApi(): Promise<LicenseSnapshot> {
  if (typeof window === "undefined") return getStoredLicense();

  try {
    const response = await fetch("http://localhost:4000/api/license");
    if (!response.ok) return getStoredLicense();

    const payload = (await response.json()) as { license?: Partial<LicenseSnapshot> };
    const nextLicense = { ...defaultLicense, ...getStoredLicense(), ...(payload.license ?? {}) };
    saveStoredLicense(nextLicense);
    return nextLicense;
  } catch {
    return getStoredLicense();
  }
}

export function getStoredLicense(): LicenseSnapshot {
  if (typeof window === "undefined") return defaultLicense;

  const raw = localStorage.getItem("jaboque_license");

  if (!raw) {
    return defaultLicense;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LicenseSnapshot>;
    return { ...defaultLicense, ...parsed };
  } catch {
    return defaultLicense;
  }
}

export function saveStoredLicense(license: Partial<LicenseSnapshot>) {
  if (typeof window === "undefined") return;
  const current = getStoredLicense();
  localStorage.setItem("jaboque_license", JSON.stringify({ ...current, ...license }));
}

export function updateStoredLicense(updates: Partial<LicenseSnapshot>) {
  saveStoredLicense(updates);
  return getStoredLicense();
}

export async function renewStoredLicense({ plan = "growth", days = 365 }: { plan?: LicenseSnapshot["plan"]; days?: number } = {}) {
  const now = new Date();
  const renewDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  try {
    const response = await fetch("http://localhost:4000/api/license/renew", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, days }),
    });

    if (response.ok) {
      const payload = (await response.json()) as { license?: Partial<LicenseSnapshot> };
      const nextLicense = { ...defaultLicense, ...getStoredLicense(), ...(payload.license ?? {}) };
      saveStoredLicense(nextLicense);
      return nextLicense;
    }
  } catch {
    // fallback local renew if backend not available
  }

  const nextLicense = updateStoredLicense({
    status: "active",
    plan,
    issuedAt: now.toISOString(),
    expiresAt: renewDate.toISOString(),
    invoiceStatus: "paid",
  });

  return nextLicense;
}

export function getLicenseStatusLabel(license: LicenseSnapshot) {
  if (license.status === "expired" || new Date(license.expiresAt).getTime() <= Date.now()) return "Expirada";
  if (license.status === "blocked") return "Bloqueada";
  if (license.status === "trial") return "Trial";
  return "Ativa";
}
