import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { LicenseSnapshot } from "@/core/types";
import { fetchLicenseFromApi, getStoredLicense } from "@/features/licensing/license-service";

const LicenseContext = createContext<LicenseSnapshot | null>(null);

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [license, setLicense] = useState<LicenseSnapshot>(() => getStoredLicense());

  useEffect(() => {
    void fetchLicenseFromApi().then(setLicense);
  }, []);

  return <LicenseContext.Provider value={license}>{children}</LicenseContext.Provider>;
}

export function useLicense() {
  const license = useContext(LicenseContext);

  if (!license) {
    return getStoredLicense();
  }

  return license;
}
