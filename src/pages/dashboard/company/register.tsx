import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/lib/auth";
import { useCreateCompany, useCategories } from "@/lib/queries";
import { slugify } from "@/lib/utils";

export function CompanyRegister() {
  const { profile } = useAuth();
  const { data: categories } = useCategories();
  const createCompany = useCreateCompany();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: profile?.full_name ?? "",
    category_id: "",
    description: "",
    city: "Luanda",
    province: "Luanda",
    phone: "",
    email: profile?.email ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    createCompany.mutate(
      {
        owner_id: profile.id,
        name: form.name,
        slug: slugify(form.name) + "-" + Math.random().toString(36).slice(2, 6),
        category_id: form.category_id || null,
        description: form.description || null,
        city: form.city || null,
        province: form.province || null,
        phone: form.phone || null,
        email: form.email || null,
      },
      {
        onSuccess: () => toast({ title: "Empresa cadastrada com sucesso!", variant: "success" }),
        onError: (err) => toast({ title: "Erro ao cadastrar", description: err.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="container py-12 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl font-bold">Cadastrar a sua empresa</h1>
          <p className="mt-2 text-muted-foreground">Comece a receber pedidos de orçamento hoje mesmo</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da empresa</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Decora Festas Angola" required />
            </div>
            <div className="space-y-2">
              <Label>Categoria principal</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descrição</Label>
              <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva a sua empresa e os serviços que oferece..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Província</Label>
                <Input id="province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+244 900 000 000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full gap-2" disabled={createCompany.isPending}>
              {createCompany.isPending ? "Cadastrando..." : <>Cadastrar empresa <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>
        </Card>
        <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1">
          <Sparkles className="h-4 w-4 text-accent" /> Poderá completar o perfil depois de cadastrar
        </p>
      </motion.div>
    </div>
  );
}
