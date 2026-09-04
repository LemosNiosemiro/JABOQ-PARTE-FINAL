import type { UserRole } from "@/core/types";
import { getStoredLicense } from "@/features/licensing/license-service";

export type PermissionKey =
  | "admin"
  | "company"
  | "client"
  | "billing"
  | "licensing"
  | "reports"
  | "events"
  | "bookings";

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Record<PermissionKey, boolean>> = {
  client: {
    admin: false,
    company: false,
    client: true,
    billing: false,
    licensing: false,
    reports: false,
    events: true,
    bookings: true,
  },
  company: {
    admin: false,
    company: true,
    client: false,
    billing: false,
    licensing: false,
    reports: false,
    events: true,
    bookings: true,
  },
  admin: {
    admin: true,
    company: true,
    client: true,
    billing: true,
    licensing: true,
    reports: true,
    events: true,
    bookings: true,
  },
};

export function getRolePermissions(role: UserRole) {
  return DEFAULT_ROLE_PERMISSIONS[role];
}

export function canAccessModule(module: PermissionKey, role: UserRole) {
  const permissions = getRolePermissions(role);
  const hasRoleAccess = permissions[module];

  if (!hasRoleAccess) {
    return false;
  }

  if (role === "admin") {
    const license = getStoredLicense();
    const isBlocked = ["expired", "blocked"].includes(license.status) || new Date(license.expiresAt).getTime() <= Date.now();
    return !isBlocked;
  }

  return true;
}

export async function validateServerAccess(role: UserRole, module: PermissionKey) {
  try {
    const response = await fetch(`http://localhost:4000/api/permissions/${role}`);
    if (response.ok) {
      const payload = (await response.json()) as { permissions?: { modules?: string[]; canAccessAdmin?: boolean } };
      const allowed = payload.permissions?.modules?.includes(module) ?? canAccessModule(module, role);
      return {
        allowed: !!allowed,
        source: "backend",
        role,
        module,
        reason: allowed ? "Permissão válida" : "Acesso negado por regra de negócio",
      };
    }
  } catch {
    // local fallback when backend not running
  }

  const allowed = canAccessModule(module, role);

  return {
    allowed,
    source: "backend-ready",
    role,
    module,
    reason: allowed ? "Permissão válida" : "Acesso negado por regra de negócio",
  };
}
