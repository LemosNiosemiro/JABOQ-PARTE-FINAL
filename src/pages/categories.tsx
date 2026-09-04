import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCategories, useCompanies } from "@/lib/queries";

const categoryIcons: Record<string, string> = {
  decoracao: "🌸", buffet: "🍽️", dj: "🎧", fotografia: "📸", filmagem: "🎥",
  bolos: "🎂", doces: "🍬", convites: "✉️", espacos: "🏛️", som: "🔊",
  iluminacao: "💡", brinquedos: "🎈", casamentos: "💍", batizados: "👶",
  aniversarios: "🎉", "eventos-corporativos": "💼", formaturas: "🎓", shows: "🎤",
};

export default function CategoriesPage() {
  const { data: categories } = useCategories();

  return (
    <div className="container py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold">Todas as categorias</h1>
        <p className="mt-2 text-muted-foreground">Explore todos os tipos de fornecedores disponíveis</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories?.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
          >
            <Link to={`/explore?category=${cat.id}`}>
              <Card className="p-6 text-center hover:shadow-lg hover:border-primary/40 transition-all hover:-translate-y-1 cursor-pointer group h-full">
                <div className="text-4xl mb-3">{categoryIcons[cat.slug] ?? "✨"}</div>
                <h3 className="font-display font-semibold group-hover:text-primary transition-colors">{cat.name}</h3>
                {cat.description && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                )}
                <ArrowRight className="h-4 w-4 text-primary mt-3 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
