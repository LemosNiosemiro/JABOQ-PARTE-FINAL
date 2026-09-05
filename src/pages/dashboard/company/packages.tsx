import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Package, Plus, Sparkles, Trash2 } from "lucide-react";
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

const packageSuggestions = [
  {
    label: "Brilho Essencial",
    description: "O essencial para uma celebração bonita, funcional e económica.",
    items: ["Decoração base", "Som ambiente", "Coordenação durante 4 horas"],
    price: 45000,
    tone: "border-success/30 bg-success/5",
  },
  {
    label: "Memória Personalizada",
    description: "Uma experiência desenhada para combinar com a identidade do seu evento.",
    items: ["Decoração personalizada", "Fotografia do evento", "Coordenação durante 6 horas"],
    price: 85000,
    tone: "border-primary/30 bg-primary/5",
  },
  {
    label: "Brilho Completo",
    description: "O pacote premium para transformar cada momento numa experiência memorável.",
    items: ["Decoração premium", "DJ e iluminação", "Fotografia e vídeo", "Coordenação integral"],
    price: 150000,
    tone: "border-accent/40 bg-accent/10",
  },
];

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

  const useSuggestion = (suggestion: typeof packageSuggestions[number]) => {
    setForm({
      name: suggestion.label,
      description: suggestion.description,
      price: suggestion.price,
      itemsText: suggestion.items.join("\n"),
    });
    setOpen(true);
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

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-foreground" />
          <h2 className="font-display font-semibold">Pacotes prontos para personalizar</h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {packageSuggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => useSuggestion(suggestion)}
              className={`rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${suggestion.tone}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Package className="h-5 w-5 text-primary" />
                  <p className="mt-2 font-semibold">{suggestion.label}</p>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{suggestion.description}</p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {suggestion.items.map((item) => (
                  <li key={item} className="flex items-start gap-1.5"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm font-bold text-primary">{formatCurrency(suggestion.price)}</p>
            </button>
          ))}
        </div>
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
