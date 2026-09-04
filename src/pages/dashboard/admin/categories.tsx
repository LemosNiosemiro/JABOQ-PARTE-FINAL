import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCategories, useCompanies } from "@/lib/queries";

const categoryIcons: Record<string, string> = {
  decoracao: "🌸", buffet: "🍽️", dj: "🎧", fotografia: "📸", filmagem: "🎥",
  bolos: "🎂", doces: "🍬", convites: "✉️", espacos: "🏛️", som: "🔊",
  iluminacao: "💡", brinquedos: "🎈", casamentos: "💍", batizados: "👶",
  aniversarios: "🎉", "eventos-corporativos": "💼", formaturas: "🎓", shows: "🎤",
};

export function AdminCategories() {
  const { data: categories } = useCategories();
  const { data: companies } = useCompanies({ limit: 1000 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Categorias</h1>
        <p className="text-muted-foreground mt-1">{categories?.length ?? 0} categorias no marketplace</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((cat, i) => {
          const companyCount = companies?.companies.filter((c) => c.category_id === cat.id).length ?? 0;
          return (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-5 flex items-center gap-4">
                <div className="text-3xl">{categoryIcons[cat.slug] ?? "✨"}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{cat.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{cat.slug}</p>
                </div>
                <Badge variant="secondary">{companyCount} empresas</Badge>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
