import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Building2, Star, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAdminStats, useAdminProfiles, useAdminCompanies } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export function AdminReports() {
  const { data: stats } = useAdminStats();
  const { data: profiles } = useAdminProfiles();
  const { data: companies } = useAdminCompanies();

  const clientCount = profiles?.filter((p) => p.role === "client").length ?? 0;
  const companyCount = profiles?.filter((p) => p.role === "company").length ?? 0;
  const adminCount = profiles?.filter((p) => p.role === "admin").length ?? 0;

  const avgRating = companies && companies.length > 0
    ? (companies.reduce((sum, c) => sum + c.rating, 0) / companies.length).toFixed(1)
    : "0.0";

  const topCompanies = companies?.sort((a, b) => b.rating - a.rating).slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground mt-1">Métricas e desempenho da plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Clientes", value: clientCount, color: "text-primary bg-primary/10" },
          { icon: Building2, label: "Empresas", value: companyCount, color: "text-accent bg-accent/10" },
          { icon: Star, label: "Avaliação média", value: avgRating, color: "text-warning bg-warning/10" },
          { icon: TrendingUp, label: "Reservas", value: stats?.totalBookings ?? 0, color: "text-success bg-success/10" },
        ].map((stat, i) => (
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

      <Card className="p-6">
        <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" /> Distribuição de utilizadores
        </h2>
        <div className="space-y-3">
          {[
            { label: "Clientes", value: clientCount, max: profiles?.length ?? 1, color: "bg-primary" },
            { label: "Empresas", value: companyCount, max: profiles?.length ?? 1, color: "bg-accent" },
            { label: "Admins", value: adminCount, max: profiles?.length ?? 1, color: "bg-destructive" },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / item.max) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className={`h-full ${item.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-accent" /> Top empresas
        </h2>
        <div className="space-y-3">
          {topCompanies.map((company, i) => (
            <div key={company.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{company.name}</p>
                <p className="text-xs text-muted-foreground">{company.category?.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-sm">{company.rating.toFixed(1)} ★</p>
                <p className="text-xs text-muted-foreground">{company.review_count} avaliações</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
