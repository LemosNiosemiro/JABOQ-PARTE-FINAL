import { motion } from "framer-motion";
import { Check, X, ShoppingBag, Phone, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/lib/auth";
import { useCompanyByOwner, useCompanyBookings, useUpdateBookingStatus } from "@/lib/queries";
import { formatDate, formatCurrency, getEventStatusLabel, getEventStatusColor } from "@/lib/utils";
import type { Booking } from "@/lib/types";

export function CompanyBookings() {
  const { profile } = useAuth();
  const { data: company } = useCompanyByOwner(profile?.id);
  const { data: bookings } = useCompanyBookings(company?.id);
  const updateStatus = useUpdateBookingStatus();
  const { toast } = useToast();

  const handleStatusChange = (booking: Booking, status: Booking["status"]) => {
    updateStatus.mutate(
      { bookingId: booking.id, status },
      {
        onSuccess: () => toast({ title: `Reserva ${getEventStatusLabel(status).toLowerCase()}`, variant: "success" }),
        onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Reservas</h1>
        <p className="text-muted-foreground mt-1">Gerencie os pedidos de orçamento recebidos</p>
      </div>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((booking, i) => (
            <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{booking.event?.title}</h3>
                      <Badge variant={getEventStatusColor(booking.status) as any}>{getEventStatusLabel(booking.status)}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(booking.event_date)}</span>
                      <span className="flex items-center gap-1">👥 {booking.event?.guest_count} convidados</span>
                    </div>
                    {booking.service && <p className="text-sm">Serviço: <span className="font-medium">{booking.service.name}</span></p>}
                    {booking.package && <p className="text-sm">Pacote: <span className="font-medium">{booking.package.name}</span></p>}
                    {booking.notes && <p className="text-sm text-muted-foreground italic">"{booking.notes}"</p>}
                    <p className="font-display text-lg font-bold text-primary">{formatCurrency(booking.price)}</p>
                  </div>
                  {booking.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" className="gap-1" onClick={() => handleStatusChange(booking, "confirmed")}>
                        <Check className="h-4 w-4" /> Aceitar
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => handleStatusChange(booking, "refused")}>
                        <X className="h-4 w-4" /> Recusar
                      </Button>
                    </div>
                  )}
                  {booking.status === "confirmed" && (
                    <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => handleStatusChange(booking, "completed")}>
                      <Check className="h-4 w-4" /> Marcar como concluído
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="Nenhuma reserva recebida"
          description="Quando os clientes solicitarem orçamentos, aparecerão aqui."
        />
      )}
    </div>
  );
}
