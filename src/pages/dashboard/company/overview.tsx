import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Star, Eye, TrendingUp, ArrowRight, Wrench, Package, BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useCompanyByOwner, useCompanyBookings, useCompanyServices, useCompanyPackages, useCompanyReviews } from "@/lib/queries";
import { formatDate, formatCurrency, getEventStatusLabel, getEventStatusColor } from "@/lib/utils";

export function CompanyOverview() {
  const { profile } = useAuth();
  const { data: company } = useCompanyByOwner(profile?.id);
  const { data: bookings } = useCompanyBookings(company?.id);
  const { data: services } = useCompanyServices(company?.id);
  const { data: packages } = useCompanyPackages(company?.id);
  const { data: reviews } = useCompanyReviews(company?.id);

  const stats = [
    { icon: ShoppingBag, label: "Reservas", value: bookings?.length ?? 0, color: "text-primary bg-primary/10" },
    { icon: Star, label: "Avaliações", value: company?.review_count ?? 0, color: "text-accent bg-accent/10" },
    { icon: Wrench, label: "Serviços", value: services?.length ?? 0, color: "text-success bg-success/10" },
    { icon: Package, label: "Pacotes", value: packages?.length ?? 0, color: "text-destructive bg-destructive/10" },
  ];

  const totalRevenue = bookings?.filter((b) => b.status === "confirmed" || b.status === "completed").reduce((sum, b) => sum + b.price, 0) ?? 0;
  const pendingBookings = bookings?.filter((b) => b.status === "pending") ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{company?.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary">{company?.category?.name}</Badge>
            {company?.is_verified && <Badge variant="default" className="gap-1"><BadgeCheck className="h-3 w-3" /> Verificado</Badge>}
            <span className="text-sm text-muted-foreground">{company?.city}, {company?.province}</span>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to={`/empresa/${company?.slug}`} target="_blank">
            <Eye className="h-4 w-4" /> Ver página pública
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">Receita total</h2>
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <p className="font-display text-3xl font-bold text-success">{formatCurrency(totalRevenue)}</p>
          <p className="text-sm text-muted-foreground mt-1">Reservas confirmadas e concluídas</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">Avaliação média</h2>
            <Star className="h-5 w-5 text-accent fill-accent" />
          </div>
          <p className="font-display text-3xl font-bold">{company?.rating.toFixed(1) ?? "0.0"}</p>
          <p className="text-sm text-muted-foreground mt-1">{company?.review_count} avaliações de clientes</p>
        </Card>
      </div>

      {/* Pending bookings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Reservas pendentes</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/empresa/pedidos">Ver todas <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        {pendingBookings.length > 0 ? (
          <div className="space-y-3">
            {pendingBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="font-semibold text-sm">{booking.event?.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(booking.event_date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary">{formatCurrency(booking.price)}</span>
                  <Badge variant={getEventStatusColor(booking.status) as any}>{getEventStatusLabel(booking.status)}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhuma reserva pendente</p>
        )}
      </Card>
    </div>
  );
}
