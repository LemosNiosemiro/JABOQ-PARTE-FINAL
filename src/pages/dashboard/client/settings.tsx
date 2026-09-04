import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Moon, Bell, Globe, Shield, LogOut } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Separator } from "@/components/ui/separator";

export function ClientSettings() {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie as suas preferências</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Modo escuro</p>
              <p className="text-xs text-muted-foreground">Alterar a aparência da plataforma</p>
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
              <p className="font-semibold text-sm">Notificações</p>
              <p className="text-xs text-muted-foreground">Receber alertas de novos orçamentos</p>
            </div>
          </div>
          <Switch defaultChecked />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Privacidade</p>
              <p className="text-xs text-muted-foreground">Os seus dados estão protegidos pela LGPD</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Ver política</Button>
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
