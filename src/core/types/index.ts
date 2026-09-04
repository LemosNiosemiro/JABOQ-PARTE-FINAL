export type UserRole = "client" | "company" | "admin";
export type LicenseStatus = "trial" | "active" | "expired" | "blocked";
export type LicensePlan = "starter" | "growth" | "premium" | "enterprise";
export type InvoiceStatus = "pending" | "paid" | "overdue";

export interface LicenseSnapshot {
  status: LicenseStatus;
  plan: LicensePlan;
  companyName: string;
  issuedAt: string;
  expiresAt: string;
  seats: number;
  fiscalName: string;
  invoiceStatus: InvoiceStatus;
  modules: string[];
}

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  companyId?: string;
  isActive: boolean;
}

export interface PermissionMap {
  canAccessAdmin: boolean;
  canManageCompany: boolean;
  canManageBookings: boolean;
  canManageBilling: boolean;
}
