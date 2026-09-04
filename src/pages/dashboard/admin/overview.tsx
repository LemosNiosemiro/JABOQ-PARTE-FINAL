import { motion } from "framer-motion";
import { Building2, Users, ShoppingBag, Star, Tag, TrendingUp, DollarSign, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminStats, useAdminCompanies } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export function AdminOverview() {
  const { data: stats } = useAdminStats();
  const { data: companies } = useAdminCompanies();

  const statCards = [
    { icon: Building2, label: "Empresas", value: stats?.totalCompanies ?? 0, color: "text-primary bg-primary/10" },
    { icon: Users, label: "Utilizadores", value: stats?.totalProfiles ?? 0, color: "text-accent bg-accent/10" },
    { icon: ShoppingBag, label: "Reservas", value: stats?.totalBookings ?? 0, color: "text-success bg-success/10" },
    { icon: Star, label: "Avaliações", value: stats?.totalReviews ?? 0, color: "text-destructive bg-destructive/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da plataforma JABOQUE</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
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
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" /> Crescimento
          </h2>
          <div className="space-y-3">
            {[
              { label: "Categorias", value: stats?.totalCategories ?? 0, max: 20 },
              { label: "Empresas", value: stats?.totalCompanies ?? 0, max: 100 },
              { label: "Utilizadores", value: stats?.totalProfiles ?? 0, max: 200 },
              { label: "Reservas", value: stats?.totalBookings ?? 0, max: 100 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Empresas recentes
          </h2>
          <div className="space-y-3">
            {companies?.slice(0, 5).map((company) => (
              <div key={company.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{company.name}</p>
                  <p className="text-xs text-muted-foreground">{company.category?.name} - {formatDate(company.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {company.is_verified && <Badge variant="default" className="text-xs">Verificado</Badge>}
                  {company.is_featured && <Badge variant="accent" className="text-xs">Destaque</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
