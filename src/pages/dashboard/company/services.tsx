import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Plus, Sparkles, Trash2, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/lib/auth";
import { useCompanyByOwner, useCompanyServices, useCreateService, useDeleteService } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/lib/types";

const serviceSuggestions = [
  {
    label: "Económico",
    title: "Serviço essencial",
    description: "Uma solução prática para eventos bem organizados e acessíveis.",
    price: 15000,
    unit: "evento",
    tone: "border-success/30 bg-success/5",
  },
  {
    label: "Personalizado",
    title: "Experiência à medida",
    description: "Planeamento adaptado ao estilo, dimensão e orçamento de cada evento.",
    price: 35000,
    unit: "evento",
    tone: "border-primary/30 bg-primary/5",
  },
  {
    label: "Premium",
    title: "Produção completa",
    description: "Acompanhamento exclusivo com atenção a todos os detalhes da celebração.",
    price: 75000,
    unit: "evento",
    tone: "border-accent/40 bg-accent/10",
  },
];

export function CompanyServices() {
  const { profile } = useAuth();
  const { data: company } = useCompanyByOwner(profile?.id);
  const { data: services } = useCompanyServices(company?.id);
  const createService = useCreateService();
  const deleteService = useDeleteService();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: 0, unit: "serviço" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    createService.mutate(
      { company_id: company.id, ...form, is_active: true },
      {
        onSuccess: () => {
          toast({ title: "Serviço adicionado!", variant: "success" });
          setOpen(false);
          setForm({ name: "", description: "", price: 0, unit: "serviço" });
        },
        onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleDelete = (service: Service) => {
    deleteService.mutate(service, {
      onSuccess: () => toast({ title: "Serviço removido", variant: "default" }),
    });
  };

  const useSuggestion = (suggestion: typeof serviceSuggestions[number]) => {
    setForm({
      name: suggestion.title,
      description: suggestion.description,
      price: suggestion.price,
      unit: suggestion.unit,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Serviços</h1>
          <p className="text-muted-foreground mt-1">Gerencie os serviços que oferece</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo serviço
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-foreground" />
          <h2 className="font-display font-semibold">Comece com uma sugestão</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {serviceSuggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => useSuggestion(suggestion)}
              className={`rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${suggestion.tone}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{suggestion.label}</span>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 font-semibold">{suggestion.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{suggestion.description}</p>
              <p className="mt-3 text-sm font-bold text-primary">{formatCurrency(suggestion.price)} / {suggestion.unit}</p>
            </button>
          ))}
        </div>
      </div>

      {services && services.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {services.map((service, i) => (
            <motion.div key={service.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{service.name}</h3>
                    {service.description && <p className="text-sm text-muted-foreground mt-1">{service.description}</p>}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="font-display text-lg font-bold text-primary">{formatCurrency(service.price)}</span>
                      <span className="text-xs text-muted-foreground">/ {service.unit}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(service)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Wrench}
          title="Nenhum serviço cadastrado"
          description="Adicione serviços para que os clientes possam solicitá-los."
          action={<Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Adicionar serviço</Button>}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo serviço</DialogTitle>
            <DialogDescription>Adicione um serviço que a sua empresa oferece.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do serviço</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Decoração completa" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descrição</Label>
              <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva o serviço..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (Kz)</Label>
                <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} min={0} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade</Label>
                <Input id="unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="serviço, hora, pessoa..." required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createService.isPending}>
                {createService.isPending ? "Adicionando..." : "Adicionar serviço"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
