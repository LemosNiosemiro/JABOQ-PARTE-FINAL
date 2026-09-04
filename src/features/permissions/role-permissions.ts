import type { UserRole } from "@/core/types";

export type ModulePermission =
  | "admin"
  | "clients"
  | "companies"
  | "bookings"
  | "finance"
  | "licensing"
  | "reports"
  | "operations";

export const ROLE_PERMISSIONS: Record<UserRole, ModulePermission[]> = {
  client: ["clients", "bookings"],
  company: ["companies", "bookings", "finance"],
  admin: ["admin", "clients", "companies", "bookings", "finance", "licensing", "reports", "operations"],
};

export async function fetchRolePermissions(role: UserRole) {
  try {
    const response = await fetch(`http://localhost:4000/api/permissions/${role}`);
    if (!response.ok) return getRoleSummary(role);

    const payload = (await response.json()) as { permissions?: { modules?: ModulePermission[] } };
    return {
      role,
      modules: payload.permissions?.modules ?? ROLE_PERMISSIONS[role],
    };
  } catch {
    return getRoleSummary(role);
  }
}

export function hasModuleAccess(role: UserRole, module: ModulePermission) {
  return ROLE_PERMISSIONS[role].includes(module);
}

export function getRoleSummary(role: UserRole) {
  return {
    role,
    modules: ROLE_PERMISSIONS[role],
  };
}
