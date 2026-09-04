import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Moon, Bell, LogOut, Globe } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

export function CompanySettings() {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie as preferências da sua conta</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Modo escuro</p>
              <p className="text-xs text-muted-foreground">Alterar a aparência</p>
            </div>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Notificações de reservas</p>
              <p className="text-xs text-muted-foreground">Receber alertas de novos pedidos</p>
            </div>
          </div>
          <Switch defaultChecked />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Terminar sessão</p>
            <p className="text-xs text-muted-foreground">Sair da sua conta</p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => signOut()} className="gap-2">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </Card>
    </div>
  );
}
