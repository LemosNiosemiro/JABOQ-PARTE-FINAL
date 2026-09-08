import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { CompanyCard } from "@/components/company-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/lib/queries";

export function ClientFavorites() {
  const { data: favorites } = useFavorites();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Favoritos</h1>
        <p className="text-muted-foreground mt-1">Os serviços JABOQUE que guardou para mais tarde</p>
      </div>

      {favorites && favorites.length > 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {favorites.map((fav, i) => (
            <CompanyCard key={fav.id} company={fav.company} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Nenhum favorito ainda"
          description="Toque no coração dos serviços que gostar para guardá-los aqui."
          action={<Button asChild><Link to="/explore">Explorar serviços <ArrowRight className="h-4 w-4" /></Link></Button>}
        />
      )}
    </div>
  );
}
