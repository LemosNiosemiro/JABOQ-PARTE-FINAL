import { useState } from "react";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/lib/auth";
import { getInitials } from "@/lib/utils";

export function ClientProfile() {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    city: profile?.city ?? "",
    province: profile?.province ?? "",
    bio: profile?.bio ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateProfile(form);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao atualizar perfil", description: error, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado com sucesso!", variant: "success" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Meu perfil</h1>
        <p className="text-muted-foreground mt-1">Atualize as suas informações pessoais</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        <Card className="p-6 text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {getInitials(profile?.full_name ?? "U")}
            </AvatarFallback>
          </Avatar>
          <p className="font-display font-semibold">{profile?.full_name}</p>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
        </Card>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" value={profile?.email ?? ""} disabled className="pl-9 bg-muted/50" />
              </div>
              <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+244 900 000 000" className="pl-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Luanda" className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Província</Label>
                <Input id="province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="Luanda" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Conte um pouco sobre si..." rows={3} />
            </div>
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
