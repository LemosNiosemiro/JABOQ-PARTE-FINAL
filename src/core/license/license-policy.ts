import type { LicenseSnapshot } from "@/core/types";

export function isLicenseExpired(license: LicenseSnapshot | null | undefined) {
  if (!license) return true;
  return new Date(license.expiresAt).getTime() <= Date.now();
}

export function isAdminAccessBlocked(license: LicenseSnapshot | null | undefined) {
  if (!license) return true;
  return license.status === "expired" || license.status === "blocked" || isLicenseExpired(license);
}

export function getLicenseSummary(license: LicenseSnapshot | null | undefined) {
  if (!license) {
    return {
      label: "Sem licença",
      isExpired: true,
      isAdminBlocked: true,
    };
  }

  return {
    label: license.status === "active" ? `Plano ${license.plan}` : `Licença ${license.status}`,
    isExpired: isLicenseExpired(license),
    isAdminBlocked: isAdminAccessBlocked(license),
  };
}
