import { useState, useEffect } from "react";
import { Building2, Save, Globe, Instagram, Facebook, Phone, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/lib/auth";
import { useCompanyByOwner, useUpdateCompany, useCategories } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export function CompanyProfile() {
  const { profile } = useAuth();
  const { data: company } = useCompanyByOwner(profile?.id);
  const { data: categories } = useCategories();
  const updateCompany = useUpdateCompany();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    description: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    instagram: "",
    facebook: "",
    city: "",
    province: "",
    address: "",
    price_from: 0,
    price_to: 0,
  });

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name ?? "",
        category_id: company.category_id ?? "",
        description: company.description ?? "",
        phone: company.phone ?? "",
        whatsapp: company.whatsapp ?? "",
        email: company.email ?? "",
        website: company.website ?? "",
        instagram: company.instagram ?? "",
        facebook: company.facebook ?? "",
        city: company.city ?? "",
        province: company.province ?? "",
        address: company.address ?? "",
        price_from: company.price_from ?? 0,
        price_to: company.price_to ?? 0,
      });
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    updateCompany.mutate(
      { id: company.id, updates: form },
      {
        onSuccess: () => toast({ title: "Perfil atualizado com sucesso!", variant: "success" }),
        onError: (err) => toast({ title: "Erro ao atualizar", description: err.message, variant: "destructive" }),
      }
    );
  };

  if (!company) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Perfil da empresa</h1>
        <p className="text-muted-foreground mt-1">Atualize as informações que os clientes veem</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card className="p-6 space-y-4">
          <h2 className="font-display font-semibold flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Informações básicas</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da empresa</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Descrição</Label>
            <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva a sua empresa..." rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceFrom">Preço a partir de (Kz)</Label>
              <Input id="priceFrom" type="number" value={form.price_from} onChange={(e) => setForm({ ...form, price_from: Number(e.target.value) })} min={0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceTo">Preço até (Kz)</Label>
              <Input id="priceTo" type="number" value={form.price_to} onChange={(e) => setForm({ ...form, price_to: Number(e.target.value) })} min={0} />
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-6 space-y-4">
          <h2 className="font-display font-semibold flex items-center gap-2"><Phone className="h-5 w-5 text-primary" /> Contactos</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+244 900 000 000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+244 900 000 000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6 space-y-4">
          <h2 className="font-display font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Localização</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Província</Label>
              <Input id="province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua, número, bairro..." />
          </div>
        </Card>

        {/* Social */}
        <Card className="p-6 space-y-4">
          <h2 className="font-display font-semibold flex items-center gap-2"><Instagram className="h-5 w-5 text-primary" /> Redes sociais</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram (sem @)</Label>
              <Input id="instagram" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="minha_empresa" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook (URL)</Label>
              <Input id="facebook" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="https://facebook.com/..." />
            </div>
          </div>
        </Card>

        <Button type="submit" size="lg" disabled={updateCompany.isPending} className="gap-2">
          <Save className="h-4 w-4" /> {updateCompany.isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </div>
  );
}
