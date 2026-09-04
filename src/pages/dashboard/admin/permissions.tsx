import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRoleSummary, hasModuleAccess } from "@/features/permissions/role-permissions";
import { ShieldCheck } from "lucide-react";

export function PermissionsAdminPage() {
  const roles = ["admin", "company", "client"] as const;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Permissões</p>
        <h2 className="font-display text-3xl font-bold">Controle de acesso por perfil</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {roles.map((role) => {
          const summary = getRoleSummary(role);

          return (
            <Card key={role} className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold capitalize">{role}</h3>
                </div>
                <Badge variant="outline">{summary.modules.length} módulos</Badge>
              </div>

              <div className="space-y-2">
                {summary.modules.map((module) => (
                  <div key={module} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                    <span>{module}</span>
                    <Badge variant={hasModuleAccess(role, module) ? "success" : "destructive"}>
                      {hasModuleAccess(role, module) ? "OK" : "Bloq"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
