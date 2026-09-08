import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useClientBookings } from "@/lib/queries";
import { formatDate, formatCurrency, getEventStatusLabel, getEventStatusColor } from "@/lib/utils";

export function ClientBookings() {
  const { data: bookings } = useClientBookings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Orçamentos e reservas</h1>
        <p className="text-muted-foreground mt-1">Acompanhe os seus pedidos de orçamento</p>
      </div>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((booking, i) => (
            <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">JABOQUE</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.event?.title} - {formatDate(booking.event_date)}
                      </p>
                      {booking.service && (
                        <p className="text-xs text-muted-foreground mt-0.5">Serviço: {booking.service.name}</p>
                      )}
                      {booking.package && (
                        <p className="text-xs text-muted-foreground mt-0.5">Pacote: {booking.package.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-display text-lg font-bold text-primary">
                      {formatCurrency(booking.price)}
                    </span>
                    <Badge variant={getEventStatusColor(booking.status) as any}>
                      {getEventStatusLabel(booking.status)}
                    </Badge>
                  </div>
                </div>
                {booking.notes && (
                  <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">{booking.notes}</p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="Nenhum orçamento solicitado"
          description="Conheça os serviços JABOQUE e solicite apoio para os seus eventos."
          action={<Button asChild><a href="/explore">Explorar serviços <ArrowRight className="h-4 w-4" /></a></Button>}
        />
      )}
    </div>
  );
}
