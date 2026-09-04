import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ShoppingBag, Heart, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useClientEvents, useClientBookings, useFavorites } from "@/lib/queries";
import { formatDate, formatCurrency, getEventStatusLabel, getEventStatusColor } from "@/lib/utils";

export function ClientOverview() {
  const { profile } = useAuth();
  const { data: events } = useClientEvents();
  const { data: bookings } = useClientBookings();
  const { data: favorites } = useFavorites();

  const stats = [
    { icon: Calendar, label: "Eventos", value: events?.length ?? 0, color: "text-primary bg-primary/10" },
    { icon: ShoppingBag, label: "Orçamentos", value: bookings?.length ?? 0, color: "text-accent bg-accent/10" },
    { icon: Heart, label: "Favoritos", value: favorites?.length ?? 0, color: "text-destructive bg-destructive/10" },
    { icon: TrendingUp, label: "Concluídos", value: bookings?.filter((b) => b.status === "completed").length ?? 0, color: "text-success bg-success/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">
          Olá, {profile?.full_name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">Aqui está um resumo da sua atividade</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} mb-3`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Upcoming events */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Próximos eventos</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/painel/eventos">Ver todos <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        {events && events.length > 0 ? (
          <div className="space-y-3">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(event.event_date)} - {event.guest_count} convidados</p>
                  </div>
                </div>
                <Badge variant={getEventStatusColor(event.status) as any}>
                  {getEventStatusLabel(event.status)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">Ainda não tem eventos criados</p>
            <Button asChild><Link to="/painel/eventos">Criar primeiro evento</Link></Button>
          </div>
        )}
      </Card>

      {/* Recent bookings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Orçamentos recentes</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/painel/pedidos">Ver todos <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        {bookings && bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.slice(0, 4).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{booking.company?.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(booking.event_date)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-primary">{formatCurrency(booking.price)}</span>
                  <Badge variant={getEventStatusColor(booking.status) as any}>
                    {getEventStatusLabel(booking.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">Nenhum orçamento solicitado ainda</p>
            <Button asChild><Link to="/explore">Explorar fornecedores</Link></Button>
          </div>
        )}
      </Card>
    </div>
  );
}
