import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Search, BadgeCheck, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState } from "@/components/ui/empty-state";
import { useAdminCompanies } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export function AdminCompanies() {
  const { data: companies } = useAdminCompanies();
  const [search, setSearch] = useState("");

  const filtered = companies?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Empresas</h1>
        <p className="text-muted-foreground mt-1">{companies?.length ?? 0} empresas cadastradas</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar empresa..." className="pl-9" />
      </div>

      {filtered && filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((company, i) => (
            <motion.div key={company.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <Link to={`/empresa/${company.slug}`} target="_blank" className="font-semibold text-sm hover:text-primary transition-colors truncate block">
                      {company.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{company.category?.name} - {company.city}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={company.rating} size="sm" />
                      <span className="text-xs text-muted-foreground">{formatDate(company.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {company.is_verified && <Badge variant="default" className="gap-1"><BadgeCheck className="h-3 w-3" /> Verificado</Badge>}
                  {company.is_featured && <Badge variant="accent">Destaque</Badge>}
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/empresa/${company.slug}`} target="_blank"><Eye className="h-4 w-4" /></Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Building2} title="Nenhuma empresa encontrada" />
      )}
    </div>
  );
}
