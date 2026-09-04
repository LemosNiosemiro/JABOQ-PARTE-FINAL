import { Link } from "react-router-dom";
import { MapPin, Heart, BadgeCheck, Eye } from "lucide-react";
import { motion } from "framer-motion";
import type { Company } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useToggleFavorite, useIsFavorited } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toaster";

interface CompanyCardProps {
  company: Company;
  index?: number;
}

export function CompanyCard({ company, index = 0 }: CompanyCardProps) {
  const { session } = useAuth();
  const toggleFav = useToggleFavorite();
  const { data: isFavorited } = useIsFavorited(company.id);
  const { toast } = useToast();

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      toast({ title: "Faça login para favoritar", variant: "destructive" });
      return;
    }
    toggleFav.mutate(company.id, {
      onSuccess: (res) => {
        toast({
          title: res.favorited ? "Adicionado aos favoritos" : "Removido dos favoritos",
          variant: "default",
        });
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
        <Link to={`/empresa/${company.slug}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={company.cover_url ?? `https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&h=400`}
              alt={company.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              {company.is_sponsored && (
                <Badge variant="accent" className="shadow-md">Patrocinado</Badge>
              )}
              {company.is_verified && (
                <Badge variant="default" className="shadow-md gap-1">
                  <BadgeCheck className="h-3 w-3" /> Verificado
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavorite}
              className="absolute top-2 right-2 h-9 w-9 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white border-0"
            >
              <Heart className={isFavorited ? "h-4 w-4 fill-destructive text-destructive" : "h-4 w-4"} />
            </Button>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="h-12 w-12 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-primary text-lg">
                    {company.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-semibold text-base leading-tight truncate group-hover:text-primary transition-colors">
                  {company.name}
                </h3>
                {company.category && (
                  <p className="text-xs text-muted-foreground mt-0.5">{company.category.name}</p>
                )}
              </div>
            </div>

            {company.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {company.description}
              </p>
            )}

            <div className="flex items-center gap-3">
              <StarRating rating={company.rating} size="sm" showValue />
              <span className="text-xs text-muted-foreground">
                {company.review_count} avaliações
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {company.city ?? "Luanda"}
              </div>
              {company.price_from != null && (
                <span className="text-sm font-semibold text-primary">
                  a partir de {formatCurrency(company.price_from)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}
