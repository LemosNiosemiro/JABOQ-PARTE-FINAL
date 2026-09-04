import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, Users, MapPin, Trash2, Edit2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toaster";
import { useClientEvents, useCreateEvent } from "@/lib/queries";
import { formatDate, getEventStatusLabel, getEventStatusColor } from "@/lib/utils";
import type { EventType } from "@/lib/types";

const eventTypes: EventType[] = [
  "Casamentos", "Aniversários", "Batizados", "Eventos Corporativos",
  "Formaturas", "Shows", "Outros",
];

export function ClientEvents() {
  const { data: events } = useClientEvents();
  const createEvent = useCreateEvent();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    event_type: "Aniversários" as EventType,
    event_date: "",
    city: "",
    province: "",
    guest_count: 50,
    budget: 200000,
    description: "",
  });
  // client_id is defaulted by auth.uid() in the database — no need to pass it.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.event_date) {
      toast({ title: "Selecione a data do evento", variant: "destructive" });
      return;
    }
    createEvent.mutate(form, {
      onSuccess: () => {
        toast({ title: "Evento criado com sucesso!", variant: "success" });
        setOpen(false);
        setForm({ title: "", event_type: "Aniversários", event_date: "", city: "", province: "", guest_count: 50, budget: 200000, description: "" });
      },
      onError: (err) => toast({ title: "Erro ao criar evento", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Meus eventos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os seus eventos e celebrações</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo evento
        </Button>
      </div>

      {events && events.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {events.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-semibold text-lg">{event.title}</h3>
                    <Badge variant="secondary" className="mt-1">{event.event_type}</Badge>
                  </div>
                  <Badge variant={getEventStatusColor(event.status) as any}>
                    {getEventStatusLabel(event.status)}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {formatDate(event.event_date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> {event.guest_count} convidados
                  </div>
                  {event.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {event.city}, {event.province}
                    </div>
                  )}
                  {event.budget && (
                    <p className="font-semibold text-foreground">Orçamento: Kz {event.budget.toLocaleString("pt-AO")}</p>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">{event.description}</p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="Nenhum evento criado"
          description="Crie o seu primeiro evento para começar a solicitar orçamentos."
          action={<Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Criar evento</Button>}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar novo evento</DialogTitle>
            <DialogDescription>Adicione os detalhes do seu evento para solicitar orçamentos.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nome do evento</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Aniversário da Maria" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v as EventType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Luanda" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Província</Label>
                <Input id="province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="Luanda" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="guests">Convidados</Label>
                <Input id="guests" type="number" value={form.guest_count} onChange={(e) => setForm({ ...form, guest_count: Number(e.target.value) })} min={1} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento (Kz)</Label>
                <Input id="budget" type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} min={0} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descrição</Label>
              <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva o seu evento..." rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createEvent.isPending}>
                {createEvent.isPending ? "Criando..." : "Criar evento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
