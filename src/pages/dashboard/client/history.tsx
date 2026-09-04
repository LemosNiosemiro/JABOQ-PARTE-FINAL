import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Filter, Search, TrendingUp, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { useClientEvents } from "@/lib/queries";
import { formatCurrency, formatDate, getEventStatusColor, getEventStatusLabel } from "@/lib/utils";
import type { BookingStatus, EventType } from "@/lib/types";

const statusOptions: Array<BookingStatus | "all"> = ["all", "pending", "confirmed", "completed", "cancelled", "refused"];

export function ClientHistory() {
  const { data: events } = useClientEvents();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events
      .filter((event) => {
        const matchesQuery = event.title.toLowerCase().includes(query.toLowerCase())
          || event.event_type.toLowerCase().includes(query.toLowerCase())
          || event.city?.toLowerCase().includes(query.toLowerCase())
          || event.province?.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter === "all" || event.status === statusFilter;
        const matchesType = typeFilter === "all" || event.event_type === typeFilter;
        return matchesQuery && matchesStatus && matchesType;
      })
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
  }, [events, query, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = events?.length ?? 0;
    const confirmed = events?.filter((item) => item.status === "confirmed").length ?? 0;
    const completed = events?.filter((item) => item.status === "completed").length ?? 0;
    const pending = events?.filter((item) => item.status === "pending").length ?? 0;
    const totalBudget = events?.reduce((sum, item) => sum + (item.budget ?? 0), 0) ?? 0;
    return { total, confirmed, completed, pending, totalBudget };
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Histórico de eventos</h1>
          <p className="text-muted-foreground mt-1">Revise eventos passados, acompanhe estados e encontre os seus detalhes rapidamente.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button asChild variant="secondary">
            <Link to="/painel/eventos" className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Novo evento
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Eventos totais</p>
          <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Confirmados</p>
          <p className="mt-2 text-3xl font-semibold">{stats.confirmed}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Concluídos</p>
          <p className="mt-2 text-3xl font-semibold">{stats.completed}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Orçamento total</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(stats.totalBudget)}</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar por título, tipo ou localização"
                className="pl-10"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:w-[420px]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Status</p>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookingStatus | "all") }>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "all" ? "Todos" : getEventStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Tipo de evento</p>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as EventType | "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Casamentos">Casamentos</SelectItem>
                  <SelectItem value="Aniversários">Aniversários</SelectItem>
                  <SelectItem value="Batizados">Batizados</SelectItem>
                  <SelectItem value="Eventos Corporativos">Eventos Corporativos</SelectItem>
                  <SelectItem value="Formaturas">Formaturas</SelectItem>
                  <SelectItem value="Shows">Shows</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <Card key={event.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
                      <Clock className="h-3.5 w-3.5" /> {formatDate(event.event_date)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
                      <Filter className="h-3.5 w-3.5" /> {event.event_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-lg font-semibold truncate">{event.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.city ? `${event.city}, ${event.province}` : "Local não informado"}
                      </p>
                    </div>
                    <Badge variant={getEventStatusColor(event.status) as any}>
                      {getEventStatusLabel(event.status)}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-right">
                  <p className="text-sm text-muted-foreground">Convidados</p>
                  <p className="font-semibold">{event.guest_count}</p>
                  <p className="text-sm text-muted-foreground">Orçamento</p>
                  <p className="font-semibold">{event.budget ? formatCurrency(event.budget) : "-"}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description ?? "Sem descrição adicional."}</p>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/painel/eventos">Ver eventos</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="Nenhum histórico encontrado"
          description="Aplique filtros ou crie novos eventos para ver o histórico detalhado aqui."
          action={
            <Button asChild>
              <Link to="/painel/eventos">Criar evento</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
