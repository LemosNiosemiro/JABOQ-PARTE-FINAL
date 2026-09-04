export const appConfig = {
  appName: "JABOQUE Festas",
  appVersion: "1.0.0",
  license: {
    defaultPlan: "growth",
    defaultStatus: "trial",
    rolesBlockedWhenLicenseExpires: ["admin"],
  },
  billing: {
    currency: "AOA",
    defaultTax: 0.17,
    invoicePrefix: "JBF",
  },
  features: {
    allowPublicBrowsing: true,
    allowClientDashboard: true,
    allowCompanyDashboard: true,
    allowAdminDashboard: true,
  },
} as const;
