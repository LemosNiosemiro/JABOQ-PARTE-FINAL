import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Package, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/lib/auth";
import { useCompanyByOwner, useCompanyPackages, useCreatePackage, useDeletePackage } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";
import type { Package as PackageType } from "@/lib/types";

export function CompanyPackages() {
  const { profile } = useAuth();
  const { data: company } = useCompanyByOwner(profile?.id);
  const { data: packages } = useCompanyPackages(company?.id);
  const createPackage = useCreatePackage();
  const deletePackage = useDeletePackage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: 0, itemsText: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    const items = form.itemsText.split("\n").map((s) => s.trim()).filter(Boolean);
    createPackage.mutate(
      { company_id: company.id, name: form.name, description: form.description, price: form.price, items, is_active: true },
      {
        onSuccess: () => {
          toast({ title: "Pacote criado!", variant: "success" });
          setOpen(false);
          setForm({ name: "", description: "", price: 0, itemsText: "" });
        },
        onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleDelete = (pkg: PackageType) => {
    deletePackage.mutate(pkg, {
      onSuccess: () => toast({ title: "Pacote removido", variant: "default" }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Pacotes</h1>
          <p className="text-muted-foreground mt-1">Crie pacotes combinando serviços</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo pacote
        </Button>
      </div>

      {packages && packages.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {packages.map((pkg, i) => (
            <motion.div key={pkg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Package className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-semibold">{pkg.name}</h3>
                    {pkg.description && <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(pkg)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {(pkg.items as string[]).map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
                <p className="font-display text-xl font-bold text-primary pt-3 border-t border-border">
                  {formatCurrency(pkg.price)}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="Nenhum pacote criado"
          description="Crie pacotes para oferecer combinações de serviços com desconto."
          action={<Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Criar pacote</Button>}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo pacote</DialogTitle>
            <DialogDescription>Combine serviços num pacote com preço especial.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do pacote</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Pack Casamento Premium" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descrição</Label>
              <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="items">Itens incluídos (um por linha)</Label>
              <Textarea id="items" value={form.itemsText} onChange={(e) => setForm({ ...form, itemsText: e.target.value })} placeholder="Decoração completa&#10;DJ por 6 horas&#10;Buffet para 100 pessoas" rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço do pacote (Kz)</Label>
              <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} min={0} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createPackage.isPending}>
                {createPackage.isPending ? "Criando..." : "Criar pacote"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
